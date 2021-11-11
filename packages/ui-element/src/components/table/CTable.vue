<template>
  <div class="c-table" :class="{ 'no-footer': noPager }">
    <div class="c-table__body">
      <el-form ref="formRef" :model="{ list: tableData.data }" style="height: 100%">
        <el-table
          v-if="isShowTable"
          ref="tableRef"
          v-bind="$attrs"
          v-loading="tableLoading"
          class="fw"
          :height="$attrs.height || '100%'"
          :border="typeof $attrs.border !== 'undefined' ? $attrs.border : false"
          :show-summary="showSummary"
          :summary-method="innerSummaryMethod"
          :use-virtual="showVirtual"
          :data="tableData.data"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <!-- 全选列-->
          <el-table-column
            v-if="batchEditable ? true : showCheckbox"
            align="center"
            type="selection"
            width="40"
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
          <el-table-column v-if="showExpand" type="expand" :fixed="showFixed">
            <template #default="scope">
              <slot v-bind="scope" name="expand" />
            </template>
          </el-table-column>

          <!-- 属性列-->
          <child-table-column
            v-for="(item, index) in columnItems"
            :key="index"
            :column="item"
            :editable="editable"
            :batch-editable="batchEditable"
            :on-editor-submit="handleEditorSubmit"
            :on-batch-edit="handleBatchEditor"
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
import { ref, reactive, nextTick, computed, useAttrs } from 'vue'
import { _, useApiRequest, useConfig } from '@zto/zpage'

import { useMessage } from '../../composables'
import { xlsxUtil } from '../../utils'

import * as tableUtil from './util'
import ChildTableColumn from './child-table-column'
import Pagination from './pagination.vue'

import type { TableColumn, TablePager, SummaryMethodParams, TableData } from './types'
import type { ExportColumn } from '../../utils/xlsx'

// 属性
const props = withDefaults(
  defineProps<{
    api?: string // api请求
    params?: GenericObject // api请求参数
    data?: Array<any> // 表格数据
    columns?: Array<any> // 列设置
    showExpand?: boolean // 展开列是否展示
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
    noIndex?: boolean // 是否展示序号列
    noOperation?: boolean // 是否展示操作列
    operationPosition?: string // 操作列位置
    operationWidth?: string | number // 操作列宽度
    pagerAttrs?: GenericObject // 内部属性
    pageSizes?: Array<number> // 可选分页数
    pageSize?: number // 页面大小
    paginationSmall?: boolean // pagination small
    paginationLayout?: string // pagination layout
    editable?: boolean // 是否可编辑
    batchEditable?: boolean // 是否可批量编辑
    onEditorSubmit?: GenericFunction // 编辑器提交
    onBatchEdit?: GenericFunction // 批量更新
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
    selectableFn: () => true,
    editable: false,
    batchEditable: false
  }
)

// 事件
const emit = defineEmits(['selection-change', 'batch-edit', 'editor-submit', 'link', 'fetch'])

// 消息提示
const { Message } = useMessage()
const attrs = useAttrs()

// api请求
const apiRequest = useApiRequest()

// 引用
const tableRef = ref<any>()
const formRef = ref<any>()

// ---- table相关 ------->

const isShowTable = ref<boolean>(true)
const selectedRows = ref<any[]>([])

const tableLoading = ref(false)

const tableData = reactive<TableData>({
  data: props.data || [],
  total: 0,
  summary: {}
})

const innerSummaryMethod = computed(() => {
  return props.summaryMethod || tableSummaryFn
})

// 可见表格头, 加入多级表头
const vTableHead = computed<ExportColumn[]>(() => {
  const result: ExportColumn[] = []
  const tableHead = columnItems.value
  if (!tableHead) return []

  const formatCol = (col: TableColumn) => {
    const _col: any = Object.assign({}, col)
    const _width = `${(_col.width || '') as string}`
    if (_width) {
      _col.width = parseInt(_width.replace(/[a-zA-Z]/g, ''))
    }
    return _col
  }

  const columnFinder = (columns: TableColumn[], level: number) => {
    for (const column of columns) {
      if (column.children) {
        columnFinder(column.children, level + 1)
      } else {
        result.push(formatCol(column) as ExportColumn)
      }
    }
  }

  columnFinder(tableHead, 0)
  return result
})

