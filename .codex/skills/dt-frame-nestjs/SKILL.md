---
name: dt-frame-nestjs
description: 生成或修改 dt-frame 管理后台的 NestJS 后端规范，覆盖 apps/backend、TypeORM + MySQL + Redis、JWT RBAC、Swagger、Vitest/supertest。当新增后端模块、设计权限、建表迁移、联调认证或编写后端测试时使用。
---

# dt-frame NestJS 后端规范

## 适用前提

当前模板只有前端，后端尚未存在。需要后端能力时，按本技能在 `apps/backend/` 内完整搭建，而不是在 `apps/web` 中伪造服务端逻辑。

参考实现：`D:\frames\front\dt-frame-new\apps\backend`。参考项目实际包名是 `@dt-frames/backend`；本模板生成时按仓库约定使用 `@dt-frames/starter-backend`，具体产品可替换。

## 固定技术栈

- NestJS 11、TypeORM 0.3、`mysql2`、`ioredis`、`@nestjs/jwt`、`@nestjs/passport`、`class-validator`、`class-transformer`、`@nestjs/swagger`、`@nestjs/config`、`bcryptjs`、`helmet`、`@nestjs/throttler`。
- 测试：Vitest + `@nestjs/testing` + supertest + `unplugin-swc`。
- 后端只依赖 `packages/core` 的纯 TS 能力，禁止依赖 `apps/web`。

## 目录结构

```text
apps/backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.setup.ts
│   ├── common/          # decorators / guards / filters / interceptors / dto / entities / utils
│   ├── config/          # configuration.ts
│   ├── database/        # data-source.ts / migrations
│   ├── redis/
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── roles/
│       ├── menus/
│       └── <feature>/
├── test/                # 本轮生成时才创建 *.e2e-spec.ts
├── vitest.config.ts
├── vitest.config.e2e.ts
├── .env.example
└── package.json
```

业务模块内按需包含 `module.ts`、`controller.ts`、`service.ts`、`repository.ts`、`entity.ts`、`dto/`、`*.spec.ts`。简单模块不必为分层而分层。

参考项目已有 `vitest.config.ts`、`vitest.config.e2e.ts` 和少量 `src/**/*.spec.ts`，但当前没有 `apps/backend/test/` 目录；不得声称已有完整 e2e 套件。

## 必守契约

- 全局前缀 `/api`；成功 `{ code: 0, data, message: 'ok' }`，异常 `{ code, message, timestamp, path }`。
- 除显式 `@Public()` 外，所有接口必须登录；权限用 `@RequirePermission('sys:<resource>:<action>')`。
- `@Public()` 只用于登录、刷新、验证码、健康检查等白名单；登出需要登录。
- DTO 使用 class-validator；`ValidationPipe({ whitelist: true, transform: true })` 全局启用。
- 密码使用 bcrypt；access token 约 15 分钟，refresh token 约 7 天，refresh token、验证码和在线会话存 Redis。
- `synchronize: false`，建表和字段变更通过 migration；测试模式的 sqlite/`synchronize` 必须显式配置。
- 对外响应不泄露密码、密钥、refresh token 或其他敏感字段。
- 每个接口有 Swagger 注解；每个新增模块有单测和关键 e2e。

## 生成顺序

1. 先读 `dt-frame-api-contract`，确定路径、DTO、分页和权限码。
2. 设计 entity、索引、唯一约束和 migration。
3. 写 DTO 与 service 单测（至少关键分支）。
4. 实现 service -> controller -> module，注册到 `app.module.ts`。
5. 增加 Swagger 注解、操作日志与 e2e。
6. 运行 typecheck、lint、单测、e2e；再与前端 API 函数联调。

## 权限守卫事实

参考 `PermissionGuard`：

- 没有 `@RequirePermission`：直接放行。
- 系统角色：`hasSystemRole(user.id)` 为真时直接放行。
- 其他用户：查询角色关联权限码，缺少声明的任意权限码时抛出 `ForbiddenException`。
- 传数组时要求拥有全部权限码。

不要把系统角色放行复制到前端，也不要只在 controller 做权限判断而绕过 service 的业务校验。

## 接口与数据形态

- 资源名用小写复数：`@Controller('apps')`、`@Controller('configs')`。
- 详情 `GET /:id`、更新 `PATCH /:id`、删除 `DELETE /:id`。
- 批量删除沿用 `POST /batch-delete` + `{ ids }`。
- 状态切换沿用 `POST /:id/status`。
- 标准分页返回 `{ pageNum, pageSize, total, pages, list }`；全量接口返回数组。
- 写操作按真实模式使用 `@OperationLog({ title, businessType })`。

## 参考文档

- `references/architecture.md`：目录、模块分层、全局装配和接口组织。
- `references/auth-rbac.md`：登录、刷新、JWT 守卫、权限守卫和菜单权限码。
- `references/database-config.md`：TypeORM、MySQL、Redis、迁移、审计字段与环境变量。
- `references/swagger.md`：Swagger 入口、DTO 注解、Bearer 调试和响应描述。
- `references/testing.md`：Vitest、supertest、测试库隔离、scripts 和验收流程。

