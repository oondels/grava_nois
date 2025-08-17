#!/usr/bin/env python3
from __future__ import annotations
import os
import re
import time
import threading
import subprocess
from dataclasses import dataclass
from pathlib import Path
from collections import deque
from typing import Deque, List, Optional


# -----------------------------
# Configuração e utilidades
# -----------------------------
@dataclass
class CaptureConfig:
    buffer_dir: Path
    current_dir: Path
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
        self.current_dir.mkdir(parents=True, exist_ok=True)


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

    return subprocess.Popen(
        ffmpeg_cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL,
    )


# -----------------------------
# Buffer de segmentos (indexador)
# -----------------------------
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


# -----------------------------
# Construção do highlight
# -----------------------------
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
        cfg.current_dir
        / f"highlight_{time.strftime('%Y%m%d-%H%M%S', time.localtime(click_ts))}.mp4"
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
