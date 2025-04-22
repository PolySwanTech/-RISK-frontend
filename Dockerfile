# Build Angular
FROM node:18-alpine as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod
# ou --configuration production si tu veux optimiser

# Serveur NGINX
FROM nginx:alpine
COPY --from=build /app/dist/risk-view/browser /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
