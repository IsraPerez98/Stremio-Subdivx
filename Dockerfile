FROM node as builder

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm ci

RUN npm run build


FROM node

WORKDIR /app

ENV PORT=80

ENV NODE_ENV=production

EXPOSE ${PORT}

COPY package*.json ./

RUN npm ci --production

ENV HOST="58196d6c26cf-stremio-tusubtitulo.baby-beamup.club"

COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/index.js"]