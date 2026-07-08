# Backend Stack — Live Presence & Chat

The frontend currently mocks two things client-side so the site works standalone:

- **Chat Playground** (`frontend/src/contexts/ChatContext.tsx`) — canned replies, no network calls.
- **Presence / live cursors** (`frontend/src/contexts/PresenceContext.tsx`) — reads
  `VITE_PRESENCE_WS_URL` from the environment. If it's unset (today), it runs in a
  solo/offline fallback: you're "1 active user," no remote cursors render, and
  renaming only updates `localStorage`. As soon as a real WebSocket endpoint is
  deployed and that env var points to it, guest counts, live chat, and multiplayer
  cursors all light up with no further frontend changes.

This document specifies the backend needed to make that real.

## 1. Goals

1. Track how many visitors are currently on the site ("active users").
2. Give each visitor a stable guest identity (`Guest-4821`) they can rename.
3. Relay chat messages between visitors and Roger in near real time.
4. Broadcast every visitor's live cursor position + name to everyone else.
5. Stay cheap to run and simple to operate for a single-developer portfolio site.

## 2. Recommended stack

| Concern              | Choice                                          | Why |
|-----------------------|--------------------------------------------------|-----|
| Runtime               | Node.js 20+ with TypeScript                      | Matches the frontend's language, one skillset. |
| Transport             | WebSocket via [`ws`](https://github.com/websockets/ws) (or Socket.IO if you want rooms/reconnect helpers out of the box) | Native WebSocket is what the frontend already speaks (`new WebSocket(...)`); `ws` is a thin, fast server for it. |
| HTTP framework        | [Fastify](https://fastify.dev/) (or Express)     | Handles the HTTP upgrade to WS, health checks, and any REST endpoints. |
| Ephemeral state       | [Redis](https://redis.io/) (pub/sub + hashes)    | Source of truth for "who's online" and cursor positions; enables horizontal scaling later. |
| Durable storage (optional) | PostgreSQL                                  | Only needed if you want chat history to survive restarts or want to review messages later. Skip for v1. |
| Hosting               | Fly.io, Railway, or Render                       | All support long-lived WebSocket connections and a managed Redis add-on; cheap at this scale. |
| Process               | Single Node process to start                     | One instance is plenty for portfolio-scale traffic. Redis is included from day one so you can scale to N instances later without a rewrite. |

You do **not** need Kafka, a message queue, or Kubernetes for this scale. Keep it to one Node service + one Redis instance.

## 3. Data model

All presence data is **ephemeral** — nothing here needs to survive a server restart except optionally chat history.

### Guest identity (client-generated, server-validated)
```ts
interface Guest {
  id: string;          // UUID, generated client-side, persisted in localStorage
  guestNumber: number;  // e.g. 4821, generated client-side; server may reassign on collision
  name: string;          // "Guest-4821" by default, renameable, max 24 chars
  color: string;         // hex, derived from guestNumber, used for cursor + chat avatar
}
```

### Presence record (Redis hash, keyed by connection)
```
presence:{guestId} = {
  name, guestNumber, color,
  x, y,              // normalized 0..1 viewport coordinates
  page: "projects",   // optional: which section they're viewing, from IntersectionObserver
  lastSeen: 1730664000000
}
```
TTL each record ~15s and refresh on every heartbeat/cursor update, so a closed tab
without a clean disconnect frame still disappears quickly.

### Chat message (optional persistence)
```ts
interface ChatMessage {
  id: string;
  guestId: string;
  name: string;
  text: string;        // sanitized, length-capped (e.g. 500 chars)
  timestamp: number;
}
```

## 4. WebSocket protocol

Single endpoint, e.g. `wss://presence.yourdomain.com`. JSON text frames both ways.

### Client → Server

| type          | payload                                   | notes |
|---------------|--------------------------------------------|-------|
| `join`        | `{ id, guestNumber, name, color }`         | Sent once on connect. |
| `cursor-move` | `{ cursor: { id, name, guestNumber, color, x, y, updatedAt } }` | Throttled client-side to ~20/sec (already implemented). Server should also drop/coalesce bursts per-connection. |
| `rename`      | `{ id, name }`                              | Server should sanitize + length-cap and re-broadcast. |
| `chat-message`| `{ id, text }`                              | Server stamps `timestamp`, sanitizes, rate-limits, and relays/persists. |
| `ping`        | `{}`                                        | Optional heartbeat if not relying on WS-level ping/pong. |

### Server → Client

| type            | payload                                   | notes |
|------------------|--------------------------------------------|-------|
| `presence-sync`  | `{ activeUsers, cursors: RemoteCursor[] }` | Sent right after `join`, and periodically as a full resync safety net. |
| `cursor-move`    | `{ cursor: RemoteCursor }`                 | Fan-out of another visitor's move. |
| `active-users`   | `{ count }`                                | Sent whenever the count changes. |
| `user-left`      | `{ id, activeUsers }`                      | On disconnect/timeout. |
| `chat-message`   | `{ message: ChatMessage }`                 | Fan-out of a new chat message (from a visitor or from Roger, if you build an admin sender). |

This maps 1:1 to what `PresenceContext.tsx` already expects, so no frontend
changes are needed once this contract is implemented.

## 5. Server responsibilities

1. **On connect (HTTP upgrade → WS):**
   - Validate `Origin` header against an allowlist (your domain only).
   - Assign the connection to an in-memory `Map<connectionId, WebSocket>`.
2. **On `join`:**
   - Sanitize `name` (strip HTML/control chars, cap length, reject empty → fallback to `Guest-####`).
   - Write the presence record to Redis with a short TTL.
   - Increment/read the active-user count from Redis (`SCARD` on a set of connection IDs, or count of live hash keys).
   - Reply with `presence-sync` (current cursors + count), then publish `active-users` to everyone via Redis pub/sub.
3. **On `cursor-move`:**
   - Clamp `x`/`y` to `[0, 1]`.
   - Refresh the Redis TTL for that guest.
   - Publish `cursor-move` to the pub/sub channel; every instance's subscribers fan it out to their local WS connections (this is what makes multi-instance scaling work).
4. **On `rename`:**
   - Sanitize + cap length, update Redis, publish a `cursor-move`-style update (or a dedicated `rename` broadcast) so everyone's cached cursor label updates.
5. **On `chat-message`:**
   - Rate-limit per guest (e.g. 1 message/sec, burst of 5) to prevent spam.
   - Sanitize text (strip HTML, cap length ~500 chars).
   - Optionally persist to Postgres.
   - Publish `chat-message` to all connections.
6. **On disconnect / missed heartbeat:**
   - Remove the Redis presence record.
   - Publish `user-left` with the updated count.
7. **Periodic sweep (every ~10s):**
   - Expire any presence record whose `lastSeen` is stale (covers ungraceful disconnects like closed laptops).

## 6. Scaling notes

- A single Node process handles thousands of idle WebSocket connections fine; you likely won't need more than one instance for a portfolio site.
- Redis is included from the start specifically so that if you ever *do* run multiple instances (e.g. blue/green deploys, or a traffic spike), pub/sub already fans messages out across instances — no protocol change needed, just point every instance at the same Redis.
- If you stay single-instance, Redis can even be swapped for an in-memory `Map`, but keeping Redis costs little and gives you a free upgrade path plus survives process restarts for the active-user count.

## 7. Security & abuse prevention

- **Origin/CORS allowlist** on the WS upgrade — reject connections from other domains.
- **Always use WSS** (TLS) in production; most hosts terminate TLS for you.
- **Sanitize all user-supplied strings** (`name`, chat `text`) server-side — never trust the client, even though the frontend also caps length.
- **Rate limit** per-connection for both cursor updates (defense in depth beyond the client throttle) and chat messages.
- **Cap concurrent connections per IP** to blunt trivial abuse.
- **No PII collected** — guest IDs are random client-generated UUIDs, not tied to accounts, IPs are not stored beyond what your host's access logs already capture. Mention this in a short privacy note if you want to be transparent about the cursor-sharing feature.

## 8. Environment variables

**Backend**
```
PORT=8080
REDIS_URL=redis://...
ALLOWED_ORIGIN=https://yourdomain.com
DATABASE_URL=postgres://...   # optional, only if persisting chat history
```

**Frontend** (`frontend/.env.production`)
```
VITE_PRESENCE_WS_URL=wss://presence.yourdomain.com
```

## 9. Suggested build order

1. **Phase 1 — presence count only.** WS server + Redis, `join`/`presence-sync`/`active-users`/`user-left`. Ship the "N visitors online" pill first since it's the lowest-risk, highest-visible win.
2. **Phase 2 — live cursors.** Add `cursor-move` relay. The frontend's `LiveCursors` component and throttled broadcast are already built and waiting on this.
3. **Phase 3 — real chat.** Replace `ChatContext`'s canned replies with real `chat-message` relay over the same socket (or a second one). Optionally add a tiny authenticated "Roger" sender (a CLI or admin page hitting a REST endpoint) so you can reply live from your phone/laptop.
4. **Phase 4 (optional) — persistence & moderation.** Postgres-backed chat history, a profanity filter, and an admin view of recent messages/guests.

## 10. Suggested project layout

```
backend/
  src/
    server.ts          # Fastify app + WS upgrade handling
    presence/
      store.ts         # Redis-backed presence read/write/TTL helpers
      broadcast.ts      # Redis pub/sub fan-out to local WS clients
    chat/
      messages.ts       # sanitize, rate-limit, optional Postgres persistence
    ws/
      handlers.ts        # join / cursor-move / rename / chat-message handlers
    lib/
      sanitize.ts
      rateLimit.ts
  package.json
  tsconfig.json
```

## 11. Current implemented backend (feature-based monolith)

The backend now includes an Express + TypeScript feature-monolith foundation with
Spotify "now playing" integration.

### Folder structure

```
backend/
  src/
    app.ts
    server.ts
    common/
      config/env.ts
      errors/http-error.ts
      middleware/
        error-handler.ts
        not-found-handler.ts
      types/spotify.ts
    features/
      health/
        health.controller.ts
        health.routes.ts
      spotify/
        spotify.client.ts
        spotify.mapper.ts
        spotify.service.ts
        spotify.controller.ts
        spotify.routes.ts
    routes/
      index.ts
      root.routes.ts
      api.routes.ts
```

### Endpoints

- `GET /health` — basic health check.
- `GET /api/health` — same health check under API namespace.
- `GET /api/spotify/auth/start` — starts Spotify OAuth in browser.
- `GET /api/spotify/auth/callback` — exchanges auth code and returns tokens (including refresh token).
- `GET /api/spotify/now-playing` — returns:

```json
{
  "song": "Track name",
  "artist": "Artist name",
  "isPlaying": true
}
```

When nothing is currently playing, the endpoint returns a stable fallback payload:

```json
{
  "song": "Not playing",
  "artist": "Spotify",
  "isPlaying": false
}
```

### Environment variables for the implemented server

```
PORT=8080
ALLOWED_ORIGIN=https://yourdomain.com
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REFRESH_TOKEN=...
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8080/api/spotify/auth/callback
SPOTIFY_SCOPES=user-read-currently-playing,user-read-playback-state
SPOTIFY_SHOW_DIALOG=true
```

- `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are required to use auth helper endpoints.
- `SPOTIFY_REFRESH_TOKEN` is required for `/api/spotify/now-playing`.
