export default {
  type: 'analysis-page',
  body: {
    type: 'grid',
    rows: [
      {
        type: 'chart-section',
        title: '事件统计',
        fetch: {
          api: 'getEventDetail',
          params: {
            appCode: '${app.currentApp.appCode}',
            bhvId: '${route.query.bhvId}',
            startDate: '${page.data.startDate}',
            endDate: '${page.data.endDate}'
          }
        },
        chart: {
          autoresize: true,
          option: {
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              dataProp: 'countTime'
            },
            yAxis: {
              type: 'value'
            },
            series: []
          }
        },
        indicator: {
          // items: [{ prop: 'triggerPv', desc: '描述' }]
        },
        table: {
          columns: [
            { prop: 'countTime', label: '日期', minWidth: 100 },
            { prop: 'triggerPv', label: '触发次数', width: 100 },
            { prop: 'triggerUv', label: '触发用户数', width: 100 }
          ]
        }
      }
    ]
  }
}
