# 1. Étape de construction (Build)
FROM node:20-slim AS builder

# Installation d'openssl pour Prisma
RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm ci

# Copie du reste du code et build
COPY . .

RUN npx prisma generate
RUN npm run prebuild
RUN npm run build


WORKDIR /app

# On ne copie que le nécessaire pour alléger l'image
COPY --from=builder /app/package*.json ./

# Variable d'environnement par défaut
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]