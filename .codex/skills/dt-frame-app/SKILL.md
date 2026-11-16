---
name: dt-frame-app
description: apps/web 的页面、接口、静态路由、菜单匹配、权限、Dt 组件、CRUD 组合式 API、UnoCSS 与前端验收规范。当新增或修改后台页面、登录流程、业务 CRUD 页面、前端接口和样式时使用。
---

# apps/web 应用规范

## 当前应用事实

- 入口：`apps/web/src/main.ts`，负责 i18n、HTTP、主题、UI 全局配置、静态路由配置和布局。
- 登录页：`apps/web/src/views/login/`，静态路由 `/login`。当前模板只提供登录页。
- 路由：`apps/web/src/router/routes.ts` 显式声明静态路由；`useAppStore().setAppConf({ router: { routes } })` 将路由交给 `@dt-frames/layout` 的 `initRouter()`。
- 业务菜单：登录后 `useAuthStore.authLogin()` 请求 `/user/menus`，`getModules()` 按菜单 `path` 匹配静态路由后执行 `router.addRoute()` 并写入 route meta。
- HTTP：`apps/web/src/utils/http.ts` 设置 `baseURL = '/api'`，注入 Bearer，解包成功外壳，401 时尝试刷新并重试。
- 布局：`App.vue` 中非简版路径使用 `DtTheme`，页面不要自行搭建侧边栏、顶栏和页脚。
- 认证：`@dt-frames/layout` 的 `useAccessStore` / `useAuthStore` 是登录态、菜单和路由的权威状态。
- 权限指令：全局已注册 `v-auth`，读取 `accessStore.accessCodes`；权限码来自后端 `button` 菜单的 `authCode`。

## 页面目录

```text
apps/web/src/views/<module>/<page>/
├── index.vue              # 页面入口
├── components/            # 页面私有组件（可选）
├── hooks/                 # 页面私有 hooks（可选）
└── types.ts               # 页面私有类型（可选）
```

- 页面入口负责数据编排和模板组合；复杂表格、表单、详情抽屉按需拆子组件。
- 接口函数放 `apps/web/src/api/<module>.ts`（复杂或复用模块）或直接写在页面的 `useSource.api` 中（自包含模块，如 `system/app`）。
- 页面临时筛选、弹窗开关和表单状态留在页面内；跨页面共享状态才提升到 `src/stores`。
- 不复制登录页的视觉结构作为业务页面；业务页面使用 `DtTheme` 布局和统一页面容器。

## 标准 CRUD

所有业务 CRUD 以 `D:\frames\front\dt-frame-new\apps\web\src\views\system\app\index.vue` 为标准，组合关系为：

```ts
import { useCurd, useForm, useSource, useVxeTable } from '@dt-frames/ui'

const { source } = useSource({
	pageKey: 'pageNum',
	pageName: '应用管理',
	authPrefix: 'sys:app',
	api: {
		queryPage: async (params) => { /* 返回数组或 PageResult */ },
		queryById: async ({ id }) => http.get('/apps/' + id),
		deletes: (ids) => http.post('/apps/batch-delete', { ids }),
		add: (model) => http.post('/apps', model),
		update: ({ id, ...rest }) => http.patch('/apps/' + id, rest),
	},
	beforeSave: (model) => model,
})

const [registerForm] = useForm({ ...source, mode: 'filter', compact: true, schemas: [] })
const [Curd, curdInstance] = useCurd({ source, modalProps: {}, formProps: { schemas: [] } })
const [registerTable, table] = useVxeTable({ ...source, toolbar: [], operations: [], columns: [] })
```

页面模板：

```vue
<template>
	<div class="dt-page">
		<DtForm @register="registerForm" />
		<DtVxeTable @register="registerTable" />
		<Curd />
	</div>
</template>
```

关键事实：

- `useSource` 的 `pageKey` 默认 `pageNumber`；对接参考后端必须写 `pageNum`。
- `api.queryPage` 返回数组时走全量列表，设置 `showPagination: false`，如 `system/app`；返回 `{ list, total, ... }` 时走分页，如 `config/post/notice`。
- `beforeSave` 可返回转换后的模型；返回 `false` 会阻止保存。
- `useCurd` 返回 `[Curd, curdInstance]`，真实 API 包括 `openAddDialog()`、`openEditDialog(row)`、`del(row)`、`dels(ids)`。
- `useVxeTable` 返回 `[registerTable, table]`；批量删除可用 `table.grid.value?.getCheckboxRecords?.()`。
- 工具栏与行操作推荐使用完整权限码：`auth: 'sys:config:create'`、`'sys:config:update'`、`'sys:config:delete'`；外层列表可使用 `v-auth="'sys:config:list'"`。
- `authPrefix` 可用于补全内置短动作或默认按钮，但不得据此假设所有自定义按钮都自动拥有权限。
- 日期列可用 `render: { date: 'YYYY-MM-DD HH:mm:ss' }`；状态和图标可用 JSX `render`；TSX 中使用的 Element Plus 组件必须显式导入。

