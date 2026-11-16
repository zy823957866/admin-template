# NestJS 后端架构

## 分层

```text
apps/backend/src/
├── main.ts              # 创建应用，调用 setupApp，监听端口
├── app.module.ts        # 根模块：Config/TypeORM/Redis/限流/业务模块/全局守卫与拦截器
├── app.setup.ts         # 前缀、校验、CORS、helmet、Swagger（e2e 复用）
├── common/
│   ├── decorators/       # @Public / @CurrentUser / @RequirePermission / 操作日志
│   ├── dto/              # 分页参数与分页结果
│   ├── entities/         # 审计基础实体
│   ├── filters/          # 全局异常输出
│   ├── guards/           # JWT 与权限守卫
│   ├── interceptors/     # 响应包装、操作日志
│   └── utils/
├── config/
├── database/
│   ├── data-source.ts
│   └── migrations/
├── modules/<feature>/
└── redis/
```

## 模块职责

- `controller`：只处理 HTTP 路由、参数绑定、Swagger 注解和调用 service。
- `service`：业务规则、事务边界、权限相关数据校验、实体到 VO 的转换。
- `repository`：复杂 TypeORM 查询封装；简单查询可留在 service。
- `entity`：数据库映射和关系；不承载 HTTP 或业务编排逻辑。
- `dto`：入参校验和 Swagger 元数据；创建、更新、查询分别建类。
- `module`：声明 controller、service、TypeORM entity 和其他依赖。

参考项目当前没有 `apps/backend/test/` 目录。上文的 `test/` 是生成后端时必须新建的 e2e 目录，不是现有事实。

## 根模块

`app.module.ts` 负责：

- `ConfigModule.forRoot({ isGlobal: true, load: [configuration] })`。
- `TypeOrmModule.forRootAsync()`，从 `ConfigService` 读取连接配置。
- Redis 模块、业务模块、健康检查。
- 全局 `APP_GUARD`：JWT、权限；`APP_INTERCEPTOR`：响应包装、操作日志；`APP_FILTER`：异常过滤。
- 参考项目还注册 `ThrottlerModule`、`RedisModule`、`DataScopeModule` 等；新增模块要确认是否真的需要这些能力，不要照搬无用依赖。

不要在每个 controller 重复手写响应包装和异常捕获。

## 全局装配

```ts
/** 应用通用装配，主进程与 e2e 共用。 @param app Nest 应用 */
export function setupApp(app: INestApplication): void {
	app.setGlobalPrefix('api')
	app.use(helmet())
	app.enableCors({ origin: true, credentials: true })
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
	// Swagger 见 references/swagger.md
}
```

生产环境必须收紧 CORS 来源，并按部署要求限制 Swagger。

## 接口组织

- 资源名用小写复数：`@Controller('users')`。
- 详情用 `@Get(':id')`，更新用 `@Patch(':id')`，删除用 `@Delete(':id')`。
- 需要 current user 时使用 `@CurrentUser()`，不直接读取 `req.user`。
- 路径参数需要数值时使用 `ParseIntPipe` 或在 DTO 中转换并校验。
- 分页统一继承 `PageQueryDto`，返回 `PageResult<T>`。
- 业务异常用 `NotFoundException` / `ConflictException` / `ForbiddenException`，不要统一抛 500。
- 写操作按真实模式使用 `@OperationLog({ title, businessType })`，审计实体与逻辑删除由 `BaseEntity` 统一提供。

## 依赖规则

- `apps/backend -> packages/core` 单向依赖。
- 业务模块之间优先通过 service 接口调用；避免 controller 直接调用其他 controller。
- 不为共享几个常量创建循环依赖；共享纯 TS 权限码/类型放 `packages/core`。
- `packages/core` 不得引入 `@nestjs/*`、TypeORM、Express 或 Redis。
