---
name: code-style
description: dt-frame-starter 的命名、格式、TypeScript、Vue SFC 与 JSDoc 强制规范。
---

# 代码风格与注释（强制）

## 基础格式

- TS、Vue、JS、MJS 使用 Tab 缩进（编辑器显示宽度 4），JSON/YAML 使用 2 空格。
- 使用 LF 行尾、UTF-8、单引号、不写行尾分号；沿用现有源码风格。
- 单行建议不超过 100 字符；超长表达式拆行，不要用压缩成一行的复杂代码。
- 不运行会产生大量无关改动的全仓格式化；只格式化本次改动文件。

## 命名

- 可复用 Vue 组件文件与组件名使用 PascalCase，例如 `UserForm.vue`、`DtUserCard`；页面入口统一为 `index.vue`，演示页可使用现有 kebab-case 文件。
- 目录、普通 TS 文件、API 文件使用 kebab-case 或小写单词，例如 `use-user-table.ts`、`api/configs.ts`。
- 函数和变量使用 camelCase；常量使用 UPPER_SNAKE_CASE；类型、接口、枚举使用 PascalCase。
- 组合式函数统一 `useXxx`；布尔值使用 `is` / `has` / `can` 前缀；事件回调使用 `onXxx`。
- 权限码使用 `资源:动作`，例如 `sys:user:create`；不得使用中文或空格作为权限码。

## TypeScript

- 禁止隐式 `any`；无法确定外部结构时先用 `unknown`，再收窄类型。
- 仅在确实无法建模时使用 `any`，必须在同一处写明原因；禁止新增 `@ts-ignore`，必要时用 `@ts-expect-error` 并附说明。
- 类型导入使用 `import type`；对外导出的函数参数和返回值必须显式标注类型。
- 优先使用类型收窄、泛型和 `satisfies`，不要靠类型断言掩盖接口不一致。
- 同目录文件用 `./` 相对导入；跨目录优先使用 `@/` 别名；不要出现跨层 `../../../../` 的相对路径。

## Vue SFC

- 默认使用 `<script setup lang="ts">`；需要 JSX 单元格渲染或自定义表单 `render` 时使用 `<script lang="tsx" setup>`，与 `system/app` 等真实页面一致。
- 按 `<script>`、`<template>`、`<style>` 顺序组织。
- Props/Emits 使用类型声明；对外暴露的状态和行为要有类型。
- 页面私有逻辑留在页面目录；跨页面复用后再提升到 `src/components/`、`src/hooks/` 或 `packages/core/`。
- 复杂模板拆成具名子组件，不在一个 SFC 中堆叠多个业务弹窗和表格。
- 样式优先 UnoCSS；组件私有且原子类难以表达的样式使用 `<style scoped>`；禁止污染全局样式。

## JSDoc

所有导出的函数、组合式函数、组件、类型、接口和常量必须写 JSDoc：

```ts
/**
 * 将后端分页响应转换为页面表格使用的数据。
 * @param result 后端分页结果
 * @returns 当前页列表与总数
 */
export function mapPageResult<T>(result: PageResult<T>): { list: T[]; total: number } {
	return { list: result.list, total: result.total }
}
```

- 首行说明用途；`@param` 说明参数语义；`@returns` 说明返回值；必要时补充 `@throws` / `@example`。
- 不要写“函数作用”“方法说明”这类无信息量注释。
- 对安全敏感逻辑、兼容性处理和复杂分支，在代码上方用简短中文注释解释原因。
