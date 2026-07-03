# Roger — Portfolio

A premium, engineering-focused portfolio built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and React Three Fiber.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## Build

```bash
npm run build   # type-checks then builds to dist/
npm run preview # serve the production build locally
```

## Making it yours

All of the content you'll want to personalize lives in `src/data/`:

- `src/data/site.ts` — name, role, tagline, email, GitHub/LinkedIn URLs, "now playing" placeholder
- `src/data/projects.ts` — your projects (name, description, role, stack, architecture, links)
- `src/data/experience.ts` — timeline entries (internships, education, freelance, achievements)
- `src/data/techStack.ts` — the two marquee rows in the About section

Nothing in these files is lorem ipsum — it's realistic sample content standing in for yours, so swap it out directly.

### 3D Avatar

`src/components/three/AvatarScene.tsx` currently renders a stylized abstract
placeholder (a distorted core + orbiting rings) because there's no `Roger.glb`
yet. It already has the full motion rig: idle breathing, floating, and
mouse-follow rotation, plus HDR-style environment lighting. To use a real
model once you have one:

1. Drop your file at `public/models/Roger.glb`.
2. In `AvatarScene.tsx`, replace `<PlaceholderFigure />` with:
   ```tsx
   const { scene } = useGLTF('/models/Roger.glb');
   return <primitive object={scene} scale={1.4} position={[0, -1.2, 0]} />;
   ```
3. Call `useGLTF.preload('/models/Roger.glb')` near the top of the file.

The parent rig (breathing / floating / mouse-follow / reduced-motion handling) works unchanged.

### Spotify "Now Playing"

`src/data/site.ts` exports a static `nowPlaying` object. Wire it up to a real
now-playing endpoint (Spotify's Web API + a small serverless proxy, since the
API requires a server-side secret) and replace the static import in
`SpotifyBar.tsx` with a fetch/poll.

### Chat Playground

`src/contexts/ChatContext.tsx` simulates a WebSocket connection end-to-end
(connect → online → send → typing → reply) entirely on the client. To back it
with a real server, swap the `setTimeout`-based mock in that file for actual
`WebSocket` event handlers — the rest of the UI (message list, typing
indicator, unread badge, timestamps) needs no changes.

The 5×5 color grid beneath the chat input is a disabled UI preview for a
future WLED smart-lighting integration — see `src/components/chat/IoTGrid.tsx`.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 3 · Framer Motion · React Three Fiber · Drei · Lucide React

## Accessibility

- Semantic landmarks, skip-to-content link, visible focus rings
- Keyboard-operable navigation, theme toggle, and chat panel
- `prefers-reduced-motion` is respected globally (CSS animations, Framer Motion via `MotionConfig`, and the 3D scene)
