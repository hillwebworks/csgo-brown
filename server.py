#!/usr/bin/env python3
"""Local dev server for CSC GO demo — serves HTML at / and /nimda."""
import http.server
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
HTML = "csgoHTML.html"
PORT = 8766


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        if self.path in ("/", "/index.html", "/nimda", "/nimda/"):
            self.path = f"/{HTML}"
        return super().do_GET()


if __name__ == "__main__":
    with http.server.HTTPServer(("", PORT), Handler) as httpd:
        print(f"Serving http://localhost:{PORT}/")
        print(f"Creds page: http://localhost:{PORT}/nimda")
        httpd.serve_forever()
