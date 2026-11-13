<script setup lang="ts">
/**
 * 登录表单组件：用户名 + 密码 + 验证码 + 记住我。
 */
import type { FormInstance, FormRules } from 'element-plus'
import { UiLock, UiUser } from '@dt-frames/icons'
import { useAccessStore } from '@dt-frames/layout'
import { useAuthStore } from '@dt-frames/layout'
import { aesEncryption, getLocal, removeLocal, setLocal } from '@dt-frames/core'
import { login as loginApi } from '@/api/auth'
import CaptchaField from './CaptchaField.vue'

type FormType = {
	username: string
	password: string
	captcha: string
	captchaKey: string
	remember: boolean
}

const formRef = ref<FormInstance>()
const captchaFieldRef = ref<InstanceType<typeof CaptchaField>>()

const form = reactive<FormType>({
	username: '',
	password: '',
	captcha: '',
	captchaKey: '',
	remember: true,
})

const rules = reactive<FormRules<FormType>>({
	username: [
		{ required: true, message: '用户名不能为空', trigger: 'blur' },
	],
	password: [
		{ required: true, message: '密码不能为空', trigger: 'blur' },
		{
			pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/,
			message: '密码中必须包含数字和字母',
			trigger: 'blur',
		},
		{ min: 6, max: 25, message: '密码长度为 6-25', trigger: 'blur' },
	],
	captcha: [
		{ required: true, message: '请输入验证码', trigger: 'blur' },
	],
})

const COOKIE_USER_INFO = 'DT_USER_INFO_'
const { encryptByAES, decryptByAES } = aesEncryption()

const getCookie = () => {
	const userInfo: unknown = getLocal(COOKIE_USER_INFO)
	if (!userInfo) return

	try {
		const decrypted = decryptByAES(`${userInfo}`)
		const parsed = JSON.parse(decrypted) as {
			username: string
			password: string
			remember: boolean
		}

		form.username = parsed.username || ''
		form.password = parsed.password || ''
		form.remember = parsed.remember ?? true
	} catch {
		removeLocal(COOKIE_USER_INFO)
	}
}

onBeforeMount(() => {
	getCookie()
})

const router = useRouter()
const route = useRoute()
const { authLogin } = useAuthStore()
const accessStore = useAccessStore()

/** 刷新图形验证码。 */
const refreshCaptcha = () => {
	void captchaFieldRef.value?.refresh()
}

/** 忘记密码提示。 */
const handleForgotPassword = () => {
	ElMessage.info('请联系管理员重置密码')
}

/**
 * 提交登录。
 * @param formEl 表单实例
 */
const loginIn = (formEl: FormInstance | undefined) => {
	if (!formEl) return

	formEl.validate(async (valid) => {
		if (!valid) return

		try {
			const result = await loginApi({
				username: form.username,
				password: form.password,
				captchaKey: form.captchaKey,
				captcha: form.captcha,
			})

			// 保存 refreshToken，供 accessToken 过期时静默续期
			accessStore.setRefreshToken(result.refreshToken)

			// 记住密码
			if (form.remember) {
				setLocal(
					COOKIE_USER_INFO,
					encryptByAES(
						JSON.stringify({
							username: form.username,
							password: form.password,
							remember: form.remember,
						}),
					),
				)
			} else {
				removeLocal(COOKIE_USER_INFO)
			}

			// 拉取用户信息与菜单，并跳转首个可访问页面
			const { firstPath } = await authLogin(result.accessToken, {
				showWelcome: true,
			})
			if (!firstPath) {
				ElMessage.error('未找到菜单，请联系管理员')
				refreshCaptcha()
				return
			}

			router.replace(
				route.query.redirect
					? decodeURIComponent(route.query.redirect as string)
					: firstPath,
			)
		} catch (e) {
			ElMessage.error(e instanceof Error ? e.message : '登录失败')
			refreshCaptcha()
		}
	})
}
</script>

<template>
	<ElForm ref="formRef" :model="form" :rules="rules" @submit.prevent="loginIn(formRef)">
		<label class="mb-1 block text-[12px] leading-none text-[#909399]">用户名</label>
		<ElFormItem prop="username" class="login-form-item !mb-6">
			<ElInput
				v-model="form.username"
				size="large"
				placeholder="请输入用户名"
				class="[--el-input-icon-color:#7d7e7e]"
				clearable
			>
				<template #prefix>
					<DtIcon :icon="UiUser" :size="16" />
				</template>
			</ElInput>
		</ElFormItem>

		<label class="mb-1 block text-[12px] leading-none text-[#909399]">密码</label>
		<ElFormItem prop="password" class="login-form-item !mb-6">
			<ElInput
				v-model="form.password"
				type="password"
				size="large"
				placeholder="请输入密码"
				class="[--el-input-icon-color:#7d7e7e]"
				show-password
			>
				<template #prefix>
					<DtIcon :icon="UiLock" :size="16" />
				</template>
			</ElInput>
		</ElFormItem>

		<CaptchaField
			ref="captchaFieldRef"
			v-model="form.captcha"
			v-model:captcha-key="form.captchaKey"
		/>

		<ElFormItem class="login-form-item !mb-9 !mt-6">
			<ElButton type="primary" class="w-full" size="large" native-type="submit">
				登 录
			</ElButton>
		</ElFormItem>

		<ElFormItem class="login-form-item !mb-0">
			<div class="flex w-full items-center justify-between">
				<ElCheckbox v-model="form.remember" label="记住我" />
				<span
					class="cursor-pointer text-[#269ac1] hover:opacity-80"
					@click="handleForgotPassword"
				>
					忘记密码？
				</span>
			</div>
		</ElFormItem>
	</ElForm>
</template>
