FROM node:20-alpine

# 工作目录
WORKDIR /app

# 基础工具
RUN apk add --no-cache bash git

# 复制 package.json（用于安装依赖）
COPY frontend/package*.json ./frontend/

# 进入 frontend 目录安装依赖
WORKDIR /app/frontend
RUN npm install

# 回到根目录
WORKDIR /app

# 暴露端口
EXPOSE 3000

# 默认启动开发服务器
CMD ["sh", "-c", "cd frontend && npm run dev"]