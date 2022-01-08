/** 默认活动 */
export const DEFAULT_ACTIONS = {
  query: {
    label: '查询'
  },
  add: {
    label: '新增'
  },
  edit: {
    label: '编辑'
  },
  delete: {
    label: '删除',
    message: {
      boxType: 'confirm',
      type: 'warning',
      title: '提示',
      message: '确认要删除当前记录吗，删除后将无法恢复？'
    }
  },
  download: {
    label: '下载',
    actionType: 'download'
  },
  import: {
    label: '导入',
    actionType: 'import',
    trigger: false
  },
  export: {
    label: '导出全部',
    actionType: 'export'
  }
}
