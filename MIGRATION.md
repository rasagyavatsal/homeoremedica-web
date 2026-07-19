# Migration record

This repository was created on 2026-07-12 as a history-free snapshot of `apps/web/` from private monorepo commit `08bfbc0e429ff51557f9463dc22460a373b3c4c3`. The standalone history begins at commit `b01fa95f0e35a2fcf99d3ddf8d4229606eb6ff29`; earlier web history remains in the private monorepo.

## Path mapping

- `apps/web/` became the repository root.
- Non-data source from `packages/shared/` was copied initially and later folded into the web application's domain modules in commit `3e325f1ff126f205b5042434581c251e84643753`.

## Data boundary

The full dataset is closed source. These paths were deliberately excluded:

- `dataset/`
- `packages/shared/data/`
- `apps/web/public/data/remedies.db`

Local development uses the small synthetic dataset in `data/demo-remedies.json`. Generated SQLite files are ignored by Git.
