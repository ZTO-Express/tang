<template>
  <div class="c-table" :class="{ 'no-footer': noPager }">
    <div class="c-table__body">
      <el-form ref="formRef" :model="tableData" :disabled="disabled" style="height: 100%">
        <el-table
          v-if="isShowTable"
          ref="tableRef"
          v-bind="$attrs"
          v-loading="tableLoading"
          class="fw"
          :height="autoHeight ? undefined : $attrs.height || '100%'"
          :border="typeof $attrs.border !== 'undefined' ? $attrs.border : false"
          :show-summary="showSummary"
          :summary-method="innerSummaryMethod"
          :use-virtual="showVirtual"
          :data="tableData.data"
          :load="innerLoadMethod"
          :row-key="rowKey"
          highlight-current-row
          :cell-style="innerCellStyle"
          :header-cell-style="innerHeaderCellStyle"
          :span-method="innerSpanMethod"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <!-- 全选列-->
          <el-table-column
            v-if="batchEditable ? true : showCheckbox"
            align="center"
            type="selection"
            width="46"
            :selectable="selectableFn"
            :fixed="showFixed"
          />

          <!-- 序号列-->
          <el-table-column
            v-if="!noIndex"
            key="index"
            type="index"
            label="序号"
            width="49"
            align="center"
            :fixed="showFixed"
          />

          <!-- 操作列-->
          <el-table-column
            v-if="!noOperation"
            :fixed="showFixed === true ? operationPosition : false"
            label="操作"
            :width="operationWidth"
            align="center"
          >
            <template #default="scope">
              <slot v-bind="scope" name="operation" />
            </template>
          </el-table-column>

          <!-- 展开列-->
          <el-table-column v-if="props.expand" type="expand" :fixed="showFixed">
            <template #default="scope">
              <widget :schema="props.expand" :context-data="scope" />
            </template>
          </el-table-column>

          <!-- 属性列-->
          <child-table-column
            v-for="(item, index) in columnItems"
            :key="index"
            :column="item"
            :editable="editable"
            :batch-editable="batchEditable"
            :editor-model="tableData"
            :editor-ex-form-rules="editorExFormRules"
            @editor-submit="handleEditorSubmit"
            @batch-editor-submit="handleBatchEditorSubmit"
          >
            <template v-for="prop of childProps(columnItems)" #[`${prop}Header`]="scope">
              <slot v-bind="scope" :name="prop + 'Header'" />
            </template>

            <template v-for="prop in childProps(columnItems)" #[prop]="scope">
              <slot v-bind="scope" :name="prop" />
            </template>
          </child-table-column>
        </el-table>
      </el-form>
    </div>
    <div v-if="!noPager" class="c-table__footer">
      <pagination
        v-model:page-size="pager.pageSize"
        v-model:page-index="pager.pageIndex"
        v-bind="pagerAttrs"
        class="c-table__pagination"
        :small="paginationSmall"
        :layout="paginationLayout"
        :total="tableData.total"
        :page-sizes="pageSizes"
        @fetch="doFetch"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import {
  ref,
  reactive,
  watch,
  nextTick,
  computed,
  useAttrs,
  inject,
  _,
  onMounted,
  onUnmounted,
  useCurrentAppInstance
} from '@zto/zpage'

import { C_FORM_KEY } from '../../consts'
import { xlsxUtil } from '../../utils'

import * as tableUtil from './util'
import ChildTableColumn from './child-table-column'
import Pagination from './pagination.vue'

import type { SummaryMethodParams, TableColumn, TablePager, TableData } from './types'
import type { ExportColumn } from '../../utils/xlsx'

import type { GenericFunction, ApiRequestAction, AppEventListeners } from '@zto/zpage'

