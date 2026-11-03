<script lang="ts" setup>
/**
 * 验证码输入组件：图形验证码图片 + 输入框，支持点击刷新。
 */
import { Key } from '@element-plus/icons-vue'
import { fetchCaptcha } from '@/api/auth'

/** 验证码输入值（v-model）。 */
const model = defineModel<string>({ default: '' })

/** 验证码 key，登录时回传后端校验。 */
const captchaKey = defineModel<string>('captchaKey', { default: '' })

const captchaImg = ref('')
const loading = ref(false)
const loadFailed = ref(false)

/**
 * 将后端原始 SVG 字符串转为可渲染的 data URI。
 * @param svg 原始 SVG 字符串
 * @returns data URI
 */
const toDataUri = (svg: string) =>
	svg.startsWith('data:image/svg+xml')
		? svg
		: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

/** 加载图形验证码并清空输入框。 */
const loadCaptcha = async () => {
	loading.value = true
	loadFailed.value = false
	try {
		const res = await fetchCaptcha()
		captchaKey.value = res.captchaKey
		captchaImg.value = toDataUri(res.img)
		model.value = ''
	} catch {
		captchaKey.value = ''
		captchaImg.value = ''
		loadFailed.value = true
		ElMessage.error('验证码加载失败')
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	void loadCaptcha()
})

defineExpose({ refresh: loadCaptcha })
</script>

<template>
	<div>
		<label class="mb-1 block text-[12px] leading-none text-[#909399]">验证码</label>
		<ElFormItem prop="captcha" class="login-form-item !mb-4">
			<div class="flex w-full items-center gap-3">
				<ElInput
					v-model="model"
					size="large"
					placeholder="请输入验证码"
					class="min-w-0 flex-1 [--el-input-icon-color:#7d7e7e]"
					clearable
				>
					<template #prefix>
						<DtIcon :icon="Key" :size="16" />
					</template>
				</ElInput>
				<button
					type="button"
					class="flex h-10 w-[100px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-solid border-[#dcdfe6] bg-[#f5f7fa] transition hover:border-[#269ac1] disabled:cursor-not-allowed disabled:opacity-60"
					:disabled="loading"
					:title="loadFailed ? '点击重新加载验证码' : '点击刷新验证码'"
					@click="loadCaptcha"
				>
					<span v-if="loading" class="text-xs text-[#909399]">加载中</span>
					<img
						v-else-if="captchaImg"
						:src="captchaImg"
						alt="验证码"
						class="h-full w-full object-contain"
					/>
					<span v-else class="px-2 text-center text-xs text-[#909399]">
						{{ loadFailed ? '点击重试' : '加载验证码' }}
					</span>
				</button>
			</div>
		</ElFormItem>
	</div>
</template>
