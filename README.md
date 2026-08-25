Hermes Office 3D — a real-time 3D visualization of the Hermes multi-agent backend's task
decomposition flow (VP -> Manager -> 10 worker agents -> synthesis), replacing a scripted
2D-canvas loading animation. Built with Next.js, React Three Fiber, `recast-navigation`
(navmesh + Crowd for real pathfinding and local avoidance — no manual collision code) and
`@react-three/rapier` (physics for the billiards/ping-pong minigames).

## Connecting to the real Hermes backend

By default the app runs in demo mode: the sidebar's "Broadcast Directive" button fires a
scripted sequence of the same events a real backend would send. To drive it from the actual
Hermes backend instead, set:

```bash
# .env.local
NEXT_PUBLIC_HERMES_WS_URL=wss://your-hermes-backend/ws
```

The backend should push JSON messages shaped like `src/types/events.ts`'s `HermesBackendEvent`
(`task_received`, `subtask_assigned`, `subtask_progress`, `subtask_done`, `synthesis_start`,
`done`, `courier_dispatch`, ...) — see `src/hooks/useHermesSocket.ts`. The connection status dot
in the sidebar header reflects live connection state (grey = demo mode/offline, amber =
connecting, green = connected, red = error/retrying). Authentication for the WebSocket
connection is not yet defined (open question — add whatever scheme the backend requires,
e.g. a token query param or a Sec-WebSocket-Protocol header, in `useHermesSocket.ts`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
