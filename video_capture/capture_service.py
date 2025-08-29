from __future__ import annotations
import sys
from pathlib import Path
import os, json, time, traceback
from datetime import datetime, timezone
import threading
from video_core import (
    CaptureConfig,
    SegmentBuffer,
    start_ffmpeg,
    build_highlight,
    enqueue_clip,
    add_image_watermark,
    generate_thumbnail,
    ffprobe_metadata,
    register_clip_metadados,
    upload_file_to_signed_url,
    finalize_clip_uploaded,
)
from video_core import _sha256_file  # util interno


class ProcessingWorker:
    def __init__(
        self,
        queue_dir: Path,  # queue_raw/
        out_wm_dir: Path,  # 20_highlights_wm/
        failed_dir: Path,  # 90_failed/
        watermark_path: Path,  # assets/logo.png
        scan_interval: float = 1.5,  # varredura a cada 1.5s
        max_attempts: int = 3,
        wm_margin: int = 24,
        wm_opacity: float = 0.6,
        wm_rel_width: float = 0.2,
    ):
        self.queue_dir = queue_dir
        self.out_wm_dir = out_wm_dir
        self.failed_dir = failed_dir
        self.watermark_path = watermark_path
        self.scan_interval = scan_interval
        self.max_attempts = max_attempts
        self.wm_margin = wm_margin
        self.wm_opacity = wm_opacity
        self.wm_rel_width = wm_rel_width

        self._stop = threading.Event()
        self._t = None

        self.out_wm_dir.mkdir(parents=True, exist_ok=True)
        self.failed_dir.mkdir(parents=True, exist_ok=True)

    def start(self):
        self._t = threading.Thread(target=self._loop, daemon=True)
        self._t.start()

    def stop(self, timeout: float = 2.0):
        self._stop.set()
        if self._t:
            self._t.join(timeout=timeout)

    def _loop(self):
        while not self._stop.is_set():
            try:
                self._scan_once()
            except Exception:
                # loga e continua o loop
                print("[worker] erro inesperado no loop:\n", traceback.format_exc())
            self._stop.wait(self.scan_interval)

    def _scan_once(self):
        # procura .mp4 na fila (sidecar .json com o mesmo stem é recomendado)
        for mp4 in sorted(self.queue_dir.glob("*.mp4")):
            stem = mp4.stem
            meta_path = self.queue_dir / f"{stem}.json"
            lock_path = self.queue_dir / f"{stem}.lock"

            # exige sidecar
            if not meta_path.exists():
                # sem sidecar? cria um mínimo para seguir o fluxo
                payload = {
                    "type": "highlight_raw",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "file_name": mp4.name,
                    "size_bytes": mp4.stat().st_size,
                    "sha256": None,
                    "meta": ffprobe_metadata(mp4),
                    "status": "queued",
                    "attempts": 0,
                }
                meta_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2))

            # tenta lock atômico (claim do job)
            try:
                fd = os.open(
                    str(lock_path), os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o644
                )
                os.close(fd)
            except FileExistsError:
                # outro worker pegou
                continue

            try:
                self._process_one(mp4, meta_path)
            except Exception as e:
                print(f"[worker] falhou {mp4.name}: {e}")
                self._handle_failure(mp4, meta_path, e)
            finally:
                # libera o lock (remove .lock)
                try:
                    lock_path.unlink(missing_ok=True)
                except Exception:
                    pass

    def _process_one(self, mp4: Path, meta_path: Path):
        # carrega/atualiza sidecar
        meta = json.loads(meta_path.read_text())
        attempts = int(meta.get("attempts", 0))

        # idempotência simples: se já existe saída final, não refazer
        out_mp4 = self.out_wm_dir / mp4.name
        thumb_jpg = self.out_wm_dir / (mp4.stem + ".jpg")
        if out_mp4.exists() and thumb_jpg.exists():
            meta.update(
                {
                    "status": "watermarked",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "wm_path": str(out_mp4),
                    "thumbnail_path": str(thumb_jpg),
                }
            )
            meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2))
            # remove o original da fila
            try:
                mp4.unlink()
            except FileNotFoundError:
                pass
            return

        # 1) watermark canto inferior direito
        tmp_out = self.out_wm_dir / f"{mp4.stem}.wm_tmp.mp4"
        add_image_watermark(
            input_path=str(mp4),
            watermark_path=str(self.watermark_path),
            output_path=str(tmp_out),
            margin=self.wm_margin,
            opacity=self.wm_opacity,
            rel_width=self.wm_rel_width,
            codec="libx264",
            crf=20,
            preset="ultrafast",  # Pi agradece
        )
        tmp_out.replace(out_mp4)  # atomic move

        # 2) thumbnail (meio do vídeo)
        generate_thumbnail(out_mp4, thumb_jpg, at_sec=None)

        # 3) atualiza sidecar
        meta.update(
            {
                "status": "watermarked",
                "attempts": attempts,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "wm_path": str(out_mp4),
                "thumbnail_path": str(thumb_jpg),
                "meta_wm": ffprobe_metadata(out_mp4),
            }
        )
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2))

        # 3.1) registra intenção de upload no backend (POST /api/videos/metadados)
        api_base = os.getenv("GN_API_BASE") or os.getenv("API_BASE_URL")
        api_token = os.getenv("GN_API_TOKEN") or os.getenv("API_TOKEN")
        client_id = os.getenv("GN_CLIENT_ID") or os.getenv("CLIENT_ID")
        venue_id = os.getenv("GN_VENUE_ID") or os.getenv("VENUE_ID")
        if api_base:
            try:
                size_wm = out_mp4.stat().st_size
                sha256_wm = _sha256_file(out_mp4)
                payload = {
                    "venue_id": venue_id,
                    "duration_sec": 15, # TODO: Fix this, put the real duration seconds
                    "captured_at": meta.get("created_at"),
                    "meta": meta.get("meta_wm") or {},
                    "sha256": sha256_wm,
                }
                print("[worker] Enviando registro de metadados ao backend…")
                resp = register_clip_metadados(
                    api_base, payload, token=api_token, timeout=15.0
                )
                print(f"[worker] Resposta do backend: {json.dumps(resp)[:300]}")
                meta.setdefault("remote_registration", {})
                meta["remote_registration"].update(
                    {
                        "status": "registered",
                        "registered_at": datetime.now(timezone.utc).isoformat(),
                        "response": resp,
                    }
                )
                # status opcional: manter "watermarked" e anotar registro remoto
                meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2))
                print(f"[worker] registro remoto OK: clip_id={resp.get('clip_id')}")

                # 3.2) upload para a URL assinada, se fornecida
                upload_url = (resp or {}).get("upload_url")
                if upload_url:
                    print("[worker] Iniciando upload para URL assinada…")
                    t0 = time.time()
                    try:
                        status_code, reason, resp_headers = upload_file_to_signed_url(
                            upload_url, out_mp4, content_type="video/mp4", extra_headers=None, timeout=180.0
                        )
                        dt_ms = int((time.time() - t0) * 1000)
                        meta.setdefault("remote_upload", {})
                        meta["remote_upload"].update(
                            {
                                "status": "uploaded" if 200 <= status_code < 300 else "failed",
                                "http_status": status_code,
                                "reason": reason,
                                "attempted_at": datetime.now(timezone.utc).isoformat(),
                                "duration_ms": dt_ms,
                                "file_size": size_wm,
                            }
                        )
                        meta_path.write_text(
                            json.dumps(meta, ensure_ascii=False, indent=2)
                        )
                        # TODO: Verificar confirmação do backend
                        print(
                            f"[worker] upload finalizado: HTTP {status_code} {reason} em {dt_ms} ms"
                        )

                        # 3.3) Finaliza upload no backend (validação de integridade)
                        if 200 <= status_code < 300:
                            clip_id = (resp or {}).get("clip_id")
                            if clip_id and api_base:
                                try:
                                    print(f"[worker] Notificando backend upload concluído (clip_id={clip_id})…")
                                    etag = None
                                    try:
                                        etag = (resp_headers or {}).get("etag")
                                    except Exception:
                                        etag = None
                                    fin = finalize_clip_uploaded(
                                        api_base,
                                        clip_id=clip_id,
                                        size_bytes=size_wm,
                                        sha256=sha256_wm,
                                        etag=etag,
                                        token=api_token,
                                        timeout=20.0,
                                    )
                                    meta.setdefault("remote_finalize", {})
                                    meta["remote_finalize"].update(
                                        {
                                            "status": "ok",
                                            "finalized_at": datetime.now(timezone.utc).isoformat(),
                                            "response": fin,
                                        }
                                    )
                                    meta_path.write_text(
                                        json.dumps(meta, ensure_ascii=False, indent=2)
                                    )
                                    print("[worker] Finalização confirmada pelo backend.")
                                except Exception as e:
                                    meta.setdefault("remote_finalize", {})
                                    meta["remote_finalize"].update(
                                        {
                                            "status": "failed",
                                            "error": str(e),
                                            "attempted_at": datetime.now(timezone.utc).isoformat(),
                                        }
                                    )
                                    meta_path.write_text(
                                        json.dumps(meta, ensure_ascii=False, indent=2)
                                    )
                                    print(f"[worker] Falha ao finalizar upload no backend: {e}")
                    except Exception as e:
                        dt_ms = int((time.time() - t0) * 1000)
                        meta.setdefault("remote_upload", {})
                        meta["remote_upload"].update(
                            {
                                "status": "failed",
                                "error": str(e),
                                "attempted_at": datetime.now(timezone.utc).isoformat(),
                                "duration_ms": dt_ms,
                                "file_size": size_wm,
                            }
                        )
                        meta_path.write_text(
                            json.dumps(meta, ensure_ascii=False, indent=2)
                        )
                        print(f"[worker] upload falhou: {e}")
                else:
                    print("[worker] Nenhuma upload_url na resposta; pulando upload.")
            except Exception as e:
                meta.setdefault("remote_registration", {})
                meta["remote_registration"].update(
                    {
                        "status": "failed",
                        "error": str(e),
                        "attempted_at": datetime.now(timezone.utc).isoformat(),
                    }
                )
                meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2))
                print(f"[worker] registro remoto falhou: {e}")
        else:
            print("Sem api url configurada, pulando registro")
            # sem configuração de API, apenas registra um hint no sidecar
            meta.setdefault("remote_registration", {})
            meta["remote_registration"].update(
                {
                    "status": "skipped",
                    "reason": "GN_API_BASE ausente",
                }
            )
            meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2))

        # 4) remove o original da fila
        try:
            mp4.unlink()
        except FileNotFoundError:
            pass

    def _handle_failure(self, mp4: Path, meta_path: Path, err: Exception):
        # incrementa tentativas e decide o que fazer
        try:
            meta = json.loads(meta_path.read_text())
        except Exception:
            meta = {"attempts": 0, "status": "queued"}

        meta["attempts"] = int(meta.get("attempts", 0)) + 1
        meta["updated_at"] = datetime.now(timezone.utc).isoformat()
        meta["last_error"] = str(err)

        if meta["attempts"] >= self.max_attempts:
            meta["status"] = "failed"
            # move para failed/
            fail_mp4 = self.failed_dir / mp4.name
            fail_json = self.failed_dir / meta_path.name
            # grava erro detalhado
            err_path = self.failed_dir / (mp4.stem + ".error.txt")
            err_path.write_text(traceback.format_exc())

            try:
                mp4.replace(fail_mp4)
            except FileNotFoundError:
                pass
            try:
                meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2))
            except Exception:
                pass
            try:
                meta_path.replace(fail_json)
            except FileNotFoundError:
                pass
        else:
            # volta para fila com backoff (deixa lá p/ próxima rodada)
            meta["status"] = "queued_retry"
            meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2))
            time.sleep(1.0 * meta["attempts"])  # backoff linear simples


