# Étape 1 : Construction de l'application Angular
FROM node:18 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json (si présents)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source de l'application Angular
COPY . .

# Construire l'application Angular en mode production
RUN npm run build --prod

# Étape 2 : Servir l'application avec NGINX + Lua
FROM openresty/openresty:alpine

# Installer les dépendances nécessaires à Lua + Luarocks
RUN apk add --no-cache git lua5.1 lua5.1-dev gcc musl-dev openssl-dev make curl \
    && curl -R -O https://luarocks.org/releases/luarocks-3.9.1.tar.gz \
    && tar zxpf luarocks-3.9.1.tar.gz \
    && cd luarocks-3.9.1 \
    && ./configure --prefix=/usr/local \
    && make && make install \
    && luarocks install lua-resty-jwt \
    && luarocks install lua-resty-http
# Copier la configuration NGINX
COPY default.conf /etc/nginx/nginx.conf

# Copier le fichier Lua pour la gestion du JWT
COPY jwt.lua /etc/nginx/lua/jwt.lua
COPY app.pub /etc/nginx/keys/public.pem

# Copier les fichiers construits d'Angular dans le répertoire de NGINX
COPY --from=build /app/dist/risk-view/browser /usr/local/openresty/nginx/html

# Exposer le port 80 pour l'accès HTTP
EXPOSE 80

# Démarrer OpenResty (NGINX avec Lua)
CMD ["openresty", "-g", "daemon off;"]