// 属性
const props = withDefaults(
  defineProps<{
    api?: ApiRequestAction // api请求
    apiParams?: Record<string, any> // api请求参数

    data?: Array<any> // 表格数据
    dataListProp?: string // 列表数据属性
    dataTotalProp?: string // 总数属性
    dataSummaryProp?: string // 汇总属性
    onDataLoad?: GenericFunction // 数据加载

    columns?: Array<any> // 列设置
    noPager?: boolean // 是否隐藏分页
    showFixed?: boolean | string // 全选列 展开列 操作列 固定
    totalRows?: number // 总行数
    showVirtual?: boolean // 是否虚拟加载
    selectableFn?: GenericFunction // checkbox禁用与否
    showCheckbox?: boolean // 是否展示checkbox
    showSummary?: boolean // 是否展示统计行
    summaryMethod?: GenericFunction // 统计方法
    summaryDataProp?: string // 统计数据属性
    summaryText?: string // 合计行第一列的文本
    loadMethod?: GenericFunction // 加载方法（树形节点，懒加载情况下）
    parentProp?: string // 父节点属性
    rowKey?: string
    noIndex?: boolean // 是否展示序号列
    noOperation?: boolean // 是否展示操作列
    operationPosition?: string // 操作列位置
    operationWidth?: string | number // 操作列宽度
    pagerAttrs?: Record<string, any> // 内部属性
    pageSizes?: Array<number> // 可选分页数
    pageSize?: number // 页面大小
    paginationSmall?: boolean // pagination small
    paginationLayout?: string // pagination layout

    cellStyle?: any // 单元格样式
    headerCellStyle?: any // 头部单元格样式
    autoHeight?: boolean // 自动高度

    batchEditable?: boolean // 是否可批量编辑
    editable?: boolean // 是否可编辑
    disabled?: boolean // 是否disable编辑
    editorDefaults?: any // 编辑器默认值

    dataColumns?: boolean // 从数据中获取列信息
    dataColumnsProp?: string // 数据列属性

    rowspanProp?: string // 是否合并对应属性（合并单元格）
    spanMethod?: Function // 合并方法

    listeners?: AppEventListeners // 时间监听配置

    expand?: any

    export?: Record<string, any> // 导出配置
  }>(),
  {
    data: () => [],
    columns: () => [],
    showFixed: false,
    showVirtual: false,
    showCheckbox: false,
    showSummary: false,
    noIndex: false,
    noOperation: false,
    operationPosition: 'left',
    operationWidth: 'auto',
    paginationSmall: false,
    totalRows: 0,

    batchEditable: false,
    editable: false
  }
)

// 事件
const emit = defineEmits(['selection-change', 'sort-change', 'batch-editor-submit', 'editor-submit', 'link', 'fetch'])

const attrs = useAttrs()

const app = useCurrentAppInstance()

const { Message } = app.useMessage() // 消息提示
const apiRequest = app.request // api请求

// 引用
const tableRef = ref<any>()

// ---- table相关 ------->

const isShowTable = ref<boolean>(true)
const selectedRows = ref<any[]>([])
const sortedColumns = ref<any[]>([])

const tableLoading = ref(false)

const tableData = reactive<TableData>({
  data: [],
  total: 0,
  summary: {},
  columns: []
})

const isTreeTable = computed(() => {
  return !!props.rowKey
})

const innerSummaryMethod = computed(() => {
  return props.summaryMethod || tableSummaryFn
})

const innerSpanMethod = computed(() => {
  if (props.spanMethod) return props.spanMethod
  if (props.rowspanProp) return rowspanFn

  return undefined
})

const columnItems = computed<TableColumn[]>(() => {
  let columns = normalizeColumns(props.columns)
  let dataColumns = tableData.columns || []

  if (props.dataColumns === true) {
    columns = tableUtil.mergeColumns(dataColumns || [], columns)
  }

  return columns
})

/** 父子列摊平 */
const flattenColumns = computed<TableColumn[]>(() => {
  const columns = tableUtil.flattenChildren(columnItems.value)
  return columns || []
})

/** 单元格样式 */
const innerCellStyle = computed(() => {
  const columnStyles = flattenColumns.value
    .filter(it => it.cellStyle)
    .map(it => ({ prop: it.prop, style: it.cellStyle }))

  const fn = tableUtil.getColCellStyleFn(app, props.cellStyle, columnStyles)
  return fn
})

/** 头部单元格样式 */
const innerHeaderCellStyle = computed(() => {
  const columnStyles = flattenColumns.value
    .filter(it => it?.headerStyle)
    .map(it => ({ prop: it.prop, style: it.headerStyle }))

  const fn = tableUtil.getColCellStyleFn(app, props.headerCellStyle, columnStyles)
  return fn
})

// 可见表格头, 加入多级表头
const vTableHead = computed<ExportColumn[]>(() => {
  const tableHead = columnItems.value
  if (!tableHead) return []

  const formatCol = (col: TableColumn) => {
    const _col: any = { ...col }
    const _width = `${(_col.width || '') as string}`
    if (_width) {
      _col.width = parseInt(_width.replace(/[a-zA-Z]/g, ''))
    }
    return _col
  }

  const result: ExportColumn[] = []

  const columnFinder = (columns: TableColumn[], level: number) => {
    for (let column of columns) {
      if (column.children?.length) {
        columnFinder(column.children, level + 1)
      } else {
        result.push(formatCol(column) as ExportColumn)
      }
    }
  }

  columnFinder(tableHead, 0)
  return result
})

