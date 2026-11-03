import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { DtFrameResolver } from '@dt-frames/ui/resolver'
import { Dtvite } from '@dt-frames/vite-plugin'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

const dtConfig = Dtvite({
	framework: 'app',
	componentResolvers: [DtFrameResolver(), ...ElementPlusResolver()],
})

/**
 * dt-frame-starter 构建配置：基于 @dt-frames/vite-plugin 的 app 模式。
 * 扩展了 SVG 图标雪碧图、路径别名、开发代理。
 */
export default {
	...dtConfig,
	envDir: '.',
	plugins: [
		...(dtConfig.plugins ?? []),
		createSvgIconsPlugin({
			iconDirs: [path.resolve(__dirname, 'src/assets/icons')],
			symbolId: 'icon-[name]',
		}),
	],
	esbuild: {
		jsx: 'automatic',
		jsxImportSource: 'vue',
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	server: {
		port: Number(process.env.VITE_DEV_PORT ?? 5173),
		proxy: {
			'/api': {
				target: process.env.VITE_API_PROXY_TARGET,
				changeOrigin: true,
			},
			'/uploads': {
				target: process.env.VITE_API_PROXY_TARGET,
				changeOrigin: true,
			},
		},
	}
}
