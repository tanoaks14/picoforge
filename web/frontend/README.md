# PicoForge UI

Reusable React 18 + TypeScript component kit built with Vite. Goals: small, composable files (<400 lines), logic extracted to hooks, and styles isolated via CSS modules.

## Scripts
- `npm run dev` — local dev server
- `npm run build` — type-check + production bundle
- `npm run test` — vitest unit tests
- `npm run lint` — eslint with prettier compatibility
- `npm run storybook` — run Storybook locally on port 6006
- `npm run storybook:build` — build static Storybook

## Structure
- `src/theme` — design tokens
- `src/styles` — global CSS (dark, atmospheric background)
- `src/components/primitives` — reusable building blocks (buttons, inputs, modal, tabs, etc.)
- `src/components/layout` — layout helpers (Stack, Grid, SplitPane, PageShell)
- `src/components/domain` — PicoForge-flavored components (ModuleChip, ConfigForm, etc.)
- `src/hooks` — shared hooks (`useSimulatedData`, `useDisclosure`); add data-fetching hooks here

## Contribution guidelines
- Keep components under ~400 lines; lift state/side effects to hooks.
- Prefer composition over variants explosion; expose simple props.
- Co-locate CSS modules with components; avoid inline one-off styles.
- Provide aria labels for icon-only buttons and interactive elements.
- Add tests for variants and accessibility affordances when introducing new components.

## Sample page
`src/App.tsx` demonstrates wiring primitives, layout, and domain components. Replace simulated data hooks with real API hooks as backend surfaces become available.

## Storybook
Storybook is configured in `ui/.storybook`. Component stories live beside components (e.g. `Button.stories.tsx`, `ModuleTable.stories.tsx`, `ConfigForm.stories.tsx`) and load the shared global theme via `preview.ts`. Use it for visual review and quick a11y checks.

## Environment
Create a `.env` in `ui/` (see `.env.example`) to set `VITE_API_BASE` when your backend is not same-origin. The hooks `useModules` and `useLogs` call `/modules` and `/logs` via this base URL.
