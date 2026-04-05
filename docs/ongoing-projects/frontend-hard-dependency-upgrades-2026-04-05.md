# Frontend Hard Dependency Upgrade Findings

Date: 2026-04-05

Scope: evaluate the remaining non-trivial frontend package upgrades after the easy same-major sweep.

## Execution plan

### Phase 1: low-risk package move

Goal: remove the easiest remaining major upgrade first.

Steps:

1. Upgrade `lucide-react` from `0.556.0` to `1.7.0`.
2. Run `npm run build` and `npm run lint`.
3. Spot-check a few icon-heavy screens for visual regressions.

Exit criteria:

- Build passes.
- Lint passes.
- No obvious icon naming or rendering regressions in common UI paths.

### Phase 2: unblock TypeScript 6

Goal: clear the config issue preventing TypeScript 6 adoption.

Steps:

1. Replace or remove the current `baseUrl` usage in [frontend/tsconfig.json](/home/aiwithapex/projects/ai-search/frontend/tsconfig.json#L20).
2. Preserve the `@/*` alias behavior in a TS6-compatible way.
3. Upgrade to `typescript@6.0.2`.
4. Run `npm run build` and inspect any new compiler diagnostics.
5. Only if needed as a temporary bridge, add `ignoreDeprecations: "6.0"` and log it as debt to remove.

Exit criteria:

- TypeScript 6 build passes without relying on unresolved deprecation errors.
- Alias imports still resolve correctly in editor tooling and build output.

### Phase 3: unblock Vite 8

Goal: migrate the build config away from the Vite 7-only chunking setup.

Steps:

1. Replace object-form `build.rollupOptions.output.manualChunks` in [frontend/vite.config.ts](/home/aiwithapex/projects/ai-search/frontend/vite.config.ts#L25).
2. Prefer the smallest viable migration first:
   - remove manual chunking entirely and measure output
   - or convert to function-form chunking
3. Upgrade to `vite@8.0.3`.
4. Run `npm run build`.
5. Compare output size, chunk count, and any new warnings.
6. If chunk behavior degrades materially, evaluate a follow-up move to Rolldown `codeSplitting`.

Exit criteria:

- Vite 8 build passes.
- The app still loads correctly.
- Chunking is acceptable enough that we are not forced into an immediate follow-up refactor.

### Phase 4: migrate `@hey-api/openapi-ts`

Goal: remove the remaining audit blocker and modernize the generated client path safely.

Steps:

1. Upgrade `@hey-api/openapi-ts` to `0.95.0` in an isolated branch or dedicated commit.
2. Re-run client generation from [frontend/openapi-ts.config.ts](/home/aiwithapex/projects/ai-search/frontend/openapi-ts.config.ts#L1).
3. Inspect the generated output shape and compare exports against the current client entrypoint in [frontend/src/client/index.ts](/home/aiwithapex/projects/ai-search/frontend/src/client/index.ts#L1).
4. Update runtime configuration in [frontend/src/main.tsx](/home/aiwithapex/projects/ai-search/frontend/src/main.tsx#L10) if the old `OpenAPI` pattern is no longer valid.
5. Update error handling in [frontend/src/utils.ts](/home/aiwithapex/projects/ai-search/frontend/src/utils.ts#L2) if generated error types change.
6. Run `npm run build`, `npm run lint`, and a focused manual test pass on authenticated API flows.
7. Re-run `npm audit` and confirm the remaining `handlebars` / `tar` chain is gone.

Exit criteria:

- Generated client is stable and checked in.
- Authenticated requests still work.
- Error handling still behaves correctly.
- Remaining audit vulnerabilities attributable to `@hey-api/openapi-ts` are cleared.

### Recommended sequence

1. `lucide-react`
2. `typescript`
3. `vite`
4. `@hey-api/openapi-ts`

### Rollback posture

- Keep each phase in its own commit so failures are easy to isolate.
- Do not combine the `openapi-ts` migration with unrelated UI or tooling changes.
- If a phase introduces too much uncertainty, stop there and document the exact blocker before continuing.

## Current hard-upgrade set

From `npm outdated` in `frontend/`:

| Package | Current | Latest | Initial assessment |
| --- | --- | --- | --- |
| `@hey-api/openapi-ts` | `0.73.0` | `0.95.0` | High risk |
| `lucide-react` | `0.556.0` | `1.7.0` | Lower risk than expected |
| `typescript` | `5.9.3` | `6.0.2` | Medium risk |
| `vite` | `7.3.1` | `8.0.3` | Medium-high risk |

## Executive summary

`lucide-react` is the only major upgrade that looks safe enough to promote out of the "difficult" bucket. A scratch upgrade to `1.7.0` built cleanly with no code changes.

`typescript` and `vite` both have concrete, local blockers that are straightforward to describe:

- TypeScript 6 currently fails on this repo because `baseUrl` is now deprecated and errors by default.
- Vite 8 currently fails because this app uses object-form `build.rollupOptions.output.manualChunks`, which Vite 8 no longer supports.

`@hey-api/openapi-ts` remains the most sensitive upgrade. It is the package blocking the remaining audit vulnerabilities, but it also sits on the generated API client boundary and the app is coupled to the old generated runtime shape.

## Package-by-package findings

### 1. `lucide-react` `0.556.0 -> 1.7.0`

Status: likely safe to upgrade next.

Why it looked difficult:

- It is a major version jump.
- The package is imported broadly across the UI. Current usage appears in 64 frontend files.

What I checked:

- `npm view lucide-react version peerDependencies --json` reports `1.7.0` as latest and lists React 19 as supported.
- A scratch upgrade to `lucide-react@1.7.0` still passed `npm run build`.

Local coupling:

- The package is used pervasively in component imports, but only as icon component imports from `lucide-react`.

Risk call:

- Compile/build risk looks low.
- Visual drift risk is non-zero because Lucide 1.x releases include icon shape changes and additions, so a quick UI spot-check is still warranted.

Recommendation:

- Move this into the next real upgrade pass.
- After bumping, run the normal frontend build and visually spot-check a few icon-heavy views.

### 2. `typescript` `5.9.3 -> 6.0.2`

Status: blocked by current `tsconfig.json`.

What I checked:

- `npm view typescript version --json` reports `6.0.2` as latest.
- A scratch upgrade to `typescript@6.0.2` failed immediately on `npm run build`.

Observed failure:

```text
error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.
Specify compilerOption '"ignoreDeprecations": "6.0"' to silence this error.
```

Local blocker:

- [frontend/tsconfig.json](/home/aiwithapex/projects/ai-search/frontend/tsconfig.json#L20) uses `"baseUrl": "."`.
- The same file also uses path aliases at [frontend/tsconfig.json](/home/aiwithapex/projects/ai-search/frontend/tsconfig.json#L21).

Impact assessment:

- This is not a broad TypeScript-6 incompatibility in app code.
- It is a targeted config migration issue.
- Because the project already sets explicit `target`, `module`, `moduleResolution`, `strict`, and `lib`, most TS6 default changes should not hit this repo directly.

Recommendation:

- Remove the `baseUrl` dependency in `tsconfig.json` and keep aliasing via `paths` only if possible.
- If the team wants a quick temporary unblock, `ignoreDeprecations: "6.0"` is available, but that should be treated as transitional only.
- After the config cleanup, rerun the TS6 spike before attempting Vite 8.

### 3. `vite` `7.3.1 -> 8.0.3`

Status: blocked by current build config.

What I checked:

- `npm view vite version engines --json` reports `8.0.3` as latest and requires Node `^20.19.0 || >=22.12.0`.
- The local environment is already on Node `v24.14.0`, so runtime support is not the blocker.
- A scratch upgrade to `vite@8.0.3` failed on `npm run build`.

Observed failure:

```text
Warning: Invalid output options (1 issue found)
- For the "manualChunks". Invalid type: Expected Function but received Object.

TypeError: manualChunks is not a function
```

Local blocker:

- [frontend/vite.config.ts](/home/aiwithapex/projects/ai-search/frontend/vite.config.ts#L25) uses object-form `manualChunks`.

Additional note:

- The Vite 8 spike also emitted a warning that the `esbuild` option coming from `vite:react-swc` is deprecated in favor of `oxc`. That warning did not appear to be the fatal issue in this repo.

Impact assessment:

- This is a real migration, not a routine patch.
- The good news is that the failing point is specific and obvious.

Recommendation:

- Replace object-form chunking with a supported strategy before attempting the real Vite 8 upgrade.
- The likely options are: drop the custom manual chunking entirely and re-measure build output; convert to a function-based chunking strategy short-term; or migrate to Rolldown `codeSplitting` if the team wants to align with Vite 8’s preferred direction.

### 4. `@hey-api/openapi-ts` `0.73.0 -> 0.95.0`

Status: highest-risk upgrade and the one tied to the remaining audit findings.

Why it matters:

- `npm audit` shows the remaining 5 vulnerabilities all sit behind this package upgrade path.
- It owns the generated API client surface for the frontend.

Local coupling:

- The generator config lives at [frontend/openapi-ts.config.ts](/home/aiwithapex/projects/ai-search/frontend/openapi-ts.config.ts#L1).
- The current config explicitly uses deprecated legacy Axios client generation at [frontend/openapi-ts.config.ts](/home/aiwithapex/projects/ai-search/frontend/openapi-ts.config.ts#L8).
- The app currently imports old generated runtime exports from [frontend/src/client/index.ts](/home/aiwithapex/projects/ai-search/frontend/src/client/index.ts#L2).
- Runtime configuration depends on `OpenAPI.BASE` and `OpenAPI.TOKEN` in [frontend/src/main.tsx](/home/aiwithapex/projects/ai-search/frontend/src/main.tsx#L10).
- Error handling also depends on the generated `ApiError` type in [frontend/src/main.tsx](/home/aiwithapex/projects/ai-search/frontend/src/main.tsx#L21) and [frontend/src/utils.ts](/home/aiwithapex/projects/ai-search/frontend/src/utils.ts#L2).
- The app also imports generated API types from `@/client/types.gen` in 35 files.

What I checked:

- `npm view @hey-api/openapi-ts version peerDependencies --json` reports `0.95.0` as latest.
- The latest package now declares TypeScript support as `>=5.5.3 || >=6.0.0 || 6.0.1-rc`.
- A scratch generator run with `0.95.0` was not trustworthy enough to use as a clean diff baseline: the CLI reported success in a temp copy, but the temp output tree did not materialize cleanly afterward. I do not want to over-interpret that result, but it does reinforce that this should be upgraded in a dedicated branch rather than via a blind forced audit fix.

Why this is risky from the upstream side:

- Hey API’s migration notes explicitly mark legacy clients as deprecated and say they must be prefixed with `legacy/`.
- The current repo is still on that deprecated path via `legacy/axios`.
- Hey API’s migration notes also document the removal of the old internal default client flow in favor of generated service-owned clients with `setConfig()`.
- The current repo is still built around the older `OpenAPI` export shape.

Practical interpretation for this repo:

- The config itself is not obviously obsolete because it already uses `plugins`, `asClass`, and the newer single-argument `methodNameBuilder(operation)` form.
- The real risk is the generated runtime contract, not the config syntax.
- The most likely break surface is replacing `OpenAPI`-style global configuration with the newer generated client configuration flow.

Recommendation:

- Treat this as a dedicated upgrade project, not a routine package bump.
- Do it after or alongside the TypeScript cleanup, not before.
- Plan to regenerate the client, inspect the generated export surface, update [frontend/src/main.tsx](/home/aiwithapex/projects/ai-search/frontend/src/main.tsx#L10) and [frontend/src/utils.ts](/home/aiwithapex/projects/ai-search/frontend/src/utils.ts#L2) for any runtime API changes, and rerun the app flow that depends on auth, request errors, and generated service methods.

## Recommended upgrade order

1. Upgrade `lucide-react` first. It already passed a scratch build and should be low drama.
2. Upgrade `typescript` next by removing the `baseUrl` blocker in `tsconfig.json`.
3. Upgrade `vite` after that by rewriting or removing object-form `manualChunks`.
4. Upgrade `@hey-api/openapi-ts` last in a dedicated branch, because it is both the audit blocker and the generated-client/runtime migration.

## Suggested next actions

- Short-term low-risk move: upgrade `lucide-react`.
- Short-term unblocker: clean up `tsconfig.json` so TypeScript 6 can be tested properly.
- Build-system migration: replace the manual chunk map in `vite.config.ts`.
- Security-driven project: do a focused `@hey-api/openapi-ts` migration to eliminate the remaining audit findings.

## References

- TypeScript 6.0 release notes: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html
- Vite migration from v7: https://vite.dev/guide/migration
- Hey API migration notes: https://heyapi.dev/openapi-ts/migrating
- Hey API Axios client docs: https://heyapi.dev/openapi-ts/clients/axios
- Hey API output docs: https://heyapi.dev/openapi-ts/output
- Lucide releases: https://github.com/lucide-icons/lucide/releases
