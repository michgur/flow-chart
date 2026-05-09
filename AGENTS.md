# Agent Context

Use `vp` for everything (never `npm`/`pnpm` directly): `vp add/remove`, `vp dev`, `vp check`, `vp test`, `vp build`.
Before finishing work, run `vp check` and `vp build`; run `vp test` too (it may exit non-zero if no test files exist yet).
Use `vp exec` for running local binaries, and `vp dlx` for remote (never `npx`/`pnpx dlx` directly).

## Project Packages

- `react`, `react-dom`: app runtime/UI.
- `@xyflow/react`: flow editor/canvas.
- `tailwindcss`, `@tailwindcss/vite`: styling + Tailwind Vite integration.
- `@phosphor-icons/react`: icons.
- `vite-plus`, `@vitejs/plugin-react`: toolchain/config.

## Rules

- Always look up library usage in context7 before implementing or changing framework/library patterns.
- HAVE TASTE - the most important rule. Produce simple, readable code, with a minimal code surface, clear contracts, and simple names.
- Naming - have taste, for example if the component is GoalInput, then the props should be `value` and `onChange(goal)`, not `goalValueItemElement` and `onGoalUpdateChangedGoal(goalItemElement)`. If something could be determined by the context - it shouldn't appear in the variable name.
- No redundant type checks - if you have a parameter `x: X`, don't check `typeof x === 'object' && 'x_field' in x`. Just assume type correctness.
- Don't create functions for basic normalizations that should be inlined, e.g.

```
function normalizeGoalNameForFunIsAwesome(goalName: string | null | undefined) {
    return goalName === "" ? typeof goal === "string" ? "" : null ? undefined fucks sake
}
```

should just be an inline `const normalized = name === "" ? undefined : name ?? undefined` or something like that.

- Same for variables, if it's only used once it could probably be inlined.
- "You Might Not Need an Effect" - React docs.
- Complex stateful logic goes in custom hooks.
- I DESPISE overprotective code. Outside of user input, always assume state correctness. Prefer relying on react-flow for correct state, to writing custom guardrail logic.
- I also HATE 'one line helper functions' that are only used once, and just obstruct the logic (just inline it, as said above).
