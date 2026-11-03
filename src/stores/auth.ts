import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
	fetchProfile,
	login as loginApi,
	type LoginParams,
	type Profile,
} from '../api/auth'
import { clearToken, getToken, setToken } from '../utils/http'

/**
 * 认证状态：令牌持久化到 localStorage，用户信息含角色与权限码。
 */
export const useAuthStore = defineStore('auth', () => {
	const token = ref(getToken())
	const user = ref<Profile | null>(null)
	const isLoggedIn = computed(() => Boolean(token.value))

	/**
	 * 登录并保存令牌与用户信息。
	 * @param params 用户名与密码
	 */
	async function login(params: LoginParams): Promise<void> {
		const result = await loginApi(params)
		token.value = result.accessToken
		setToken(result.accessToken)
		user.value = result.user
	}

	/**
	 * 拉取当前用户信息（刷新后恢复会话）。
	 */
	async function loadProfile(): Promise<void> {
		user.value = await fetchProfile()
	}

	/**
	 * 登出：调用后端接口作废令牌，清空本地状态，跳转到登录页。
	 */
	async function logout(): Promise<void> {
		try {
			await import('../api/auth').then((m) => m.logout()).catch(() => null)
		} finally {
			token.value = ''
			user.value = null
			clearToken()
			window.location.href = '/login'
		}
	}

	return { token, user, isLoggedIn, login, loadProfile, logout }
})
