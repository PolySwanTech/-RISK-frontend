# Étape 1 : Construction de l'application Angular
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Étape 2 : Servir l'application avec NGINX + Lua (OpenResty)
FROM openresty/openresty:alpine

# Installer les dépendances nécessaires à Lua + Luarocks
RUN apk add --no-cache git lua5.1 lua5.1-dev gcc musl-dev openssl-dev make \
    && luarocks install lua-resty-jwt \
    && luarocks install lua-resty-http

# Création des répertoires requis
RUN mkdir -p /etc/nginx/lua /etc/nginx/keys

# Copier la configuration NGINX + script Lua + clé publique
COPY default.conf /etc/nginx/nginx.conf
COPY jwt.lua /etc/nginx/lua/jwt.lua
COPY app.pub /etc/nginx/keys/public.pem

# Copier les fichiers Angular buildés
COPY --from=build /app/dist/risk-view/browser /usr/local/openresty/nginx/html

EXPOSE 80

CMD ["openresty", "-g", "daemon off;"]