---
name: api-contract
description: 前后端接口路径、响应外壳、分页、认证、错误与权限码的强制契约。
---

# API 契约（强制）

## 基础

- 后端全局前缀固定为 `/api`；前端 `request.defaults.baseURL` 与 Vite `/api` 代理保持一致。
- 成功响应固定为 `{ code: 0, data: T, message: 'ok' }`。
- 错误响应固定为 `{ code: number, message: string, timestamp: string, path: string }`，HTTP 状态码与 `code` 使用同一语义。
- 前端只通过 `apps/web/src/utils/http.ts` 的 `http.get/post/patch/delete` 调用接口；该封装已解包成功响应，API 函数和页面拿到的是 `data`。
- 接口路径使用小写复数资源，例如 `/apps`、`/configs`、`/user/menus`；不要使用 `/getUser`、`/doDelete` 这类动词式路径。
- 批量删除与状态切换沿用真实项目模式，例如 `POST /configs/batch-delete`、`POST /posts/:id/status`。

## 认证与用户侧接口

| 接口 | 认证 | 请求 | 实际响应要点 |
| --- | --- | --- | --- |
| `GET /api/auth/captcha` | 否 | - | `{ enabled, img?, captchaKey? }` |
| `POST /api/auth/login` | 否 | `username`、`password`、可选 `captchaKey` / `captcha` | `{ accessToken, refreshToken, user }` |
| `POST /api/auth/refresh` | 否 | `{ refreshToken }` | `{ accessToken }` |
| `GET /api/auth/profile` | 是 | - | `{ id, username, nickname, roles, permissions }` |
| `POST /api/auth/logout` | 是 | - | `{ success: true }` |
| `GET /api/user/info` | 是 | - | `{ userId, username, userName, nickname, avatar, signature, phone?, email?, roles }` |
| `GET /api/user/menus` | 是 | 可选 `appCode` | `MenuVO[]` |
| `GET /api/user/permissions` | 是 | - | `string[]` |
| `GET /api/user/apps` | 是 | - | 当前用户可见应用卡片 `AppVO[]` |

`/auth/profile` 与 `/user/info` 的字段结构不同：前者含 `permissions`，后者是布局用户信息，不含权限码数组。权限码使用 `/auth/profile` 或 `/user/permissions`，不要虚构 `/user/info` 的 `permissions` 字段。

登录成功返回的 `user` 至少包含 `id`、`username`、`nickname`、`roles`、`permissions`；不得返回密码哈希、refresh token 或内部密钥。

## 菜单契约

`MenuVO` 的真实字段包括：

- `id`、`pid`、`path`、`name`、`type`、`order`、`show`。
- `authCode`、`icon`、`appId`、`activePath`。
- `keepAlive`、`affixTab`、`hideInBreadcrumb`、`hideInTab`。
- 可选的 `badge`、`badgeType`、`badgeVariants`、`iframeSrc`。

`type` 为 `catalog`、`menu`、`button`、`embedded` 或 `link`。前端根据非 `button` 菜单的 `path` 匹配静态路由，并从 `button` 菜单收集 `authCode`。菜单数据没有页面 `component` 字段。

## 分页与列表

标准分页结果：

```ts
/** 分页结果。 */
export interface PageResult<T> {
	pageNum: number
	pageSize: number
	total: number
	pages: number
	list: T[]
}
```

- 标准分页参数为 `pageNum`（从 1 开始）和 `pageSize`；后端继承或对齐 `PageQueryDto`，使用 `@Type(() => Number)`、`@IsInt()`、`@Min(1)` 校验。
- 参考项目 `PageQueryDto` 当前只有最小校验；新增面向公网的分页接口时应补充合理的 `Max` 上限，且前端不得依赖无限大 `pageSize`。
- 不是所有列表都必须分页。`system/app` 的 `GET /apps` 返回数组，页面使用 `showPagination: false`；`config/post/notice` 返回分页对象。生成模块时以真实接口形态为准。
- `useSource` 的 `pageKey` 默认是 `pageNumber`；对接参考后端时必须显式写 `pageKey: 'pageNum'`。
- 空结果返回 `[]`，不是 `null`；列表使用明确的业务排序字段，不依赖数据库隐式顺序。

## DTO 与校验

- 入参必须是 class DTO；全局 `ValidationPipe({ whitelist: true, transform: true })` 拒绝未声明字段。
- 创建与更新分开 DTO；更新使用 `PATCH` 和可选字段，必要时通过 `PartialType` 复用。
- 字符串有长度限制；枚举用 `@IsIn` / `@IsEnum`；数字用范围校验；日期与布尔值做类型转换。
- 响应优先使用明确 VO/DTO 或真实 entity 映射；不得直接暴露密码、刷新令牌、内部密钥或敏感字段。

## 权限码

- 权限码格式 `资源:动作`，例如 `sys:app:list`、`sys:app:create`、`sys:app:update`、`sys:app:delete`。
- 后端 controller 使用 `@RequirePermission('<code>')`。同一装饰器传数组时，参考实现要求拥有全部权限码。
- `PermissionGuard` 对系统角色直接放行，其余用户校验角色关联菜单按钮的权限码；该放行逻辑只保留在服务端守卫中。
- 前端按钮使用 `v-auth="'<code>'"`，表格工具栏/操作列使用 `auth: '<code>'`；不能只隐藏按钮而省略后端校验。
- 无权限返回 403，不能返回 200 + 空数据掩盖。
- 登录返回的 `permissions`、`/user/permissions` 与菜单按钮 `authCode` 必须同源。

## 文件

- 上传使用 `multipart/form-data`，字段名固定，限制大小与类型，返回文件 ID、URL 或元数据。
- 下载接口必须鉴权；文件名使用 RFC 5987 编码，防止响应头注入。
- 不在 URL 中传敏感 token；预览地址使用短期签名或鉴权下载。

## 变更检查

- [ ] 前端类型与后端 DTO 字段一致。
- [ ] 分页、枚举、日期、空值语义一致。
- [ ] 权限码同时出现在后端、菜单数据和前端使用点。
- [ ] 静态路由 `path` 与菜单 `path` 一致。
- [ ] Swagger 与测试同步更新。
- [ ] 破坏性变更已在交付说明中标注。

