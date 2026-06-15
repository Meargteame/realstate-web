# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

# Use npm ci for reproducible, faster production installs
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Optional: pass Mapbox token at build time if you want Mapbox instead of OSM
ARG VITE_MAPBOX_ACCESS_TOKEN=""
ENV VITE_MAPBOX_ACCESS_TOKEN=${VITE_MAPBOX_ACCESS_TOKEN}

RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine

# Run as non-root for security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid

COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config: SPA routing + reverse proxy /api and /uploads to backend
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # gzip\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;\n\
    gzip_min_length 256;\n\
\n\
    # static assets: long cache\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    # API reverse proxy\n\
    location /api/ {\n\
        proxy_pass http://backend:5000/api/;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_read_timeout 60s;\n\
    }\n\
\n\
    # Uploaded files reverse proxy\n\
    location /uploads/ {\n\
        proxy_pass http://backend:5000/uploads/;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
\n\
    # SPA fallback — must be last\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