完整真实样板和变体见 `references/page-patterns.md`。不要凭记忆改组件名、Hook 返回值或 schema 字段。

## 搜索表单与弹窗

- 查询表单：`useForm({ ...source, mode: 'filter', compact: true, schemas })`，字段按查询 DTO 定义。
- 新增/编辑：`useCurd({ source, modalProps, formProps })`；表单 schema 使用真实组件名，例如 `Input`、`InputNumber`、`Select`、`RadioGroup`、`DatePicker`、`Switch`、`TreeSelect`、`Upload`、`I18nInput`。
- 自定义字段渲染：`render` / `appendSlot` 使用 JSX 或已存在的页面组件；不能编造未核验的 Props。
- 必填、长度、正则和后端 DTO 保持一致；字段映射放在 `beforeSave` 或 API 函数中，避免页面模型与后端实体长期漂移。

## 路由与菜单

- 新增页面时，在 `apps/web/src/router/routes.ts` 增加静态懒加载路由，例如：

```ts
{
	path: '/system/app',
	name: 'system-app',
	component: () => import('@/views/system/app/index.vue'),
	meta: { title: '系统管理 / 应用管理' },
}
```

- 同时在 backend 菜单种子/数据中增加相同 `path` 的 `catalog`/`menu` 记录和 `button` 权限记录。
- 菜单表 `sys_menu` 没有 `component` 字段；组件映射只存在静态路由表。
- 禁止在页面或 store 中再维护一份菜单 path 列表，也禁止只完成其中一边。
- 路由 name 使用 `<module>-<page>` 的 kebab-case，避免与现有路由冲突。

## 接口使用

```ts
import { http } from '@/utils/http'

/** 参数配置分页结果。 */
export interface ConfigPageResult {
	list: Array<{ id: number; name: string }>
	total: number
}

/** 参数配置分页查询。 @param params 查询参数 @returns 分页结果 */
export function pageConfigs(params: Record<string, unknown>): Promise<ConfigPageResult> {
	return http.get<ConfigPageResult>('/configs', { params })
}
```

- 请求/响应类型必须显式；禁止把 `any` 传遍页面。
- 参考分页接口返回 `list` / `total`；完整标准还包含 `pageNum` / `pageSize` / `pages`，按实际接口处理。
- 请求失败由页面捕获并给用户可理解提示；不要吞掉错误。
- API 层不使用 Element Plus 弹窗，只负责请求和类型。

## 组件与样式

- 可复用组件命名 PascalCase；页面入口使用 `index.vue`。
- 优先查找 `@dt-frames/ui` 已提供的 `Dt*` 组件；不确定 API 时查看类型或真实页面，禁止猜。
- 模板中的 Element Plus 组件由 Resolver 自动按需引入；TSX `render` 中使用的组件显式从 `element-plus` 导入。
- 布局、间距、颜色优先 UnoCSS；复杂动画和伪元素用 scoped CSS。
- 不新增全局样式、不覆盖 Element Plus 全量主题；主题色通过 CSS 变量或在页面局部设置。
- 文案使用中文，保持一致、简洁；错误提示说明用户下一步能做什么。

## 响应式与性能

- 大列表使用服务端分页，不在前端一次性加载全量；真实全量列表明确 `showPagination: false`。
- 重型编辑器、图表和文件预览按需动态导入。
- 图片使用合理尺寸和懒加载；登录背景这类大图不得阻塞首屏关键路径。
- 避免无意义的深度 `watch` 和大对象 `reactive`；优先 computed 和最小状态。

## 前端验收

- 运行 `pnpm typecheck` 与 `pnpm build`。
- 手工走通登录 -> 菜单 path 匹配 -> 目标页面 -> 权限按钮 -> CRUD 请求。
- 检查 401 刷新、无权限、空数据、接口失败、重复提交、批量删除。
- 若测试设施存在，补充对应组件/页面测试；没有测试设施时如实说明。

## 参考

- 页面模板与 CRUD 真实样板见 `references/page-patterns.md`。
- 接口契约见 skill `dt-frame-api-contract`。

