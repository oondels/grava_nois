#!/usr/bin/env python3
from __future__ import annotations
import sys
from pathlib import Path

from video_core import (
    CaptureConfig,
    SegmentBuffer,
    start_ffmpeg,
    build_highlight,
)


def main() -> int:
    # --- Config padrão do MVP (mesmos valores do seu script) ---
    buffer_dir = Path("/tmp/recorded_videos")
    current_dir = Path(__file__).resolve().parent / "recorded_clips"

    cfg = CaptureConfig(
        buffer_dir=buffer_dir,
        current_dir=current_dir,
        device="/dev/video0",
        seg_time=1,
        pre_seconds=40,
        post_seconds=10,
        scan_interval=0.5,
        max_buffer_seconds=80,
    )
    cfg.ensure_dirs()

    # --- Inicia FFmpeg e indexador ---
    proc = start_ffmpeg(cfg)
    segbuf = SegmentBuffer(cfg)
    segbuf.start()

    print(
        f"Gravando… pressione ENTER para capturar {cfg.pre_seconds}s + {cfg.post_seconds}s (Ctrl+C sai)"
    )
    try:
        while True:
            input()  # stdin apenas aqui
            build_highlight(cfg, segbuf)
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
