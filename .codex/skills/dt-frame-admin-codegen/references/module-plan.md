# 业务模块计划模板

生成代码前把下表填完整；可以随实现更新，但不得留下未知字段直接开工。

## 基本信息

- 中文模块名：
- 英文资源名：
- 前端页面目录：
- 静态路由 path：
- 路由 name：
- 路由文件：`apps/web/src/router/routes.ts`
- 后端模块目录：
- 菜单归属：
- 菜单父级 path：
- 权限前缀，例如 `sys:<resource>`：
- 主要用户角色：
- 数据范围：
- 是否含系统内置数据：

## 字段表

| 后端字段 | 页面字段 | 中文名 | 类型 | 必填 | 唯一 | 默认值 | 约束/枚举 | 关联 | 前端控件 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | id | 主键 | bigint/string | 是 | 是 | 自增/UUID | - | - | 只读 |

字段映射必须明确。页面字段与后端字段不同时，指定 `toView`、`beforeSave` 或 API 函数中的转换位置。

## 接口表

| 功能 | 方法 | 路径 | 权限码 | 请求 DTO | 响应 | 前端 API 位置 |
| --- | --- | --- | --- | --- | --- | --- |
| 分页列表 | GET | `/api/<resources>` | `sys:<resource>:list` | QueryDto | `PageResult<VO>` | `api/<module>.ts` 或 `useSource` |
| 全量列表 | GET | `/api/<resources>` | `sys:<resource>:list` | 可选 QueryDto | `VO[]` | `useSource` |
| 详情 | GET | `/api/<resources>/:id` | `sys:<resource>:list` | - | VO | 按需 |
| 新增 | POST | `/api/<resources>` | `sys:<resource>:create` | CreateDto | VO | 按需 |
| 更新 | PATCH | `/api/<resources>/:id` | `sys:<resource>:update` | UpdateDto | VO | 按需 |
| 删除 | DELETE | `/api/<resources>/:id` | `sys:<resource>:delete` | - | void | 按需 |
| 批量删除 | POST | `/api/<resources>/batch-delete` | `sys:<resource>:delete` | `{ ids }` | void | 按需 |
| 状态切换 | POST | `/api/<resources>/:id/status` | `sys:<resource>:update` | 状态 DTO | void/VO | 按需 |

明确列表是数组还是分页对象，并据此设置 `showPagination` 和 `pageKey: 'pageNum'`。

## 前端组合表

| 部分 | 实现 |
| --- | --- |
| 数据源 | `useSource`，填写 `pageKey/pageName/authPrefix/api/beforeSave` |
| 搜索 | `useForm({ ...source, mode: 'filter', compact: true, schemas })` |
| 新增/编辑 | `useCurd({ source, modalProps, formProps })` |
| 表格 | `useVxeTable({ ...source, idField, toolbar, operations, columns })` |
| 页面 | `DtForm` + `DtVxeTable` + `<Curd />` |
| 权限 | 工具栏/操作 `auth: '<完整权限码>'`；页面外层 `v-auth` |

## 菜单与权限表

| 节点 | type | path / authCode | 名称 | 父级 | 排序 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| 页面 | `menu` | `/system/<page>` | 中文名 | 目录 path | 数字 | 与静态路由 path 一致 |
| 目录 | `catalog` | `/system` | 系统管理 | - | 数字 | 如已有可复用 |
| 查询按钮 | `button` | `sys:<resource>:list` | 查询 | 页面 path | 数字 | 可选，按项目实际 |
| 新增按钮 | `button` | `sys:<resource>:create` | 新增 | 页面 path | 数字 | 需前后端一致 |
| 修改按钮 | `button` | `sys:<resource>:update` | 修改 | 页面 path | 数字 | 需前后端一致 |
| 删除按钮 | `button` | `sys:<resource>:delete` | 删除 | 页面 path | 数字 | 需前后端一致 |

`sys_menu` 真实字段包括 `appId`、`parentId`、`type`、`path`、`zhCnName`、`enName`、`order`、`authCode`、`icon/iconName`、`keepAlive` 等；没有 `component` 字段。

## 验收表

| 用例 ID | 场景 | 前置条件 | 操作 | 预期结果 | 验证方式 |
| --- | --- | --- | --- | --- | --- |
| MOD-01 | 列表查询 | 有权限 | 打开页面并筛选/翻页 | 数据、总数/数组形态正确 | e2e/手工 |
| MOD-02 | 新增校验 | 有权限 | 提交空字段 | `useCurd` 表单阻止并提示 | 手工/组件测试 |
| MOD-03 | 新增成功 | 有权限 | 填写合法字段 | 接口成功、弹窗关闭、列表刷新 | e2e/手工 |
| MOD-04 | 字段映射 | 有权限 | 新增/编辑含别名或数字字段 | 后端收到正确字段类型 | 手工/单测 |
| MOD-05 | 业务保护 | 有权限 | 编辑/删除内置数据 | 前端提示且后端拒绝 | 手工/e2e |
| MOD-06 | 越权访问 | 无权限 | 调用接口 | 403 且无数据 | e2e |
| MOD-07 | 删除 | 有权限 | 单删/批量删 | 二次确认、成功刷新 | 手工/e2e |
| MOD-08 | 菜单匹配 | 菜单含新 path | 登录 | 静态路由注册，页面可访问 | 手工 |

## 假设

列出本轮为推进实现而采用的假设；涉及业务字段、权限、删除策略和系统内置数据的假设必须让用户可见。

