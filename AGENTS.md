# Repository Guidelines

dt-frame-starter 是基于 Vue 3 + TypeScript + Vite + Pinia + Element Plus + UnoCSS + `@dt-frames/*` 的管理后台启动模板，使用 pnpm workspace 组织。当前仓库只包含登录页，尚未包含后端、业务页面和测试运行器。

本文件是仓库级入口。生成、修改或审查代码前，按以下顺序执行：

1. 阅读本文件。
2. 阅读 `.codex/rules/` 中与任务相关的强制规则，尤其是 `source-of-truth.md`。
3. 阅读匹配任务的 `.codex/skills/*/SKILL.md`；需要细节时继续读该技能的 `references/`。
4. 核对当前 `package.json`、路由、类型、组件源码和已有实现。

冲突优先级：用户明确要求 > 当前可运行代码与依赖事实 > `.codex/rules` > `.codex/skills` > 通用框架知识。发现规范与代码冲突时，先修正规范，不要继续按错误规范生成代码。

## 事实参考

- 标准 CRUD：`D:\frames\front\dt-frame-new\apps\web\src\views\system\app\index.vue`。
- 分页、显式权限与业务保护变体：`config/index.vue`、`post/index.vue`、`notice/index.vue`。
- 前端路由：`D:\frames\front\dt-frame-new\apps\web\src\router\routes.ts`。
- 后端基线：`D:\frames\front\dt-frame-new\apps\backend`。
- 参考项目只提供实现证据；本模板的包名、目录和当前设施仍以本仓库真实文件为准。

不得把猜测写成项目事实。使用组件、Hook、接口、字段、权限码或命令前，必须在真实源码或 `package.json` 中核验。

## 项目结构

- `apps/web/`：Vue 3 管理后台应用，负责入口、路由、页面、应用级 store、HTTP 封装和静态资源。
- `packages/core/`：`@dt-frames/starter-core` 纯 TypeScript 占位包。
- `scripts/`：workspace 工程脚本。
- 根 `package.json`：统一命令、工具链和 workspace 管理。
- `@dt-frames/core`、`hooks`、`ui`、`layout`、`icons`、`vite-plugin` 当前来自 npm，不在本仓库修改。
- 后续生成的后端放 `apps/backend/`，包名使用 `@dt-frames/starter-backend`；复制为具体产品后可替换为产品包名。

依赖方向保持单向：`apps/web -> packages/core`、`apps/backend -> packages/core`；`packages/core` 不依赖 Vue、Element Plus、NestJS、TypeORM 或任何应用。

生成代码前先核对 `package.json`、`pnpm-workspace.yaml`、`apps/web/package.json`、`vite.config.ts`、`main.ts`、`router/routes.ts`、`utils/http.ts` 和相邻现有实现。

## 强制代码约定

- 页面放 `apps/web/src/views/<module>/<page>/index.vue`。自包含模块可在 `useSource` 内直接调用 `http`；复杂或跨页面复用的接口放 `apps/web/src/api/<module>.ts`。
- 业务页面必须同时在 `apps/web/src/router/routes.ts` 声明静态懒加载路由，并在后端 `/user/menus` 数据中提供相同 `path` 的菜单记录。`@dt-frames/layout` 的 `initRouter`/`getModules` 会用菜单 path 匹配静态路由后注册；菜单表没有 `component` 字段。
- 菜单负责可见性、顺序、标题和权限；静态路由负责页面组件映射。禁止只改一边，也禁止在页面或 store 中维护第三份菜单常量。
- 后台增删改查使用 `@dt-frames/ui` 的 `useSource + useForm + useCurd + useVxeTable + DtVxeTable`，以 `system/app/index.vue` 为结构样板。禁止再手写一套等价的 `ElForm + ElTable` CRUD；登录页现有手写表单不受此限制。
- 所有请求走 `apps/web/src/utils/http.ts` 的类型化 `http.get/post/patch/delete`，不直接使用 axios、fetch 或硬编码后端域名。
- 后端全局前缀为 `/api`；成功响应为 `{ code: 0, data, message: 'ok' }`；异常为 `{ code, message, timestamp, path }`。
- 前后端权限码使用同一套 `资源:动作`，例如 `sys:app:create`。后端使用 `@RequirePermission`，前端使用 `auth` 或 `v-auth`；系统角色在 `PermissionGuard` 中直接放行的行为不得复制成前端硬编码白名单。
- 后端只有明确标记 `@Public()` 的接口可匿名访问；其余接口默认受 JWT 和权限守卫保护。
- 数据库结构通过 migration 管理，默认 `synchronize: false`；业务实体继承审计基类，逻辑删除字段与查询过滤保持一致。
- 所有导出的函数、组件、类型和常量写 JSDoc；组件 Props/Emits 必须声明类型。
- 禁止提交真实密钥、数据库密码、令牌或生产账号；`.env.example` 只放占位值。
- 不保留 mock 数据、假接口、空实现、`TODO` 占位或 `console.log` 交付。
- 不做与当前需求无关的重构、依赖升级或全仓格式化。

