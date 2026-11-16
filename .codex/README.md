# dt-frame-starter Codex 规范

本目录存放 AI 生成代码时必须使用的技能和规则，`AGENTS.md` 是仓库级入口。

## 使用顺序

1. 先读根目录 `AGENTS.md`。
2. 读 `rules/source-of-truth.md`，确认事实来源和禁止臆造要求。
3. 读本次任务适用的其他 `rules/`。
4. 按任务选择匹配的 skill；`SKILL.md` 给出主流程，`references/` 只在需要细节时读取。
5. 最后核对当前代码、`package.json` 和参考项目真实实现。

## 事实来源

- 当前模板实现：本仓库 `apps/web`、`packages/core`、配置文件和 `package.json`。
- 业务实现样板：`D:\frames\front\dt-frame-new`，尤其是 `system/app` CRUD、`router/routes.ts`、`packages/layout` 路由注册和 `apps/backend`。
- 规范与真实代码冲突时，以真实代码为准，并修正规范。

不要把未来才生成的能力写成已经存在，也不要把参考项目的包名、目录、测试设施直接当作本模板现有事实。

## 目录

```text
.codex/
├── rules/                 # 始终遵守的硬约束
├── skills/
│   ├── dt-frame-architecture/
│   ├── dt-frame-admin-codegen/
│   ├── dt-frame-app/
│   ├── dt-frame-api-contract/
│   └── dt-frame-nestjs/
└── README.md
```

## 维护原则

- 规范变更必须同步到 `main` 与 `pnpm` 分支。
- 新增规则或技能时，同步更新 `AGENTS.md` 的索引。
- 不把业务代码、密钥、临时调研数据或生成缓存放在本目录。
- 参考项目 `dt-frame-new/.codex` 只用于借鉴结构；本模板的事实、依赖和接口以本仓库与参考项目可运行源码为准。

