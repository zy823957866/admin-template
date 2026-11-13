import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

/**
 * UnoCSS 原子化 CSS 配置。
 */
export default defineConfig({
	presets: [presetUno(), presetAttributify(), presetIcons()],
	shortcuts: {
		'flex-center': 'flex items-center justify-center',
		'page-card': 'bg-white rounded-lg p-4 shadow-sm',
	},
})
