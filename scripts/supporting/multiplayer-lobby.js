(function () {
  const list = document.getElementById('sessions');
  const refreshBtn = document.getElementById('refresh');
  const hostBtn = document.getElementById('host');
  const HOST_PORT = 9000;

  function join(sess) {
    window.location.href = `dustland.html?host=${encodeURIComponent(sess.host)}&port=${sess.port}`;
  }

  function refresh() {
    list.textContent = 'Loading...';
    fetch('http://localhost:7777/sessions')
      .then(r => r.json())
      .then(data => {
        list.textContent = '';
        data.forEach(sess => {
          const li = document.createElement('li');
          const btn = document.createElement('button');
          btn.textContent = sess.name;
          btn.onclick = () => join(sess);
          li.appendChild(btn);
          list.appendChild(li);
        });
        if (!data.length) list.textContent = 'No sessions found';
      })
      .catch(err => {
        list.textContent = 'Error: ' + (err?.message || err);
      });
  }

  async function host() {
    const name = prompt('Session name?', 'LAN Game') || 'LAN Game';
    hostBtn.disabled = true;
    try {
      await globalThis.Dustland?.multiplayer?.startHost({ port: HOST_PORT });
    } catch (err) {
      alert('Error: ' + (err?.message || err));
      hostBtn.disabled = false;
      return;
    }
    try {
      await fetch('http://localhost:7777/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, host: 'localhost', port: HOST_PORT })
      });
    } catch (err) {
      alert('Error: ' + (err?.message || err));
    }
    window.location.href = `dustland.html?host=localhost&port=${HOST_PORT}`;
  }

  refreshBtn.onclick = refresh;
  hostBtn.onclick = host;
  refresh();
})();
