---
name: dt-frame-api-contract
description: 前后端共享的 API 路径、响应外壳、分页、认证、错误、菜单数据、文件与权限码契约。当设计接口、修改 DTO、联调登录/菜单/权限或排查字段不一致时使用。
---

# API 契约规范

## 唯一事实源

接口契约以真实 controller、前端 API 函数、类型和本技能共同为准。修改接口时，前端类型、API 函数、后端 DTO、Swagger、菜单权限和测试必须同步更新。不得只凭页面字段反推接口或数据库结构。

## 响应外壳

成功：

```json
{ "code": 0, "data": {}, "message": "ok" }
```

失败：

```json
{
  "code": 400,
  "message": "参数错误",
  "timestamp": "2026-11-16T00:00:00.000Z",
  "path": "/api/apps"
}
```

- HTTP 状态码与 `code` 语义一致：400 参数错误，401 未认证，403 无权限，404 不存在，409 冲突，500 服务异常。
- 前端 `utils/http.ts` 已自动解包成功外壳并返回 `data`；页面和 API 函数不要再判断 `code === 0`。
- `StreamableFile` 等文件响应可绕过 JSON 外壳，但 controller 必须明确返回文件响应。

## 统一路径

- 后端全局前缀：`/api`。
- 前端 `request.defaults.baseURL = '/api'`；开发代理目标来自 `VITE_API_PROXY_TARGET`。
- 资源路径使用小写复数：`/apps`、`/configs`、`/notices`、`/posts`、`/users`。
- 子资源：`/users/:id/roles`；状态切换：`/posts/:id/status`；批量删除：`/configs/batch-delete`。
- 不混用 `/getUser`、`/saveUser`、`/doDelete` 这类动词式路径。

## 认证与用户侧接口

| 接口 | 认证 | 请求 | 实际响应要点 |
| --- | --- | --- | --- |
| `GET /api/auth/captcha` | 否 | - | `{ enabled, img?, captchaKey? }` |
| `POST /api/auth/login` | 否 | `username`、`password`、可选验证码 | `{ accessToken, refreshToken, user }` |
| `POST /api/auth/refresh` | 否 | `{ refreshToken }` | `{ accessToken }` |
| `GET /api/auth/profile` | 是 | - | `{ id, username, nickname, roles, permissions }` |
| `POST /api/auth/logout` | 是 | - | `{ success: true }` |
| `GET /api/user/info` | 是 | - | `{ userId, username, userName, nickname, avatar, signature, phone?, email?, roles }` |
| `GET /api/user/menus` | 是 | 可选 `appCode` | `MenuVO[]` |
| `GET /api/user/permissions` | 是 | - | `string[]` |
| `GET /api/user/apps` | 是 | - | 当前用户可见应用卡片 `AppVO[]` |

关键区别：`/auth/profile` 返回权限码；`/user/info` 是布局用户信息，不返回 `permissions`。不要把两者合并成一个虚构的 `ProfileDto`。

登录返回的 `user` 含 `id`、`username`、`nickname`、`roles`、`permissions`；永远不返回密码哈希、refresh token 或内部密钥。

## 菜单数据

`MenuVO` 真实字段：

- `id`、`pid`、`path`、`name`、`type`、`order`、`show`。
- `authCode`、`icon`、`appId`、`activePath`。
- `keepAlive`、`affixTab`、`hideInBreadcrumb`、`hideInTab`。
- 可选 `badge`、`badgeType`、`badgeVariants`、`iframeSrc`。

`type` 取值：`catalog`、`menu`、`button`、`embedded`、`link`。

前端流程：

1. `/user/menus` 返回菜单。
2. 非 `button` 菜单按 `path` 匹配 `router/routes.ts` 的静态路由。
3. 匹配成功后通过 `router.addRoute` 注册，并使用菜单信息生成 route meta。
4. `button` 菜单的 `authCode` 进入 `accessCodes`，供 `v-auth` 和表格 `auth` 使用。

菜单表 `sys_menu` 没有 `component` 字段；页面组件只能在静态路由表声明。

## 分页

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

- 标准参数：`pageNum` 从 1 开始，`pageSize` 有合理上限。
- 后端用 `@Type(() => Number)`、`@IsInt()`、`@Min(1)` 校验；新增公网接口应补 `@Max()`。
- 参考 `PageQueryDto` 当前只有 `Min(1)`，不要声称已有上限。
- `useSource` 的 `pageKey` 默认 `pageNumber`；对接 REST 参考后端时显式写 `pageKey: 'pageNum'`。
- 并非所有列表都分页：`GET /apps` 返回数组，`system/app` 设置 `showPagination: false`；`/configs`、`/posts`、`/notices` 返回分页对象。
- 空结果返回 `[]`，不是 `null`；列表按稳定业务字段排序。

## DTO 与校验

- 入参必须是 class DTO；全局 `whitelist: true` 拒绝未声明字段。
- 创建与更新分开 DTO；更新使用 `PATCH` 和可选字段。
- 字符串有长度限制；枚举用 `@IsIn` / `@IsEnum`；数字有范围校验；日期与布尔值做类型转换。
- 查询参数中的嵌套对象不使用 JSON 字符串；复杂筛选使用明确字段或专用查询 DTO。
- 响应使用 VO/DTO 映射；不要把 TypeORM entity 的敏感字段直接暴露。

## 权限码

- 格式：`资源:动作`，例如 `sys:app:list`、`sys:app:create`、`sys:app:update`、`sys:app:delete`。
- 后端 controller 使用 `@RequirePermission('<code>')`；传数组时必须拥有全部权限码。
- 前端使用 `auth` / `v-auth`；服务端守卫是最终授权。
- 无权限返回 403，不能返回 200 + 空数据掩盖。
- 登录返回的 `permissions`、`/user/permissions` 与菜单按钮 `authCode` 必须同源。
- 系统角色在 `PermissionGuard` 中直接放行，不在前端维护额外管理员白名单。

## 文件

- 上传使用 `multipart/form-data`，字段名固定，限制大小与类型，返回文件 ID/URL/元数据。
- 下载接口必须鉴权；文件名使用 RFC 5987 编码，防止响应头注入。
- 不在 URL 中传敏感 token；预览地址使用短期签名或鉴权下载。

## 变更检查

- [ ] 前端类型与后端 DTO 字段一致。
- [ ] 分页形态、枚举、日期、空值语义一致。
- [ ] 权限码同时出现在后端、菜单数据和前端使用点。
- [ ] 静态路由 `path` 与菜单 `path` 一致。
- [ ] Swagger 与测试同步更新。
- [ ] 破坏性变更已在交付说明中标注。

