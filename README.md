# Vite+ Monorepo Overrides Reproduction

This repository is a minimal, continuously testable reproduction for the Vite+ monorepo
configuration pattern documented in the Monorepo guide.

It demonstrates:

- one root `vite.config.ts` for shared Vite+ config
- `lint.overrides` for package-specific Oxlint behavior
- `fmt.overrides` for package-specific Oxfmt behavior
- split config fragments imported into the root config
- package-local `build` scripts executed through `vp run -r build`

## Verify

```bash
pnpm install
pnpm verify
```

`pnpm verify` runs:

- `vp check`
- `vp run -r build`
- temporary failure probes that assert the React and console lint overrides are actually active

## Layout

```text
apps/
  api/      Node API package; console logging is allowed through lint overrides.
  web/      React app package; React lint rules are enabled through lint overrides.
packages/
  ui/       Shared React UI package; React lint rules are enabled through lint overrides.
tooling/
  lint/     Split lint config fragments imported by the root vite.config.ts.
```