watch(
  () => props.data,
  () => {
    tableData.data = props.data || []
  },
  { immediate: true }
)

/** 选中行发生变化 */
function handleSelectionChange(selection: any[]) {
  selectedRows.value = selection
  emit('selection-change', selection)
}

/** 排序发生变化 */
async function handleSortChange(sort: any) {
  if (!sort || !sort.prop) return

  let _sortOrder = 0

  if (sort.order === 'ascending') {
    _sortOrder = 1
  } else if (sort.order === 'descending') {
    _sortOrder = -1
  }

  // 移除当前属性排序
  const _sColumns = sortedColumns.value.filter(it => it.prop !== sort.prop)
  _sColumns.unshift({ prop: sort.prop, order: _sortOrder })

  sortedColumns.value = _sColumns

  emit('sort-change', sort, sortedColumns.value)

  await doFetch(false)
}

/**批量編輯
 * @param data
 */
async function handleBatchEditorSubmit(data: Record<string, string>) {
  if (!selectedRows.value.length) return Message.error('请选择需要编辑的行')

  for (const row of selectedRows.value || []) {
    for (const [key, val] of Object.entries(data)) {
      row[key] = val
    }
  }

  emit('batch-editor-submit', selectedRows.value, data)
}

/**
 * 编辑器提交
 */
async function handleEditorSubmit(...args: any[]) {
  await doFetch(false)

  emit('editor-submit', ...args)
}

/** 链接跳转 */
function handleLink(link: any, row: any, col: any, scope: any) {
  emit('link', link, row, col, scope)
}

/**
 * 统计方法
 * @param param
 */
function tableSummaryFn(params: SummaryMethodParams) {
  const { columns } = params

  const summaryData = tableData.summary || {}

  const result = columns.map((col: any, i) => {
    if (i === 0) return props.summaryText || '汇总'

    const _col = getColumnByProp(col.property, props.columns)

    if (!_col || !_col.summaryProp) return ''

    const summaryProp = _col.summaryProp == true ? _col.prop : _col.summaryProp
    const summaryVal = summaryData[summaryProp]

    let summaryText = summaryVal
    if (_.isEmpty(summaryVal)) {
      summaryText = _col.summaryEmptyText || '--'
    } else if (_col.summaryFormatter) {
      summaryText = tableUtil.formatValue(summaryVal, _col.summaryFormatter, { app, data: tableData })
    }

    return summaryText
  })

  return result
}

/** 父子节点加载方法 */
async function tableLoadFn(row: any, node: any, resolve: Function) {
  if (props.api && props.parentProp && props.rowKey) {
    tableLoading.value = true

    const payload: any = {
      [props.parentProp]: row[props.rowKey]
    }
    await apiRequest(payload)
      .then(res => {
        resolve(res)
      })
      .finally(() => {
        tableLoading.value = false
      })
  }
}

function childProps(children?: TableColumn[]) {
  if (!children) return []
  return tableUtil.getChildProps(children)
}

// 根据属性获取列
function getColumnByProp(prop: string, cols: any[]): any {
  if (!prop || !cols?.length) return undefined

  for (const col of cols) {
    if (col.prop === prop) return col
    if (col.children?.length) {
      const _col = getColumnByProp(prop, col.children)
      if (_col) return _col
    }
  }

  return undefined
}

/** 规范化列配置 */
function normalizeColumns(columns: TableColumn[], pid?: string) {
  if (!columns?.length) return [...(columns || [])]

  pid = pid || '_col' // pid用于定位为唯一列

  const _columns = columns
    .filter(col => {
      return app.checkPermission(col.perm)
    })
    .map((col: any, index: number) => {
      const _col = { ...col }
      _col.__id = `${pid}_${index}`
      _col.editorProp = _col.editor?.prop || _col.prop // 设置编辑属性
      if (!_col.prop) _col.prop = _col.__id // 如果没有prop，默认设置prop，以备后续识别
      _col.formatter = tableUtil.getColFormatter(_col)
      return _col
    })

  _columns.forEach(_col => {
    _col.children = normalizeColumns(_col.children, _col.__id)
  })

  return _columns
}

