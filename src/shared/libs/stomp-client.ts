import { Client } from '@stomp/stompjs';
import { getAuthToken } from '@apis/instance';

let client: Client | null = null;
let activating: Promise<Client> | null = null;

const connectListeners = new Set<(c: Client) => void>();

function getBrokerUrl(): string {
  const url = import.meta.env.VITE_CHAT_WS_URL;
  if (!url) {
    throw new Error('VITE_CHAT_WS_URL이 설정되지 않았습니다.');
  }
  return url;
}

function notifyConnectListeners(): void {
  if (!client?.connected) return;
  for (const fn of connectListeners) {
    fn(client);
  }
}

function waitUntilConnected(c: Client, timeoutMs = 30_000): Promise<void> {
  if (c.connected) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const id = window.setInterval(() => {
      if (c.connected) {
        window.clearInterval(id);
        resolve();
      } else if (Date.now() > deadline) {
        window.clearInterval(id);
        reject(new Error('STOMP 연결 시간 초과'));
      }
    }, 50);
  });
}

function createClient(): Client {
  const c = new Client({
    brokerURL: getBrokerUrl(),
    connectHeaders: {},
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    reconnectDelay: 5_000,
    beforeConnect: async () => {
      const token = await getAuthToken();
      c.connectHeaders = {
        Authorization: token ? `Bearer ${token}` : '',
      };
    },
    onConnect: () => {
      notifyConnectListeners();
    },
    onStompError: (frame) => {
      console.error('[STOMP]', frame.headers, frame.body);
    },
  });
  return c;
}

/** STOMP 연결 보장. 이미 연결돼 있으면 같은 인스턴스 반환 */
export async function ensureStompConnected(): Promise<Client> {
  if (client?.connected) return client;
  if (activating) return activating;

  const p = (async () => {
    if (!client) {
      client = createClient();
    }
    if (!client.active) {
      client.activate();
    }
    await waitUntilConnected(client);
    return client;
  })();

  activating = p;

  try {
    return await p;
  } finally {
    activating = null;
  }
}

export function disconnectStomp(): void {
  connectListeners.clear();
  if (client) {
    client.deactivate();
    client = null;
  }
  activating = null;
}

/** CONNECT/재연결 시 실행. 이미 연결 상태면 즉시 1회 실행 */
export function onStompConnect(handler: (c: Client) => void): () => void {
  connectListeners.add(handler);
  if (client?.connected) {
    handler(client);
  }
  return () => {
    connectListeners.delete(handler);
  };
}

export function getStompClient(): Client | null {
  return client;
}
