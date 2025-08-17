#!/usr/bin/env python3
import subprocess
import os
import threading
import time
import re
from pathlib import Path
from collections import deque

# ====== CONFIG ======
BUFFER_DIR = "/tmp/recorded_videos"
CURRENT_DIR = Path(__file__).resolve().parent / "recorded_clips"
SEG_TIME = 1  # segundos por segmento
PRE_SECONDS = 40  # janela "antes do clique"
POST_SECONDS = 10  # janela "depois do clique"
SCAN_INTERVAL = 0.5  # varredura do diretório
MAX_BUFFER_SECONDS = 80  # manter no disco no máx. 80 s
MAX_SEGMENTS = max(1, int(MAX_BUFFER_SECONDS / SEG_TIME))

DIR = Path(BUFFER_DIR)
DIR.mkdir(parents=True, exist_ok=True)
CURRENT_DIR.mkdir(parents=True, exist_ok=True)

# ====== ESTADO COMPARTILHADO ======
segments = deque(
    maxlen=MAX_SEGMENTS
)  # caminhos dos arquivos .mp4 (ordenados por tempo)
seg_lock = threading.Lock()
stop_event = threading.Event()

# ====== CALCULA start_number ======
pattern = re.compile(r"buffer(\d{3,})\.mp4$")
existing_nums = []
for f in os.listdir(BUFFER_DIR):
    m = pattern.match(f)
    if m:
        try:
            existing_nums.append(int(m.group(1)))
        except ValueError:
            pass
start_num = max(existing_nums) + 1 if existing_nums else 0

# ====== INICIA FFMPEG (segmentação contínua) ======
ffmpeg_cmd = [
    "ffmpeg",
    "-nostdin",
    "-f",
    "v4l2",
    "-i",
    "/dev/video0",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-tune",
    "zerolatency",
    # força I-frames alinhados ao SEG_TIME para cortes previsíveis
    "-force_key_frames",
    f"expr:gte(t,n_forced*{SEG_TIME})",
    "-f",
    "segment",
    "-segment_time",
    str(SEG_TIME),
    "-segment_start_number",
    str(start_num),
    "-reset_timestamps",
    "1",
    str(DIR / "buffer%06d.mp4"),
]
proc = subprocess.Popen(
    ffmpeg_cmd,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
    stdin=subprocess.DEVNULL,
)


def index_segments():
    """
    Varre o diretório periodicamente, mantém só os arquivos mais recentes,
    e atualiza o deque 'segments' de forma consistente.
    """
    while not stop_event.is_set():
        files = sorted(DIR.glob("buffer*.mp4"), key=lambda p: p.stat().st_mtime)

        # Remove excedentes mais antigos no disco (evita encher /tmp)
        extra = files[:-MAX_SEGMENTS]
        for p in extra:
            try:
                p.unlink()
            except FileNotFoundError:
                pass

        # Mantém os mais novos no buffer
        files = files[-MAX_SEGMENTS:]
        with seg_lock:
            segments.clear()
            segments.extend(str(p) for p in files)

        # Espera com possibilidade de acordar cedo se for finalizar
        stop_event.wait(SCAN_INTERVAL)


def build_highlight(pre_s=PRE_SECONDS, post_s=POST_SECONDS):
    """
    Espera o pós-buffer, tira um snapshot do buffer e concatena os arquivos.
    """
    click_ts = time.time()
    print("Botão apertado! Aguardando pós-buffer…")
    # espera o período pós-clique + pequena folga para garantir fechamento do último segmento
    time.sleep(max(0, post_s) + 0.25)

    # quantos segmentos precisamos no total (pre + post)
    need = max(1, int(round((pre_s + post_s) / SEG_TIME)))

    with seg_lock:
        selected = list(segments)[-need:]

    if not selected:
        print("Nenhum segmento disponível — encerrando.")
        return

    # Gera lista para concat demuxer
    list_txt = DIR / f"to_concat_{int(click_ts)}.txt"
    with open(list_txt, "w") as f:
        for seg in selected:
            f.write(f"file '{seg}'\n")

    out = (
        CURRENT_DIR
        / f"highlight_{time.strftime('%Y%m%d-%H%M%S', time.localtime(click_ts))}.mp4"
    )

    # Concatena sem recodificar (fluxo contínuo, mesmos parâmetros)
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


def main():
    print(
        f"Gravando… pressione ENTER para capturar {PRE_SECONDS}s + {POST_SECONDS}s (Ctrl+C sai)"
    )
    t_idx = threading.Thread(target=index_segments, daemon=True)
    t_idx.start()

    try:
        while True:
            input()  # apenas a thread principal mexe no stdin
            build_highlight()
    except KeyboardInterrupt:
        print("\nEncerrando…")
    finally:
        stop_event.set()
        try:
            proc.terminate()
        except Exception:
            pass
        # dá tempo para a thread indexadora sair
        t_idx.join(timeout=2)


if __name__ == "__main__":
    main()
