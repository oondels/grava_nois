from __future__ import annotations
import os
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from tempfile import NamedTemporaryFile
from pathlib import Path
from typing import Tuple
from video_core import upload_file_to_signed_url


STORE = {"body": b"", "headers": {}}


class PutHandler(BaseHTTPRequestHandler):
    def do_PUT(self):  # noqa: N802
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except Exception:
            length = 0
        body = self.rfile.read(length) if length > 0 else b""
        STORE["body"] = body
        STORE["headers"] = {k: v for k, v in self.headers.items()}
        # Responde OK
        self.send_response(200, "OK")
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"ok")

    def log_message(self, fmt, *args):  # suprime logs do servidor
        pass


def run_server_in_thread() -> Tuple[HTTPServer, int]:
    srv = HTTPServer(("127.0.0.1", 0), PutHandler)  # porta aleatória
    port = srv.server_port
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    return srv, port


def main() -> int:
    print("[test] Subindo servidor HTTP local (PUT)…")
    srv, port = run_server_in_thread()
    try:
        # cria arquivo temporário com conteúdo conhecido
        with NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            data = os.urandom(256 * 1024)  # 256 KiB
            tmp.write(data)
            tmp_path = Path(tmp.name)

        print(f"[test] Arquivo de teste: {tmp_path} ({tmp_path.stat().st_size} bytes)")
        url = f"http://127.0.0.1:{port}/upload/test.mp4?sig=fake"
        print(f"[test] Fazendo upload para {url}")
        status, reason, headers = upload_file_to_signed_url(url, tmp_path, content_type="video/mp4", timeout=10.0)
        print(f"[test] Resposta: HTTP {status} {reason} | headers: {headers}")

        if not (200 <= status < 300):
            print("[test] Falhou: status não-2xx")
            return 2

        recv = STORE.get("body", b"")
        if recv != data:
            print(f"[test] Conteúdo divergente: enviado={len(data)}B recebido={len(recv)}B")
            return 3
        print("[test] Conteúdo verificado com sucesso (bytes idênticos)")
        print("[test] Headers recebidos:")
        for k, v in STORE.get("headers", {}).items():
            print(f"    {k}: {v}")
        return 0
    finally:
        srv.shutdown()
        srv.server_close()
        try:
            tmp_path.unlink(missing_ok=True)  # type: ignore[name-defined]
        except Exception:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
