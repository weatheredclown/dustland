(function () {
  const list = document.getElementById('sessions');
  const refreshBtn = document.getElementById('refresh');

  function join(sess) {
    alert('Joining ' + sess.name + ' at ' + sess.host + ':' + sess.port);
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
      .catch(() => {
        list.textContent = 'No sessions found';
      });
  }

  refreshBtn.onclick = refresh;
  refresh();
})();
