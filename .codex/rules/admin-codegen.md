---
name: admin-codegen
description: 从业务需求生成管理后台模块时必须遵循的输入、步骤、交付物和验收标准。
---

# 管理后台模块生成（强制）

## 开始前

生成完整业务模块前，先收集或确认：

- 模块名称、英文资源名、页面路径、路由 name、菜单归属和菜单父级。
- 字段清单：名称、类型、必填、唯一、长度、默认值、枚举值、日期格式和字段映射。
- 需要的操作：列表分页/全量列表、详情、新增、编辑、删除、批量删除、状态切换和导入导出。
- 列表筛选、排序、分页、关联查询和统计需求。
- 权限前缀与按钮权限码，例如 `sys:app:list/create/update/delete`。
- 后端接口、表结构或可对齐的旧系统。
- 是否存在系统内置数据、不可编辑/不可删除规则或数据范围限制。

字段、接口或权限不明确时，不得编造；先给出显式假设或向用户确认。只在登录页模板上多做几个页面，不等于完成业务模块。

## 生成顺序

1. **模块计划**：输出字段表、接口表、菜单/权限表、前端组件组合和验收项。
2. **API 契约**：先定路径、DTO、响应、分页形态和错误语义，遵循 `dt-frame-api-contract`。
3. **后端**：migration -> entity -> DTO -> service -> controller -> module -> Swagger -> 测试，遵循 `dt-frame-nestjs`。
4. **前端数据层**：自包含模块可在 `useSource.api` 中直接调用 `http`；跨页面复用或逻辑复杂时建立 `apps/web/src/api/<module>.ts`。
5. **搜索表单**：`useForm({ ...source, mode: 'filter', compact: true, schemas })`，字段与查询 DTO 对齐。
6. **新增/编辑**：`useCurd({ source, modalProps, formProps })`；字段映射和保存前校验放 `beforeSave`。
7. **表格**：`useVxeTable({ ...source, columns, toolbar, operations })` 配 `DtVxeTable`；分页、状态列和操作列按真实数据形态配置。
8. **路由**：在 `apps/web/src/router/routes.ts` 增加与菜单 path 完全一致的静态懒加载路由。
9. **菜单与权限**：在后端菜单种子/管理数据中增加同 path 的 `catalog`/`menu` 节点，以及 `button` 类型权限码；菜单表没有 `component` 字段。
10. **验收**：运行类型检查、构建和受影响测试，手工验证登录、菜单匹配、页面、权限和 CRUD。

## 前端标准

所有业务 CRUD 必须优先使用以下组合，结构以 `system/app/index.vue` 为准：

- `useSource`：声明 `pageKey`、`pageName`、`authPrefix`、`api.queryPage/queryById/deletes/add/update` 和 `beforeSave`。
- `useForm`：搜索表单使用 `mode: 'filter'`；字段组件从 `componentMap` 的真实组件名中选择。
- `useCurd`：管理新增/编辑弹窗，使用 `curdInstance.openAddDialog()`、`openEditDialog(row)`、`del`、`dels`。
- `useVxeTable`：返回 `[registerTable, table]`，`table.grid.value?.getCheckboxRecords?.()` 可获取勾选行。
- `DtVxeTable`、`DtForm` 和 `<Curd />` 组成页面。

要求：

- `queryPage` 返回数组时使用全量列表并设置 `showPagination: false`，例如 `system/app`；返回 `{ list, total, ... }` 时使用分页表格，例如 `config/post/notice`。
- 分页查询显式设置 `pageKey: 'pageNum'`；`useSource` 默认键是 `pageNumber`，不要混用。
- 工具栏和行操作优先写完整权限码，例如 `auth: 'sys:config:create'`；`authPrefix` 可补全内置短动作，但不得依赖它掩盖缺失的权限点。
- 页面外层权限可使用 `v-auth="'sys:config:list'"`，列表列使用 JSX `render`、日期格式对象或已核验的组件。
- 复杂自定义内容、富文本和状态切换必须参考真实变体；不确定组件 API 时先查类型和现有页面，禁止猜。

## 后端交付物

- `apps/backend/src/modules/<module>/` 下的 module/controller/service/dto/entity 等，至少包含一个完整可运行的 CRUD 主流程。
- 数据库迁移和必要初始化数据；不得依赖生产 `synchronize` 建表。
- 每个受保护接口使用 `@RequirePermission`，白名单接口使用 `@Public()`。
- 新增、更新、删除按现有模式使用 `@OperationLog`，并补齐 Swagger 注解、统一响应、DTO 校验和异常语义。
- 列表接口明确是全量数组还是 `PageResult`；与前端 `useSource` 的真实分支一致。
- 新模块必须提供 Vitest 单测和关键 supertest e2e；若确实尚未建立 `test/` 目录，必须在交付说明中明确它是本轮新增，不能声称已存在。

## 菜单与权限

- 页面路由只从静态路由表映射组件；后端菜单只提供 path、标题、图标、顺序和权限。
- 菜单节点字段以 `sys_menu` 实体为准：`appId`、`parentId`、`type`、`path`、`zhCnName`、`enName`、`order`、`authCode`、`icon/iconName` 等。
- 按钮菜单的 `authCode` 会进入前端 `accessCodes`；权限码必须同时出现在 controller、菜单种子和前端使用点。
- 系统管理员由后端 `PermissionGuard` 放行；禁止在前端额外维护一张“管理员白名单”。

## 禁止项

- 生成假接口、假字段、假权限、假菜单字段或“稍后实现”的空函数。
- 把 `ElForm + ElTable` 手写页面作为标准 CRUD。
- 只写静态路由而不写后端菜单，或只写菜单而不写静态路由。
- 在菜单表或前端 store 中编造 `component` 映射字段。
- 在页面里直接拼接 SQL、权限判断常量或服务地址。
- 为一个 CRUD 需求新增 UI 框架、状态库、HTTP 库或重复工具库。
- 只生成页面不生成后端，或只生成后端不接前端，却宣称模块完成。
- 没有运行任何检查就宣称“生成完成”或“测试通过”。

