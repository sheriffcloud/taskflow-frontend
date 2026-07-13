# ── STAGE 1: Install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ── STAGE 2: Build the React app ──────────────────────────────────────────────
# Vite compiles all your JSX files into plain HTML/CSS/JS
# Output goes to /app/dist folder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── STAGE 3: Serve with Nginx ──────────────────────────────────────────────────
# This is the final image — it contains ONLY Nginx and the built files
# No Node.js, no source code, no node_modules
# Result: a tiny, secure production image
FROM nginx:alpine AS runtime

# Copy the built React files into Nginx's serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default Nginx config with ours
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]