<template>
  <div class="w-crud" :class="sectionClass" :style="sectionStyle">
    <div class="w-crud__con" :class="{ 'no-toolbar': noToolbar }">
      <!-- 搜索区域 -->
      <el-collapse-transition v-if="!!sSearch">
        <div v-show="expandedSearch && sSearch?.hidden !== true" class="w-crud__search">
          <c-form ref="searchFormRef" v-bind="searchFormAttrs" :model="searchModel" @keyup="handleKeyup">
            <slot name="search" />
            <c-form-items v-bind="searchItemsAttrs" :model="searchModel">
              <template #operation>
                <el-button
                  v-if="$attrs.perm"
                  v-perm="$attrs.perm"
                  :loading="searchLoading"
                  type="primary"
                  v-preventReclick
                  @click="handleSearch"
                >
                  查询
                </el-button>
                <el-button v-else :loading="searchLoading" type="primary" v-preventReclick @click="handleSearch">
                  查询
                </el-button>
                <el-button v-preventReclick @click="handleSearchReset">重置</el-button>
              </template>
            </c-form-items>
          </c-form>
        </div>
      </el-collapse-transition>

      <!-- 表格信息 -->
      <div class="w-crud__content">
        <div class="w-crud__content-body">
          <div v-if="!noToolbar" class="w-crud__toolbar" :style="toolbarStyle">
            <div class="toolbar__line" />
            <div v-if="sToolbar.title" class="toolbar__title">
              <Content :content="sToolbar.title" :contextData="innerContextData" />
            </div>
            <div class="toolbar__actions">
              <template v-for="(it, index) in sToolbar?.items || []" :key="`tool_${String(index)}`">
                <el-button
                  v-if="it.action === 'toggle-expand'"
                  type="primary"
                  v-bind="getToolbarActionAttrs(it)"
                  class="q-ml-md"
                  v-preventReclick
                  @click="doToggleExpand"
                >
                  {{ expandToggleFlag ? '展开所有' : '收起所有' }}
                </el-button>
                <c-action v-else-if="it.action" v-bind="getToolbarActionAttrs(it)" class="q-ml-md"></c-action>
                <cmpt
                  v-else-if="it.cmpt"
                  :config="it.cmpt"
                  v-bind="{ onSubmit: doSearch, ...it }"
                  :context-data="innerContextData"
                />
                <component
                  v-else-if="it.componentType"
                  :is="it.componentType"
                  class="q-ml-md"
                  v-bind="{ onSubmit: doSearch, ...it }"
                  :context-data="innerContextData"
                />
                <widget v-else-if="it.type" class="q-ml-md" :schema="it" />
              </template>
            </div>
            <div v-if="!noToolbarExtra" class="toolbar__extra">
              <slot name="tools">
                <div class="u-flex">
                  <slot name="extra" />
                  <template v-if="sSearch">
                    <el-divider direction="vertical" class="content__divider" />
                    <div class="inline">
                      <el-button
                        v-if="!sToolbar.noRefresh"
                        type="text"
                        class="q-ml-md"
                        v-preventReclick
                        @click="handleRefresh"
                      >
                        刷新
                        <i class="el-icon-refresh-right"></i>
                      </el-button>
                      <el-button
                        v-if="!sToolbar.noExport"
                        type="text"
                        class="q-ml-md"
                        v-preventReclick
                        @click="doExport"
                      >
                        导出
                        <i class="el-icon-download"></i>
                      </el-button>
                      <el-button
                        v-if="!sToolbar.noSearchHide"
                        v-show="sSearch.hidden !== true"
                        type="text"
                        class="q-ml-md"
                        v-preventReclick
                        @click="toggleExpandSearch"
                      >
                        {{ expandedSearch ? '隐藏筛选' : '展开筛选' }}
                        <i :class="expandedSearch ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                      </el-button>
                      <ColumnsFilter
                        v-if="columnsFilterable"
                        :name="wSchema.name"
                        :columns="innerColumns"
                        :storable="!tableAttrs.dataColumns"
                        :context-data="innerContextData"
                        @change="handleColumnsFilterChange"
                      />
                    </div>
                  </template>
                </div>
              </slot>
            </div>
          </div>

          <!-- 主体内容部分-->
          <div v-loading="searchLoading" class="w-crud__body" :style="{ height: bodyStyle.height }">
            <c-table
              ref="tableRef"
              class="w-crud__table"
              v-bind="tableAttrs"
              @editor-submit="handleEditorSubmit"
              @batch-editor-submit="handleBatchEditorSubmit"
              @fetch="handleTableFetch"
            >
              <template #operation="scope">
                <template
                  v-for="(it, index) in sTable?.operation?.items || []"
                  :key="`operation_${index}_${curSearchOptions?.pageIndex || 0}`"
                >
                  <c-action v-if="it.action" v-bind="getOperationActionAttrs(it, scope)" class="q-ml-sm"></c-action>
                  <!-- 如果有items配置，走“更多操作”样式 -->
                  <c-more-action v-else-if="it.items?.length" :label="it.label" v-bind="it">
                    <c-action
                      v-for="(_it, key) in it.items || []"
                      :key="`operation_more_${index}_${key}_${curSearchOptions?.pageIndex || 0}`"
                      v-bind="getOperationActionAttrs(_it, scope)"
                      class="q-ml-sm"
                      style="display: block"
                    ></c-action>
                  </c-more-action>
                  <cmpt
                    v-else-if="it.cmpt"
                    :config="it.cmpt"
                    v-bind="{ onSubmit: doSearch, ...it }"
                    :context-data="scope"
                  />
                  <component
                    v-else-if="it.componentType"
                    :is="it.componentType"
                    :model="scope.row"
                    v-bind="{ onSubmit: doSearch, ...it }"
                    :context-data="scope"
                  />
                  <widget v-else-if="it.type" :schema="it" />
                </template>
              </template>
            </c-table>
          </div>
        </div>
      </div>
    </div>

    <!-- v-bind="dialogAttrs"写在下面 -->
    <c-dialog
      v-if="activeAction?.dialog && !dialogClose"
      ref="dialogRef"
      v-loading="dialogLoading"
      :on-submit="handleDialogSubmit"
      @close="handleDialogClose"
      v-bind="dialogAttrs"
    ></c-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  _,
  ref,
  tpl,
  computed,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
  useCurrentAppInstance,
  PAGE_SEARCH_EVENT_KEY,
  PAGE_SEARCH_DATA_KEY
} from '@zto/zpage'

