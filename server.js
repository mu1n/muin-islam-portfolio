const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5050;
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize path
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Potential local file paths to check
  const candidates = [];

  // 1. In public dir
  candidates.push(path.join(PUBLIC_DIR, pathname));

  // 2. In root dir
  candidates.push(path.join(ROOT_DIR, pathname));

  // 3. Clean route as folder/index.html in root dir
  candidates.push(path.join(ROOT_DIR, pathname, 'index.html'));

  let foundFile = null;
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        const stat = fs.statSync(c);
        if (stat.isFile()) {
          foundFile = c;
          break;
        } else if (stat.isDirectory()) {
          const indexFile = path.join(c, 'index.html');
          if (fs.existsSync(indexFile)) {
            foundFile = indexFile;
            break;
          }
        }
      } catch (e) {}
    }
  }

  if (foundFile) {
    const ext = path.extname(foundFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(foundFile).pipe(res);
  } else {
    // 404 fallback
    const notFoundPage = path.join(ROOT_DIR, '404.html');
    if (fs.existsSync(notFoundPage)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(notFoundPage).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`MUIN ISLAM Portfolio Server running at http://localhost:${PORT}`);
});
