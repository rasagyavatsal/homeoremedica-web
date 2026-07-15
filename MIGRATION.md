# Migration record

Extracted from private monorepo commit `08bfbc0e429ff51557f9463dc22460a373b3c4c3` on 2026-07-12. The original private monorepo remains the history archive.

Old `apps/web` content became this repository. The former `packages/shared` source now lives alongside its sole consumer in the web application's domain modules. Its remedy data was excluded. The tracked `public/data/remedies.db` was intentionally excluded because public Git and Firebase Hosting history would expose it.
