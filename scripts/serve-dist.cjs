const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
}

function resolveFile(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0] || '/');
  const filePath = path.normalize(path.join(root, cleanPath === '/' ? '/index.html' : cleanPath));
  if (!filePath.startsWith(root)) return null;
  return filePath;
}

const server = http.createServer((req, res) => {
  const filePath = resolveFile(req.url || '/');
  if (!filePath) {
    return send(res, 403, 'Forbidden');
  }

  const tryFile = (candidatePath) => {
    fs.readFile(candidatePath, (readErr, data) => {
      if (readErr) {
        if (candidatePath !== path.join(root, 'index.html')) {
          return tryFile(path.join(root, 'index.html'));
        }
        return send(res, 500, `Failed to read file: ${readErr.message}`);
      }

      const ext = path.extname(candidatePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      send(res, 200, data, contentType);
    });
  };

  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      return tryFile(path.join(root, 'index.html'));
    }
    return tryFile(filePath);
  });
});

server.listen(port, host, () => {
  console.log(`Dashboard ready at http://${host}:${port}`);
});
