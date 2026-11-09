# CyberTwin-AGV Dashboard

React 19 + TypeScript + Vite + Tailwind CSS digital-twin UI.

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/ (served by the FastAPI backend)
npm run lint
```

It connects to `ws://<host>:8000/ws/telemetry` when the edge backend is up and
falls back to a built-in simulation otherwise. See the [root README](../README.md).
