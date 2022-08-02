import type { NavMenuItemConfig } from '@zto/zpage'

export const menus: NavMenuItemConfig[] = [
  {
    name: 'site.docs',
    title: '文档',
    order: 10,
    children: [
      { name: 'site.docs.about', title: '关于', path: '/docs/about' },
      {
        name: 'site.docs.start',
        title: '开始',
        children: [{ name: 'site.docs.start.intro', title: '介绍', path: '/docs/start/intro' }]
      }
    ]
  },
  {
    name: 'site.cmpts',
    title: '组件',
    order: 20,
    children: [
      { name: 'site.cmpts.intro', title: '介绍', path: '/cmpts/intro' },
      {
        name: 'site.cmpts.layout',
        title: '布局',
        children: [{ name: 'site.cmpts.layout.crud', title: '增删改查', path: '/cmpts/layout/crud' }]
      }
    ]
  },
  {
    name: 'site.examples',
    title: '示例',
    order: 30,
    children: [
      {
        name: 'site.examples.page',
        title: '页面',
        children: [
          { name: 'site.examples.page.simple', title: '简单页面', path: '/examples/page/simple' },
          { name: 'site.examples.page.form', title: '表单页面', path: '/examples/page/form' }
        ]
      },
      {
        name: 'site.examples.form',
        title: '表单',
        children: []
      },
      {
        name: 'site.examples.crud',
        title: '增删改查',
        children: []
      }
    ]
  }
]
