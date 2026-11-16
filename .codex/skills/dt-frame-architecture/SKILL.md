---
name: dt-frame-architecture
description: dt-frame-starter 的 workspace 分层、技术栈事实、依赖方向、分支同步与新增包决策。当调整目录、引入依赖、新增 workspace 包、理解 main/pnpm 分支或规划前后端边界时使用。
---

# dt-frame-starter 架构规范

## 先核对事实

本模板是**单 Web 应用 + 纯 TS core 包**的 pnpm workspace，不是 `dt-frame-new` 的完整多包框架。不要凭空补齐 `hooks`、`ui`、`icons`、`vite-plugin`、`internal`、`mcp` 等目录；这些能力当前通过 npm 包 `@dt-frames/*` 使用。

业务代码的参考实现是 `D:\frames\front\dt-frame-new`。其中 `apps/web`、`packages/ui`、`packages/layout` 和 `apps/backend` 提供真实组件、路由与后端行为证据；本模板尚未实现的目录和测试设施不能被描述为现有能力。

生成代码前先读：

- `package.json`、`pnpm-workspace.yaml`、`apps/web/package.json`。
- `apps/web/vite.config.ts`、`apps/web/tsconfig.json`、`apps/web/uno.config.ts`。
- `apps/web/src/main.ts`、`router/routes.ts`、`utils/http.ts`。
- 被修改页面或模块附近的现有实现。

## 目录与职责

```text
apps/web/             Vue 3 管理后台应用（组装层 + 页面）
packages/core/        @dt-frames/starter-core 纯 TS 占位包
scripts/              workspace 工程脚本
AGENTS.md             仓库级 AI 约束入口
.codex/               skills / rules
```

- `apps/web` 允许放页面、页面组件、API 函数、应用级 store、全局配置和样式。
- `packages/core` 只放无框架依赖的类型、常量、纯函数和共享契约；保持 `sideEffects: false`。
- 单个页面的组件、类型、接口优先留在页面或模块目录，不因“可能复用”提前抽象。
- 出现两个以上应用或两个以上业务模块的真实复用需求，才考虑新增 workspace 包。

## 依赖方向

- `apps/web -> packages/core`。
- 未来 `apps/backend -> packages/core`。
- `packages/core` 不依赖 `apps/*`、Vue、Pinia、Vue Router、Element Plus、NestJS 或 TypeORM。
- 不修改 `node_modules` 中的 `@dt-frames/*`；需要定制时在本仓库封装或向对应包提需求。
- 禁止循环依赖；跨应用不得直接引用另一应用的 `src` 文件。

## 技术栈事实

- 前端：Vue 3、TypeScript、Vite 7、Pinia 3、Vue Router 4、axios、Element Plus、UnoCSS、vxe-table、dayjs、lodash-es、VueUse。
- 框架能力：`@dt-frames/layout` 提供布局、路由初始化、访问状态、主题和权限指令；`@dt-frames/ui` 提供 Dt 组件与全局配置；`@dt-frames/core` 提供 HTTP、i18n、存储、加密和基础类型。
- 后端生成：NestJS 11 + TypeORM + MySQL + Redis + JWT RBAC；详见 `dt-frame-nestjs`。
- 包管理器：pnpm；Node 版本服从根 `package.json` 的 `engines`。
- 当前模板根包没有测试运行器；参考项目虽有部分测试，但不能据此推断本模板已有 `pnpm test`/`pnpm verify`。

## 分支

- `main` 与 `pnpm` 两个分支的规范必须完全一致。
- 修改 `AGENTS.md` 或 `.codex/` 后，两个分支都要更新；用 `git diff main..pnpm -- AGENTS.md .codex` 检查。
- 代码如果实际分叉，以真实 diff 为准，不用分支名称猜测功能差异。

## 新增能力决策

1. 先复用现有依赖或 `@dt-frames/*`。
2. 单个页面内实现即可的，留在页面目录。
3. 跨页面但仍属 Web 应用的，放 `apps/web/src/components` 或 `src/hooks`。
4. 纯 TS、跨前后端可共享的，放 `packages/core`。
5. 仍无法满足且有多应用复用证据时，才新增 workspace 包，并同步更新根命令、tsconfig、依赖和文档。

## 工程命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm format
pnpm commit
pnpm lint:commit
```

后端生成后的命令必须落在 `apps/backend/package.json`，通过 `pnpm --filter @dt-frames/starter-backend <script>` 调用。

## 验收

- 目录和依赖方向没有反向或循环引用。
- 新增包/依赖有明确复用理由，没有重复框架能力。
- 前端至少通过 `pnpm typecheck` 与 `pnpm build`。
- 规范文件在 `main`、`pnpm` 两个分支保持一致。
