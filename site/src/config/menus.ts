import type { NavMenuItemConfig } from '@zto/zpage'

export const menus: NavMenuItemConfig[] = [
  {
    name: 'guide',
    title: '指南',
    children: [
      { name: 'guide.about', title: '关于', path: '/guide/about' },
      {
        name: 'guide.start',
        title: '开始',
        children: [
          { name: 'guide.start.quick', title: '快速开始', path: '/guide/start/quick' },
          { name: 'guide.start.criterion', title: '开发规范', path: '/guide/start/criterion' }
        ]
      },
      {
        name: 'guide.advance',
        title: '高级',
        children: [{ name: 'guide.advance.internal', title: '原理', path: '/guide/advance/internal' }]
      }
    ]
  },
  {
    name: 'widgets',
    title: '微件',
    children: [
      { name: 'widgets.intro', title: '介绍', path: '/widgets/intro' },
      {
        name: 'widgets.page',
        title: '页面',
        order: 20,
        children: [
          { name: 'widgets.page.normal', title: '普通页', path: '/widgets/page/normal' },
          { name: 'widgets.page.tab', title: 'Tab页', path: '/widgets/page/tab' },
          { name: 'widgets.page.welcome', title: '欢迎页', path: '/widgets/page/welcome' },
          { name: 'widgets.page.blank', title: '空白页', path: '/widgets/page/blank' }
        ]
      },
      {
        name: 'widgets.list',
        title: '列表',
        children: [{ name: 'widgets.list.crud', title: '增删改查', path: '/widgets/list/crud' }]
      },
      {
        name: 'widgets.data',
        title: '数据',
        children: [
          { name: 'widgets.data.page', title: '页面', path: '/widgets/data/page' },
          { name: 'widgets.data.chart', title: '图表', path: '/widgets/data/chart' }
        ]
      }
    ]
  },
  {
    name: 'cmpts',
    title: '组件',
    children: [
      { name: 'cmpts.intro', title: '介绍', path: '/cmpts/intro' },
      {
        name: 'cmpts.func',
        title: '功能',
        children: [
          { name: 'cmpts.func.action', title: 'Actions 行为按钮', path: '/cmpts/func/action' },
          { name: 'cmpts.func.button', title: 'Button 按钮', path: '/cmpts/func/button' },
          { name: 'cmpts.func.checkbox', title: 'Checkbox 多选框', path: '/cmpts/func/checkbox' },
          { name: 'cmpts.func.radio', title: 'Radio 单选框', path: '/cmpts/func/radio' },
          { name: 'cmpts.func.dateRangePicker', title: 'DateRangePicker 选择器', path: '/cmpts/func/dateRangePicker' },
          { name: 'cmpts.func.dialog', title: 'Dialog 对话框', path: '/cmpts/func/dialog' },
          { name: 'cmpts.func.drawer', title: 'Drawer 抽屉', path: '/cmpts/func/drawer' }
        ]
      }
      // {
      //   title: '表单'
      // },
      // {
      //   title: '表格'
      // },
      // {
      //   title: '数据展示'
      // },
      // {
      //   title: '其他'
      // }
    ]
  },
  {
    name: 'examples',
    title: '示例',
    children: [
      {
        name: 'examples.page',
        title: '页面',
        children: [
          { name: 'examples.page.simple', title: '简单页面', path: '/examples/page/simple' },
          { name: 'examples.page.form', title: '表单页面', path: '/examples/page/form' }
        ]
      }
      // {
      //   title: '表单',
      //   children: []
      // },
      // {
      //   title: '增删改查',
      //   children: []
      // }
    ]
  },
  {
    name: 'editor',
    title: '可视化编辑器',
    children: [
      { name: 'editor.basic', title: '基础', path: '/editor/basic' },
      { name: 'editor.schema', title: '结构', path: '/editor/schema' }
    ]
  }
]
