const commonOptions = {
  opWorkOrderTypes: [
    { label: '巡检类', value: 1 },
    { label: '客服类', value: 2 },
    { label: '商业类', value: 3 },
    { label: '运营类', value: 4 },
    { label: '舆情类', value: 5 },
    { label: '其他类', value: 6 }
  ]
}

const mockData = {
  currentPage: 0,
  pageCount: 0,
  pageSize: 0,
  sortFields: [],
  total: 2,
  data: [
    {
      abnormal: null,
      accountCode: '',
      accountName: null,
      address: '1首先这是门店地址12这是详细地址23结束3',
      amount: 0.1,
      city: '上海市',
      cityId: '310100',
      depotCode: 'KDCS19',
      depotName: '上海青浦签收不出库店',
      district: '青浦区',
      districtId: '310118',
      finishTime: null,
      finishWay: 1,
      finishWayName: '执行人需到店',
      gmtCreate: '2022-08-17 11:06:18',
      id: 32269,
      issueObject: 0,
      issueObjectName: '服务商/城市经理',
      province: '上海',
      provinceId: '310000',
      regionValue: '上海上海市青浦区',
      requireFinishTime: '2022-08-17 23:59:59',
      status: 0,
      statusName: '待处理',
      taskCode: 'GD_TASK_220817000001002012',
      title: '测试工单3-尤',
      type: 1,
      typeName: '巡检类',
      workOrderCode: 'GD20220817000028'
    },
    {
      abnormal: null,
      accountCode: '',
      accountName: null,
      address: '华新镇华志路1685号',
      amount: 0.1,
      city: '上海市',
      cityId: '310100',
      depotCode: 'KDCS13170',
      depotName: '压测test',
      district: '青浦区',
      districtId: '310118',
      finishTime: null,
      finishWay: 1,
      finishWayName: '执行人需到店',
      gmtCreate: '2022-08-17 11:06:18',
      id: 32268,
      issueObject: 0,
      issueObjectName: '服务商/城市经理',
      province: '上海',
      provinceId: '310000',
      regionValue: '上海上海市青浦区',
      requireFinishTime: '2022-08-17 23:59:59',
      status: 0,
      statusName: '待处理',
      taskCode: 'GD_TASK_220817000001002012',
      title: '测试工单3-尤',
      type: 1,
      typeName: '巡检类',
      workOrderCode: 'GD20220817000019'
    }
  ]
}

export function addDialog() {
  return {
    width: 600,
    labelWidth: 100,
    itemSpan: 24,

    formItems: [
      { label: '工单名称', type: 'input', prop: 'title' },
      { label: '工单编号', type: 'input', prop: 'workOrderCode' },
      { label: '工单类型', type: 'select', prop: 'type', options: [...commonOptions.opWorkOrderTypes] },
      {
        label: '创建时间',
        type: 'date-range-picker',
        prop: 'startTime',
        toProp: 'endTime',
        defaultTo: 'now',
        defaultRange: 30
      }
    ]
  }
}

// 默认数据
const DefaultJson = {
  type: 'crud',
  actions: {
    query: { api: 'kdcs.getWorkOrderDeliveryPage', mockData },
    add: {
      api: 'kdcs.addRiskStore',
      // perm: true,
      dialog: addDialog()
    },
    detail: {
      label: '详情',
      link: {
        title: '工单详情（${data.row.workOrderCode}）',
        name: 'kt.operate.task.workorder.detail',
        path: '/operate/task/workorder/detail'
        // query: {
        //   id: '${data.row.id}'
        // }
      }
    },
    export: {
      api: 'base.addExportTask',
      searchParamProp: 'parameter',
      // exportType: 'wokrOrderList',
      apiParams: {
        exportType: 'wokrOrderList',
        remark: ''
      },
      exSearchParams: {
        pageIndex: 1,
        pageSize: 1000000
      }
      // perm: 'wokrOrderList'
    }
  },
  search: {
    items: [
      { label: '工单名称', type: 'input', prop: 'title', span: 12 },
      { label: '工单编号', type: 'input', prop: 'workOrderCode', span: 12 },
      { label: '工单类型', type: 'select', prop: 'type', options: [...commonOptions.opWorkOrderTypes], span: 12 },
      {
        label: '创建时间',
        type: 'date-range-picker',
        prop: 'startTime',
        toProp: 'endTime',
        defaultTo: 'now',
        defaultRange: 30,
        span: 12
      }
    ]
  },
  toolbar: {
    items: [
      {
        action: 'add',
        label: '新增',
        api: 'kdcs.addRiskStore',
        // perm: 'kdcs.addRiskStore',
        dialog: addDialog()
      },
      {
        action: 'export',
        label: '导出全部',
        api: 'base.addExportTask',
        searchParamProp: 'parameter',
        // exportType: 'wokrOrderList',
        apiParams: {
          exportType: 'wokrOrderList',
          remark: ''
        },
        exSearchParams: {
          pageIndex: 1,
          pageSize: 1000000
        }
        // perm: 'wokrOrderList'
      }
    ]
  },
  table: {
    showCheckbox: true,
    operation: {
      width: 80,
      items: [
        {
          action: 'detail',
          label: '详情',
          link: {
            title: '工单详情（${data.row.workOrderCode}）',
            name: 'kt.operate.task.workorder.detail',
            path: '/operate/task/workorder/detail'
            // query: {
            //   id: '${data.row.id}'
            // }
          }
        }
      ]
    },
    columns: [
      { label: '工单编号', prop: 'workOrderCode', width: 150 },
      { label: '工单名称', prop: 'title', minWidth: 200 },
      { label: '工单类型', prop: 'typeName', width: 80 },
      { label: '工单批次号', prop: 'workOrderCode', width: 150 },
      { label: '完成方式', prop: 'finishWayName', width: 120 },
      { label: '工单首次下发对象', prop: 'issueObjectName', width: 120 },
      { label: '省', prop: 'province', width: 80 },
      { label: '市', prop: 'city', width: 80 },
      { label: '区', prop: 'district', width: 80 },
      { label: '门店名称', prop: 'depotName', width: 180 },
      { label: '门店编号', prop: 'depotCode', width: 160 },
      { label: '创建时间', prop: 'gmtCreate', width: 150 },
      { label: '处理人员', prop: 'accountName', width: 120 },
      { label: '设置完结时间', prop: 'requireFinishTime', width: 150 },
      { label: '工单状态', prop: 'statusName', width: 120 },
      { label: '工单结算金额', prop: 'amount', width: 100 },
      // { label: '工单结算金额', prop: 'amount', width: 100, perm: [UserPermissons.OPERATE_WORKORDER_AMOUNT_VIEW] },
      { label: '工单完成日期', prop: 'finishTime', width: 150 }
    ]
  }
}

// 获取本地session数据
const getEditorJson = (key: string) => {
  const EditorJson = sessionStorage.getItem(key)
  return EditorJson ? JSON.parse(EditorJson) : DefaultJson
}

const EditorJson = getEditorJson('/editor/basic')

export default {
  body: EditorJson
}
