import { http } from '../utils/http'

/** 登录参数。 */
export interface LoginParams {
	username: string
	password: string
	/** 验证码 key（后端启用验证码时必填）。 */
	captchaKey?: string
	/** 验证码内容。 */
	captcha?: string
}

/** 图形验证码结果。 */
export interface CaptchaResult {
	/** 验证码图片（SVG 字符串或 data URI）。 */
	img: string
	/** 验证码 key，登录时回传校验。 */
	captchaKey: string
}

/** 登录用户信息。 */
export interface LoginUser {
	id: number
	username: string
	nickname: string
	roles: string[]
	permissions: string[]
}

/** 登录结果。 */
export interface LoginResult {
	accessToken: string
	refreshToken: string
	user: LoginUser
}

/** 当前用户信息。 */
export type Profile = LoginUser

/**
 * 获取图形验证码。
 * @returns 验证码图片与 key
 */
export function fetchCaptcha(): Promise<CaptchaResult> {
	return http.get<CaptchaResult>('/auth/captcha')
}

/**
 * 登录并获取访问令牌。
 * @param params 用户名、密码与验证码
 * @returns 令牌与用户信息
 */
export function login(params: LoginParams): Promise<LoginResult> {
	return http.post<LoginResult>('/auth/login', params)
}

/**
 * 获取当前登录用户信息（含角色与权限码）。
 * @returns 用户信息
 */
export function fetchProfile(): Promise<Profile> {
	return http.get<Profile>('/auth/profile')
}

/**
 * 登出并作废刷新令牌。
 * @returns 是否成功
 */
export function logout(): Promise<{ success: boolean }> {
	return http.post<{ success: boolean }>('/auth/logout')
}
