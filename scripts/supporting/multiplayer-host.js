import http from 'node:http';

const sessions = [];

http.createServer((req, res) => {
  if (req.url === '/sessions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sessions));
  } else if (req.url === '/sessions' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const sess = JSON.parse(body || '{}');
        if (sess && sess.name && sess.port) {
          sessions.push(sess);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } else {
          res.writeHead(400);
          res.end();
        }
      } catch {
        res.writeHead(400);
        res.end();
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(7777, () => {
  console.log('Lobby server running on http://localhost:7777');
});
