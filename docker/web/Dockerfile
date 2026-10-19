FROM node:22-bookworm-slim

RUN corepack enable && corepack prepare pnpm@10.34.3 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG VITE_API_URL=http://localhost:18182
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

ENV PORT=8080
EXPOSE 8080

CMD ["pnpm", "exec", "vite", "preview", "--host", "0.0.0.0", "--port", "8080"]
