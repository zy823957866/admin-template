import type { ApiSelectType } from '@dt-frames/core'

/**
 * 下拉数据源结构配置：定义通用的远程下拉选项接口映射。
 * 按需扩展，key 为业务侧引用的标识名。
 */
export const STRUCTURE: { [key: string]: ApiSelectType } = {
	// 示例：角色下拉
	// ROLES_LIST: {
	// 	api: '/roles',
	// 	type: 'get',
	// 	params: { pageNum: 1, pageSize: 9999 },
	// 	listName: 'list',
	// 	label: 'name',
	// 	value: 'code',
	// },
}
