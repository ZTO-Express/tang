import type { NavMenuItemConfig } from '@zto/zpage'

export const menus: NavMenuItemConfig[] = [
  {
    name: 'guide',
    title: '指南',
    children: [
      {
        name: 'guide.intro',
        title: '介绍',
        children: [
          { name: 'guide.intro.about', title: '关于', path: '/guide/intro/about' },
          { name: 'guide.intro.concept', title: '概念', path: '/guide/intro/concept' }
        ]
      },
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
        name: 'widgets.basic',
        title: '基础',
        children: [
          { name: 'widgets.basic.tpl', title: '模版', path: '/widgets/basic/tpl' },
          { name: 'widgets.basic.html', title: 'Html', path: '/widgets/basic/html' },
          { name: 'widgets.basic.action', title: '行为按钮', path: '/widgets/basic/action' }
        ]
      },
      {
        name: 'widgets.page',
        title: '页面',
        children: [
          { name: 'widgets.page.normal', title: '普通页', path: '/widgets/page/normal' },
          { name: 'widgets.page.tab', title: 'Tab页', path: '/widgets/page/tab' },
          { name: 'widgets.page.welcome', title: '欢迎页', path: '/widgets/page/welcome' },
          { name: 'widgets.page.blank', title: '空白页', path: '/widgets/page/blank' }
        ]
      },
      {
        name: 'widgets.form',
        title: '表单',
        children: [
          { name: 'widgets.form.form', title: '表单', path: '/widgets/form/form' },
          { name: 'widgets.form.input', title: '输入框', path: '/widgets/form/input' },
          { name: 'widgets.form.inputNumber', title: '数字输入框', path: '/widgets/form/inputNumber' },
          { name: 'widgets.form.select', title: '选择框', path: '/widgets/form/select' },
          { name: 'widgets.form.switch', title: '开关', path: '/widgets/form/switch' },
          { name: 'widgets.form.fuzzySelect', title: '模糊选择', path: '/widgets/form/fuzzySelect' },
          { name: 'widgets.form.datepicker', title: '日期选择', path: '/widgets/form/checkbox' },
          { name: 'widgets.form.dateRangePicker', title: '日期范围选择', path: '/widgets/form/dateRangePicker' },
          { name: 'widgets.form.dateTimePicker', title: '日期时间选择', path: '/widgets/form/dateTimePicker' },
          { name: 'widgets.form.import', title: '导入', path: '/widgets/form/import' },
          { name: 'widgets.form.checkbox', title: '单/多选框', path: '/widgets/form/checkbox' },
          { name: 'widgets.form.fileList', title: '文件列表', path: '/widgets/form/fileList' },
          { name: 'widgets.form.html', title: 'Html', path: '/widgets/form/html' },
          { name: 'widgets.form.text', title: '文本', path: '/widgets/form/text' },
          { name: 'widgets.form.upload', title: '上传', path: '/widgets/form/upload' },
          { name: 'widgets.form.image', title: '图片', path: '/widgets/form/image' },
          { name: 'widgets.form.video', title: '视频', path: '/widgets/form/video' },
          { name: 'widgets.form.action', title: '活动按钮', path: '/widgets/form/action' },
          { name: 'widgets.form.editTable', title: '编辑表格', path: '/widgets/form/editTable' }
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
