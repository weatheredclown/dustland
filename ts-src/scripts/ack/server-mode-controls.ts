import { ServerSession, type ServerSessionSnapshot } from './server-session.js';

type ServerModeUiState = {
  message: string;
  buttonLabel: string;
  buttonDisabled: boolean;
  buttonTooltip: string;
};

function initServerModeControls(): void {
  const container = document.getElementById('serverModeActions');
  if (!container) {
    return;
  }

  const statusEl = container.querySelector<HTMLElement>('[data-role="server-mode-status"]');
  const button = container.querySelector<HTMLButtonElement>('button');
  if (!statusEl || !button) {
    return;
  }

  button.addEventListener('click', () => {
    if (button.disabled) {
      return;
    }
    window.alert?.('Cloud save management is still under construction. Hang tight while we wire it up!');
  });

  const session = ServerSession.get();
  session.subscribe(snapshot => {
    applySnapshot(snapshot, container, statusEl, button);
  });
}

function applySnapshot(
  snapshot: ServerSessionSnapshot,
  container: HTMLElement,
  statusEl: HTMLElement,
  button: HTMLButtonElement,
): void {
  if (snapshot.bootstrap.status !== 'firebase-ready') {
    container.hidden = true;
    return;
  }

  container.hidden = false;
  container.dataset.state = snapshot.status;

  const uiState = describeSnapshot(snapshot);
  statusEl.textContent = uiState.message;
  button.textContent = uiState.buttonLabel;
  button.disabled = uiState.buttonDisabled;
  button.title = uiState.buttonTooltip;
}

function describeSnapshot(snapshot: ServerSessionSnapshot): ServerModeUiState {
  switch (snapshot.status) {
    case 'idle':
      return {
        message: 'Cloud saves preview is warming up.',
        buttonLabel: '☁ Cloud',
        buttonDisabled: false,
        buttonTooltip: 'Preview build – features coming soon.',
      };
    case 'initializing':
      return {
        message: 'Connecting to Dustland cloud…',
        buttonLabel: '☁ Connecting…',
        buttonDisabled: true,
        buttonTooltip: 'Hold tight while we finish booting the client.',
      };
    case 'authenticating':
      return {
        message: 'Signing you in…',
        buttonLabel: '☁ Signing in…',
        buttonDisabled: true,
        buttonTooltip: 'Finalizing authentication with the server.',
      };
    case 'authenticated': {
      const name = formatUserName(snapshot);
      return {
        message: `Signed in as ${name}.`,
        buttonLabel: '☁ Cloud',
        buttonDisabled: false,
        buttonTooltip: 'Manage your cloud saves (coming soon).',
      };
    }
    case 'error': {
      const detail = snapshot.error?.message ?? 'Unknown issue';
      return {
        message: `Cloud error: ${detail}`,
        buttonLabel: '☁ Retry',
        buttonDisabled: false,
        buttonTooltip: 'Tap to try again once the issue is resolved.',
      };
    }
    case 'disabled':
    default:
      return {
        message: 'Cloud saves unavailable.',
        buttonLabel: '☁ Cloud',
        buttonDisabled: true,
        buttonTooltip: 'Server mode is currently disabled.',
      };
  }
}

function formatUserName(snapshot: ServerSessionSnapshot): string {
  const raw = snapshot.user;
  if (!raw) {
    return 'player';
  }
  if (typeof raw.displayName === 'string' && raw.displayName.trim()) {
    return raw.displayName.trim();
  }
  if (typeof raw.email === 'string' && raw.email.trim()) {
    return raw.email.trim();
  }
  return raw.uid || 'player';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServerModeControls, { once: true });
} else {
  initServerModeControls();
}