def main() -> int:
    base = Path(__file__).resolve().parent
    cfg = CaptureConfig(
        buffer_dir=Path("/tmp/recorded_videos"),
        clips_dir=base / "recorded_clips",
        queue_dir=base / "queue_raw",
        device="/dev/video0",
        seg_time=1,
        pre_seconds=40,
        post_seconds=10,
        scan_interval=0.5,
        max_buffer_seconds=60,
    )
    cfg.ensure_dirs()

    # pastas do worker
    out_wm_dir = base / "20_highlights_wm"
    failed_dir = base / "90_failed"
    out_wm_dir.mkdir(parents=True, exist_ok=True)
    failed_dir.mkdir(parents=True, exist_ok=True)

    watermark_path = base / "files" / "grava-nois.png"

    proc = start_ffmpeg(cfg)
    segbuf = SegmentBuffer(cfg)
    segbuf.start()

    # inicia worker
    worker = ProcessingWorker(
        queue_dir=cfg.queue_dir,
        out_wm_dir=out_wm_dir,
        failed_dir=failed_dir,
        watermark_path=watermark_path,
        scan_interval=1.5,
        max_attempts=3,
        wm_margin=24,
        wm_opacity=0.6,
        wm_rel_width=0.2,
    )
    worker.start()

    print(
        f"Gravando… pressione ENTER para capturar {cfg.pre_seconds}s + {cfg.post_seconds}s (Ctrl+C sai)"
    )
    try:
        while True:
            input()  # stdin apenas aqui
            out = build_highlight(cfg, segbuf)
            if out:
                enqueue_clip(cfg, out)  # move p/ queue_raw + salva metadados
    except KeyboardInterrupt:
        print("\nEncerrando…")
    finally:
        segbuf.stop(join_timeout=2)
        try:
            proc.terminate()
        except Exception:
            pass

    return 0


if __name__ == "__main__":
    sys.exit(main())
