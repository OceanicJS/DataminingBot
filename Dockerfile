FROM node:20-alpine

WORKDIR /app
RUN echo -e "update-notifier=false\nloglevel=error\nnode-linker=hoisted" > ~/.npmrc
RUN npm install --no-save pnpm
COPY package.json pnpm-lock.yaml ./
RUN npx pnpm install  --frozen-lockfile
COPY . .
RUN npx pnpm build
RUN npx pnpm prune --prod
CMD npx pnpm start
