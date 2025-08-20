from __future__ import annotations
import os, re, json, time, hashlib, subprocess, threading
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from collections import deque
from typing import Deque, List, Optional, Tuple, Dict, Any
import urllib.request
import urllib.error
import ssl
import http.client
from urllib.parse import urlparse


# ---- CONFIG & TYPES ---------------------------------------------------------
@dataclass
class CaptureConfig:
    buffer_dir: Path
    clips_dir: Path  # onde o highlight nasce
    queue_dir: Path  # fila para tratamento posterior (raw)
    device: str = "/dev/video0"
    seg_time: int = 1
    pre_seconds: int = 40
    post_seconds: int = 10
    scan_interval: float = 0.5
    max_buffer_seconds: int = 80

    @property
    def max_segments(self) -> int:
        return max(1, int(self.max_buffer_seconds / self.seg_time))

    def ensure_dirs(self) -> None:
        self.buffer_dir.mkdir(parents=True, exist_ok=True)
        self.clips_dir.mkdir(parents=True, exist_ok=True)
        self.queue_dir.mkdir(parents=True, exist_ok=True)


# ---- FFmpeg recorder --------------------------------------------------------
def _calc_start_number(buffer_dir: Path) -> int:
    pattern = re.compile(r"buffer(\d{3,})\.mp4$")
    nums: List[int] = []
    for f in os.listdir(buffer_dir):
        m = pattern.match(f)
        if m:
            try:
                nums.append(int(m.group(1)))
            except ValueError:
                pass
    return (max(nums) + 1) if nums else 0


def start_ffmpeg(cfg: CaptureConfig) -> subprocess.Popen:
    start_num = _calc_start_number(cfg.buffer_dir)
    out_pattern = str(cfg.buffer_dir / "buffer%06d.mp4")
    # Old -> Camera do notebook
    ffmpeg_cmd = [
        "ffmpeg",
        "-nostdin",
        "-f",
        "v4l2",
        "-i",
        cfg.device,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-tune",
        "zerolatency",
        "-force_key_frames",
        f"expr:gte(t,n_forced*{cfg.seg_time})",
        "-f",
        "segment",
        "-segment_time",
        str(cfg.seg_time),
        "-segment_start_number",
        str(start_num),
        "-reset_timestamps",
        "1",
        out_pattern,
    ]

    # Camera Dedicada
    # ffmpeg_cmd = [
    #     "ffmpeg",
    #     "-rtsp_transport",
    #     "tcp",
    #     "-i",
    #     "rtsp://admin:wa0i4Ochu@192.168.1.21:2399/cam/realmonitor?channel=1&subtype=0",
    #     "-c:v",
    #     "libx264",
    #     "-preset",
    #     "ultrafast",
    #     "-tune",
    #     "zerolatency",
    #     "-force_key_frames",
    #     "expr:gte(t,n_forced*1)",
    #     "-c:a",
    #     "aac",
    #     "-b:a",
    #     "96k",  # audio
    #     "-f",
    #     "segment",
    #     "-segment_time",
    #     str(cfg.seg_time),
    #     "-segment_start_number",
    #     str(start_num),
    #     "-reset_timestamps",
    #     "1",
    #     out_pattern,
    # ]

    return subprocess.Popen(
        ffmpeg_cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL,
    )


# ---- Segment buffer (indexer thread) ---------------------------------------
class SegmentBuffer:
    def __init__(self, cfg: CaptureConfig):
        self.cfg = cfg
        self._segments: Deque[str] = deque(maxlen=cfg.max_segments)
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._t: Optional[threading.Thread] = None

    def start(self) -> None:
        self._t = threading.Thread(target=self._index_loop, daemon=True)
        self._t.start()

    def stop(self, join_timeout: float = 2.0) -> None:
        self._stop.set()
        if self._t:
            self._t.join(timeout=join_timeout)

    def snapshot_last(self, n: int) -> List[str]:
        with self._lock:
            return list(self._segments)[-n:]

    def _index_loop(self) -> None:
        while not self._stop.is_set():
            files = sorted(
                self.cfg.buffer_dir.glob("buffer*.mp4"), key=lambda p: p.stat().st_mtime
            )
            # limpa excedentes no disco
            extra = files[: -self.cfg.max_segments]
            for p in extra:
                try:
                    p.unlink()
                except FileNotFoundError:
                    pass
            files = files[-self.cfg.max_segments :]
            with self._lock:
                self._segments.clear()
                self._segments.extend(str(p) for p in files)
            self._stop.wait(self.cfg.scan_interval)


