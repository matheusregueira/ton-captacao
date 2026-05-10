const http = require('http');
const fs   = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
};

http.createServer((req, res) => {
  const file = req.url === '/' ? 'index.html' : req.url.slice(1);
  const ext  = path.extname(file);
  const type = MIME[ext] || 'text/plain';

  fs.access(file, fs.constants.F_OK, err => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(file).pipe(res);
  });
}).listen(8084, () => console.log('Ton Captação rodando em: http://localhost:8084'));
