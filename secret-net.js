(function () {
  const missions = [
    {
      id: 'boot-sequence',
      title: 'Mission 1 · Boot sequence breach',
      node: 'veil.net',
      narrative:
        'The Veil uplink is spinning up for the first time in months. Provision the shell nodes without tipping the registrar. Keep the apex quiet, bring the mirrors online, and route courier mail through the sanctioned relay.',
      goals: [
        'Point veil.net to the primary covert host at 10.12.42.7 using an A record.',
        'Alias www to the apex so it tracks the same address.',
        'Deliver mail to courier.veil-relay.ax with priority 10.',
      ],
      solution: ['root-main', 'www-alias', 'mx-relay'],
      hints: [
        {
          when: (selected) => selected.includes('root-decoy'),
          message:
            'The sandbox address still points to a diagnostic rack. Pull it before the auditors notice the out-of-date PTR.',
        },
        {
          when: (selected) => selected.includes('www-stub'),
          message: 'A CNAME to a raw IP bleeds metadata. Alias www back to the apex.',
        },
      ],
    },
    {
      id: 'mirror-chase',
      title: 'Mission 2 · Ghost mirror chase',
      node: 'ghostglass.city',
      narrative:
        'A rival collective is fuzzing our mirror mesh. You need a hot standby but anything that loops traffic or exposes test nodes will be flagged.',
      goals: [
        'Keep the apex pointed at 203.0.113.88.',
        'Bring mirror.ghostglass.city online as a CNAME back to the apex.',
        'Publish a TXT key with the lattice fingerprint ghostglass-city-4f7 to validate the backup tunnel.',
      ],
      solution: ['ghost-apex', 'ghost-mirror', 'ghost-txt'],
      hints: [
        {
          when: (selected) => selected.includes('ghost-loop'),
          message: 'Looping a CNAME at @ resolves to itself forever. Control needs a mirror pointed outward.',
        },
        {
          when: (selected) => selected.includes('ghost-old-ip'),
          message: 'The deprecated IP leaks the staging subnet. Use the new public address.',
        },
      ],
    },
    {
      id: 'summit-silence',
      title: 'Mission 3 · Silent summit broadcast',
      node: 'summit.blackchannel',
      narrative:
        'An encrypted summit is streaming through Secret/Net. Only the CDN and verification nodes should appear. Strip any extra services and prepare the fallback record.',
      goals: [
        'Serve the apex from 198.51.100.66.',
        'Expose stream.summit.blackchannel as a CNAME to cdn.secret-net.live.',
        'Hold a low-priority backup A record pointing to 198.51.100.92.',
        'Block any lingering SSH test record from entering the zone.',
      ],
      solution: ['summit-apex', 'summit-stream', 'summit-backup'],
      hints: [
        {
          when: (selected) => selected.includes('summit-ssh'),
          message: 'That SSH host was for QA only. Pull it before the summit feed begins.',
        },
        {
          when: (selected, expected) =>
            expected.some((id) => !selected.includes(id)) && selected.includes('summit-backup'),
          message:
            'Backups are good, but command still wants the primary and stream records locked before they will sign off.',
        },
      ],
    },
  ];

  const state = {
    index: 0,
    zone: new Map(),
    completed: new Set(),
  };

  const scenarioPanel = document.getElementById('secretNetScenarioPanel');
  const missionCard = document.getElementById('secretNetMissionCard');
  const candidateList = document.getElementById('secretNetCandidateList');
  const zoneContainer = document.getElementById('secretNetZone');
  const statusEl = document.getElementById('secretNetStatus');
  const feedbackEl = document.getElementById('secretNetFeedback');
  const resetButton = document.getElementById('secretNetResetButton');
  const checkButton = document.getElementById('secretNetCheckButton');
  const nextButton = document.getElementById('secretNetNextButton');

  function init() {
    renderScenarioList();
    loadMission(0);
    updateStatus();
    resetButton.addEventListener('click', resetZone);
    checkButton.addEventListener('click', checkConfiguration);
    nextButton.addEventListener('click', advanceMission);
  }

  function renderScenarioList() {
    scenarioPanel.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'secret-net__scenario-list';
    missions.forEach((mission, idx) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secret-net__scenario-item';
      if (idx === state.index) {
        button.classList.add('is-active');
      }
      if (state.completed.has(mission.id)) {
        button.setAttribute('data-complete', 'true');
      }
      button.addEventListener('click', () => {
        loadMission(idx);
        updateScenarioSelection();
      });

      const title = document.createElement('h3');
      title.className = 'secret-net__scenario-title';
      title.textContent = mission.title;

      const meta = document.createElement('p');
      meta.className = 'secret-net__scenario-meta';
      meta.textContent = state.completed.has(mission.id)
        ? 'Status: completed'
        : 'Status: pending';

      button.appendChild(title);
      button.appendChild(meta);
      list.appendChild(button);
    });
    scenarioPanel.appendChild(list);
  }

  function updateScenarioSelection() {
    const buttons = scenarioPanel.querySelectorAll('.secret-net__scenario-item');
    buttons.forEach((button, idx) => {
      button.classList.toggle('is-active', idx === state.index);
      const mission = missions[idx];
      const meta = button.querySelector('.secret-net__scenario-meta');
      if (state.completed.has(mission.id)) {
        button.setAttribute('data-complete', 'true');
        if (meta) {
          meta.textContent = 'Status: completed';
        }
      } else {
        button.removeAttribute('data-complete');
        if (meta) {
          meta.textContent = 'Status: pending';
        }
      }
    });
  }

  function loadMission(index) {
    state.index = index;
    state.zone.clear();
    nextButton.hidden = true;
    feedbackEl.innerHTML = '';
    renderMissionCard();
    renderCandidateList();
    renderZone();
    updateStatus();
  }

  function renderMissionCard() {
    const mission = missions[state.index];
    missionCard.innerHTML = '';

    const title = document.createElement('h2');
    title.className = 'secret-net__mission-title';
    title.textContent = mission.title;

    const domain = document.createElement('p');
    domain.className = 'secret-net__mission-domain';
    domain.textContent = `Node: ${mission.node}`;

    const narrative = document.createElement('p');
    narrative.className = 'secret-net__mission-narrative';
    narrative.textContent = mission.narrative;

    const subtitle = document.createElement('h3');
    subtitle.className = 'secret-net__mission-subtitle';
    subtitle.textContent = 'Objectives';

    const goals = document.createElement('ul');
    goals.className = 'secret-net__mission-goals';
    mission.goals.forEach((goal) => {
      const item = document.createElement('li');
      item.textContent = goal;
      goals.appendChild(item);
    });

    missionCard.appendChild(title);
    missionCard.appendChild(domain);
    missionCard.appendChild(narrative);
    missionCard.appendChild(subtitle);
    missionCard.appendChild(goals);
  }

  function renderCandidateList() {
    const mission = missions[state.index];
    candidateList.innerHTML = '';
    mission.candidates.forEach((candidate) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'secret-net__candidate';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = state.zone.has(candidate.id);
      input.addEventListener('change', () => {
        toggleRecord(candidate, input.checked);
      });

      const body = document.createElement('div');
      body.className = 'secret-net__candidate-body';

      const meta = document.createElement('div');
      meta.className = 'secret-net__candidate-meta';
      meta.innerHTML = `
        <span>${candidate.host}</span>
        <span>${candidate.type}</span>
        <span>${candidate.ttl}</span>
      `;

      const value = document.createElement('strong');
      value.textContent = candidate.value;

      const description = document.createElement('p');
      description.className = 'secret-net__candidate-description';
      description.textContent = candidate.description;

      body.appendChild(meta);
      body.appendChild(value);
      body.appendChild(description);

      wrapper.appendChild(input);
      wrapper.appendChild(body);
      candidateList.appendChild(wrapper);
    });
  }

  function toggleRecord(candidate, isSelected) {
    if (isSelected) {
      state.zone.set(candidate.id, candidate);
    } else {
      state.zone.delete(candidate.id);
    }
    renderZone();
    feedbackEl.innerHTML = '';
  }

  function renderZone() {
    if (!state.zone.size) {
      zoneContainer.innerHTML = '<p class="secret-net__zone-empty">Zone file is empty.</p>';
      return;
    }
    const table = document.createElement('table');
    table.className = 'secret-net__zone-table';
    const head = document.createElement('thead');
    head.innerHTML = `
      <tr>
        <th>Host</th>
        <th>Type</th>
        <th>Value</th>
        <th>TTL</th>
      </tr>
    `;
    table.appendChild(head);

    const body = document.createElement('tbody');
    Array.from(state.zone.values()).forEach((record) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.host}</td>
        <td>${record.type}</td>
        <td>${record.value}</td>
        <td>${record.ttl}</td>
      `;
      body.appendChild(row);
    });
    table.appendChild(body);
    zoneContainer.innerHTML = '';
    zoneContainer.appendChild(table);
  }

  function resetZone() {
    state.zone.clear();
    renderZone();
    const checkboxes = candidateList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    feedbackEl.innerHTML = '';
    nextButton.hidden = true;
  }

  function checkConfiguration() {
    const mission = missions[state.index];
    const expected = mission.solution;
    const selected = Array.from(state.zone.keys());
    const sortedExpected = [...expected].sort();
    const sortedSelected = [...selected].sort();
    const isMatch =
      sortedExpected.length === sortedSelected.length &&
      sortedExpected.every((id, idx) => id === sortedSelected[idx]);

    if (isMatch) {
      feedbackEl.innerHTML = renderFeedback(
        'Command accepts the zone. Move to the next breach.',
        'success'
      );
      nextButton.hidden = false;
      nextButton.textContent = state.index === missions.length - 1 ? 'Run debrief' : 'Next mission';
      state.completed.add(mission.id);
      updateScenarioSelection();
      updateStatus();
      return;
    }

    for (const hint of mission.hints || []) {
      if (hint.when(selected, expected)) {
        feedbackEl.innerHTML = renderFeedback(hint.message, 'warning');
        return;
      }
    }

    const missing = sortedExpected.filter((id) => !state.zone.has(id));
    const extras = sortedSelected.filter((id) => !expected.includes(id));
    const parts = [];
    if (missing.length) {
      parts.push(`Still missing: ${missing.length} required record${missing.length > 1 ? 's' : ''}.`);
    }
    if (extras.length) {
      parts.push(`Unexpected records detected: ${extras.length}.`);
    }
    feedbackEl.innerHTML = renderFeedback(
      parts.length ? parts.join(' ') : 'Almost there—double-check the dossier.',
      'warning'
    );
  }

  function renderFeedback(message, tone) {
    const classes = ['secret-net__feedback-message'];
    if (tone === 'success') {
      classes.push('secret-net__feedback-message--success');
    } else {
      classes.push('secret-net__feedback-message--warning');
    }
    return `<div class="${classes.join(' ')}">${message}</div>`;
  }

  function advanceMission() {
    if (state.index < missions.length - 1) {
      loadMission(state.index + 1);
      updateScenarioSelection();
    } else {
      feedbackEl.innerHTML = renderFeedback(
        'All nodes hardened. Debrief packet transmitted to command.',
        'success'
      );
      nextButton.hidden = true;
    }
  }

  function updateStatus() {
    const mission = missions[state.index];
    statusEl.textContent = `Now briefing ${mission.title} (${state.index + 1}/${missions.length})`;
  }

  missions[0].candidates = [
    {
      id: 'root-main',
      host: '@',
      type: 'A',
      value: '10.12.42.7',
      ttl: '300',
      description: 'Primary covert host managed by Secret/Net operations.',
    },
    {
      id: 'root-decoy',
      host: '@',
      type: 'A',
      value: '10.12.10.4',
      ttl: '300',
      description: 'Old diagnostics server. Leaving it published leaks the lab subnet.',
    },
    {
      id: 'www-alias',
      host: 'www',
      type: 'CNAME',
      value: '@',
      ttl: '300',
      description: 'Points www traffic to the apex without exposing the IP.',
    },
    {
      id: 'www-stub',
      host: 'www',
      type: 'CNAME',
      value: '10.12.42.7',
      ttl: '300',
      description: 'Alias directly to an IP. Registrars flag this instantly.',
    },
    {
      id: 'mx-relay',
      host: '@',
      type: 'MX',
      value: '10 courier.veil-relay.ax',
      ttl: '1800',
      description: 'Courier relay for encrypted mail dispatch.',
    },
    {
      id: 'mx-decoy',
      host: '@',
      type: 'MX',
      value: '20 mail.veil-labs.internal',
      ttl: '1800',
      description: 'Internal QA mail host. Remove before going live.',
    },
  ];

  missions[1].candidates = [
    {
      id: 'ghost-apex',
      host: '@',
      type: 'A',
      value: '203.0.113.88',
      ttl: '600',
      description: 'New hardened mirror hub with traffic scrubbing.',
    },
    {
      id: 'ghost-old-ip',
      host: '@',
      type: 'A',
      value: '203.0.113.12',
      ttl: '600',
      description: 'Deprecated staging IP still in the registry cache.',
    },
    {
      id: 'ghost-mirror',
      host: 'mirror',
      type: 'CNAME',
      value: '@',
      ttl: '600',
      description: 'Mirror host points back to the apex for failover.',
    },
    {
      id: 'ghost-loop',
      host: '@',
      type: 'CNAME',
      value: '@',
      ttl: '600',
      description: 'Self-referential CNAME. Creates an endless resolution loop.',
    },
    {
      id: 'ghost-txt',
      host: 'mirror',
      type: 'TXT',
      value: 'lattice=ghostglass-city-4f7',
      ttl: '600',
      description: 'Verification fingerprint shared with the mirror ops team.',
    },
    {
      id: 'ghost-mx',
      host: '@',
      type: 'MX',
      value: '10 mail.ghostglass.city',
      ttl: '600',
      description: 'Mail routing is handled elsewhere. Ignore this decoy.',
    },
  ];

  missions[2].candidates = [
    {
      id: 'summit-apex',
      host: '@',
      type: 'A',
      value: '198.51.100.66',
      ttl: '300',
      description: 'Primary CDN ingress dedicated to the summit broadcast.',
    },
    {
      id: 'summit-ssh',
      host: 'ssh',
      type: 'A',
      value: '198.51.100.24',
      ttl: '300',
      description: 'Leftover QA SSH endpoint. Publishing it exposes admin access.',
    },
    {
      id: 'summit-stream',
      host: 'stream',
      type: 'CNAME',
      value: 'cdn.secret-net.live',
      ttl: '300',
      description: 'Stream endpoint distributed across the secure CDN.',
    },
    {
      id: 'summit-backup',
      host: '@',
      type: 'A',
      value: '198.51.100.92',
      ttl: '3600',
      description: 'Low priority backup host if the main CDN goes dark.',
    },
    {
      id: 'summit-fallback',
      host: 'fallback',
      type: 'CNAME',
      value: 'stream.summit.blackchannel',
      ttl: '3600',
      description: 'Extra alias not needed if stream already points to the CDN.',
    },
  ];

  init();
})();