import { appUtil } from '../../utils'
import { UI_GLOBAL_EVENTS } from '../../consts'
import { DEFAULT_ACTIONS } from './consts'

import ColumnsFilter from './columns-filterer.vue'

import type { PageContext } from '@zto/zpage'

// 属性
const props = defineProps<{
  schema: Record<string, any>
  contextData?: Record<string, any>
}>()

const app = useCurrentAppInstance()

const router = app.router
const route = app.useRoute()

const emitter = app.emitter
const apiRequest = app.request // api请求
const { MessageBox, Message } = app.useMessage() // 请求

const fsApi = app.apis.fsApi

const crudConfig = app.useWidgetsConfig('crud', {})
const tableConfig = app.useComponentsConfig('table', {})

// 数据属性
const dataProp = tableConfig?.data?.dataProp || 'data'

const wSchema = app.useWidgetSchema(props.schema)

// 注册微件事件监听
app.useWidgetEmitter(wSchema, { searchOn: () => doSearch })

// Tab切换时重新布局（防止tab错位）
emitter.on(UI_GLOBAL_EVENTS.PAGE_TAB_CHANGE, () => {
  nextTick(() => {
    doLayout()
  })
})

// 活动 schema
const sSection = app.useWidgetSchema(wSchema.section || {})

// 活动 schema
const sActions = app.useWidgetSchema(wSchema.actions || {})

// 查询 schema
const sSearch = app.useWidgetSchema(wSchema.search || {})

// 工具栏 schema
const sToolbar = app.useWidgetSchema(wSchema.toolbar || {})

// 表格 schema
const sTable = app.useWidgetSchema(wSchema.table || {})

// 树形相关schema
const sTree = app.useWidgetSchema(sTable.tree || {})

const innerColumns = ref<any[]>([])
innerColumns.value = Array.isArray(sTable.columns) ? sTable.columns : []

// 查询数据模型
const searchModel = reactive(sSearch?.model || {})

// 查询数据结果
const searchResult = ref<any>()

// 当前激活的活动
const activeAction = ref<any>({})