/** 选中行发生变化 */
function handleSelectionChange(selection: any[]) {
  selectedRows.value = selection
  emit('selection-change', selection)
}

/**批量編輯
 * @param data
 */
async function handleBatchEditor(data: Record<string, string>) {
  if (!selectedRows.value.length) return Message.error('请勾选列')

  for (const row of selectedRows.value || []) {
    for (const [key, val] of Object.entries(data)) {
      row[key] = val
    }
  }

  await Promise.resolve().then(() => {
    props.onBatchEdit && props.onBatchEdit(selectedRows, data)
  })

  emit('batch-edit', selectedRows.value, data)
}

/**
 * 编辑器提交
 */
async function handleEditorSubmit(...args: any[]) {
  await Promise.resolve().then(() => {
    props.onEditorSubmit && props.onEditorSubmit(...args)
  })

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

  return columns.map((col: any, i) => {
    if (i === 0) return props.summaryText || '汇总'

    const _col = getColumnByProp(col.property, props.columns)

    if (!_col || _col.summaryProp === false) return ''
    const summaryProp = _col.summaryProp || _col.prop
    if (!summaryProp) return ''

    if (_.isUndefined(summaryData[summaryProp])) {
      return _col.summaryEmptyText || '--'
    } else {
      return summaryData[summaryProp]
    }
  })
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

/** 重新layout */
function doLayout() {
  // 多级表头筛选有问题，暂时这样解决
  if (columnItems.value.find(column => column.children && column.children.length)) {
    isShowTable.value = false
    nextTick(() => (isShowTable.value = true))
    return
  }

  tableRef.value.doLayout()
}

// 导出数据
function exportData(fileName: string) {
  if (!tableData.data.length) {
    Message.warning('请先查询出数据')
    return
  }

  const exportOpts: any = {
    fileName,
    columns: vTableHead
  }
  xlsxUtil.exportData(tableData.data, exportOpts)
}

// ---- 表格编辑相关 ------->

/** 验证 */
function validate() {
  return formRef.value.validate()
}

// ---- 分页相关 ------->

const pageSizeCfg = useConfig('components.pagination.pageSize', 100)

const columnItems = computed<TableColumn[]>(() => {
  return props.columns.map((col: any) => {
    col.formatter = tableUtil.getColFormatter(col)
    return col
  })
})

const pager = reactive<TablePager>({
  pageIndex: 1,
  pageSize: props.pageSize || pageSizeCfg
})

/** 重设页面信息 */
function resetPager() {
  pager.pageIndex = 1
  return pager
}

// ---- 数据相关 ------->

const dataCfg = useConfig('components.table.data', {})

/** 请求数据 */
async function doFetch(isResetPager: boolean) {
  if (tableLoading.value) return
  if (isResetPager) resetPager()

  const payload = {
    attrs,
    action: {
      type: 'query',
      api: props.api as string,
      method: (attrs.apiMethod || attrs.method) as string,
      sourceType: 'table'
    },
    ...pager,
    params: props.params,
    noPager: props.noPager
  }

  if (props.api) {
    tableLoading.value = true
    await apiRequest(payload)
      .then(res => {
        setData(res)
      })
      .finally(() => {
        tableLoading.value = false
      })
  }

  emit('fetch', payload)
}

/** 设置表格数据 */
function setData(data: any) {
  if (!data) return

  const dataProp = dataCfg.dataProp || 'data'
  const totalProp = dataCfg.totalProp || 'total'
  const summaryProp = dataCfg.summaryProp || 'summary'

  let list: any[] = []
  let total = 0

  if (dataCfg.parser) {
    const parserRes = dataCfg.parser(data) || {}
    list = parserRes.list
    total = parserRes.totalRows
  } else {
    list = data[dataProp]
    total = data[totalProp] || 0
  }

  tableData.data = list || []
  tableData.total = total > 0 ? total : pager.pageIndex === 1 ? 0 : tableData.total

  if (data[summaryProp]) {
    tableData.summary = data[summaryProp]
    nextTick((tableRef as any).doLayout)
  }
}

/** 导出组件方法 */
defineExpose({
  selectedRows,
  pager,
  resetPager,
  setData,
  doFetch,
  doLayout,
  validate,
  exportData
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
}
</style>
