# 构建阶段
FROM node:16-alpine as build-stage

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 安装所有依赖
RUN npm ci

# 如果不存在mysql_data，则创建mysql_data文件
RUN mkdir -p ./mysql_data

# 复制应用源代码
COPY . .

# 构建生产版本
RUN npm run build

# 调试：检查构建结果
RUN ls -la /app/dist

# 生产阶段
FROM nginx:alpine as production-stage

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 调试：检查nginx配置
RUN cat /etc/nginx/nginx.conf

# 复制构建产物到nginx目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 调试：检查复制的文件
RUN ls -la /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]