// 组件引用
const tableRef = ref<any>() // 表格组件
const dialogRef = ref<any>() // 弹出框
const searchFormRef = ref<any>() // 查询框

// 组件上下文数据
const innerContextData = computed(() => {
  const tableData = tableRef.value?.tableData || {}

  return {
    contextData: props.contextData, // 上下文
    searchResult: searchResult.value, // 查询结果
    search: searchModel.value, // 查询表单数据
    result: searchResult.value, // 查询结果
    tableData: tableData, // 表格数据
    rows: tableData.data, // 表格行数据
    summary: tableData.summary // 表格汇总
  }
})

// ----- 生命周期相关 ----->
onMounted(async () => {
  const context = app.useContext()

  // 注册页面搜索处理
  app.ons(PAGE_SEARCH_EVENT_KEY, pageSearchHandler)

  if (_.isFunction(sTable.columns)) {
    innerColumns.value = await Promise.resolve().then(() => {
      return sTable.columns.call(this, context) || []
    })
  }

  // 立即查询
  if (sSearch.immediate !== false) {
    await doSearch()
  }
})

onBeforeUnmount(() => {
  // 解除页面搜索处理
  app.offs(PAGE_SEARCH_EVENT_KEY, pageSearchHandler)
})

async function pageSearchHandler(event: any) {
  const { resetPager, refreshPager } = (event || {}) as any

  await doSearch(resetPager, refreshPager)
}

// ----- 模块相关 ----->
const sectionStyle = computed(() => ({
  height: sSection.height || '100%',
  ...wSchema.style
}))

const sectionClass = computed(() => wSchema.class)

// ----- 查询相关 ----->

// 表格加载
const searchLoading = ref(false)

// 收起查询
const expandedSearch = ref<boolean>(!!sSearch)

const searchFormAttrs = computed(() => {
  return {
    span: sSearch.span || 6,
    items: sSearch.items,
    api: sSearch.api || sActions.query?.api,
    labelWidth: sSearch.labelWidth,
    noResetProps: sSearch.noResetProps,
    ...sSearch.innerAttrs?.form
  }
})

// 查询表单
const searchItemsAttrs = computed(() => {
  return {
    span: sSearch.span || 6,
    items: sSearch.items,
    api: sSearch.api || sActions.query?.api,
    ...sSearch.innerAttrs?.formItems
  }
})

// 执行查询
async function handleSearch() {
  const valid = await searchFormRef.value.validate()
  if (valid) await doSearch(true)
}

// 执行重写加载
async function handleRefresh() {
  await doSearch(false, false)
}

// 按键查询
function handleKeyup(event: KeyboardEvent) {
  if (event.code == 'Enter') doSearch(true)
}

// 执行重设
function handleSearchReset() {
  searchFormRef.value.resetFields(true)
  if (sSearch.onReset) {
    sSearch.onReset(searchModel)
  }
}

function toggleExpandSearch() {
  expandedSearch.value = !expandedSearch.value
}

// ----- 工具栏相关 ----->

const noToolbar = sToolbar.hidden === true

// 关闭工具栏扩展
const noToolbarExtra = computed(() => {
  if (_.isBoolean(sToolbar.noExtra)) return sToolbar.noExtra
  return crudConfig?.toolbar?.noExtra === true
})

// 获取工具栏动作属性
function getToolbarActionAttrs(config: any) {
  const name = config.action
  const actionAttrs = {
    name,
    trigger: () => triggerAction(actionAttrs),
    ...(DEFAULT_ACTIONS as any)[name],
    ...sActions[config.action],
    ..._.omit(config, ['action'])
  }

  if (actionAttrs.actionType === 'import') {
    actionAttrs.successMessage = actionAttrs.successMessage || '数据导入成功！'
    actionAttrs.onSubmit = actionAttrs.onSubmit || (() => doSearch())
  }

  if (actionAttrs.componentType) {
    actionAttrs.componentType = app.resolveComponent(actionAttrs.componentType)
  }

  return actionAttrs
}

// ----- 表格相关 ----->

/** 可见列 */
const innerVisibleColumns = ref<any[]>([])

const columnsFilterable = computed(() => {
  if (_.isBoolean(sTable.columnsFilterable)) return sTable.columnsFilterable
  return crudConfig.table?.columnsFilterable === true
})

