# ---------------------------- PRODUCTION MODE
# FROM node:24-slim AS build
# WORKDIR /app
# ENV NEXT_TELEMETRY_DISABLED=1
# COPY package*.json ./
# RUN npm ci --ignore-scripts
# COPY . .
# RUN npm run build
#
# FROM node:24-slim
# WORKDIR /app
# ENV NODE_ENV=production PORT=3000 NEXT_TELEMETRY_DISABLED=1
# COPY --from=build /app/.next/standalone ./
# COPY --from=build /app/.next/static ./.next/static
# COPY --from=build /app/public ./public
# EXPOSE 3000
# CMD ["node","server.js"]

# ---------------------------- DEV MODE
FROM node:24

WORKDIR /app
COPY package*.json ./
RUN npm ci --unsafe-perm

COPY . .
CMD ["npm","run","dev"]
