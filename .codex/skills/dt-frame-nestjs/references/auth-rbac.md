# 认证与 RBAC

## 登录

`POST /api/auth/login` 的参考流程：

1. DTO 校验用户名、密码、可选验证码。
2. 验证码启用时校验 Redis 中的 key，并一次性删除。
3. 按用户名查用户，校验状态与 `bcryptjs` 密码。
4. 查询角色码与权限码，生成包含 `sub`、`username`、`roles`、`jti` 的 JWT 载荷。
5. 签发 access token 与 refresh token。
6. refresh token 写入 Redis，并登记在线会话与登录日志。
7. 返回 `{ accessToken, refreshToken, user }`，`user` 含 `id`、`username`、`nickname`、`roles`、`permissions`。

登录失败统一提示“用户名或密码错误”，禁用用户单独提示，避免暴露内部细节。

## 令牌

- access token 默认 15 分钟，refresh token 默认 7 天，时间来自配置。
- refresh token 存 Redis，刷新时校验会话并轮换 `jti`。
- `POST /api/auth/refresh` 只返回 `{ accessToken }`。
- `POST /api/auth/logout` 撤销 refresh token 和在线会话。
- 前端 401 后由 `utils/http.ts` 静默刷新；刷新失败才触发登录过期。

## 守卫

- `JwtAuthGuard` 作为全局 `APP_GUARD`，默认所有接口受保护。
- `@Public()` 用于登录、刷新、验证码、健康检查等白名单；不要让整个 controller 默认公开。
- `PermissionGuard` 作为全局守卫，读取 `@RequirePermission` 元数据。
- 参考实现：无权限声明直接放行；系统角色直接放行；其他用户必须拥有声明的全部权限码，缺少任意一个返回 403。
- 前端 `v-auth` 只做界面显隐；服务端权限守卫才是最终授权。

## 权限模型

- 用户、角色、菜单/按钮为多对多关系；权限码来自 `button` 菜单的 `authCode`。
- 权限码格式 `sys:<resource>:<action>`，如 `sys:app:list`、`sys:app:create`、`sys:app:update`、`sys:app:delete`。
- `/user/menus` 返回菜单树；非按钮菜单的 `path` 用于匹配前端静态路由，按钮菜单的 `authCode` 进入前端 `accessCodes`。
- `/user/permissions` 返回权限码数组；`/auth/profile` 也返回 `permissions`。`/user/info` 不含 `permissions`。
- 系统管理员放行集中在 `PermissionGuard` 的 `hasSystemRole` 判断中，不散落到页面或 controller。

## 示例

```ts
/** 创建应用。 @param dto 创建参数 @returns 新应用 */
@Post()
@RequirePermission('sys:app:create')
@ApiBearerAuth()
@ApiOperation({ summary: '创建应用' })
create(@Body() dto: CreateAppDto): Promise<App> {
	return this.appsService.create(dto)
}
```

## 常见错误

- 只在 controller 判断权限，service 越权调用仍可执行。
- 把 `@Public()` 加到整个 controller，误放行管理接口。
- 把密码、refresh token 或完整 JWT 写入日志。
- 前端隐藏按钮就认为安全；接口未做权限校验。
- 声称 `/user/info` 返回权限码；实际应使用 `/auth/profile` 或 `/user/permissions`。
- 在菜单表里寻找或编造 `component` 字段；组件映射只在静态路由表。

