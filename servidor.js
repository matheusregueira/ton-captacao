const http = require('http');
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const GIT = '"C:\\Program Files\\Git\\cmd\\git.exe"';
const CWD = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.json': 'application/json',
};

http.createServer((req, res) => {
  console.log('[req]', req.method, req.url);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url.startsWith('/salvar-base')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      console.log('[salvar-base] body recebido, tamanho:', body.length);
      try {
        const arquivo = path.join(CWD, 'base.json');
        fs.writeFileSync(arquivo, body, 'utf8');
        console.log('[salvar-base] base.json salvo em', arquivo);
        execSync(`${GIT} add base.json`, { cwd: CWD, stdio: 'pipe' });
        try {
          execSync(`${GIT} commit -m "Atualiza base Ton via dashboard"`, { cwd: CWD, stdio: 'pipe' });
          console.log('[salvar-base] commit ok');
        } catch(e) { console.log('[salvar-base] nada novo pra commitar'); }
        execSync(`${GIT} push`, { cwd: CWD, stdio: 'pipe' });
        console.log('[salvar-base] push ok');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch(e) {
        console.error('[salvar-base] ERRO:', e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, erro: e.message }));
      }
    });
    return;
  }

  const file = req.url === '/' ? 'index.html' : req.url.slice(1);
  const ext  = path.extname(file);
  const type = MIME[ext] || 'text/plain';

  fs.access(file, fs.constants.F_OK, err => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(file).pipe(res);
  });
}).listen(8085, () => {
  console.log('=== Ton Captacao v2 rodando em http://localhost:8085 ===');
  console.log('CWD:', CWD);
});
