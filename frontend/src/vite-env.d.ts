/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** WebSocket URL for the live presence/chat backend. See backend/BACKEND.md. */
  readonly VITE_PRESENCE_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
