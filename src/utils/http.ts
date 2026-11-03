import {
	CacheKey,
	getLocal,
	handleLoginExpired,
	handleTokenExpired,
	removeLocal,
	setLocal,
} from '@dt-frames/core'
import { request } from '@dt-frames/hooks'
import type { AxiosRequestConfig } from 'axios'

/** 令牌统一存于 core CacheKey.TOKEN（与布局/access store、core http 共用同一存储）。 */
const TOKEN_KEY = CacheKey.TOKEN
/** 刷新令牌统一存于 core CacheKey.REFRESH_TOKEN（accessToken 过期时静默续期用）。 */
const REFRESH_TOKEN_KEY = CacheKey.REFRESH_TOKEN

// 后端全局前缀为 /api（NestJS setGlobalPrefix），统一在此设置 baseURL
request.defaults.baseURL = '/api'

/** 后端统一响应外壳。 */
export interface ApiEnvelope<T> {
	code: number
	data: T
	message: string
}

/**
 * 从本地存储读取令牌。
 * @returns 令牌或空串
 */
export function getToken(): string {
	return getLocal<string>(TOKEN_KEY) ?? ''
}

/**
 * 写入令牌。
 * @param token JWT 访问令牌
 */
export function setToken(token: string): void {
	setLocal(TOKEN_KEY, token)
}

/** 清除本地令牌。 */
export function clearToken(): void {
	removeLocal(TOKEN_KEY)
	removeLocal(REFRESH_TOKEN_KEY)
}

// 请求拦截：自动附加 Bearer 令牌
request.interceptors.request.use((config) => {
	const token = getToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// 响应拦截：解包 { code, data, message }；401 时先静默续期重发，失败走登录过期兜底
request.interceptors.response.use(
	(response) => {
		const body = response.data as ApiEnvelope<unknown> | undefined
		if (body && typeof body === 'object' && 'code' in body) {
			if (body.code !== 0) {
				return Promise.reject(new Error(body.message || '请求失败'))
			}
			response.data = body.data
		}
		return response
	},
	async (error: {
		response?: { status?: number; data?: ApiEnvelope<unknown> }
		message?: string
		config?: AxiosRequestConfig & { __isRetryRequest?: boolean }
	}) => {
		// 401：先尝试静默续期，成功后以新令牌重发原请求；失败由 core 统一触发登录过期兜底
		if (error.response?.status === 401 && error.config) {
			const rawHeaders = error.config.headers as unknown as {
				get?: (key: string) => unknown
				[key: string]: unknown
			}
			const skipLoginExpired =
				rawHeaders?.['X-Skip-Login-Expired'] === '1' ||
				(typeof rawHeaders?.get === 'function' &&
					rawHeaders.get('X-Skip-Login-Expired') === '1')
			if (!skipLoginExpired && !error.config.__isRetryRequest) {
				error.config.__isRetryRequest = true
				if (await handleTokenExpired()) {
					// 请求拦截器会重读本地新令牌
					return request.request(error.config)
				}
				return Promise.reject(new Error('登录已过期，请重新登录'))
			}
			if (!skipLoginExpired) {
				handleLoginExpired()
			}
			return Promise.reject(new Error('登录已过期，请重新登录'))
		}
		const body = error.response?.data
		const serverMessage =
			body && typeof body === 'object' && 'message' in body ? String(body.message) : ''
		return Promise.reject(new Error(serverMessage || error.message || '请求失败'))
	},
)

/**
 * 类型化请求助手：解包 AxiosResponse，直接返回后端 data 载荷。
 */
export const http = {
	/** GET 请求。 */
	get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
		request.get<T>(url, config).then((res) => res.data),
	/** POST 请求。 */
	post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
		request.post<T>(url, data, config).then((res) => res.data),
	/** PATCH 请求。 */
	patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
		request.patch<T>(url, data, config).then((res) => res.data),
	/** DELETE 请求。 */
	delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
		request.delete<T>(url, config).then((res) => res.data),
}
