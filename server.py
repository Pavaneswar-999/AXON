import os
import sys
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 3030
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

class LuxuryCockpitHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        # Prevent aggressive browser caching during rapid development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_HEAD(self):
        self.handle_request(head_only=True)

    def do_GET(self):
        self.handle_request(head_only=False)

    def handle_request(self, head_only=False):
        path = self.path.split('?')[0].lstrip('/')
        if not path or path == '/':
            path = 'index.html'

        filepath = os.path.join(ROOT_DIR, os.path.normpath(path))
        if not os.path.exists(filepath) or os.path.isdir(filepath):
            self.send_error(404, f"File not found: {self.path}")
            return

        file_size = os.path.getsize(filepath)
        mime_type, _ = mimetypes.guess_type(filepath)
        if not mime_type:
            if filepath.endswith('.js'):
                mime_type = 'application/javascript'
            elif filepath.endswith('.css'):
                mime_type = 'text/css'
            elif filepath.endswith('.mp3'):
                mime_type = 'audio/mpeg'
            elif filepath.endswith('.webp'):
                mime_type = 'image/webp'
            elif filepath.endswith('.svg'):
                mime_type = 'image/svg+xml'
            elif filepath.endswith('.json'):
                mime_type = 'application/json'
            else:
                mime_type = 'application/octet-stream'

        range_header = self.headers.get('Range')
        if range_header and range_header.startswith('bytes='):
            # Parse Range: bytes=start-end
            try:
                parts = range_header.replace('bytes=', '').split('-')
                start = int(parts[0]) if parts[0] else 0
                end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1
                if start >= file_size or end >= file_size or start > end:
                    self.send_error(416, "Requested Range Not Satisfiable")
                    return

                length = end - start + 1
                self.send_response(206)
                self.send_header('Content-Type', mime_type)
                self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                self.send_header('Content-Length', str(length))
                self.send_header('Accept-Ranges', 'bytes')
                self.end_headers()

                if not head_only:
                    with open(filepath, 'rb') as f:
                        f.seek(start)
                        chunk_size = 64 * 1024
                        bytes_to_send = length
                        while bytes_to_send > 0:
                            read_len = min(chunk_size, bytes_to_send)
                            data = f.read(read_len)
                            if not data:
                                break
                            self.wfile.write(data)
                            bytes_to_send -= len(data)
                return
            except Exception as e:
                # Fallback to standard 200 if range parse fails
                pass

        self.send_response(200)
        self.send_header('Content-Type', mime_type)
        self.send_header('Content-Length', str(file_size))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()

        if not head_only:
            with open(filepath, 'rb') as f:
                chunk_size = 64 * 1024
                while True:
                    data = f.read(chunk_size)
                    if not data:
                        break
                    self.wfile.write(data)

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, LuxuryCockpitHandler)
    print(f"Luxury Axon Server running on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    run()

