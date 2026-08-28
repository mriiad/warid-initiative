# Deployment

The Express backend serves the built frontend itself (see `src/app.js` --
`express.static` plus a catch-all route to `index.html`), so this ships as
**one** container, not a separate frontend/backend pair.

## One-time setup

### 1. Database (MongoDB Atlas)

1. Create a free cluster at https://www.mongodb.com/ (see the "Database"
   section in `README.md` for the click-through steps).
2. Create a database user and note the username/password.
3. You'll need five pieces for the env vars below: `DB_HOST` (the
   `mongodb+srv` scheme, already the default), `DB_USER`, `DB_PASSWORD`,
   `DB_NAME` (the cluster/database name), and `DB_SAMPLE` (the random suffix
   Atlas appends to your cluster hostname, e.g. the `abc12` in
   `warid.abc12.mongodb.net`).

### 2. Render service

1. In the [Render dashboard](https://dashboard.render.com/), **New >
   Blueprint**, and point it at this repository. Render reads `render.yaml`
   at the repo root and creates the `warid-app` web service from it.
2. Render will prompt for every env var marked `sync: false` in
   `render.yaml` (the secrets) -- fill these in from step 1's database
   credentials and your SMTP provider's credentials. See `.env.example` for
   what each one does. `JWT_SECRET_KEY`, `REFRESH_SECRET_KEY`, and
   `SECRET_KEY` are generated automatically by Render (`generateValue:
   true`) -- you don't need to supply those.
3. Deploy. Render builds the committed `Dockerfile` and starts the
   container.
4. Once the first deploy is live, copy the service's public URL (Render
   assigns one automatically, e.g. `https://warid-app.onrender.com`) and set
   `FRONTEND_URL` to that same URL in the service's environment settings,
   then trigger a redeploy. This is a chicken-and-egg step: the URL doesn't
   exist until after the first deploy.

### 3. First administrator

1. Register the user who should become the first administrator through the
   deployed application.
2. From a trusted shell or one-off process configured with the production
   database environment variables, run:

   ```sh
   npm run bootstrap:admin -- --username <registered-username>
   ```

The command promotes that existing user only when the database has no
administrator. It exits without changing data if an administrator already
exists or the username is unknown. Do not expose this command through an HTTP
endpoint; use the existing admin-protected promotion API for every later
administrator.

### 4. Frontend API base URL

The frontend is built as part of the same Docker image (see the
`frontend-build` stage in `Dockerfile`), and Vite inlines `VITE_`-prefixed
env vars into the bundle at *build* time, not at container start. The
Dockerfile defaults `VITE_API_URL` to an empty string, which resolves to
same-origin relative requests -- correct as long as the frontend and API
stay on the same host, which they do here. You only need to override
`VITE_API_URL`/`VITE_FRONTEND_URL` as Docker build args if you ever split
the frontend onto a different host than the API.

## Ongoing deploys

Render redeploys automatically on every push to the branch it's watching
(configure this in the service's Settings tab -- typically `main` or
`develop`). CI (`.github/workflows/ci.yml`) validates that the Docker image
still builds on every PR and push, independently of Render's own build.

### One-time data backfills

A few changes add a new required field to existing documents and ship a
backfill script for it. Run these once, from a trusted shell configured with
the production database environment variables, right after deploying the
version that introduces them -- skipping one doesn't corrupt data, but does
leave existing accounts/admins missing something the new code expects of
everyone going forward:

- `npm run backfill:admin-roles` -- sets `role: 'principal'` on every existing
  admin (issue #183). Safe to skip: `requireAdminRole.js` already treats a
  missing role as principal, this just makes it explicit for the UI.
- `npm run backfill:activate-users` -- sets `isActive: true` on every
  existing account (issue #357). **Not safe to skip**: login now refuses an
  account with `isActive: false` once mail is configured, and every account
  created before this field existed has `isActive: false` -- skipping this
  locks all of them out.

## Local parity

To build and run the same image locally:

```sh
docker build -t warid-app .
docker run -p 3000:3000 --env-file .env warid-app
```

(Copy `.env.example` to `.env` and fill in real values first.)
