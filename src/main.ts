/**
 * dt-frame-starter 入口：注册 pinia / i18n / http / 全局配置，并挂载路由。
 * 复用 @dt-frames/layout 的 initRouter / useAccessStore / initHttp 初始化方式。
 * 无 SSO，登录过期直接跳转 /login。
 */
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import 'element-plus/dist/index.css'
import 'virtual:uno.css'
import '@/assets/css/index.css'
import './styles/main.css'

import 'virtual:svg-icons-register'
import App from './App.vue'
import { Pages, initHttp, setI18nLanguage, setupI18n, useAppStore as useCoreAppStore } from '@dt-frames/core'
import { auth, initRouter, useAccessStore, useTheme } from '@dt-frames/layout'
import { setupVxeTable, useAppStore } from '@dt-frames/ui'
import { routes } from './router/routes'
import { STRUCTURE } from './const/structure'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 国际化：core + ui 语言包
void setupI18n({
	defaultLocale: 'zh-cn',
	elementPlus: { autoLoad: true, defaultLocale: 'zh-cn' },
})

/** 登录过期弹窗单例标志：避免并发 401 重复弹出。 */
let loginExpiredDialogShown = false

// http 请求配置：401 时先静默续期重试，续期失败弹"登录过期"兜底（Bearer 头 + 成功码对齐后端 code: 0）
initHttp(
	{ unAuthCode: [401], baseUrl: '/api', okCode: 0, refreshUrl: '/auth/refresh' },
	{
		go: (path: string) => {
			window.location.href = path
		},
		messageError: (msg: string) => ElMessage.error({ message: msg, grouping: true }),
		onUnAuth: () => {
			const accessStore = useAccessStore()
			accessStore.setAccessToken(null)
			accessStore.setIsAccessChecked(false)
		},
		onLoginExpired: () => {
			if (loginExpiredDialogShown) return
			loginExpiredDialogShown = true

			const accessStore = useAccessStore()
			accessStore.setAccessToken(null)
			accessStore.setIsAccessChecked(false)

			ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
				confirmButtonText: '重新登录',
				cancelButtonText: '取消',
				showCancelButton: false,
				showClose: false,
				closeOnClickModal: false,
				closeOnPressEscape: false,
			})
				.then(() => {
					const currentPath =
						window.location.hash.replace(/^#/, '') ||
						`${window.location.pathname}${window.location.search}`
					window.location.href = `${Pages.LOGIN}?redirect=${encodeURIComponent(currentPath || '/')}`
				})
				.catch(() => {
					// 未确认时停留当前页，路由守卫会在下次导航时引导登录
				})
				.finally(() => {
					loginExpiredDialogShown = false
				})
		},
	},
)

// 主题偏好初始化：合并默认/缓存偏好并应用 CSS 变量
const { initPreferences } = useTheme()
void initPreferences({ footer: { enable: true } })

// ui 全局配置（弹窗/表格/vxe-table 默认值）
useAppStore().setAppConf({
	router: { useHashRoute: false, noLayoutPaths: [Pages.LOGIN], routes },
	api: { userInfo: '/user/info', menu: '/user/menus' },
	ui: {
		upload: { downloadUrl: '/files/download' },
		layout: {
			userDropdown: [
				{ label: '个人中心', path: '/security/profile', order: 0 },
			],
		},
		modal: {},
		table: { expandActions: true, expandNum: 2 },
		vxeTable: { components: [] },
	},
})

// core 全局配置（字典/缓存/下拉数据源）
useCoreAppStore().setAppConf({
	dict: {
		api: '/dicts/items',
		type: 'get',
		requestKey: 'dictType',
		label: 'zhCnDictKey',
		value: 'dictValue',
	},
	cache: {},
	structure: STRUCTURE,
})

setI18nLanguage()

// 注册 vxe-table / Element 渲染插件
setupVxeTable([])

// 布局路由：静态路由 + 权限守卫 + 动态菜单路由
const router = initRouter()

app.use(router)
app.directive('auth', auth)
app.mount('#app')
