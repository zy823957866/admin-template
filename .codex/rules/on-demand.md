---
name: on-demand
description: 依赖、组件、图标、样式和重型模块的按需引入要求。
---

# 按需引入（强制）

- 新增依赖前先搜索现有依赖与实现；能复用 `@dt-frames/*`、Element Plus、VueUse、dayjs、lodash-es 的，不新增同类库。
- 新依赖必须说明必要性、体积影响和维护状态，并安装到实际使用它的 workspace 包。
- 优先使用 `@dt-frames/ui` 的 `Dt*` 组件与 Element Plus 自动导入，不在页面里手写重复的基础组件。
- 不直接引入完整组件库样式、完整 lodash、新的 CSS 框架或新的状态库。
- 图标优先使用 `@dt-frames/icons` 或 `@element-plus/icons-vue` 的按需导入。
- 重型功能（富文本、大型上传、图表、代码编辑器、地图）只在需要时引入，并使用动态 `import()` 或独立页面分包。
- UnoCSS 用于布局和常规样式；需要复杂动画、伪元素或主题覆盖时用 scoped CSS，不把页面样式写进全局。
- `packages/core` 只引入纯 TS 通用库，不引入 Vue、Element Plus、NestJS 或 TypeORM。
