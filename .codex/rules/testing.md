---
name: testing
description: 单元测试、接口 e2e、前端验收与测试真实性的强制要求。
---

# 测试与自主验收（强制）

## 当前模板基线

- 当前根包没有测试运行器，因此不要虚构 `pnpm test` 或 `pnpm verify` 已存在。
- `apps/web` 当前没有 Vitest/浏览器测试配置；不要在交付说明中声称已有组件测试或 Playwright e2e。
- 前端改动在测试设施出现前，至少运行 `pnpm typecheck` 和 `pnpm build`，并手工验证登录、菜单、页面和权限主链路。
- 参考项目 `dt-frame-new/apps/backend` 已有 `vitest.config.ts` 与 `vitest.config.e2e.ts`，也有少量 `src/**/*.spec.ts`，但当前没有 `apps/backend/test/` 目录；生成后端时必须实际创建测试目录和用例，不能把参考配置当成完整套件。

## 测试分层

- 纯函数：`packages/core` 使用 Node 环境单元测试，覆盖空值、边界和非法输入。
- 后端 service：`apps/backend/src/**/*.spec.ts` 使用 Vitest + `unplugin-swc`。
- 后端接口：`apps/backend/test/**/*.e2e-spec.ts` 使用 `@nestjs/testing` + supertest。
- 前端页面与组件：只有在项目实际建立 Vitest/browser 或 Playwright 设施后执行对应测试；没有设施时如实标注手工验收。
- 跨前后端主流程：Web 端登录、菜单 path 匹配、按钮权限、CRUD 至少做手工验收；有 e2e 设施时再自动化。

## 必须覆盖

- 登录成功、登录失败、token 过期/刷新、退出登录。
- 未登录访问受保护接口和页面；无权限访问返回 403；有权限可执行。
- 参数校验失败、重复主键、非法状态流转。
- 列表分页/全量数组分支、筛选、空数据；创建/更新/删除/批量删除主流程。
- 菜单 path 与静态路由匹配、按钮权限码是否进入 `accessCodes`。
- 关键安全分支：越权访问、敏感字段不出现在响应中。

## 规则

- 每个验收项必须能对应到测试文件或明确的手工验收步骤；没有验证方式的验收项视为未完成。
- 修 bug 必须带回归测试；无法自动化时记录最小复现步骤。
- 禁止无断言空测试、跳过测试来凑通过率、用 mock 掩盖关键鉴权/数据库行为。
- 后端 e2e 使用独立数据库或测试模式；参考配置可在 `NODE_ENV=test` 下使用 sqlite 内存库，但 Redis 仍需独立实例。测试之间互不依赖。
- 使用可见状态或轮询条件等待，避免固定 `sleep`。
- 收尾必须如实报告：运行了哪些命令、结果如何、哪些场景未验证。