/** 重新layout */
async function doLayout(force = false) {
  await new Promise(resolve => {
    if (force) {
      isShowTable.value = false
      setTimeout(() => {
        isShowTable.value = true
        resolve(true)
      }, 10)

      return
    }

    // 多级表头筛选有问题，暂时这样解决
    if (columnItems.value.find(column => column.children && column.children.length)) {
      isShowTable.value = false
      nextTick(() => {
        isShowTable.value = true
        resolve(true)
      })
      return
    }

    nextTick(() => {
      tableRef.value.doLayout()

      nextTick(() => {
        resolve(true)
      })
    })
  })
}

// ---- 分页相关 ------->

const pageSizeCfg = app.useComponentsConfig('pagination.pageSize', 100)

const pager = reactive<TablePager>({
  pageIndex: 1,
  curPageIndex: 1,
  pageSize: props.pageSize || pageSizeCfg
})

/** 重设页面信息 */
function resetPager() {
  pager.pageIndex = 1
  pager.curPageIndex = 1
  return pager
}

// ---- 排序相关 ------->

/**
 * 清除排序
 */
function clearSort() {
  tableRef.value.clearSort()
  sortedColumns.value = []
}

/**
 * 获取排序信息
 */
function getSort() {
  return sortedColumns.value
}

// ---- 数据相关 ------->

// 注册微件事件监听
app.useEventListeners(props.listeners, {
  fetchOn: async (e: any) => {
    await doFetch(e?.resetPager, { apiParams: e?.params })
  },

  setDataOn: async (e: any) => {
    setData(e.data)
  }
})

const dataCfg = app.useComponentsConfig('table.data', {})

/** 请求数据 */
async function doFetch(isResetPager: boolean = false, options?: any) {
  if (tableLoading.value) return
  if (isResetPager) resetPager()

  options = { ...options }

  const payload = {
    attrs,
    action: {
      type: 'query',
      api: props.api,
      method: (attrs.apiMethod || attrs.method) as string,
      sourceType: 'table'
    },
    pageIndex: pager.pageIndex,
    pageSize: pager.pageSize,
    params: { ...props.apiParams, ...options.apiParams },
    noPager: props.noPager,
    pageSort: sortedColumns.value
  }

  if (props.api) {
    tableLoading.value = true
    await apiRequest(payload)
      .then(res => {
        pager.curPageIndex = pager.pageIndex
        setData(res)
      })
      .finally(() => {
        tableLoading.value = false
      })
  }

  emit('fetch', payload, isResetPager)
}

/** 设置表格数据 */
async function setData(data: any) {
  if (!data) return

  const listProp = props.dataListProp || dataCfg.listProp || 'data'
  const totalProp = props.dataTotalProp || dataCfg.totalProp || 'total'
  const summaryProp = props.dataSummaryProp || dataCfg.summaryProp || 'summary'
  const columnsProp = props.dataColumnsProp || dataCfg.columnsProp || 'columns'

  let list: any[] = []
  let total = 0

  if (dataCfg.parser) {
    const parserRes = dataCfg.parser(data) || {}
    list = parserRes.list
    total = parserRes.totalRows
  } else if (Array.isArray(data)) {
    list = data
    total = data.length
  } else {
    list = data[listProp]
    total = data[totalProp] || 0
  }

  if (isTreeTable.value) {
    tableData.data = []
  }

  if (props.rowspanProp) {
    list = parseRowspanData(list, props.rowspanProp)
  }

  await nextTick(async () => {
    tableData.data = list || []
    tableData.total = total > 0 ? total : pager.pageIndex === 1 ? 0 : tableData.total
    tableData.columns = data[columnsProp] || []

    // 注意：__summary预定字段名称（不能修改）
    if (data[summaryProp] || data.__summary) {
      tableData.summary = { ...data[summaryProp], ...data.__summary }

      nextTick((tableRef as any).doLayout)
    }

    if (props.onDataLoad) {
      const context = app.useContext(tableData)
      await props.onDataLoad(context)
    }
  })
}

// 返回表格数据
function getData() {
  return tableData.data
}

const rowspanColumns = computed(() => {
  const _cols = columnItems.value.filter(it => it.rowspan === true)
  return _cols
})

