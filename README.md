# dt-frame-starter

基于 dt-frame 的前端管理后台启动模板（纯净版）。所有 `@dt-frames/*` 依赖均从 npm 安装，不使用 workspace 形式。

## 特性

- **登录页**：自带用户名/密码/验证码表单
- **动态菜单**：路由由后端 `/user/menus` 接口驱动
- **完整框架能力**：布局系统、组件库、vxe-table、富文本、字典、主题、i18n、权限指令
- **原子化 CSS**：UnoCSS
- **按需引入**：DtFrame 组件 + Element Plus 自动按需加载

## 快速开始

```bash
# 安装依赖
pnpm install

# 首次安装后批准构建脚本（esbuild / vue-demi 等需要）
pnpm approve-builds --all

# 启动开发服务
pnpm dev

# 生产构建
pnpm build

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint
```

## 环境变量

复制 `.env` 并按需修改：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_APP_ID` | 应用 ID | `STARTER` |
| `VITE_APP_CODE` | 应用编码（菜单过滤） | `starter` |
| `VITE_API_PROXY_TARGET` | 后端 API 代理地址 | `http://localhost:3000` |
| `VITE_DEV_PORT` | 开发服务端口 | `5173` |

## 后端接口约定

- 登录：`POST /auth/login`
- 验证码：`GET /auth/captcha`
- 令牌续期：`POST /auth/refresh`
- 用户信息：`GET /user/info`
- 菜单列表：`GET /user/menus`
- 字典项：`GET /dicts/items`

## 项目结构

```
src/
├── api/auth.ts          # 认证相关接口
├── assets/              # 静态资源（样式、图标、图片）
├── const/structure.ts   # 下拉数据源结构配置
├── router/routes.ts     # 静态路由（仅登录页）
├── stores/auth.ts       # 认证状态 store
├── styles/main.css      # 全局自定义样式
├── utils/http.ts        # axios 封装（拦截器 + 解包）
├── views/login/         # 登录页
├── App.vue              # 根组件
└── main.ts              # 入口文件
```

## 技术栈

- Vue 3 + TypeScript
- Element Plus（按需引入）
- Pinia
- Vue Router
- @dt-frames/core / ui / layout / hooks / icons
- UnoCSS
- Vite

## 注意

> **关于 `@dt-frames/vite-plugin`**：当前 5.0.0 版本的 vite-plugin 包仅发布 TypeScript 源码，
> 无法作为独立 npm 包被 Node.js 直接加载。因此本项目手动配置 Vite 插件，
> 功能与 `Dtvite({ framework: 'app' })` 等价。
>
> **关于 `DtFrameResolver`**：发布的 resolver 中硬编码了 `src/` 路径，
> `scripts/fix-resolver.cjs` 在 `postinstall` 时自动将其修正为 `es/` 路径以兼容发布包。
