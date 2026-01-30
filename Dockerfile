# --- 阶段 1：构建 ---
FROM node:18-alpine AS builder

WORKDIR /app

# 禁用 Next.js 遥测
ENV NEXT_TELEMETRY_DISABLED=1

# 复制依赖项文件
COPY package*.json ./
RUN npm install

# 复制所有源代码
COPY . .

# 执行构建并导出静态文件 (Next.js 导出到 out 目录)
RUN npm run build && npm run export

# --- 阶段 2：运行 ---
FROM nginx:alpine

# 从构建阶段复制导出的静态文件
COPY --from=builder /app/out /usr/share/nginx/html

# 复制 resources.json 确保它在根目录可用
# 虽然 public 文件夹的内容会被导出，但显式确保其存在
COPY --from=builder /app/public/resources.json /usr/share/nginx/html/resources.json

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
