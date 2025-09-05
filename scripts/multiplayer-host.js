import http from 'node:http';

const sessions = [{ name: 'Test Host', host: 'localhost', port: 9000 }];

http.createServer((req, res) => {
  if (req.url === '/sessions') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sessions));
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(7777, () => {
  console.log('Lobby server running on http://localhost:7777');
});
