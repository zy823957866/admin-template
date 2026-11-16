# 页面与 CRUD 真实样板

标准来源：`D:\frames\front\dt-frame-new\apps\web\src\views\system\app\index.vue`。

下面是该页面的真实结构。生成新 CRUD 时优先复用同样的 Hook 组合、字段映射和模板结构；业务字段可以变化，但不改回 `ElForm + ElTable` 手写模式。

```vue
<script lang="tsx" setup>
import { DtIcon, DtIconPicker, useCurd, useForm, useSource, useVxeTable } from '@dt-frames/ui'
import { ElTag } from 'element-plus'
import { UiEmpty } from '@dt-frames/icons'
import { getValueByCode } from '@dt-frames/core'

/** 后端字段 -> 页面字段。 @param it 后端应用对象 */
const toView = (it: any) => ({
	...it,
	appName: it.name,
	appCode: it.code,
	logo: it.icon,
	accessUrl: it.baseUrl || it.path || '',
	sort: it.order,
	remark: it.description,
	status: String(it.status),
})

const { source } = useSource({
	pageKey: 'pageNum',
	pageName: '应用管理',
	authPrefix: 'sys:app',
	api: {
		queryPage: async (params: Recordable) => {
			const list = (await http.get('/apps')) ?? []
			return (Array.isArray(list) ? list : []).map(toView).filter((it: any) => {
				if (params.appName && !String(it.appName ?? '').includes(String(params.appName))) {
					return false
				}
				if (params.appCode && !String(it.appCode ?? '').includes(String(params.appCode))) {
					return false
				}
				return true
			})
		},
		queryById: async ({ id }) => toView(await http.get('/apps/' + id)),
		deletes: (ids) => http.post('/apps/batch-delete', { ids }),
		add: (model) =>
			http.post('/apps', {
				name: model.appName,
				code: model.appCode,
				icon: model.logo,
				baseUrl: model.accessUrl || '',
				order: model.sort,
				status: Number(model.status ?? 1),
				description: model.remark,
			}),
		update: ({ id, ...rest }) =>
			http.patch('/apps/' + id, {
				name: rest.appName,
				code: rest.appCode,
				icon: rest.logo,
				baseUrl: rest.accessUrl || '',
				order: rest.sort,
				status: Number(rest.status ?? 1),
				description: rest.remark,
			}),
	},
	beforeSave: (model: any) => ({
		...model,
		name: model.appName,
		code: model.appCode,
		icon: model.logo,
		baseUrl: model.accessUrl || '',
		order: model.sort,
		status: Number(model.status ?? 1),
		description: model.remark,
	}),
})

/** 图标选择器显隐 */
const iconPickerVisiable = ref(false)
/** 图标选择器回显的名称 */
const iconName = ref('')

// 查询表单配置
const [registerForm] = useForm({
	...source,
	mode: 'filter',
	compact: true,
	schemas: [
		{
			component: 'Input',
			name: 'appName',
			label: '应用名称',
			props: {
				placeholder: '请输入应用名称',
				clearable: true,
			},
		},
		{
			component: 'Input',
			name: 'appCode',
			label: '应用编码',
			props: {
				placeholder: '请输入应用编码',
				clearable: true,
			},
		},
	],
})

// 使用 useCurd 管理弹窗
const [Curd, curdInstance] = useCurd({
	source,
	modalProps: {
		title: '应用管理',
		width: '900px',
	},
	formProps: {
		mode: 'modal',
		labelWidth: 100,
		schemas: [
			{
				component: 'Input',
				name: 'appName',
				label: '应用名称',
				required: true,
				props: {
					placeholder: '请输入应用名称',
					maxlength: 50,
				},
			},
			{
				component: 'Input',
				name: 'appCode',
				label: '应用编码',
				required: true,
				props: {
					placeholder: '请输入应用编码',
					maxlength: 50,
				},
			},
			{
				component: 'Input',
				name: 'logo',
				label: '图标地址',
				props: {
					placeholder: '请输入图标 URL 地址',
					clearable: true,
					appendSlot: ({ formModel }: Recordable) => {
						return (
							<>
								<span
									class="inline-flex cursor-pointer"
									onClick={() => {
										iconPickerVisiable.value = !iconPickerVisiable.value
									}}
								>
									<DtIcon icon={formModel.logo || UiEmpty} size={18}></DtIcon>
								</span>
								<DtIconPicker
									visiable={iconPickerVisiable.value}
									onUpdate:visiable={(v) => (iconPickerVisiable.value = v)}
									iconName={iconName.value}
									onUpdate:iconName={(v) => (iconName.value = v)}
									icon={formModel.logo}
									onUpdate:icon={(v) => (formModel.logo = v)}
								></DtIconPicker>
							</>
						)
					},
				},
			},
			{
				component: 'Input',
				name: 'accessUrl',
				label: '访问地址',
				props: {
					placeholder: '例如 /admin/ 或 https://example.com/admin',
					clearable: true,
				},
			},
			{
				component: 'RadioGroup',
				name: 'status',
				label: '状态',
				defaultValue: '1',
				props: {
					type: 'radio',
					options: [
						{ label: '启用', value: '1' },
						{ label: '禁用', value: '0' },
					],
				},
			},
			{
				component: 'InputNumber',
				name: 'sort',
				label: '排序',
				defaultValue: 0,
				props: {
					min: 0,
					placeholder: '数字越小越靠前',
				},
			},
			{
				component: 'Input',
				name: 'remark',
				label: '备注',
				colProps: {
					span: 24,
				},
				props: {
					type: 'textarea',
					rows: 3,
					placeholder: '请输入备注信息',
					maxlength: 500,
					showWordLimit: true,
				},
			},
		],
	},
})

const [register] = useVxeTable({
	...(source as any),
	showPagination: false,
	toolbar: [
		{
			label: '新增应用',
			type: 'primary',
			onClick: () => curdInstance.openAddDialog(),
			},
	],
	columns: [
		{ type: 'checkbox', align: 'center', width: 60 },
		{
			title: '应用图标',
			field: 'logo',
			width: 80,
			align: 'center',
			render: (row: any) => {
				const logo = row?.logo
				if (!logo) return '-'
				return <DtIcon icon={logo} size={32} />
			},
		},
		{
			title: '应用名称',
			field: 'appName',
			minWidth: 150,
			showOverflow: true,
		},
		{
			title: '应用编码',
			field: 'appCode',
			minWidth: 120,
			showOverflow: true,
		},
		{
			title: '访问地址',
			field: 'accessUrl',
			minWidth: 200,
			showOverflow: true,
		},
		{
			title: '状态',
			field: 'status',
			minWidth: 80,
			align: 'center',
			render: (row: any) => {
				const statusLabel =
					getValueByCode(row?.status, 'STATUS') ??
					(row?.status != null ? String(row.status) : '-')
				return <ElTag type={row?.status === '1' ? 'success' : 'info'}>{statusLabel}</ElTag>
			},
		},
		{
			title: '排序',
			field: 'sort',
			minWidth: 70,
			align: 'center',
		},
		{
			title: '备注',
			field: 'remark',
			minWidth: 150,
			showOverflow: true,
		},
		{
			title: '创建时间',
			field: 'createDate',
			minWidth: 160,
			align: 'center',
			render: {
				date: 'YYYY-MM-DD HH:mm:ss',
			},
		},
	],
})
</script>

<template>
	<div class="dt-page">
		<DtForm @register="registerForm" />
		<DtVxeTable @register="register"></DtVxeTable>
		<Curd />
	</div>
</template>
```