# ---- Highlight builder ------------------------------------------------------
def build_highlight(cfg: CaptureConfig, segbuf: SegmentBuffer) -> Optional[Path]:
    click_ts = time.time()
    print("Botão apertado! Aguardando pós-buffer…")
    time.sleep(max(0, cfg.post_seconds) + 0.25)

    need = max(1, int(round((cfg.pre_seconds + cfg.post_seconds) / cfg.seg_time)))
    selected = segbuf.snapshot_last(need)
    if not selected:
        print("Nenhum segmento disponível — encerrando.")
        return None

    list_txt = cfg.buffer_dir / f"to_concat_{int(click_ts)}.txt"
    with open(list_txt, "w") as f:
        for seg in selected:
            f.write(f"file '{seg}'\n")

    out = (
        cfg.clips_dir
        / f"highlight_{datetime.fromtimestamp(click_ts, tz=timezone.utc).strftime('%Y%m%d-%H%M%SZ')}.mp4"
    )
    subprocess.run(
        [
            "ffmpeg",
            "-nostdin",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(list_txt),
            "-c",
            "copy",
            str(out),
        ],
        check=True,
    )
    try:
        list_txt.unlink()
    except FileNotFoundError:
        pass

    print(f"Saved {out}")
    return out


# ---- Queueing & metadata ----------------------------------------------------
def _sha256_file(p: Path, chunk: int = 1024 * 1024) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        while True:
            b = f.read(chunk)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


def ffprobe_metadata(path: Path) -> Dict[str, Any]:
    """
    Usa ffprobe para extrair metadados básicos.
    Requer ffprobe no PATH.
    """
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=codec_name,width,height,r_frame_rate",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        str(path),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, check=True)
    info = json.loads(r.stdout)
    stream = info.get("streams", [{}])[0]
    fmt = info.get("format", {})
    fps_str = stream.get("r_frame_rate", "0/1")
    try:
        num, den = fps_str.split("/")
        fps = float(num) / float(den) if float(den) != 0 else 0.0
    except Exception:
        fps = 0.0
    return {
        "codec": stream.get("codec_name"),
        "width": stream.get("width"),
        "height": stream.get("height"),
        "fps": fps,
        "duration_sec": float(fmt.get("duration", 0.0)),
    }


def enqueue_clip(cfg: CaptureConfig, clip_path: Path) -> Path:
    """
    Move o arquivo para a fila (queue_dir) e salva metadados .json ao lado.
    """
    clip_path = clip_path.resolve()
    size_bytes = clip_path.stat().st_size
    sha256 = _sha256_file(clip_path)
    meta = ffprobe_metadata(clip_path)
    payload = {
        "type": "highlight_raw",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "file_name": clip_path.name,
        "size_bytes": size_bytes,
        "sha256": sha256,
        "meta": meta,
        "pre_seconds": cfg.pre_seconds,
        "post_seconds": cfg.post_seconds,
        "seg_time": cfg.seg_time,
        "status": "queued",
    }

    dst = cfg.queue_dir / clip_path.name
    meta_path = cfg.queue_dir / (clip_path.stem + ".json")

    # move para a fila e grava sidecar
    clip_path.replace(dst)
    meta_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    print(f"Enfileirado para tratamento: {dst}")
    return dst


# ---- Watermark util (MoviePy v2) -------------------------------------------
# Posição corrigida para canto inferior direito
def add_image_watermark(
    input_path: str,
    watermark_path: str,
    output_path: str,
    margin: int = 24,
    opacity: float = 0.6,
    rel_width: float = 0.2,
    codec: str = "libx264",
    crf: int = 20,
    preset: str = "medium",
) -> None:
    """
    Mantém a marca d'água no canto inferior direito, com margem fixa.
    Requer MoviePy v2: from moviepy import VideoFileClip, ImageClip, CompositeVideoClip
    """
    from moviepy import (
        VideoFileClip,
        ImageClip,
        CompositeVideoClip,
    )  # import local p/ opção de não instalar no Pi de captura

    video = VideoFileClip(input_path)
    wmark = (
        ImageClip(watermark_path)
        .resized(width=int(video.w * rel_width))
        .with_duration(video.duration)
        .with_opacity(opacity)
    )

    x = int(video.w - wmark.w - margin)
    y = int(video.h - wmark.h - margin)
    wmark = wmark.with_position((x, y))

    out = CompositeVideoClip([video, wmark])
    out.write_videofile(
        output_path,
        codec=codec,
        audio_codec="aac",
        preset=preset,
        ffmpeg_params=["-crf", str(crf)],
    )


