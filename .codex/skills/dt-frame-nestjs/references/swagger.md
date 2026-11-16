# Swagger 文档

## 入口

Swagger 在 `setupApp` 中配置，主进程和 e2e 共用：

```ts
const config = new DocumentBuilder()
	.setTitle('dt-frame API')
	.setDescription('dt-frame 管理后台后端接口文档')
	.setVersion('1.0.0')
	.addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
	.addTag('auth', '认证')
	.addTag('users', '用户管理')
	.addTag('roles', '角色管理')
	.addTag('menus', '菜单管理')
	.addTag('health', '健康检查')
	.build()

const documentFactory = () => SwaggerModule.createDocument(app, config)
SwaggerModule.setup('docs', app, documentFactory, {
	useGlobalPrefix: true,
	swaggerOptions: { persistAuthorization: true },
	jsonDocumentUrl: 'docs-json',
})
```

- UI：`http://localhost:3001/api/docs`
- JSON：`http://localhost:3001/api/docs-json`
- `persistAuthorization: true` 便于刷新后继续使用 Bearer token。
- 新增业务模块时在 `DocumentBuilder.addTag` 预声明分组。

## 注解要求

- controller：`@ApiTags('users')`。
- 方法：`@ApiOperation({ summary: '一句话说明' })`。
- 受保护接口：`@ApiBearerAuth()`。
- 入参 DTO：字段使用 `@ApiProperty` / `@ApiPropertyOptional`，标注 `description`、`example`、长度、必填。
- 响应：`@ApiOkResponse({ type: XxxVo })` 描述**解包后的 data 载荷**，不是全局外壳。
- 错误：`@ApiUnauthorizedResponse`、`@ApiForbiddenResponse`、`@ApiNotFoundResponse` 按实际情况添加。

```ts
/** 创建角色入参。 */
export class CreateRoleDto {
	@ApiProperty({ description: '角色名称', example: '运营管理员', maxLength: 50 })
	@IsString()
	@MaxLength(50)
	name!: string

	@ApiProperty({ description: '角色编码', example: 'operator', maxLength: 50 })
	@IsString()
	@MaxLength(50)
	code!: string
}
```

## 检查

- 启动后打开 `/api/docs`，确认分组、字段、示例、Bearer 可用。
- 不把真实账号、密钥、生产路径写入示例。
- Swagger 与实际 `ValidationPipe` 规则一致，避免文档宽松、实际拒绝。
- 删除/重命名字段时同步更新注解和前端类型。
