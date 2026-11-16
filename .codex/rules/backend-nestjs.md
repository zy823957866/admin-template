---
name: backend-nestjs
description: 生成 NestJS 后端时的项目结构、分层、鉴权、数据库、接口和测试硬约束。
---

# NestJS 后端（强制）

## 项目事实

- 当前模板尚未包含后端。生成时放在 `apps/backend/`，包名 `@dt-frames/starter-backend`；具体产品可替换为对应产品包名。
- 参考实现位于 `D:\frames\front\dt-frame-new\apps\backend`，其实际包名是 `@dt-frames/backend`；只借鉴结构与代码，不要把包名、已有模块或测试设施直接当作本模板已有内容。
- 技术栈以参考项目为准：NestJS 11、TypeORM 0.3、`mysql2`、`ioredis`、`@nestjs/jwt`、`@nestjs/passport`、`class-validator`、`class-transformer`、`@nestjs/swagger`、`@nestjs/config`、`helmet`、`@nestjs/throttler`、`bcryptjs`。
- 后端只依赖 `packages/core` 的纯 TS 能力，不反向依赖 `apps/web`；`packages/core` 不引入 NestJS 或 TypeORM。
- 使用 `pnpm --filter @dt-frames/starter-backend ...` 执行后端命令，不把 NestJS 依赖提升到根包。

## 结构

```text
apps/backend/src/
├── main.ts              # 创建应用，调用 setupApp，监听端口
├── app.module.ts        # Config/TypeORM/Redis/业务模块/全局守卫
├── app.setup.ts         # 前缀、校验、CORS、helmet、Swagger
├── common/              # decorators / guards / filters / interceptors / dto / entities / utils
├── config/              # configuration.ts
├── database/            # data-source.ts / migrations
├── redis/
└── modules/<feature>/
```

- 每个业务模块包含 `module.ts`、`controller.ts`、`service.ts`、`dto/`、`entity.ts`；复杂查询再增加 repository。
- controller 只处理路由、参数绑定、Swagger 注解和调用 service；业务规则放 service；TypeORM 查询放 repository 或 service 的清晰数据访问段。
- 禁止在 service 中直接操作 `req` / `res`；使用 `@CurrentUser()` 获取当前用户。
- 内部服务通过构造器注入，禁止 `new` 手工实例化依赖。
- 对外响应优先使用 VO/DTO 映射，不返回含密码、密钥、刷新令牌等敏感字段的 entity。

## 全局装配

- `main.ts` 只负责创建应用、调用共享的 `setupApp`、监听端口。
- `setupApp` 设置：`setGlobalPrefix('api')`、`ValidationPipe({ whitelist: true, transform: true })`、`helmet()`、CORS 和 Swagger。
- 参考项目的 CORS 为开发可用的 `origin: true, credentials: true`；生产部署必须收紧来源。
- 全局拦截器将成功响应包装为 `{ code: 0, data, message: 'ok' }`；`StreamableFile` 不包装。
- 全局异常过滤器输出 `{ code, message, timestamp, path }`；5xx 记录日志，但不把堆栈返回客户端。
- 默认 `synchronize: false`，建表与变更必须走 migration；测试环境是否允许 sqlite/`synchronize` 必须在配置中显式控制。
- Swagger 入口为 `/api/docs`、JSON 为 `/api/docs-json`；生产环境必须关闭或加访问控制。

## 鉴权与权限

- 全局注册 `JwtAuthGuard` 与 `PermissionGuard`；只有登录、刷新、验证码、健康检查等明确接口标记 `@Public()`。登出需要登录。
- JWT 参考配置为 access token 15 分钟、refresh token 7 天，均来自环境变量；refresh token、验证码和在线会话存 Redis。
- 密码使用 `bcryptjs` 哈希校验，禁止明文入库、写入日志或返回响应。
- 权限码统一 `sys:<resource>:<action>`，后端 `@RequirePermission` 与前端按钮/菜单使用同一码表。
- 参考 `PermissionGuard` 的行为：无 `@RequirePermission` 直接放行；系统角色直接放行；其他用户必须拥有声明的全部权限码。
- 需要在审计中记录写操作时，按现有模式使用 `@OperationLog({ title, businessType })`。

## 数据库与配置

- 实体继承统一审计基类，至少包含 `createUser`、`createTime`、`updateUser`、`updateTime`、`deleted`。
- 列名使用 snake_case，实体属性使用 camelCase；通过 `@Column({ name: 'xxx_yyy' })` 映射。
- 连接配置全部来自环境变量；`.env.example` 只放占位值，不提交真实密码和密钥。
- 查询必须参数化；禁止把用户输入拼进 SQL、ORDER BY 或字段名。
- 唯一性、外键、软删除和并发更新在数据库或 service 层明确处理，不能只靠前端校验。
- 分页接口返回 `{ pageNum, pageSize, total, pages, list }`，继承或对齐 `PageQueryDto`；全量接口明确返回数组。

## Swagger 与测试

- 每个 controller 加 `@ApiTags`；每个接口加 `@ApiOperation`；受保护接口加 `@ApiBearerAuth`；DTO 字段加 `@ApiProperty` / `@ApiPropertyOptional`。
- 单测使用 Vitest + `unplugin-swc`，文件 `src/**/*.spec.ts`。
- 接口 e2e 使用 `@nestjs/testing` + supertest，文件 `test/**/*.e2e-spec.ts`；新增模块时必须同时创建 `test/` 目录、配置和 scripts。
- 参考项目已有 `vitest.config.ts` 与 `vitest.config.e2e.ts`，但当前没有 `apps/backend/test/` 目录；不得声称已有完整 e2e 套件。
- e2e 关闭验证码时显式设置 `CAPTCHA_ENABLED=false`；测试环境可配置 sqlite 内存库，但 Redis 仍需要独立测试实例。
- 新增模块必须提供 service 单测和至少一条关键 e2e；禁止无断言空测试、跳过鉴权测试或用 mock 掩盖数据库/守卫行为。

