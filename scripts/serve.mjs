import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.md':'text/markdown; charset=utf-8' };

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    const filePath = path.resolve(root, relative);
    if (!filePath.startsWith(root)) throw new Error('bad path');
    const info = await stat(filePath);
    const target = info.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    const body = await readFile(target);
    res.writeHead(200, { 'content-type': mime[path.extname(target)] || 'application/octet-stream', 'cache-control':'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type':'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Fallout demo: http://127.0.0.1:${port}`));
