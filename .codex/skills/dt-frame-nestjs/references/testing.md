# 后端测试与验收

## 基线

- 单测：Vitest + `unplugin-swc`，文件 `src/**/*.spec.ts`。
- 接口 e2e：`@nestjs/testing` + supertest，文件 `test/**/*.e2e-spec.ts`。
- 参考项目当前有 `vitest.config.ts`、`vitest.config.e2e.ts` 和少量单测，但没有 `apps/backend/test/` 目录；生成后端时必须实际创建该目录和配置。
- e2e 需要独立 Redis；接入 MySQL 时使用独立测试库。参考配置在 `NODE_ENV=test` 且未显式设置 `DB_TYPE` 时可使用 sqlite 内存库。
- 不允许无断言空测试，不允许跳过关键鉴权测试。

## 配置

```ts
import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

/** 后端单测配置。 */
export default defineConfig({
	plugins: [swc.vite()],
	test: {
		globals: true,
		include: ['src/**/*.spec.ts'],
		coverage: {
			provider: 'v8',
			thresholds: { lines: 68, functions: 66, branches: 53, statements: 64 },
		},
	},
})
```

```ts
import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

/** 后端 e2e 配置。 */
export default defineConfig({
	plugins: [swc.vite()],
	test: {
		env: { CAPTCHA_ENABLED: 'false' },
		globals: true,
		include: ['test/**/*.e2e-spec.ts'],
		testTimeout: 30_000,
		hookTimeout: 60_000,
	},
})
```

`unplugin-swc` 用于保证 `emitDecoratorMetadata` 在测试环境可用。覆盖阈值按项目基线设置，只升不降。

## scripts

```json
{
	"scripts": {
		"test": "vitest run",
		"test:cov": "vitest run --coverage",
		"test:e2e": "vitest run --config ./vitest.config.e2e.ts"
	}
}
```

如增加总验收命令，可以定义 `verify`，但必须实际串联 typecheck + lint + unit + e2e，不能只写名字。

## e2e 骨架

测试账号和密码通过测试夹具创建，禁止把生产账号或无来源的默认口令写进规范。

```ts
import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { setupApp } from '../src/app.setup'

describe('Auth (e2e)', () => {
	let app: INestApplication

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
		app = moduleRef.createNestApplication()
		setupApp(app)
		await app.init()
		// 在此创建测试用户/角色/菜单夹具，不要复用开发或生产数据。
	})

	it('未登录访问受保护接口返回 401', async () => {
		const res = await request(app.getHttpServer()).get('/api/apps')
		expect(res.status).toBe(401)
	})

	afterAll(async () => {
		await app.close()
	})
})
```

## 必测场景

- 登录成功/失败、验证码开关、refresh token 刷新与撤销。
- 未登录访问受保护接口返回 401。
- 无权限访问返回 403；有权限可执行；系统角色放行。
- DTO 校验失败返回 400；不存在返回 404；唯一冲突返回 409。
- 列表数组/分页、筛选、空结果；创建、更新、删除、批量删除主流程。
- 菜单 path 与静态路由匹配、按钮权限码收集。
- 响应不含密码、密钥、完整 token 等敏感字段。

## 数据库隔离

- 优先用独立 Redis；使用 MySQL 时使用独立测试库；测试模式可使用 sqlite 内存库。
- 每个测试文件自行准备和清理数据；测试之间不依赖执行顺序。
- 不使用生产库；不在测试中固定 `sleep`，使用可见状态或轮询条件。

## 收尾

- 运行受影响模块的 `typecheck`、`lint`、`test`、`test:e2e`。
- 记录未运行项目和原因。
- 前端联调需验证登录、菜单、权限和 CRUD，不只验证单个接口。

