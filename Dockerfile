# Single-image build: the Express backend already serves the built Vite
# frontend itself (see src/app.js -- express.static + a catch-all route to
# index.html), so this is one deployable service, not a frontend/backend
# split.

FROM node:24-alpine AS frontend-build
WORKDIR /app/extranet
COPY extranet/package.json extranet/package-lock.json* ./
RUN npm install
COPY extranet/ ./
# Vite inlines VITE_-prefixed env vars into the bundle at build time, so the
# frontend's API base URL has to be known now, not at container start.
# Defaults to a same-origin relative path, which is correct as long as the
# frontend is served from the same host as the API (the normal case for
# this image) -- override only if they're ever split across two hosts.
ARG VITE_API_URL=""
ARG VITE_FRONTEND_URL=""
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY src/ ./src/
COPY --from=frontend-build /app/extranet/build ./extranet/build

EXPOSE 3000
CMD ["node", "src/app.js"]
