# dt-frame-starter

基于 pnpm workspace 的 dt-frame 前端管理后台启动模板。

## 目录结构

```text
.
├── apps/
│   └── web/                  # 实际运行的 Vue 管理后台应用
├── packages/
│   └── core/                 # @dt-frames/starter-core 占位包
├── scripts/                  # monorepo 工程脚本
├── pnpm-workspace.yaml       # workspace 包与构建配置
└── package.json              # 根级统一命令与公共工具链
```

- `apps/web` 包名：`@dt-frames/starter-web`
- `packages/core` 包名：`@dt-frames/starter-core`
- 外部 `@dt-frames/*` 依赖仍从 npm 安装，`starter-core` 通过 `workspace:*` 链接

## 常用命令

```bash
# 安装整个 workspace 的依赖
pnpm install

# 启动 Web 应用
pnpm dev

# 构建所有可构建的 workspace 包
pnpm build

# 预览 Web 应用构建结果
pnpm preview

# 全 workspace 类型检查
pnpm typecheck

# 全仓库代码检查
pnpm lint

# 全仓库格式化
pnpm format

# 交互式生成规范提交
pnpm commit

# 校验最近一次提交
pnpm lint:commit
```

根目录命令统一代理到对应 workspace 包，不需要进入子目录执行。

## 提交规范

- 首次拉取或依赖变更后执行 `pnpm install`，Husky 会自动安装 `commit-msg` 钩子。
- 使用 `pnpm commit` 进入中文交互式提交，无需全局安装 Commitizen。
- 提交信息遵循 `<type>(<scope>): <subject>`，例如 `feat(web): 增加登录页校验`。
- `scope` 可选且不限白名单；本地 `git commit --no-verify` 只能绕过钩子。
- 提交前运行 `pnpm lint` 与 `pnpm format`。

## 环境变量

Web 应用的环境变量位于 `apps/web/.env` 和 `apps/web/.env.prod`。

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_APP_ID` | 应用 ID | `STARTER` |
| `VITE_APP_CODE` | 应用编码（菜单过滤） | `starter` |
| `VITE_API_PROXY_TARGET` | 后端 API 代理地址 | `http://localhost:3001` |
| `VITE_DEV_PORT` | 开发服务端口 | `5173` |

## Web 应用能力

- 登录页：用户名、密码、验证码
- 动态菜单：路由由后端 `/user/menus` 接口驱动
- 完整框架能力：布局、组件库、vxe-table、富文本、字典、主题、i18n、权限指令
- UnoCSS 原子化样式
- DtFrame 组件与 Element Plus 按需加载

## 后端接口约定

- 登录：`POST /auth/login`
- 验证码：`GET /auth/captcha`
- 令牌续期：`POST /auth/refresh`
- 用户信息：`GET /user/info`
- 菜单列表：`GET /user/menus`
- 字典项：`GET /dicts/items`

## 新增 workspace 包

在 `packages/` 下创建带独立 `package.json` 的目录，pnpm 会自动将其纳入 workspace。其他包通过 `workspace:*` 声明依赖即可获得符号链接和同仓库联调能力。

## 注意

> `@dt-frames/vite-plugin` 当前发布的包需要 Node.js 直接加载 TypeScript 源码，因此本项目仍手动配置 Vite 插件，功能与 `Dtvite({ framework: 'app' })` 等价。
>
> `DtFrameResolver` 内部硬编码了 `src/` 路径，根目录的 `scripts/fix-resolver.cjs` 会在 `postinstall` 阶段将其修正为 `es/` 路径，以兼容 npm 发布包和 pnpm workspace 的目录布局。
