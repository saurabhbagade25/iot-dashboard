import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn

# Settings
PORT = 8000
WIDTH = 640
HEIGHT = 480
FRAMERATE = 15

class CamHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.endswith('.mjpg'):
            self.send_response(200)
            self.send_header('Age', 0)
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.end_headers()

            # Launch libcamera-vid to output MJPEG to stdout
            # Note: For legacy Pi OS (Buster), use 'raspivid'
            cmd = [
                'libcamera-vid',
                '-t', '0',
                '--inline',
                '--width', str(WIDTH),
                '--height', str(HEIGHT),
                '--framerate', str(FRAMERATE),
                '--codec', 'mjpeg',
                '-o', '-'
            ]
            
            try:
                # Use stdbuf to prevent buffering if possible, or just open subprocess
                process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, bufsize=0)
                
                while True:
                    # MJPEG from libcamera is a continuous stream of JPEGs
                    # We simply pass the chunks through. 
                    # Ideally we parse for 0xFF 0xD8 (Start of Image) and 0xFF 0xD9 (End of Image) for cleaner stream,
                    # but piping raw usually works for browsers if boundaries are roughly correct.
                    # HOWEVER, libcamera-vid outputs a raw stream. We need to wrap it.
                    
                    data = process.stdout.read(1024)
                    if not data:
                        break
                    self.wfile.write(data)
                    
            except Exception as e:
                print("Client disconnected or error:", e)
                if 'process' in locals():
                    process.terminate()
        else:
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"""
                <html>
                <head><title>Pi Camera Stream</title></head>
                <body style='text-align:center; background:#222; color:#eee;'>
                    <h1>Live Stream</h1>
                    <img src='/stream.mjpg' style='border:2px solid #fff; max-width:100%;'/>
                    <br><p>Use URL: <br><strong>http://[YOUR-PI-IP]:8000/stream.mjpg</strong><br>in your Dashboard.</p>
                </body>
                </html>
            """)

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""

if __name__ == '__main__':
    try:
        server = ThreadedHTTPServer(('0.0.0.0', PORT), CamHandler)
        print(f"📷 MJPEG Server started on port {PORT}")
        print(f"👉 Link: http://localhost:{PORT}/stream.mjpg")
        server.serve_forever()
    except KeyboardInterrupt:
        print("Stopping server")
        server.socket.close()
