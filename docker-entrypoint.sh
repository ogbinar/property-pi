#!/bin/sh
exec node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const dist = fs.readdirSync('./dist').filter(f => f.endsWith('.html'));
const index = dist.length ? dist[0] : 'index.html';
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/' || url.pathname.endsWith('/')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('./dist/' + index));
  } else {
    const filePath = './dist' + url.pathname;
    try {
      fs.accessSync(filePath);
      const ext = path.extname(filePath);
      const types = { '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'application/font-sff', '.ico': 'image/x-icon' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
    } catch {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});
server.listen(5173, '0.0.0.0', () => console.log('Preview server on port 5173'));
"
