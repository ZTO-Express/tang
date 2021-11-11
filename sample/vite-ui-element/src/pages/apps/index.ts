export default {
  body: {
    type: 'crud',
    title: '应用列表',

    actions: {
      query: { api: 'apps' }
    },

    search: {
      hidden: true
    },

    table: {
      noPager: true,
      showCheckbox: true,
      operation: {
        width: 100,
        items: [{ action: 'view', label: '查看' }]
      },
      columns: [{ prop: 'appName', label: '应用名称', minWidth: 100 }]
    }
  }
}
