FROM node:22-alpine AS front
WORKDIR /front
COPY front/package*.json ./
RUN npm ci
COPY front .
# .env.production deixa VITE_API_URL vazio: o front chama a API na mesma origem
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY api/package*.json ./
RUN npm ci --omit=dev
COPY api/src ./src
COPY --from=front /front/dist ./public
ENV HOST=0.0.0.0 PORT=3000 STATIC_DIR=/app/public DATABASE_FILE=/data/database.json
VOLUME /data
EXPOSE 3000
CMD ["node", "src/server.js"]
