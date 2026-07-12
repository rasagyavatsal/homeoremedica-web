# HomeoRemedica Web

Standalone Next.js website and API. The browser and mobile application query the API; only server code can open the remedies SQLite database.

## Local development

```sh
cp .env.example .env.local
pnpm install
pnpm generate-demo-db
pnpm dev
```

When `REMEDIES_DB_PATH`, `REMEDIES_BUCKET`, and `REMEDIES_OBJECT` are unset, the server uses the generated synthetic database at `server-data/demo-remedies.db`.

## Production database

Firebase App Hosting should set these runtime-only values:

```text
REMEDIES_DB_PATH=/tmp/remedies.db
REMEDIES_BUCKET=<private-bucket-name>
REMEDIES_OBJECT=production/remedies-YYYY-MM-DD.db
REMEDIES_DB_SHA256=<manifest-sha256>
```

Grant the App Hosting runtime service account `roles/storage.objectViewer` on only that bucket. Keep public access prevention and uniform bucket-level access enabled. Never place a production database under `public/`.

Deploying a new database means uploading an immutable versioned object, updating `REMEDIES_OBJECT` and `REMEDIES_DB_SHA256`, and rolling out a new App Hosting revision. The previous object remains available for rollback.

## GitHub automatic rollouts

Firebase development and production are isolated:

- `homeoremedica-dev` is the repository default and `main` must deploy only to the `homeoremedica-web-dev` backend.
- `homeoremedica` is production. Only the owner should have Firebase IAM access or initiate production releases.
- Development builds use the generated synthetic remedies database. They cannot read the private production remedies bucket.
- Production App Hosting values are retained in `deployment/apphosting.production.yaml`; do not replace `apphosting.yaml` or connect production to `main`.

The development App Hosting backend still requires billing to be attached to `homeoremedica-dev`. After that, create `homeoremedica-web-dev`, connect this repository's `main` branch to it, and enable Email/Password Authentication. Production releases should remain owner-controlled and use a protected release branch or manual deployment.

## Validation

```sh
pnpm validate
```

This repository has a clean history and contains no full remedy dataset.
