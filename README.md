# Image Viewer Application

这是一个现代化的图片管理系统，采用前后端分离架构，支持Docker部署。

## 技术栈

### 后端
- Node.js + Express
- MySQL 数据库 (通过 Sequelize ORM)
- Multer 文件上传

### 前端
- Vue 3
- Element Plus UI 组件库
- Vue Router 路由管理

## 功能特性

- 图片上传和管理
- 图片展示和浏览
- 图片信息编辑
- 响应式设计
- Docker 容器化部署

## 本地开发

### 环境要求
- Node.js >= 14
- MySQL >= 5.7 (本地开发) 或 Docker (容器化部署)

### 数据库初始化

在运行应用前，需要先创建数据库和表。可以使用以下 SQL 脚本初始化数据库：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS imageviewer;
USE imageviewer;

-- 创建图片表
CREATE TABLE IF NOT EXISTS images (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    category TEXT,
    remark TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 启动后端服务

```bash
# 安装依赖
npm install

# 启动 MySQL (如果本地运行)
# mysqld

# 启动后端服务
npm start
```

默认情况下，后端服务将在 `http://localhost:3000` 上运行。

### 启动前端开发服务器

```bash
# 进入客户端目录
cd client

# 安装依赖
npm install

# 启动开发服务器
npm run serve
```

前端开发服务器默认在 `http://localhost:8080` 上运行。

### 同时启动前后端

```bash
npm run dev:full
```

这将同时启动后端服务和前端开发服务器。

## 生产环境构建

### 构建前端应用

```bash
cd client
npm run build
```

构建后的文件将位于 `client/dist` 目录中。

## Docker 部署

本项目支持完整的 Docker 容器化部署，包含后端服务、前端应用和 MySQL 数据库。

### 部署步骤

1. 确保已安装 Docker 和 Docker Compose
2. 在项目根目录下运行以下命令：

```bash
docker-compose up -d
```

该命令将启动三个容器：
- MySQL 数据库服务
- Node.js 后端服务 (端口 3000)
- Nginx 前端应用 (端口 80)

### 访问应用

- 前端界面: http://localhost
- 后端 API: http://localhost:3000

### 数据持久化

MySQL 数据和上传的图片都会持久化存储在 Docker 卷中，即使容器被删除也不会丢失数据。

## API 接口

### 获取图片列表
```
GET /api/images
```

### 上传图片
```
POST /api/images
```

### 更新图片信息
```
PUT /api/images/:id
```

### 删除图片
```
DELETE /api/images/:id
```

## 环境变量

### 后端
- `PORT`: 后端服务端口，默认 3000
- `DB_HOST`: MySQL 主机地址，默认 localhost
- `DB_PORT`: MySQL 端口，默认 3306
- `DB_NAME`: MySQL 数据库名，默认 imageviewer
- `DB_USER`: MySQL 用户名，默认 root
- `DB_PASSWORD`: MySQL 密码，默认为空

### 前端
开发环境 (.env.development):
- `VUE_APP_API_BASE_URL`: 开发环境 API 地址

生产环境 (.env.production):
- `VUE_APP_API_BASE_URL`: 生产环境 API 地址

## 项目结构

```
.
├── client/                 # 前端项目目录
│   ├── public/             # 公共资源
│   └── src/                # 源代码
│       ├── components/     # Vue 组件
│       ├── router/         # 路由配置
│       ├── services/       # API 服务
│       └── App.vue         # 根组件
├── config/                 # 配置文件
│   └── db-init.sql         # 数据库初始化脚本
├── models/                 # 数据库模型
├── uploads/                # 上传文件目录
├── server.js               # 后端入口文件
├── Dockerfile              # 后端 Docker 配置
├── docker-compose.yml      # Docker Compose 编排文件
└── README.md               # 项目说明文档
```