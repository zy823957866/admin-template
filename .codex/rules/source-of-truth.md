---
name: source-of-truth
description: 生成代码前必须核验真实源码、依赖、接口、权限、组件与命令，禁止把猜测写成项目事实。
---

# 事实校验与禁止臆造（强制）

## 事实优先级

1. 用户当前明确要求。
2. 本仓库可运行代码、`package.json`、路由、类型与现有实现。
3. 参考项目 `dt-frame-new`（本机路径 `D:\frames\front\dt-frame-new`）的真实源码。
4. 本目录 `.codex/rules` 与 `.codex/skills`。
5. 通用框架知识。

低优先级内容与高优先级冲突时，以高优先级为准；发现规范过时，应先修正规范再生成代码。

## 写代码前必须核验

- 组件和 Hook：在 `@dt-frames/ui` 的类型、源码或参考项目真实页面中确认名称、参数、返回值和用法。
- 接口：在后端 controller、前端 API 文件或真实页面中确认方法、路径、请求体、响应结构。
- 权限码：在后端 `@RequirePermission`、菜单种子、前端 `auth` / `v-auth` 使用点中确认一致。
- 路由：确认 `apps/web/src/router/routes.ts` 中的静态路由与后端菜单 `path` 完全一致。
- 测试与命令：只在 `package.json`、配置文件或实际测试目录中存在时才声称可用。
- 数据库字段：以 entity、migration、DTO 和真实页面映射为准，不根据页面标签反推数据库字段。

## 当前事实与目标约定

- 描述当前模板尚未实现的能力时，必须明确写“当前不存在”或“生成时应新增”，不能写成已完成。
- 参考项目中的实现可以成为生成基线，但不能把参考项目的包名、目录或设施直接冒充为本模板已经拥有。
- 示例代码必须来自真实文件或明确标注为“生成骨架”；禁止伪造接口、字段、权限码、组件、Hook、脚本和测试路径。

## 标准参考文件

- CRUD 页面：`dt-frame-new/apps/web/src/views/system/app/index.vue`。
- 分页、显式按钮权限与自定义保护：`dt-frame-new/apps/web/src/views/system/config/index.vue`。
- 状态切换与数字字段：`dt-frame-new/apps/web/src/views/system/post/index.vue`。
- 富文本自定义渲染与日期字段：`dt-frame-new/apps/web/src/views/system/notice/index.vue`。
- 静态路由表：`dt-frame-new/apps/web/src/router/routes.ts`。
- 菜单匹配与动态注册：`dt-frame-new/packages/layout/src/stores/auth.store.ts`。
- 后端模块样例：`dt-frame-new/apps/backend/src/modules/apps/`。
- 后端全局装配：`dt-frame-new/apps/backend/src/app.module.ts`、`app.setup.ts`。

## 禁止

- 把 `ElForm + ElTable` 手写页面当作本项目的标准 CRUD。
- 编造不存在的 `@dt-frames/ui` 组件、Props、Hook 或返回值。
- 编造接口路径、DTO 字段、权限码、菜单字段或数据库列。
- 声称 `pnpm verify`、Playwright、e2e 目录或测试运行器已经存在，除非已核验。
- 用 mock、空实现、`TODO` 或“稍后补齐”掩盖未完成功能。
- 在交付说明中把未运行、未验证的内容写成通过。

