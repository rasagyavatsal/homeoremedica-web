# HomeoRemedica Web

The HomeoRemedica website and server API. Users can search four classical materia medica, sign in with Firebase Authentication, and save cases to Firestore. The full remedy dataset is closed source and is not included in this repository.

## Repositories

The application is maintained across two public repositories:

| Repository | Responsibility |
| --- | --- |
| [`homeoremedica-web`](https://github.com/rasagyavatsal/homeoremedica-web) | Next.js website, search API, authentication, and saved-case API. |
| [`homeoremedica-mobile`](https://github.com/rasagyavatsal/homeoremedica-mobile) | Expo/Android client. It uses Firebase Authentication and calls this repository's API; it does not bundle remedy data. |

The web server handles remedy searches for both clients. Firebase stores accounts and saved cases separately from the remedy dataset.

## Local development

```sh
npm ci
cp .env.example .env.local
npm run generate-demo-db
npm run dev
```

Open <http://localhost:3000>. The demo generator creates `server-data/demo-remedies.db` from the small synthetic dataset in `data/demo-remedies.json`; both the generated database and local environment files are ignored by Git.

Search works against the demo database without Firebase Admin credentials. To use sign-in and saved cases, fill in the `NEXT_PUBLIC_FIREBASE_*` browser configuration and the `FB_ADMIN_*` service-account values in `.env.local`. Never commit the Admin private key.

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run generate-demo-db` | Rebuild the local synthetic SQLite database. |
| `npm run test` | Run the Vitest suite once. |
| `npm run test:watch` | Run tests in watch mode. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Type-check without emitting files. |
| `npm run build` | Regenerate the demo database and create an optimized Next.js build. |
| `npm run validate` | Run the database generator, lint, type-check, tests, and build. |

## Runtime boundaries

- Search routes are public. The SQLite file is opened only by server code in `lib/db` and is never served from `public/`.
- Protected routes expect a Firebase ID token as `Authorization: Bearer <token>`. Cases are stored under each user's Firestore path.
- The mobile app's `EXPO_PUBLIC_API_URL` must point to this application's `/api` base URL, for example `http://192.168.1.10:3000/api` when testing on a physical device.

The API surface used by the clients is:

| Route | Access | Purpose |
| --- | --- | --- |
| `GET /api/symptoms/search` | Public | Search symptom text within one book. |
| `POST /api/find` | Public | Rank remedies matching selected symptoms. |
| `POST /api/remedies/search` | Public | Return the web client's detailed remedy search results. |
| `POST /api/auth/session` | Firebase token | Create or update the signed-in user record. |
| `GET, POST /api/cases` | Firebase token | List or create saved cases. |
| `PATCH, DELETE /api/cases/:id` | Firebase token | Update or delete a saved case. |

## Breaking changes

Commit [`4f53ce4`](https://github.com/rasagyavatsal/homeoremedica-web/commit/4f53ce4ec9f3afd060071a364511d107fdf21f07) (`feat(books)!: use canonical book identifiers`) replaced the original book identifiers throughout the web app and API:

| Retired | Current |
| --- | --- |
| `clarke` | `clarke-MM` |
| `boericke` | `boericke-MM` |
| `kent` | `kent-lectures` |
| `allen` | `allen-nosodes` |

The retired identifiers are intentionally unsupported. Browser-persisted searches that use them are discarded, and saved cases containing them are omitted rather than migrated. Signed-in users with affected cases receive a dismissible notice.

`homeoremedica-mobile` currently uses the retired identifiers. They must be migrated or mapped before the mobile app can use the current web API; otherwise its search requests are rejected.

Request validation and client-side API types are maintained separately in the web and mobile repositories. Coordinate API and persistence changes across both repositories.
