FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=http://localhost:18182
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

EXPOSE 4174
CMD ["npm", "run", "preview"]
