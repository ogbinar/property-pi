#!/bin/sh
exec node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const dist = fs.readdirSync('./dist').filter(f => f.endsWith('.html'));
const index = dist.length ? dist[0] : 'index.html';
const types = { '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'application/font-sff', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/' || u.pathname.endsWith('/')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('./dist/' + index));
  } else {
    const fp = './dist' + u.pathname;
    try {
      fs.accessSync(fp);
      const e = path.extname(fp);
      res.writeHead(200, { 'Content-Type': types[e] || 'application/octet-stream' });
      res.end(fs.readFileSync(fp));
    } catch {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});
server.listen(5173, '0.0.0.0', () => console.log('Preview server on port 5173'));
"