// 行属性类型
const columnPropTypes = computed(() => {
  const propTypes = innerColumns.value.reduce((acc: any, cur: any) => {
    if (cur.propType) acc[cur.propType] = cur.prop
    return acc
  }, (sTable.propTypes || {}) as any)

  return propTypes
})

const tableAttrs = computed(() => {
  const exportOptions = { fileName: route.meta.label, ...crudConfig.table?.export, ...sTable.export }

  // 树形表格相关
  const treeOptions = {
    rowKey: sTree.rowKey,
    lazy: _.isBoolean(sTree.lazy) ? sTree.lazy : true,
    treeProps: { chilren: sTree.childrenProp, hasChildren: sTree.hasChildrenProp },
    loadWithCondition: _.isBoolean(sTree.withCondition) ? sTree.withCondition : true
  }

  const columns = columnsFilterable.value ? innerVisibleColumns.value : innerColumns.value

  return {
    border: sTable.border !== false,
    action: sActions.query,
    editable: sTable.editable,
    batchEditable: sTable.batchEditable,
    columns,
    noOperation: _.isBoolean(sTable.noOperation) ? sTable.noOperation : !sTable.operation,
    operationWidth: sTable.operation?.width,
    showFixed: sTable.showFixed !== false,
    showCheckbox: sTable.showCheckbox,
    noIndex: _.isBoolean(sTable.noIndex) ? sTable.noIndex : sTable.showCheckbox,
    selectableFn: sTable.checkboxSelectable,
    showSummary: sTable.showSummary,
    summaryText: sTable.summaryText || sTable.sumText,
    noPager: sTable.noPager,
    dataColumns: sTable.dataColumns,
    data: sActions.query?.data,
    loadMethod: tableLoadFn,
    export: { ...exportOptions },
    ...treeOptions,
    ...sTable.innerAttrs
  }
})

const selectedRows = computed(() => {
  return tableRef.value?.selectedRows || []
})

/** 显示列发生变化 */
function handleColumnsFilterChange(visibleColumns: any[]) {
  innerVisibleColumns.value = visibleColumns || []

  nextTick(() => {
    doLayout(true)
  })
}

/** 编辑内容提交触发 */
function handleEditorSubmit() {
  doSearch()
}

/** 编辑内容提交触发 */
function handleBatchEditorSubmit() {
  doSearch()
}

function handleTableFetch(payload: any, resetPager: boolean) {
  doSearch(resetPager)
}

// 获取操作列活动熟悉
function getOperationActionAttrs(options: any, scope: any) {
  const name = options.action

  const defConfig = (DEFAULT_ACTIONS as any)[name]
  const actConfig = sActions[name] || {}
  const optConfig = _.omit(options, ['action'])

  // 合并配置
  const mergedConfig = _.deepMerge2([{ innerAttrs: { button: { type: 'text' } } }, defConfig, actConfig, optConfig])
  const actionAttrs = { contextData: scope, name, scope, ...mergedConfig }

  const configPayload = actConfig.payload || optConfig.payload
  if (typeof configPayload === 'function') {
    actionAttrs.payload = configPayload
  } else {
    actionAttrs.payload = _.deepMerge({}, configPayload, actConfig.defaults, optConfig.defaults)
  }

  actionAttrs.trigger = () => {
    triggerAction(actionAttrs)
  }

  if (actionAttrs.componentType) {
    actionAttrs.componentType = app.resolveComponent(actionAttrs.componentType)
  }

  return actionAttrs
}

/** 获取行编号（用于唯一标识一行） */
function getRowCode(row: any) {
  return columnPropTypes.value.code ? row[columnPropTypes.value.code] : null
}

/** 获取行编号（用于提示） */
function getRowName(row: any) {
  return columnPropTypes.value.name ? row[columnPropTypes.value.name] : ''
}

// ----- 弹出框相关 ----->
// 对话框loading
const dialogLoading = ref(false)
const dialogClose = ref(false)

const dialogAttrs = computed(() => {
  const actionCfg = activeAction.value
  if (!actionCfg || !actionCfg.dialog) return

  let dialogAttrs = { ...actionCfg.dialog, ...actionCfg.innerAttrs?.dialog }

  if (typeof actionCfg.dialog === 'function') {
    const context = app.useContext(actionCfg.contextData)
    dialogAttrs = actionCfg.dialog(context, actionCfg)
  }

  const title = app.filter(dialogAttrs.title || actionCfg.title || actionCfg.label, actionCfg.contextData)

  return { ...dialogAttrs, title }
})

