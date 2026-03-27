FROM node:18-slim

# Tạo thư mục app
WORKDIR /usr/src/app

# Copy dependency
COPY package*.json ./

# Cài đặt express
RUN npm install --only=production

# Copy toàn bộ code
COPY . .

# Mở port 7788
EXPOSE 7788

# Chạy server
CMD [ "node", "server.js" ]
