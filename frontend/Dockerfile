# Stage 1: Build the app
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# 1. Remove the default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# 2. Copy YOUR custom config into Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Copy the built React files (the 'dist' folder)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]