// 执行提交
// 传给CDialog组件的onSubmit
async function handleDialogSubmit(model: any, options: any) {
  const actionCfg = { ...activeAction.value, ...options }

  const context = app.useContext(model)

  const extData = tpl.deepFilter(dialogAttrs.value?.extData, context)
  const payload = _.deepMerge({}, extData, model)

  return await doAction(actionCfg.api, payload, actionCfg) // 返回doAction的结果，默认是undefined，如果父组件定义了onAction可以定义返回false
}

// 执行关闭
function handleDialogClose(args: any) {
  dialogClose.value = true

  const options = args.options
  if (options?.triggerSuccess && options?.reloadAfterSuccess === true) {
    doSearch()
  }
}

// ----- 布局相关 ----->

const toolbarStyle = computed(() => {
  return {
    height: sToolbar.height,
    ...sToolbar.style
  }
})

// 表格布局样式，主要为了兼容toolbar高度
const bodyStyle = computed(() => {
  const _style: any = {}

  if (sToolbar.height) {
    _style.height = `calc(100% - ${sToolbar.height})`
  }

  return _style
})

// ----- 通用代码 ----->

// 触发活动
async function triggerAction(actionCfg: any) {
  activeAction.value = actionCfg
  if (!actionCfg) return

  const context = app.useContext(actionCfg.contextData)

  const actionData = await buildActionData(actionCfg, context)

  // 构建数据问题，则不执行接下来的代码
  if (!actionData) return

  actionCfg.label = actionCfg.label || '操作'

  if (actionCfg.actionType === 'export') {
    await doAsyncExport(actionCfg.api, actionCfg, context)
  } else if (actionCfg.actionType === 'download') {
    if (!actionCfg.link) return
    const link = tpl.filter(actionCfg.link, context)
    await fsApi.downloadFile!(link, { ...actionCfg })
  } else if (actionCfg.link) {
    const link = tpl.deepFilter(actionCfg.link, context)
    await router.goto(link)
  } else if (actionCfg.event) {
    emitter.emits(actionCfg.event, actionData)
  } else if (actionCfg.dialog) {
    dialogClose.value = false
    nextTick(() => {
      dialogRef.value?.show(actionData)
    })
  } else if (actionCfg.message === false) {
    // message为false时
    if (actionCfg.api) {
      return doAction(actionCfg.api, actionData, actionCfg)
    }
  } else {
    const messageCfg: any =
      tpl.filter(actionCfg.message, {
        data: actionCfg.contextData,
        selectedCount: selectedRows.value?.length
      }) || `确认${actionCfg.label}选中的记录？`

    let msgConfig: any = _.isString(messageCfg)
      ? { boxType: 'confirm', type: 'warning', showCancelButton: true, message: messageCfg }
      : {
          ...messageCfg,
          boxType: 'confirm' || messageCfg.boxType,
          type: messageCfg.type || 'warning',
          message: messageCfg.message
        }

    msgConfig.title = msgConfig.title || '提示'
    msgConfig = { showCancelButton: true, cancelButtonText: '取消', confirmButtonText: '确定', ...msgConfig }

    msgConfig = tpl.deepFilter(msgConfig, context)
    await MessageBox(msgConfig).then(() => {
      return doAction(actionCfg.api, actionData, actionCfg)
    })
  }
}

