# 1. Étape de construction (Build)
FROM node:20

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code et build
COPY . .

ENV DATABASE_URL="postgresql://tcg_user:tcg_password@localhost:5434/tcg_database"

RUN npx prisma generate
RUN npm run build


WORKDIR /app


# Variable d'environnement par défaut
ENV NODE_ENV=production


CMD ["node", "dist/index.js"]