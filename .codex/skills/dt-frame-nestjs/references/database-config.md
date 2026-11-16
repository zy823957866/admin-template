# 数据库与配置

## 依赖

生产依赖放在 `apps/backend/package.json`：

```json
{
	"dependencies": {
		"@nestjs/common": "^11.0.0",
		"@nestjs/config": "^4.0.0",
		"@nestjs/core": "^11.0.0",
		"@nestjs/jwt": "^11.0.0",
		"@nestjs/passport": "^11.0.0",
		"@nestjs/platform-express": "^11.0.0",
		"@nestjs/swagger": "^11.0.0",
		"@nestjs/typeorm": "^11.0.0",
		"bcryptjs": "^3.0.0",
		"class-transformer": "^0.5.0",
		"class-validator": "^0.14.0",
		"helmet": "^8.0.0",
		"ioredis": "^5.0.0",
		"mysql2": "^3.0.0",
		"passport": "^0.7.0",
		"passport-jwt": "^4.0.0",
		"reflect-metadata": "^0.2.0",
		"rxjs": "^7.0.0",
		"typeorm": "^0.3.0"
	}
}
```

开发依赖至少包含 `@nestjs/cli`、`@nestjs/testing`、`@swc/core`、`unplugin-swc`、`vitest`、`@vitest/coverage-v8`、`supertest`、`@types/supertest`、`ts-node`、`typescript` 和对应类型包。以实际版本兼容为准，不盲目照抄旧版本。

## 环境变量

`.env.example` 只使用占位值：

```env
NODE_ENV=development
PORT=3001

DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=change-me
DB_DATABASE=dt_frames
DB_TIMEZONE=+08:00
DB_CHARSET=utf8mb4
DB_SYNCHRONIZE=false

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_CONNECT_TIMEOUT=5000
REDIS_TTL=3600

JWT_ACCESS_SECRET=change-me-access-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

CAPTCHA_ENABLED=true
CAPTCHA_TTL=300
```

`.env` 必须被忽略；生产密钥由部署环境注入，不写入仓库。

## TypeORM

- `synchronize: false`；开发也通过 migration 管理结构。
- `charset: 'utf8mb4'`，时区按部署环境设置，API 输出统一 ISO 时间。
- 开启合理连接池与超时；生产不得使用本地默认密码。
- 每个业务实体有索引、唯一约束和外键策略；软删除字段与查询过滤保持一致。
- 生成迁移后检查 SQL，禁止把临时表、调试数据或破坏性操作误提交。

```ts
/** 审计基础字段。 */
export abstract class BaseEntity {
	@Column({ name: 'create_user', type: 'bigint', nullable: true })
	createUser?: number

	@CreateDateColumn({ name: 'create_time' })
	createTime!: Date

	@Column({ name: 'update_user', type: 'bigint', nullable: true })
	updateUser?: number

	@UpdateDateColumn({ name: 'update_time' })
	updateTime!: Date

	@Column({ name: 'deleted', type: 'tinyint', default: 0 })
	deleted!: number
}
```

## 迁移命令

后端 `package.json` 建议：

```json
{
	"scripts": {
		"migration:generate": "typeorm-ts-node-commonjs -d src/database/data-source.ts migration:generate",
		"migration:run": "typeorm-ts-node-commonjs -d src/database/data-source.ts migration:run",
		"migration:revert": "typeorm-ts-node-commonjs -d src/database/data-source.ts migration:revert"
	}
}
```

执行时使用 `pnpm --filter @dt-frames/starter-backend migration:run`。

## Redis

- 用途：refresh token/会话、验证码、缓存、限流辅助。
- key 统一前缀 `dt-frame:`，例如 `dt-frame:captcha:<key>`、`dt-frame:session:<userId>`。
- 缓存内容不存明文密码或完整敏感资料。
- 验证码一次性消费；刷新/登出要清理对应会话。

## 数据访问

- 查询默认排除 `deleted = 1`。
- 写操作使用事务保证主表与关联表一致。
- 唯一冲突转成 409/明确业务错误，不要直接把数据库异常抛给客户端。
- 列表查询明确 select 字段，避免无意返回密码哈希、内部配置或大字段。