# ---- Thumbnail helper (opcional) -------------------------------------------
def generate_thumbnail(
    input_path: Path, output_path: Path, at_sec: float | None = None
) -> None:
    """Gera thumbnail .jpg no meio do vídeo (ou em at_sec)."""
    from moviepy import VideoFileClip  # MoviePy v2

    clip = VideoFileClip(str(input_path))
    t = at_sec if at_sec is not None else max(0.0, clip.duration * 0.5)
    # save_frame aceita extensão pelo caminho
    clip.save_frame(str(output_path), t=t)


# ---- HTTP helper & registration --------------------------------------------
def _http_post_json(
    url: str,
    payload: Dict[str, Any],
    headers: Optional[Dict[str, str]] = None,
    timeout: float = 10.0,
) -> Dict[str, Any]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    # permissivo para ambientes com certificados locais
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            charset = resp.headers.get_content_charset() or "utf-8"
            body = resp.read().decode(charset)
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode("utf-8")
        except Exception:
            body = ""
        raise RuntimeError(f"HTTP {e.code} ao POST {url}: {body}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Erro de rede ao POST {url}: {e}")


def register_clip_metadados(
    api_base: str,
    metadados: Dict[str, Any],
    token: Optional[str] = None,
    timeout: float = 10.0,
) -> Dict[str, Any]:
    """
    Envia metadados do clipe para o backend e retorna o payload de resposta.

    Espera que o backend exponha POST {api_base}/api/videos/metadados.
    Se `token` for fornecido, envia como `Authorization: Bearer <token>`.
    """
    client_id = os.getenv("GN_CLIENT_ID") or os.getenv("CLIENT_ID")
    venue_id = os.getenv("GN_VENUE_ID") or os.getenv("VENUE_ID")
    base = api_base.rstrip("/")

    url = f"{base}/api/videos/metadados/client/{client_id}/venue/{venue_id}"
    headers: Dict[str, str] = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return _http_post_json(url, metadados, headers=headers, timeout=timeout)


# ---- Signed URL upload ------------------------------------------------------
def upload_file_to_signed_url(
    upload_url: str,
    file_path: Path,
    content_type: str = "video/mp4",
    extra_headers: Optional[Dict[str, str]] = None,
    timeout: float = 120.0,
) -> Tuple[int, str]:
    """
    Envia o arquivo via HTTP PUT para uma URL assinada (S3/GCS/etc).

    Retorna (status_code, reason). Lança exceção em erros de conexão.
    """
    parsed = urlparse(upload_url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"URL inválida: {upload_url}")

    # Prepara conexão
    conn_cls = http.client.HTTPSConnection if parsed.scheme == "https" else http.client.HTTPConnection
    netloc = parsed.netloc
    path_qs = parsed.path or "/"
    if parsed.query:
        path_qs += f"?{parsed.query}"

    file_size = file_path.stat().st_size

    # Debug básico
    print(f"[upload] URL: {parsed.scheme}://{parsed.netloc}{parsed.path}...")
    print(f"[upload] Tamanho: {file_size} bytes | Tipo: {content_type}")

    headers = {
        "Content-Type": content_type,
        "Content-Length": str(file_size),
    }
    if extra_headers:
        headers.update(extra_headers)

    conn = conn_cls(netloc, timeout=timeout)
    try:
        conn.putrequest("PUT", path_qs)
        for k, v in headers.items():
            conn.putheader(k, v)
        conn.endheaders()

        with file_path.open("rb") as f:
            # Envia em blocos para evitar alto uso de memória
            while True:
                chunk = f.read(1024 * 1024)
                if not chunk:
                    break
                conn.send(chunk)

        resp = conn.getresponse()
        # Debug de resposta
        print(f"[upload] HTTP {resp.status} {resp.reason}")
        try:
            body = resp.read(512)
            if body:
                print(f"[upload] Resumo corpo: {body[:200]!r}")
        except Exception:
            pass
        return resp.status, resp.reason
    finally:
        try:
            conn.close()
        except Exception:
            pass
