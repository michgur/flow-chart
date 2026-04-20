# Agent Context

Use `vp` for everything (never `npm`/`pnpm` directly): `vp add/remove`, `vp dev`, `vp check`, `vp test`, `vp build`.
Before finishing work, run `vp check` and `vp build`; run `vp test` too (it may exit non-zero if no test files exist yet).

## Project Packages

- `react`, `react-dom`: app runtime/UI.
- `@xyflow/react`: flow editor/canvas.
- `tailwindcss`, `@tailwindcss/vite`: styling + Tailwind Vite integration.
- `@phosphor-icons/react`: icons.
- `vite-plus`, `@vitejs/plugin-react`: toolchain/config.

## Research + Implementation Rules

- Always look up library usage in Context7 before implementing or changing framework/library patterns.
- For React Flow, use controlled state (`useNodesState`/`useEdgesState`) and avoid rebuilding nodes/edges every render.
- Avoid viewport flashing: do not churn `fitView`; prefer one-time `fitView` on init when needed.
- Keep contract boundaries clean: container reads/writes only `Script` from `src/data-model.ts`; flow UI state stays internal under `src/flow-chart`.