// 构建活动参数
async function buildActionData(actionCfg: any, context: PageContext) {
  let actionData: any = {}

  if (typeof actionCfg.payload === 'function') {
    const searchParams = getSearchParams()
    actionData = await Promise.resolve().then(() =>
      actionCfg.payload(context, {
        ...innerContextData.value,
        selection: selectedRows.value,
        searchParams
      })
    )
  } else if (Array.isArray(actionCfg.payload)) {
    const rowData = context.data.row || {}
    actionData = actionCfg.payload.reduce((obj: any, key: string) => {
      if (key) obj[key] = rowData[key]
      return obj
    }, {})
  } else if (actionCfg.payload && !_.isEmptyObject(actionCfg.payload)) {
    actionData = app.deepFilter(actionCfg.payload, context.data)
  } else {
    actionData = _.deepClone(_.omit(actionCfg.scope?.row, ['__innerTexts']))
  }

  let targetTypes: string[] = []
  if (_.isString(actionCfg.targetType)) {
    targetTypes = [actionCfg.targetType]
  }

  // 处理选中项
  if (targetTypes.includes('selected')) {
    // 判断当前有没有选中项
    if (!selectedRows.value.length) {
      const noSelectMessage = actionCfg.noSelectMessage || `请先选择需要${actionCfg.label}的记录`
      Message.warning(noSelectMessage)
      return
    }

    // 批量参数
    if (actionCfg.batchPayload) {
      const batchPayloadTmpl = actionCfg.batchPayload
      const batchPayload: any = {}

      Object.keys(batchPayloadTmpl).forEach(key => {
        if (!Array.isArray(batchPayloadTmpl[key])) {
          batchPayload[key] = tpl.deepFilter(batchPayloadTmpl[key], context)
        } else if (batchPayloadTmpl[key][0]) {
          const batchTmpl = batchPayloadTmpl[key][0]
          batchPayload[key] = []

          selectedRows.value.forEach((row: any) => {
            batchPayload[key].push(app.deepFilter(batchTmpl, { ...context?.data, row }))
          })
        }
      })

      actionData = { ...actionData, ...batchPayload }
    }
  }

  if (targetTypes.includes('search')) {
    const searchParams = getSearchParams()
    actionData = { ...actionData, searchParams }
  }

  return actionData
}

// table重新布局
function doLayout(force = false) {
  tableRef.value?.doLayout(force)
}

// 执行活动
async function doAction(action: any, payload: any, options?: any) {
  // 如果有onAction，则返回其结果flag，如果是false，不触发查询，给二次确认弹窗做铺垫
  if (options?.onAction) {
    const ctx = app.useContext(payload)
    const flag = await Promise.resolve().then(() => options.onAction!(ctx, options))

    if (flag !== false && options?.reload !== false) return doSearch()
    return flag
  }

  if (!action) {
    if (options?.reload !== false) return doSearch()
    return
  }

  dialogLoading.value = true

  await apiRequest({
    action,
    data: payload
  })
    .then(res => {
      if (options?.successMessage !== false) {
        Message.success(options?.successMessage || `${options.label || '操作'}成功！`)
      }

      if (options?.reload !== false) return doSearch()
    })
    .finally(() => {
      dialogLoading.value = false
    })
}

const curSearchOptions = ref<any>()

// 执行查询
async function doSearch(resetPager = false, refreshPager = false) {
  if (!tableRef.value) return

  if (resetPager === true) {
    tableRef.value.resetPager()
    tableRef.value.clearSort()
  }

  const queryAction = sActions.query || {}

  if (!queryAction.api) {
    tableRef.value.setData(queryAction.data || [])
    return
  }

  const pager = tableRef.value.pager
  const sort = tableRef.value.getSort()

  let searchParams = getSearchParams()

  const context = app.useContext()

  if (sSearch.beforeSearch) {
    const beforeSearchRes = await Promise.resolve().then(() =>
      sSearch.beforeSearch({ ...context, pager, resetPager, refreshPager, searchParams, queryAction })
    )

    if (!_.isUndefined(beforeSearchRes)) searchParams = beforeSearchRes
  }

  if (!refreshPager) {
    curSearchOptions.value = {
      pageIndex: pager.pageIndex,
      pageSize: pager.pageSize,
      pageSort: sort,
      noPager: sTable.noPager,
      action: { ...queryAction, type: 'query' },
      params: searchParams
    }
  }

  searchLoading.value = true

  await apiRequest(curSearchOptions.value)
    .then(async res => {
      if (sSearch.afterSearch) {
        const afterSearchRes = await Promise.resolve().then(() =>
          sSearch.afterSearch({ ...context, pager, resetPager, searchParams, queryAction }, res)
        )

        if (!_.isUndefined(afterSearchRes)) res = afterSearchRes
      }

      pager.curPageIndex = pager.pageIndex

      searchResult.value = res

      tableRef.value?.setData(searchResult.value)
    })
    .finally(() => {
      searchLoading.value = false
    })
}

