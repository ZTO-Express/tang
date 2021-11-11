import { NavMenuItemConfig } from '@zpage/zpage'

export const menus: NavMenuItemConfig[] = [
  {
    name: 'singles', // 孤页（与其他页面无关的页面）
    children: [
      {
        name: 's_reports_cdcBizReport',
        path: '/s/reports/cdcBizReport'
      }
    ]
  }
]