// 解析行数据
function parseRowspanData(data: any[], prop: string) {
  if (!data?.length || !prop) return data

  const parsed: any[] = []

  data.forEach((it: any, idx: number) => {
    it = { ...it }
    const items = it[prop] || [{}]
    delete it.items

    const rowspan = items.length || 0
    items.forEach((_it: any, _idx: number) => {
      parsed.push({
        __rowspan: _idx === 0 ? rowspan : 0,
        __rowspanIndex: idx + 1,
        ...it,
        ..._it
      })
    })
  })

  return parsed
}

// 内部行单元格合并方法
function rowspanFn({ row, column }: any) {
  const spanColProps = rowspanColumns.value.filter(it => it.rowspan === true).map(it => it.prop)
  if (spanColProps.includes(column.property)) return [row.__rowspan, 1]
  return [1, 1]
}

// ---- 表格编辑相关 ------->

const editorExFormRules = app.useComponentsConfig('form.rules')

const formRef = ref<any>()

const editorModel = reactive({ list: tableData.data })

// 外部表单
const outerForm = inject<any>(C_FORM_KEY)

// 当前可编辑表格对应外部表格
const outerFormField = { validate }

/** 默认表格数据 */
const editorColumnDefaults = computed(() => {
  const data = flattenColumns.value.reduce((coll, it) => {
    if (it.prop && it.editor?.hasOwnProperty('default')) {
      coll[it.prop] = it.editor.default
    }
    return coll
  }, {} as any)

  return data
})

onMounted(() => {
  if (outerForm) {
    outerForm.addValidatorItem(outerFormField)
  }
})

onUnmounted(() => {
  if (outerForm) {
    outerForm.removeValidatorItem(outerFormField)
  }
})

/** 验证 */
function validate() {
  return formRef.value.validate()
}

/** 附加数据 */
function appendRow(data: any) {
  data = getRowDataWithDefaults(data)

  tableData.data.push(data)
}

/** 附加多行 */
function appendRows(datas: any[] = [{}]) {
  datas = getRowDatasWithDefaults(datas)

  tableData.data.push(...datas)
}

/** 插入行 */
function insertRow(index = 0, data?: any) {
  data = getRowDataWithDefaults(data)

  tableData.data.splice(index + 1, 0, data)
}

/** 插入多行 */
function insertRows(index = 0, datas: any[] = [{}]) {
  datas = getRowDatasWithDefaults(datas)

  tableData.data.splice(index + 1, 0, ...datas)
}

/** 获取行默认数据 */
function getRowDatasWithDefaults(datas: any[] = [{}]) {
  datas = datas.reduce((coll, it) => {
    const data = _.deepMerge(props.editorDefaults, editorColumnDefaults.value, it)
    coll.push(data)
    return coll
  }, [] as any[])

  return datas
}

/** 获取行默认数据 */
function getRowDataWithDefaults(data: any = {}) {
  data = _.deepMerge(props.editorDefaults, editorColumnDefaults.value, data)

  return data
}

/** 删除行 */
function removeRow(index = 0) {
  tableData.data.splice(index, 1)
}

/** 删除多行 */
function removeRows(rows: any[]) {
  if (!rows || !rows.length) return

  let list = tableData.data

  for (let i = 0; i < list.length; i++) {
    if (rows.includes(list[i])) {
      list.splice(i, 1)
      i--
    }
  }
}

/** 删除选中行 */
function removeSelectedRows() {
  removeRows(selectedRows.value)
}

/**
 * 设置行数据
 * @param datas
 * @param keyProp
 * @param ignoreProps
 */
function setRowsDatasByKey(datas: any[], keyProp: string, setFn?: Function) {
  let rows = tableData.data
  keyProp = keyProp || 'code'

  _.setObjectsByKeys(rows, datas, keyProp, setFn)
}

/**
 * 为数据添加不存在的key
 */
function setRowsDefaults(rows: any[]) {
  const tableHead = columnItems.value || []

  if (!rows?.length) return

  rows.forEach((item: any) => {
    let existsProps = Object.keys(item)

    tableHead.forEach(col => {
      if (col.editorProp && !existsProps.includes(col.editorProp)) {
        if (!col.editor) return

        let defaultVal: any = col.default

        if (col.editor.hasOwnProperty('default')) {
          defaultVal = col.editor.default
        }

        item[col.editorProp] = defaultVal
      }
    })
  })
}

const exportDataFn = app.useComponentsConfig('table.exportData')

