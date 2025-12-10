import { bootstrapHostedFirebase } from '../hosting/firebase-bootstrap.js';
import { ServerSession, type ServerSessionSnapshot } from './server-session.js';

type ServerModeUiState = {
  message: string;
  buttonLabel: string;
  buttonDisabled: boolean;
  buttonTooltip: string;
};

async function initServerModeControls(): Promise<void> {
  const container = document.getElementById('serverModeActions');
  if (!container) {
    return;
  }

  await bootstrapHostedFirebase();

  const statusEl = container.querySelector<HTMLElement>('[data-role="server-mode-status"]');
  const button = container.querySelector<HTMLButtonElement>('button');
  if (!statusEl || !button) {
    return;
  }

  const session = ServerSession.get();
  let latestSnapshot = session.getSnapshot();

  button.addEventListener('click', () => {
    if (button.disabled) {
      return;
    }
    if (latestSnapshot.status === 'authenticated') {
      void session.signOut();
    } else {
      void session.signIn();
    }
  });

  session.subscribe(snapshot => {
    latestSnapshot = snapshot;
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
        message: 'Sign in to manage cloud saves.',
        buttonLabel: '☁ Sign in',
        buttonDisabled: false,
        buttonTooltip: 'Use your Google account to sync modules.',
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
        buttonLabel: '☁ Sign out',
        buttonDisabled: false,
        buttonTooltip: 'Sign out of cloud saves.',
      };
    }
    case 'error': {
      const detail = snapshot.error?.message ?? 'Unknown issue';
      return {
        message: `Cloud error: ${detail}`,
        buttonLabel: '☁ Retry',
        buttonDisabled: false,
        buttonTooltip: 'Tap to try signing in again.',
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
