# Step 1: Build the Angular app
FROM node:19 AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Angular app for production
RUN npm run build --prod

# Step 2: Set up the web server
FROM nginx:alpine

# Copy the build output to the nginx server
COPY --from=build /app/dist/risk-view/browser /usr/share/nginx/html
COPY --from=build /app/nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
