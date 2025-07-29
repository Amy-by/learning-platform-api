# Learning Platform API

## 项目简介
Learning Platform API 是一个在线学习平台的后端 API 项目，使用 Node.js 和 Express 构建，结合 MongoDB 作为数据库，支持文件的上传与下载、用户认证等功能。

## 功能特性
- **文件管理**：支持文件的上传和下载功能，上传的文件会被存储到指定目录，并生成唯一的 UUID 用于下载。
- **用户认证**：使用 JSON Web Token (JWT) 进行用户认证，确保 API 的安全性。
- **数据库集成**：使用 MongoDB 作为数据库，通过 Mongoose 进行数据建模和操作。

## 目录结构
```plaintext
learning-platform-api/
├── .env
├── package-lock.json
├── package.json
├── server.js
├── models/
│   ├── Assignment.js
│   ├── Course.js
│   ├── Discussion.js
│   ├── File.js
│   ├── Progress.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── courses.js
│   ├── discussions.js
│   ├── files.js
│   ├── records.js
│   └── users.js
├── config/
│   ├── db.js
│   └── multer.js
├── controllers/
│   ├── auth.js
│   ├── courses.js
│   ├── discussions.js
│   ├── files.js
│   ├── records.js
│   └── users.js
├── middleware/
│   ├── auth.js
│   ├── error.js
│   └── upload.js
└── node_modules/
```

## 环境配置
在项目根目录下创建 `.env` 文件，并配置以下环境变量：
```plaintext
# 服务器配置
PORT=5000

# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/learning_platform

# JWT 配置
JWT_SECRET=c772cf0e20a547336b2bde16107336649539a5dcc2d1bc2b760b612bd5c721f8
JWT_EXPIRES_IN=30d

# 文件上传配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760  # 10MB
```

## 安装与运行
1. **克隆项目**
```bash
git clone https://github.com/your-repo/learning-platform-api.git
cd learning-platform-api
```

2. **安装依赖**
```bash
npm install
```

3. **运行项目**
- **开发环境**：使用 `nodemon` 监听文件变化并自动重启服务器。
```bash
npm run dev
```
- **生产环境**
```bash
npm start
```

## API 文档
### 文件上传
- **URL**：`POST /api/files`
- **请求头**：需要包含有效的 JWT Token，用于用户认证。
- **请求体**：包含一个名为 `file` 的文件字段。
- **响应**：返回文件的相关信息，包括文件 ID、文件名、原始文件名、MIME 类型、大小和下载 URL。

### 文件下载
- **URL**：`GET /api/files/:uuid`
- **参数**：`uuid` 为文件的唯一标识符。
- **响应**：返回文件内容。

## 依赖信息
项目使用了多个依赖，以下是一些主要依赖及其作用：
- **`express`**：用于构建 Web 服务器和处理 HTTP 请求。
- **`mongoose`**：用于与 MongoDB 数据库进行交互，进行数据建模和操作。
- **`multer`**：用于处理文件上传。
- **`jsonwebtoken`**：用于生成和验证 JWT Token，实现用户认证。
- **`bcryptjs`**：用于密码加密。
- **`dotenv`**：用于加载环境变量。

## 贡献
欢迎对本项目进行贡献，如果你发现任何问题或有改进建议，请提交 Issue 或 Pull Request。

