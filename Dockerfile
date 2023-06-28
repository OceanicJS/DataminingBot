FROM node:20-alpine

WORKDIR /app
COPY . .
RUN echo -e "update-notifier=false\nloglevel=error" > ~/.npmrc
RUN npm install --development
RUN npm run build
CMD npm run start
