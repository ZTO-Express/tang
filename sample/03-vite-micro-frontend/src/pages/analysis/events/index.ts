import { addEditDialog } from './_dialogs'
import { GLOBAL_EVENTS } from '@/consts'

export default {
  type: 'app-page',

  body: {
    type: 'crud',

    actions: {
      query: {
        api: {
          url: 'analysis/events',
          mockData: {
            data: [
              {
                eventId: 'E01',
                eventName: '事件1',
                pv: 1000,
                uv: 100
              }
            ]
          }
        }
      },
      edit: { api: 'analysis/event', method: 'POST', dialog: addEditDialog(true) },
      trend: { label: '事件趋势' }
    },

    search: {
      immediate: false, // 不直接加载
      labelWidth: 80,
      extData: { appCode: '${app.currentApp.appCode}' },
      items: [
        {
          type: 'date-range-picker',
          prop: 'startDate',
          toProp: 'endDate',
          label: '时间范围',
          defaultTo: new Date(),
          defaultRange: 31,
          span: 8
        }
      ]
    },

    searchOn: [GLOBAL_EVENTS.CURRENT_APP_CHANGE],

    toolbar: {},

    table: {
      editable: true,
      operation: {
        width: 120,
        items: [
          { action: 'edit' },
          {
            action: 'trend',
            link: {
              name: 'analysis_event_trend',
              data: { name: '${data.row.remark}', bhvId: '${data.row.bhvId}' }
            }
          }
        ]
      },
      columns: [
        { prop: 'eventId', label: '事件ID', width: 120 },
        { prop: 'eventName', label: '事件名称', minWidth: 200 },
        { prop: 'pv', label: '触发次数', width: 100 },
        { prop: 'uv', label: '触发用户数', width: 100 }
      ]
    }
  }
}
