import type { NavMenuItemConfig } from '@zpage/ui-element'

export const menus: NavMenuItemConfig[] = [
  {
    name: 'default',
    children: [
      {
        name: 'welcome'
      }
    ]
  },
  {
    title: '示例',
    name: 'demo',
    children: [
      {
        name: 'renderer',
        title: '渲染',
        order: 0,
        icon: '',
        path: '/demo/renderer'
      }
    ]
  },
  {
    title: '分析',
    name: 'analysis',
    children: [
      {
        name: 'apps',
        title: '应用列表',
        order: 0,
        icon: '',
        path: '/apps'
      },
      {
        name: 'analysis_events',
        title: '自定义事件',
        order: 10,
        path: '/analysis/events',
        meta: {
          leaf: true
        },
        children: [
          {
            name: 'analysis_event_trend',
            title: '事件趋势 - ${data.name}',
            path: '/analysis/events/trend',
            query: {
              bhvId: '${data.bhvId}'
            },
            meta: {
              isTemp: true // 临时路由
            }
          }
        ]
      }
    ]
  }
]