// 导出数据
function exportData(options?: any) {
  if (!tableData.data.length) {
    Message.warning('请先查询出数据')
    return
  }

  const exportOpts = { columns: vTableHead.value, ...props.export, ...options, app }

  if (exportDataFn) {
    exportDataFn(tableData.data, exportOpts)
  } else {
    xlsxUtil.exportData(tableData.data, exportOpts)
  }
}

// ---- 树形表格处理 ------->

// 树形菜单展开所有（不包括懒加载项）
function expandAll(expanded: boolean = true) {
  const data = tableData.data || []
  expandRows(data, expanded, true)
}

// 获取所有有子节点的key
function expandRows(rows: any[], expanded: boolean = true, recursive: boolean = true) {
  if (!tableRef.value) return

  rows.forEach(it => {
    if (it.children?.length) {
      tableRef.value.toggleRowExpansion(it, expanded)
      if (recursive) expandRows(it.children, expanded, recursive)
    }
  })
}

const treeResolveMap = ref(new Map())

async function innerLoadMethod(row: any, node: any, resolve: Function) {
  const rowKey = props.rowKey
  if (rowKey) {
    // 用于刷新树形节点
    treeResolveMap.value.set(row[rowKey], { row, node, resolve })
  }

  const loadMethod = props.loadMethod || tableLoadFn
  await loadMethod(row, node, resolve)
}

/**
 * 刷新节点
 */
async function refreshTreeNode(model: any, options?: any) {
  options = { ...options }

  const rowKey = props.rowKey
  const parentProp = props.parentProp

  if (!rowKey || !parentProp || !model || !tableRef.value) return

  const rowId = model[rowKey]
  const parentId = model[parentProp]

  const tableRefStore = tableRef.value.store
  const lazyTreeNodeMap = tableRefStore.states.lazyTreeNodeMap

  if (!parentId || !lazyTreeNodeMap.value) return

  let actionType: string = ''

  if (options.action) {
    actionType = options.action.actionType || options.action.name

    // 删除当前节点
    // if (actionType === 'delete') {
    //   lazyTreeNodeMap.value = _.omit(lazyTreeNodeMap.value, rowId)
    // }
  }

  const treeResolve = treeResolveMap.value.get(parentId)
  if (!treeResolve) return

  const { row, node, resolve } = treeResolve

  lazyTreeNodeMap.value[parentId] = []

  if (row) await innerLoadMethod(row, node, resolve)

  const pNode = findTreeResolveMapNode(parentId)

  if (pNode && ['add', 'delete'].includes(actionType)) {
    await refreshTreeNode(pNode)
  }

  return true
}

/** 找到延迟加载映射节点 */
function findTreeResolveMapNode(rowId: string) {
  const tableRefStore = tableRef.value.store
  const lazyTreeNodeMap = tableRefStore.states.lazyTreeNodeMap

  let node: any = null

  for (let [key, nodes] of Object.entries(lazyTreeNodeMap.value)) {
    if (!Array.isArray(nodes)) continue

    node = nodes.find(it => it.id === rowId)
    if (node) break
  }

  return node
}

/** 导出组件方法 */
defineExpose({
  innerForm: formRef,
  selectedRows,
  pager,
  tableData,
  resetPager,
  clearSort,
  getSort,
  setData,
  getData,
  doFetch,
  doLayout,
  validate,
  exportData,
  expandAll,
  expandRows,
  appendRow,
  appendRows,
  insertRow,
  insertRows,
  removeRow,
  removeRows,
  removeSelectedRows,
  setRowsDatasByKey,
  setRowsDefaults,
  refreshTreeNode
})
</script>

<style lang="scss" scoped>
$table-footer-height: 30px;

.c-table {
  height: 100%;

  &.no-footer {
    .c-table__body {
      height: 100%;
    }
  }

  &__body {
    height: calc(100% - $table-footer-height - 20px);
  }

  &__footer {
    position: relative;
    margin: 16px 0;
    text-align: center;
  }

  &__pagination {
    padding: 0;
  }
}
</style>

<style lang="scss">
.c-table {
  &-dropdown-popper {
    min-height: 200px;
  }

  &-col-text-required {
    & > .tag {
      color: #ed4014;
      margin-left: 5px;
    }
  }

  .table-column-form-item {
    margin: 15px 0;

    &.no-padding {
      margin: 0;
    }

    & > label {
      display: none;
    }

    &.show-label > label {
      display: auto;
    }

    &.is-required:not(.show-label) {
      & > .el-form-item__content:before {
        content: '*';
        color: var(--el-color-danger);
        margin-right: 4px;
      }
    }
  }
}
</style>
