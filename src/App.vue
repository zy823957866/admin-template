<script setup lang="ts">
/**
 * 应用根组件：路由按 noLayoutPaths 判断是否走简化页面（登录页），其余进入完整布局。
 * DtTheme 由 @dt-frames/layout 提供，负责侧边栏 + 顶栏 + 内容区 + 页脚的完整管理后台布局。
 */
import { computed, unref } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { DtTheme } from '@dt-frames/layout'
import { useAppStore } from '@dt-frames/ui'

const route = useRoute()
const staticRoutes = computed(() => useAppStore().appConf.router.noLayoutPaths ?? [])

/** 当前路径是否属于无需完整布局的页面（登录/初始化等）。 */
const isSimplePath = computed(() => {
	return [...unref(staticRoutes), '/', '/init-project'].includes(unref(route).path)
})
</script>

<template>
	<template v-if="isSimplePath">
		<RouterView />
	</template>

	<template v-else>
		<DtTheme>
			<template #header-left-5></template>
			<template #notification></template>
		</DtTheme>
	</template>
</template>
