import type { NavMenuItemConfig } from '@zto/zpage'

export const menus: NavMenuItemConfig[] = [
  {
    title: '指南',
    children: [
      { title: '关于', path: '/guide/about' },
      {
        title: '开始',
        children: [
          { title: '快速开始', path: '/guide/start/quick' },
          { title: '开发规范', path: '/guide/start/criterion' }
        ]
      },
      {
        title: '高级',
        children: [{ title: '原理', path: '/guide/advance/internal' }]
      }
    ]
  },
  {
    title: '微件',
    children: [
      { title: '介绍', path: '/widgets/intro' },
      {
        title: '页面',
        children: [
          { title: '普通页', path: '/widgets/page/normal' },
          { title: 'Tab页', path: '/widgets/page/tab' },
          { title: '欢迎页', path: '/widgets/page/welcome' },
          { title: '空白页', path: '/widgets/page/blank' }
        ]
      },
      {
        title: '列表',
        children: [{ title: '增删改查', path: '/widgets/list/crud' }]
      }
    ]
  },
  {
    title: '组件',
    children: [
      { title: '介绍', path: '/cmpts/intro' },
      {
        title: '页面',
        children: [{ title: '增删改查', path: '/cmpts/layout/crud' }]
      },
      {
        title: '功能',
        children: [
          { title: 'Actions 行为按钮', path: '/cmpts/func/action' },
          { title: 'Button 按钮', path: '/cmpts/func/button' },
          { title: 'Checkbox 多选框', path: '/cmpts/func/checkbox' },
          { title: 'Radio 单选框', path: '/cmpts/func/radio' },
          { title: 'DateRangePicker 选择器', path: '/cmpts/func/dateRangePicker' },
          { title: 'Dialog 对话框', path: '/cmpts/func/dialog' },
          { title: 'Drawer 抽屉', path: '/cmpts/func/drawer' }
        ]
      },
      {
        title: '表单'
      },
      {
        title: '表格'
      },
      {
        title: '数据展示'
      },
      {
        title: '其他'
      }
    ]
  },
  {
    title: '示例',
    children: [
      {
        title: '页面',
        children: [
          { title: '简单页面', path: '/examples/page/simple' },
          { title: '表单页面', path: '/examples/page/form' }
        ]
      },
      {
        title: '表单',
        children: []
      },
      {
        title: '增删改查',
        children: []
      }
    ]
  },
  {
    title: '可视化编辑器',
    children: [
      { title: '基础', path: '/editor/basic' },
      { title: '结构', path: '/editor/schema' }
    ]
  }
]
