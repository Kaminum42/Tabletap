# 使用官方提供的 Node.js 作为基础镜像，选择轻量级的版本以减小镜像大小  
FROM node:16-slim AS build  
  
# 设置工作目录  
WORKDIR /app  

# 将依赖项复制到容器中  
COPY node_modules ./node_modules

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 清除不需要的依赖项
RUN npm prune --production

# 复制编译后的代码
COPY ./dist ./dist

# 设置生产环境变量  
ENV NODE_ENV=prod
  
# 第二阶段构建，使用更小的基础镜像来减小最终镜像大小  
FROM node:16-alpine AS production  
  
# 设置工作目录  
WORKDIR /app  
  
# 从第一阶段复制 node_modules 目录和编译后的代码
COPY --from=build /app/node_modules ./node_modules  
COPY --from=build /app/dist ./dist
  
# 暴露端口  
EXPOSE 3000  

# 运行编译后的代码
CMD ["node", "dist/index.js"]