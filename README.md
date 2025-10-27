# InPayOS Admin后台管理系统

一个现代化的支付系统超级管理员后台管理界面，基于 React + TypeScript + Vite 构建。

## 功能特性

- 🎯 **仪表板** - 交易数据可视化展示
- 💰 **交易管理** - 代收、代付、充值记录管理
- 📊 **数据分析** - 实时统计和趋势分析
- 👥 **商户管理** - 管理所有商户和Cashier团队
- ⚙️ **系统配置** - 支付方式和参数配置
- 🔐 **身份认证** - JWT Token 认证机制
- 🌐 **国际化** - 支持中文界面
- 📱 **响应式设计** - 适配各种屏幕尺寸

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件**: Radix UI + Tailwind CSS
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **图表库**: Recharts
- **图标**: Lucide React

## 端口配置

| 服务 | 端口 | 描述 |
|------|------|------|
| 前端开发服务器 | 3301 | Vite开发服务器 |
| API代理服务器 | 3302 | 转发前端API请求到后端 |
| 后端Admin API | 6082 | 超级管理员后台API服务 |

### 启动服务

```bash
# 启动API代理服务器 (端口3302)
npm run proxy

# 启动前端开发服务器 (端口3301)  
npm run dev
```

访问地址：
- 前端界面: http://localhost:3301
- API代理: http://localhost:3302

## 项目结构

```
src/
├── components/          # React 组件
│   ├── ui/             # 基础 UI 组件
│   ├── Login.tsx       # 登录组件
│   ├── Dashboard.tsx   # 仪表板
│   └── ...
├── services/           # API 服务层
│   ├── api.ts         # HTTP 客户端配置
│   ├── authService.ts # 认证服务
│   └── transactionService.ts # 交易服务
├── store/             # 状态管理
│   └── authStore.ts   # 认证状态
├── utils/             # 工具函数
│   ├── errorHandler.ts # 错误处理
│   └── toast.ts       # 通知系统
└── styles/            # 样式文件
    └── globals.css    # 全局样式
```

## 开发指南

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run dev
```

访问 http://localhost:3301

### 构建部署

```bash
npm run build
```

构建产物在 `dist` 目录

### 代码检查

```bash
npm run lint
```

## 环境配置

项目支持多环境配置：

- `.env.development` - 开发环境
- `.env.production` - 生产环境

主要环境变量：

```bash
VITE_APP_TITLE=InPayOS Admin后台
VITE_API_BASE_URL=http://localhost:3302
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## API 集成

### 认证接口

- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `POST /auth/logout` - 用户登出
- `POST /auth/refresh` - 刷新 Token

### 交易接口

- `GET /transactions/dashboard` - 仪表板数据
- `GET /transactions/collection` - 代收记录
- `GET /transactions/payout` - 代付记录
- `GET /transactions/recharge` - 充值记录
- `GET /transactions/settlement` - 结算记录

## 特性说明

### 认证机制

- 使用 JWT Token 进行身份认证
- 支持 Token 自动刷新
- 请求拦截器自动添加认证头
- 401 错误自动处理登出

### 错误处理

- 统一的错误处理机制
- 网络错误重试机制
- 用户友好的错误提示
- 开发环境错误日志

### 状态管理

- 使用 Zustand 进行状态管理
- 持久化存储用户信息
- 响应式状态更新

### 通知系统

- Toast 消息通知
- 支持成功、错误、警告、信息类型
- 自动消失和手动关闭
- 支持操作按钮

## 开发规范

### 代码风格

- 使用 TypeScript 严格模式
- ESLint + Prettier 代码格式化
- 组件使用函数式写法
- Hook 使用规范

### 提交规范

```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式修改
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具变动
```

## 部署说明

### Docker 部署

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 许可证

MIT License
