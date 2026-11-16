---
name: frontend-architecture
description: 前端分层、目录、路由、依赖边界与页面放置的强制约束。
---

# 前端架构与边界（强制）

## 应用层职责

- `apps/web` 只负责应用组装：入口、路由、布局接入、页面、应用级 store、http 配置和静态资源。
- 可复用纯逻辑放 `packages/core`；依赖 Vue 的通用逻辑再考虑 `apps/web/src/hooks`。
- 不为单个页面创建新的 workspace 包；没有跨应用复用证据时，不引入包级抽象。
- 不从 `views` 反向导入其他模块内部文件；跨页面复用先提升到 `src/components` 或 `src/hooks`。

## 目录

- 页面：`apps/web/src/views/<module>/<page>/index.vue`。
- 页面私有组件：`views/<module>/<page>/components/Xxx.vue`。
- 接口：复杂或跨页面复用的模块放 `apps/web/src/api/<module>.ts`；像 `system/app` 这种自包含单页也可在 `useSource` 内直接调用 `http`。
- 应用级状态：`apps/web/src/stores/<name>.ts`；页面临时状态留在页面内。
- 公共常量：`apps/web/src/const/`；跨前后端共享的纯类型/常量放 `packages/core`。
- 公共组件：`apps/web/src/components/`；公共 hooks：`apps/web/src/hooks/`。
- 全局样式：`apps/web/src/styles/` 与 `apps/web/src/assets/css/`；页面样式不得写进全局文件。

## 路由与菜单

- 页面组件路由必须显式声明在 `apps/web/src/router/routes.ts`，并使用懒加载，例如 `component: () => import('@/views/system/app/index.vue')`。
- 后端 `/user/menus` 返回菜单记录，`@dt-frames/layout` 的 `initRouter` 按相同 `path` 找到静态路由后注册；菜单控制可见性、顺序和权限，路由表负责组件映射。
- 新增页面时两边必须同时完成：`router/routes.ts` 增加同 path 路由，后端菜单种子/接口增加同 path 菜单和按钮权限码。
- 后端菜单表是 `sys_menu`，真实字段包括 `appId`、`parentId`、`type`、`path`、`zhCnName`、`enName`、`order`、`authCode`、`icon/iconName` 等，没有 `component` 字段；不要给菜单编造页面组件映射。
- 页面路径、菜单标题、图标和权限码必须与后端菜单记录保持一致；禁止一边改了路径另一边不改。
- 不在 `App.vue`、页面或 store 中维护第三份菜单常量。

## 认证与状态

- 路由登录态、菜单和权限以 `@dt-frames/layout` 的 `useAccessStore` / `useAuthStore` 为准。
- `apps/web/src/stores/auth.ts` 是现有示例，不得继续扩展成并行的认证体系；需要统一时先做独立重构评估。
- 401、token 续期和登录过期交由 `utils/http.ts` 与 `main.ts` 的统一逻辑处理，页面不重复弹登录框。
- 页面内不要缓存敏感用户信息；需要展示时从 store 或接口读取。

## 依赖与别名

- 框架能力优先复用 `@dt-frames/core`、`@dt-frames/hooks`、`@dt-frames/ui`、`@dt-frames/layout`、`@dt-frames/icons`。
- 列表增删改查优先使用 `@dt-frames/ui` 的 `useSource`、`useForm`、`useCurd`、`useVxeTable` 和 `DtVxeTable`；`system/app/index.vue` 是标准样板，`config/post/notice` 展示显式权限和状态切换变体。
- 禁止为业务 CRUD 再手写一套 `ElForm + ElTable`；登录页现有的手写表单是既定实现，不是业务 CRUD 模板。
- `element-plus` 组件在模板中可由 Resolver 自动按需引入；在 TSX `render` 中使用的组件必须显式从 `element-plus` 导入。
- 公共依赖必须已在 `apps/web/package.json`；新增前先搜索现有实现，禁止重复造轮子。
- `@` 指向 `apps/web/src`；跨目录使用 `@/`，同目录使用 `./`。
- 不在前端代码硬编码后端域名；统一走 `/api` 和 Vite 代理，环境差异用 `VITE_*`。
- 不直接在页面中引入完整 UI 库、完整 lodash 或新的日期库；使用项目已有的按需包。
