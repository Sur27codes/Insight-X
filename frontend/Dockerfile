FROM node:18-slim AS base

WORKDIR /app

# Copy vendor directory first (needed for file: dependency)
COPY vendor /app/vendor

# Copy frontend package.json
COPY frontend/package.json /app/frontend/package.json
COPY frontend/package-lock.json /app/frontend/package-lock.json

WORKDIR /app/frontend
RUN npm install

# Copy frontend source code
COPY frontend /app/frontend

# RUN npm run build

CMD ["npm", "run", "dev"]
