module.exports = {
  types: [
    {
      value: 'WIP',
      name: 'WIP: 工作中的提交'
    },
    {
      value: 'feat',
      name: 'feat: 新特性'
    },
    {
      value: 'fix',
      name: 'fix: 修补bug'
    },
    {
      value: 'merge',
      name: 'merge: 合并代码'
    },
    {
      value: 'docs',
      name: 'docs: 文档'
    },
    {
      value: 'refactor',
      name: 'refactor: 重构（代码优化，不影响功能）'
    },
    {
      value: 'test',
      name: 'test: 测试'
    },
    {
      value: 'chore',
      name: 'chore: 杂项 （构建工具、辅助工具的变动）'
    },
    {
      value: 'style',
      name: 'style: 代码风格调整 (如：空格，格式，分号等等)'
    },
    {
      value: 'pref',
      name: 'pref: 性能优化'
    },
    {
      value: 'revert',
      name: 'revert: 撤销提交'
    }
  ],

  messages: {
    type: '请选择本次提交的类型:',
    scope: '\n请设置本次提交的任务ID或范围 (可选，E.g.:#123,router):',
    // used if allowCustomScopes is true
    customScope: '请设置本次提交的任务ID或范围 (可选，E.g.:#123,router):',
    subject: '请设置当前提交的简短描述:\n',
    body: '请设置当前提交的详细描述(可选). 使用 "|" 换行:\n',
    breaking: '列出任意BREAKING CHANGES (可选):\n',
    footer: '列出完成的issue id(可选，E.g.: #123, #234):\n',
    confirmCommit: '确认提交?'
  },

  scopes: [],
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],

  // 限制subject长度
  subjectLimit: 100
}