## 真实变体

### 分页 + 显式权限：`system/config/index.vue`

- API 函数来自 `apps/web/src/api/configs.ts`，`queryPage: pageConfigs` 直接返回分页对象。
- `useVxeTable` 使用 `idField: 'id'`，默认分页；工具栏和行操作写 `auth: 'sys:config:create'`、`'sys:config:update'`、`'sys:config:delete'`。
- 外层 `DtVxeTable v-auth="'sys:config:list'"`。
- 自定义 `handleEdit` / `handleDelete` 在调用 `openEditDialog` / `source.onDelete` 前检查 `isSystem`，服务端也必须重复校验。
- 批量删除通过 `table.grid.value?.getCheckboxRecords?.()` 获取行，再调用 `source.onDeletes(ids, 'multi')`。

### 状态切换：`system/post/index.vue`

- 查询表单使用 `Select`，弹窗使用 `InputNumber` 和 `RadioGroup`。
- 表格状态列用 `ElSwitch` 的 `modelValue` / `onChange` render。
- 状态更新调用独立 `updatePostStatus(id, status)`，成功后 `source.onSearch()`。
- 数字字段在 `beforeSave` 中显式 `Number(...)`。

### 富文本与日期：`system/notice/index.vue`

- 发布状态使用 `ElSwitch`，类型使用 `ElTag`。
- 表单中 `DatePicker` 使用 `type: 'datetime'`、`valueFormat: 'YYYY-MM-DD HH:mm:ss'`。
- 富文本字段不用 `component` 字符串，而是 `render` 渲染真实页面组件 `WangEditorNext`，并通过 `onUpdate:modelValue` 回写。
- `beforeSave` 在内容为空时调用 `ElMessage.error` 并返回 `false`，创建/更新都会被阻止。

## 页面完成清单

- [ ] 使用 `useSource + useForm + useCurd + useVxeTable + DtVxeTable`，不是手写 `ElForm + ElTable`。
- [ ] `queryPage` 的数组/分页形态与 `showPagination` 一致。
- [ ] 分页接口写 `pageKey: 'pageNum'`。
- [ ] 字段映射集中在 `toView`、`beforeSave` 或 API 函数中。
- [ ] 搜索、必填、长度、正则与后端 DTO 一致。
- [ ] 工具栏和行操作使用完整权限码；服务端有对应 `@RequirePermission`。
- [ ] 删除和批量删除走 `source.onDelete/onDeletes` 或 `curdInstance.del/dels`，保留内置确认。
- [ ] 路由已写入 `apps/web/src/router/routes.ts`，菜单在后端有同 path 记录。
- [ ] 菜单没有编造 `component` 字段。
- [ ] 运行 `pnpm typecheck`、`pnpm build`。

## 禁止

- 用 `ElForm + ElTable` 重写 CRUD。
- 把 `authPrefix` 当成所有按钮自动鉴权。
- 给 `useSource` 编造不存在的 API 键或返回值。
- 给 `FormSchema` 编造不存在的组件名、Props 或事件。
- 只写静态路由不写菜单，或只写菜单不写静态路由。

