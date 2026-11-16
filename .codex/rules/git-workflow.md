---
name: git-workflow
description: 提交信息、分支、PR、规范同步与变更聚焦要求。
---

# Git 工作流（强制）

- 提交信息遵循 Conventional Commits：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `build` / `ci` / `chore` / `revert`，使用 `pnpm commit` 生成。
- 常用 scope：`web`、`core`、`backend`、`codex`、`deps`、`ci`、`docs`、`release`；scope 可省略，但不要随意发明。
- 分支命名：功能 `feat/xxx`，修复 `fix/xxx`，Codex 自动创建 `codex/xxx`。
- 每次提交只包含一个可解释的变更；不混入无关格式化、依赖升级或废弃文件。
- `main` 与 `pnpm` 分支中的 `AGENTS.md` 和 `.codex/` 规范必须一致；规范变更后检查 `git diff main..pnpm -- AGENTS.md .codex` 为空，并额外核对未跟踪文件的文件清单与哈希。
- 提交前运行受影响范围的 `pnpm lint`、`pnpm typecheck`、`pnpm build`；格式化只处理本次改动文件。
- PR 描述包含：改动目的、主要文件、接口/数据库变更、验证命令、截图（UI 改动）、风险和未完成项。
- 不提交 `.env`、日志、构建产物、临时测试库或真实凭据；不回退他人与本任务无关的改动。
