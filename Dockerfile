# 使用官方提供的 Node.js 作为基础镜像，选择轻量级的版本以减小镜像大小  
FROM node:16-slim AS build  
  
# 设置工作目录  
WORKDIR /app  
  
# 将当前项目的 package.json 和 package-lock.json 复制到容器中  
COPY package*.json ./  
  
# 安装production依赖，利用npm缓存和离线优先选项  
RUN npm config set cache /tmp/npm-cache --global \  
    && npm install --production --prefer-offline --cache-min 99999999
  
# 将项目的其余文件复制到容器中  
COPY . .  
  
# 使用 ts-node 编译 TypeScript 代码（如果需要的话）  
# RUN tsc -p .  
  
# 设置生产环境变量  
ENV NODE_ENV=prod
  
# 第二阶段构建，使用更小的基础镜像来减小最终镜像大小  
FROM node:16-alpine AS production  
  
# 设置工作目录  
WORKDIR /app  
  
# 从第一阶段复制 node_modules 目录和编译后的代码（如果是编译型项目）  
COPY --from=build /app/node_modules ./node_modules  
COPY --from=build /app/dist ./dist
# COPY --from=build /app/src ./src
COPY --from=build /app/package*.json ./  
  
# 暴露端口  
EXPOSE 3000  
  
# 运行 ts-node 命令启动应用，或者运行编译后的 JavaScript 代码  
# CMD ["ts-node", "src/index.ts"]  
CMD ["node", "dist/index.js"] # 如果是编译型项目，则运行编译后的代码