function getSearchParams() {
  const queryAction = sActions.query || {}

  const context = app.useContext(searchModel)

  const apiParams = app.deepFilter(queryAction?.apiParams, context)
  const extData = app.deepFilter(sSearch?.extData, context)

  const pageSearchData = app.getPageData(PAGE_SEARCH_DATA_KEY)

  let searchParms = _.deepMerge(pageSearchData, extData, apiParams, searchModel)

  // 清理查询空格
  searchParms = _.shallowTrim(searchParms)

  return searchParms
}

// 异步导出
async function doAsyncExport(api?: string, options?: any, context?: any) {
  if (!tableRef.value) return

  const exportConfig = crudConfig.export || {}

  api = api || exportConfig.api

  const data = tableRef.value.getData()
  if (!data?.length) {
    Message.warning('请先查询出数据')
    return
  }

  const queryAction = sActions.query || {}
  let searchParams = getSearchParams()

  if (options?.beforeExport) {
    const flag = await Promise.resolve().then(() => options?.beforeExport(context, { ...options, searchParams }))
    if (flag === false) return
  }

  // 获取导出参数
  const getExportParamsMethod = exportConfig.getExportParams || options.getExportParams

  let reqParams: any = {}

  if (getExportParamsMethod) {
    reqParams = getExportParamsMethod(options, context)
  } else {
    if (options?.exSearchParams) {
      searchParams = { ...searchParams, ...options?.exSearchParams }
    }

    const searchParamProp = options.searchParamProp || exportConfig.searchParamProp || 'search'

    // 导出类型
    const searchTypeProp = options.searchTypeProp || exportConfig.searchTypeProp || 'exportType'
    const searchType = options.exportType || options.type

    reqParams = { [searchTypeProp]: searchType, [searchParamProp]: searchParams, ...options.apiParams }
  }

  await apiRequest({
    action: { ...queryAction, api, type: 'export' },
    params: reqParams
  })

  if (options?.openDownloads !== false) {
    appUtil.openDownloadsDialog()
  }

  setTimeout(() => {
    Message.success(options?.successMessage || '导出成功！')
  }, 100)
}

// 导出
async function doExport() {
  if (!tableRef.value) return

  tableRef.value.exportData()
}

// 展开所有树形节点
const expandToggleFlag = ref<boolean>(true)

async function doToggleExpand() {
  if (!tableRef.value) return
  tableRef.value.expandAll(expandToggleFlag.value)
  expandToggleFlag.value = !expandToggleFlag.value
}

async function tableLoadFn(row: any, node: any, resolve: Function) {
  let parentProp = tableAttrs.value.parentProp
  let rowKey = tableAttrs.value.rowKey

  // 树形相关数据
  if (sTree) {
    rowKey = sTree.rowKey || 'id'
    parentProp = sTree.parentProp || 'pid'
  }

  if (!rowKey || !parentProp) return

  const queryAction = sActions.query || {}
  if (!queryAction.api) return

  let loadParams: any = { [parentProp]: row[rowKey] }

  if (tableAttrs.value.loadWithCondition) {
    const searchParams = getSearchParams()
    loadParams = { ...searchParams, ...loadParams }
  }

  await apiRequest({
    pageIndex: 1,
    pageSize: 1000,
    noPager: sTable.noPager,
    action: { ...queryAction, type: 'query' },
    params: loadParams
  })
    .then(res => {
      resolve(res[dataProp])
    })
    .finally(() => {
      searchLoading.value = false
    })
}
</script>

<style lang="scss" scoped>
.w-crud {
  --toolbar-height: 50px;

  height: 100%;
  background: var(--section-color);
  padding: 16px 16px 8px 16px;
  box-sizing: border-box;

  .w-crud__con {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .w-crud__search {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 4px;
  }

  .w-crud__content {
    flex: 1;
    flex-grow: 1;
    height: 100%;
    position: relative;

    &-body {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .w-crud__body {
      height: calc(100% - var(--toolbar-height));
    }
  }

  .w-crud__toolbar {
    padding: 10px 0;
    display: flex;
    line-height: 28px;
    box-sizing: border-box;

    & > .toolbar {
      &__line {
        width: 4px;
        height: 16px;
        margin: 4px 8px 0 0;
        background-color: var(--primary);
        border-radius: 8px;
      }

      &__actions {
        flex: 1;
        line-height: 23px;
      }
    }
  }

  .w-crud__con {
    &.no-toolbar {
      .w-crud__body {
        height: 100%;
      }
    }
  }
}
</style>
