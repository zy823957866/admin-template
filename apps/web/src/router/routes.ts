import type { RouteRecordRaw } from 'vue-router'

/**
 * 静态路由表：仅包含登录页。
 * 业务路由由后端 /user/menus 接口返回，通过 @dt-frames/layout 动态注册。
 */
export const routes: RouteRecordRaw[] = [
	{
		path: '/login',
		name: 'login',
		component: () => import('@/views/login/index.vue'),
		meta: { title: '登录' },
	},
]
