---
name: dt-frame-admin-codegen
description: 从业务需求生成完整管理后台模块的标准流程，覆盖字段建模、API 契约、NestJS 后端、Vue CRUD 页面、静态路由、后端菜单、权限与验收。当用户要求生成后台/新增模块/做 CRUD/按业务生成页面时使用。
---

# 管理后台模块生成

## 目标

把业务需求变成可运行、可鉴权、可联调、可验收的前后端模块。完整模块必须同时处理数据模型、接口、页面、静态路由、后端菜单、按钮权限和测试。

## 输入检查

开始生成前先建立模块计划，至少包含：

| 项目 | 必须明确的内容 |
| --- | --- |
| 模块 | 中文名、英文资源名、页面路径、路由 name、所属菜单、菜单父级 |
| 字段 | 后端字段名、页面字段名、类型、必填、唯一、长度、默认值、枚举、关系 |
| 操作 | 全量/分页列表、详情、新增、编辑、删除、批量删除、状态切换、导入导出 |
| 查询 | 筛选条件、排序、分页键、关键字、时间范围 |
| 权限 | 权限前缀、列表/新增/修改/删除按钮权限码、数据范围 |
| 前端 | API 文件或页面直连 `http`、字段映射、表单控件、表格 render |
| 接口 | 方法、路径、DTO、响应形态、错误 |
| 验收 | 正常流程、异常流程、越权流程、手工/自动验证方式 |

关键字段、权限或接口缺失时，先提出最小必要问题。可以合理假设，但必须显式标注，不能悄悄编造实体字段。

## 精确生成步骤

### 1. 模块计划

参考 `references/module-plan.md` 输出：

- 字段表。
- 接口表。
- 前端组合表。
- 菜单与权限表。
- 验收表。

### 2. API 契约

先定资源名、路径、DTO、响应和错误，遵循 `dt-frame-api-contract`：

- 标准分页：`pageNum/pageSize` -> `{ pageNum, pageSize, total, pages, list }`。
- 全量列表可返回数组，例如 `GET /apps`。
- 详情、创建、更新、删除、批量删除、状态切换路径与真实模块保持一致。

### 3. 后端

按 `dt-frame-nestjs` 生成：

1. migration。
2. entity（继承审计基类、逻辑删除、唯一约束）。
3. DTO（创建/更新/查询；class-validator + Swagger）。
4. service（业务规则、唯一冲突、软删除、内置数据保护）。
5. controller（`@RequirePermission`、`@OperationLog`、Swagger）。
6. module 并注册到 `app.module.ts`。
7. 单测与关键 e2e。

### 4. 前端数据层与字段映射

- 自包含模块按 `system/app` 直接在 `useSource.api` 调用 `http`。
- 分页或跨页面复用模块放 `apps/web/src/api/<module>.ts`，参考 `config/post/notice`。
- 页面字段与后端字段不一致时集中转换：`toView` 用于后端 -> 页面，`beforeSave` 或 API 函数用于页面 -> 后端。
- `useSource` 必须写 `pageKey: 'pageNum'` 和真实 `pageName`、`authPrefix`。

### 5. 搜索表单

```ts
const [registerSearch] = useForm({
	...source,
	mode: 'filter',
	compact: true,
	schemas: [
		{ component: 'Input', name: 'name', label: '名称', props: { clearable: true } },
	],
})
```

- 字段与查询 DTO 一致。
- 组件名只能来自 `componentMap`：`Cascader`、`Checkbox`、`CheckboxGroup`、`ColorPicker`、`DatePicker`、`DateTimePicker`、`Input`、`InputNumber`、`Radio`、`RadioGroup`、`Rate`、`Select`、`VirtualizedSelect`、`Slider`、`Switch`、`TimePicker`、`TimeSelect`、`TreeSelect`、`Upload`、`I18nInput`、`Divider` 等。
- 复杂字段使用 `render` 或 `appendSlot`，先核验真实组件 Props。

### 6. 新增/编辑弹窗