## 分支与同步

- 仓库存在 `main` 和 `pnpm` 两个分支，`AGENTS.md` 与 `.codex/` 规范必须保持一致。
- 修改规范后同步两个分支，并检查两边的文件和内容；`git diff main..pnpm -- AGENTS.md .codex` 只能证明已跟踪文件一致，未跟踪文件还需逐文件核对。
- 代码差异以实际 `git diff` 为准，不根据分支名猜测功能。
- Codex 新建分支默认使用 `codex/` 前缀；用户明确指定分支名时以用户要求为准。

## 常用命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm typecheck
pnpm lint
pnpm format
pnpm commit
pnpm lint:commit
```

只使用 `pnpm`，不要使用 `npm` 或 `yarn`，不要手改 `pnpm-lock.yaml`。新增依赖使用 `pnpm --filter <package-name> add <dependency>`。

## 生成完成标准

- 前端改动至少运行 `pnpm typecheck` 和 `pnpm build`；涉及格式或 lint 规则时运行对应命令。
- 当前根包没有测试运行器，不要声称 `pnpm test` 或 `pnpm verify` 已存在。若本轮新增测试设施，必须实际运行并记录。
- 生成 `apps/backend` 时，必须同时建立 Vitest 单测、supertest e2e、`vitest.config.ts`、`vitest.config.e2e.ts` 和对应 scripts；参考项目当前有前两个配置，但 `apps/backend/test/` 目录并不存在，不能把不存在的 e2e 写成已通过。
- 接口或页面改动要能走通「登录 -> 菜单 path 匹配 -> 页面访问 -> 按钮权限 -> 数据操作」主链路。
- 交付说明列出改动文件、执行命令、验证结果和未验证项；未验证的部分必须明确标注。

## Skills

- `dt-frame-architecture`：workspace 分层、技术栈事实、依赖方向、分支同步与新增包决策。
- `dt-frame-admin-codegen`：从业务需求生成前后端管理模块的标准流程、输入清单和验收清单。
- `dt-frame-app`：`apps/web` 页面、接口、路由、权限、Dt 组件与前端验收规范。
- `dt-frame-api-contract`：前后端共享的响应外壳、分页、认证、错误和权限码契约。
- `dt-frame-nestjs`：NestJS 后端目录、TypeORM、Redis、JWT RBAC、Swagger 与测试规范。

## Rules

- `source-of-truth`：写代码前的事实核验、证据优先级与禁止臆造。
- `code-style`：命名、格式、TypeScript、Vue SFC 与 JSDoc。
- `frontend-architecture`：前端分层、目录、路由、依赖边界与 CRUD 组件选择。
- `api-contract`：接口路径、响应结构、分页、认证与权限码。
- `admin-codegen`：生成业务模块时必须完成的步骤和交付物。
- `backend-nestjs`：后端生成、分层、数据库、鉴权和测试质量门禁。
- `security`：密钥、认证、校验、上传、日志和敏感数据处理。
- `testing`：单测、e2e、验收和测试真实性要求。
- `on-demand`：依赖、组件、图标、样式与重型模块的按需引入。
- `git-workflow`：提交、分支、PR 和 main/pnpm 同步。

