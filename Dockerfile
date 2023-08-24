FROM node:20.5.1-slim as node-base

ENV APP="watcher"

WORKDIR "/$APP"

FROM node-base as builder

COPY ./package*.json .
COPY ./tsconfig.json .
COPY ./src ./src

RUN set -eux; \
    npm install && npm run compile;

FROM node-base as release

COPY ./package*.json .
COPY --from=builder "$APP/build" .

RUN set -eux; \
    npm ci; \
    adduser --no-create-home --disabled-password "${APP}"; \
    chown -R "$APP":"$APP" "/$APP/"; \
    npm uninstall npm -g; \
    rm -rf package*.json;

USER "$APP"

ENTRYPOINT ["node", "main.js", "start"]