```ts
const [Curd, curdInstance] = useCurd({
	source,
	modalProps: { title: '模块名称', width: '560px' },
	formProps: { mode: 'modal', labelWidth: 100, schemas: [] },
})
```

- 工具栏调用 `curdInstance.openAddDialog()`。
- 行操作调用 `curdInstance.openEditDialog(row)`。
- `beforeSave` 返回转换后的模型；返回 `false` 阻止保存。
- 内置数据、不可编辑/不可删除等业务保护要在前端提示并在服务端重复校验。

### 7. 表格

```ts
const [registerTable, table] = useVxeTable({
	...(source as any),
	idField: 'id',
	showPagination: false, // 仅数组结果
	toolbar: [],
	operations: [],
	columns: [],
})
```

- `useVxeTable` 返回 `[registerTable, table]`。
- 批量删除使用 `table.grid.value?.getCheckboxRecords?.()`。
- 自定义工具栏和行操作写完整权限码。
- 外层使用 `<DtVxeTable v-auth="'sys:xxx:list'" @register="registerTable" />`。

### 8. 静态路由

在 `apps/web/src/router/routes.ts` 增加：

```ts
{
	path: '/system/<page>',
	name: 'system-<page>',
	component: () => import('@/views/system/<page>/index.vue'),
	meta: { title: '系统管理 / <页面名>' },
}
```

路由 `path` 必须与后端菜单 path 完全一致。

### 9. 后端菜单与按钮权限

在菜单种子/接口中增加：

- `type: 'catalog'` 或 `'menu'` 的页面节点，`path` 与静态路由一致。
- `type: 'button'` 的权限节点，`authCode` 使用 `sys:<resource>:list/create/update/delete`。
- 必要字段：`appId`、`parentId`、`zhCnName`、`enName`、`order`、`icon/iconName`、`keepAlive` 等。

菜单表 `sys_menu` 没有 `component` 字段；不要把页面组件映射写进菜单。

### 10. 验收

- 后端：migration 可运行、Swagger 出现分组、权限拒绝返回 403、主流程可用。
- 前端：`pnpm typecheck`、`pnpm build`。
- 手工：登录 -> 菜单 path 匹配 -> 页面访问 -> 按钮显隐 -> CRUD。
- 测试：运行新增的后端单测和关键 e2e；没有实际运行不得声称通过。

## 标准交付

后端：

- `apps/backend/src/modules/<module>/...`
- migration 与必要的角色/菜单/权限初始化数据。
- `*.spec.ts` 与本轮实际创建的 `test/*.e2e-spec.ts`。

前端：

- `apps/web/src/api/<module>.ts` 或页面内自包含 `http`。
- `apps/web/src/views/<module>/<page>/index.vue`。
- `apps/web/src/router/routes.ts` 路由。
- 页面私有 `components/`、`hooks/`、`types.ts`（按需）。

跨端：

- 字段和枚举命名一致。
- 权限码一致。
- 数组/分页响应与 `useSource` 分支一致。
- Swagger、页面和测试中的示例数据一致。
- 菜单 path 与静态路由 path 一致。

## CRUD 完成定义

- 列表走全量数组或分页对象，分支明确。
- 搜索表单可查询、重置，字段与查询 DTO 一致。
- 新增/编辑通过 `useCurd` 管理，校验、字段映射、错误提示完整。
- 删除/批量删除走内置确认或显式确认，成功后刷新。
- 自定义业务保护在前后端都生效。
- 未登录、无权限、参数错误、后端异常都有明确表现。
- 新增权限码已写入菜单/角色数据，前端使用点与后端一致。
- 至少一条主流程 e2e 或手工验收步骤记录在交付说明中。
- 没有把未运行测试写成通过。

## 禁止

- 先写页面再反推接口，导致前后端字段长期不一致。
- 用前端 mock 代替未完成后端。
- 用 `ElForm + ElTable` 重写 CRUD。
- 把业务路由只写在菜单，不写静态路由表。
- 给菜单表编造 `component` 字段。
- 只隐藏按钮而不做后端权限校验。
- 添加不必要的包、UI 框架或状态库。
- 宣称“生成完成”但没有运行任何检查。

