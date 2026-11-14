import { defineConfig } from 'cz-git'

/**
 * dt-frame-starter 提交信息校验与交互式提交提示配置。
 *
 * 继承 Conventional Commits 规则，允许中文标题、任意 scope 和常见大写缩写。
 */
export default defineConfig({
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
  },
  prompt: {
    messages: {
      type: '选择你要提交的类型:',
      scope: '选择一个提交范围（可选）:',
      customScope: '请输入自定义的提交范围:',
      subject: '填写简短精炼的变更描述:\n',
      body: '填写更加详细的变更描述（可选），使用 "|" 换行:\n',
      breaking: '列举破坏性变更（可选），使用 "|" 换行:\n',
      footerPrefixesSelect: '选择关联 Issue 前缀（可选）:',
      customFooterPrefix: '输入自定义 Issue 前缀:',
      footer: '列举关联 Issue（可选），例如 #31、#I3244:\n',
      confirmCommit: '确认提交以上信息吗？',
    },
    types: [
      { value: 'feat', name: 'feat:     新增功能' },
      { value: 'fix', name: 'fix:      修复缺陷' },
      { value: 'docs', name: 'docs:     文档更新' },
      { value: 'style', name: 'style:    代码格式' },
      { value: 'refactor', name: 'refactor: 代码重构' },
      { value: 'perf', name: 'perf:     性能优化' },
      { value: 'test', name: 'test:     测试相关' },
      { value: 'build', name: 'build:    构建或依赖变更' },
      { value: 'ci', name: 'ci:       持续集成' },
      { value: 'chore', name: 'chore:    其他工程维护' },
      { value: 'revert', name: 'revert:   回退提交' },
    ],
    useEmoji: false,
    useAI: false,
    scopes: ['web', 'core', 'root', 'deps', 'ci', 'release'],
    allowEmptyScopes: true,
    allowCustomScopes: true,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    defaultScope: '',
    defaultSubject: '',
    defaultBody: '',
    defaultIssues: '',
    confirmColorize: true,
  },
})
