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
                  @click="handleSearch"
                >
                  查询
                </el-button>
                <el-button v-else :loading="searchLoading" type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleSearchReset">重置</el-button>
              </template>
            </c-form-items>
          </c-form>
        </div>
      </el-collapse-transition>

      <!-- 表格信息 -->
      <div class="w-crud__content">
        <div class="w-crud__content-body">
          <div v-if="!noToolbar" class="w-crud__toolbar">
            <div class="toolbar__line"></div>
            <div class="toolbar__actions">
              <template v-for="(it, index) in sToolbar?.items || []" :key="`tool_${String(index)}`">
                <el-button
                  v-if="it.action === 'toggle-expand'"
                  type="primary"
                  v-bind="getToolbarActionAttrs(it)"
                  class="q-ml-md"
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
            <div class="toolbar__extra">
              <slot name="tools">
                <div class="u-flex">
                  <slot name="extra" />
                  <template v-if="sSearch">
                    <el-divider direction="vertical" class="content__divider" />
                    <div class="inline">
                      <el-button v-if="!sToolbar.noRefresh" type="text" class="q-ml-md" @click="handleRefresh">
                        刷新
                        <i class="el-icon-refresh-right"></i>
                      </el-button>
                      <el-button v-if="!sToolbar.noExport" type="text" class="q-ml-md" @click="doExport">
                        导出
                        <i class="el-icon-download"></i>
                      </el-button>
                      <el-button
                        v-if="!sToolbar.noSearchHide"
                        v-show="sSearch.hidden !== true"
                        type="text"
                        class="q-ml-md"
                        @click="toggleExpandSearch"
                      >
                        {{ expandedSearch ? '隐藏筛选' : '展开筛选' }}
                        <i :class="expandedSearch ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                      </el-button>
                    </div>
                  </template>
                </div>
              </slot>
            </div>
          </div>

          <!-- 主体内容部分-->
          <div v-loading="searchLoading" class="w-crud__body">
            <c-table
              ref="tableRef"
              class="w-crud__table"
              v-bind="tableAttrs"
              @editor-submit="handleEditorSubmit"
              @batch-editor-submit="handleBatchEditorSubmit"
              @fetch="handleTableFetch"
            >
              <template #operation="scope">
                <template v-for="(it, index) in sTable?.operation?.items || []" :key="`operation_${String(index)}`">
                  <c-action v-if="it.action" v-bind="getOperationActionAttrs(it, scope)" class="q-ml-sm"></c-action>
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

    <c-dialog
      v-if="activeAction?.dialog && !dialogClose"
      ref="dialogRef"
      v-bind="dialogAttrs"
      v-loading="dialogLoading"
      :on-submit="handleDialogSubmit"
      @close="handleDialogClose"
    ></c-dialog>
  </div>
</template>

<script setup lang="ts">
import { _, tpl, computed, reactive, ref, onMounted, nextTick, useCurrentAppInstance } from '@zto/zpage'

import { appUtil } from '../../utils'
import { UI_GLOBAL_EVENTS } from '../../consts'
import { DEFAULT_ACTIONS } from './consts'

import type { PageContext } from '@zto/zpage'

// 属性
const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

const router = app.router

const emitter = app.emitter
const apiRequest = app.request // api请求
const { MessageBox, Message } = app.useMessage() // 请求

const fsApi = app.apis.fsApi

const crudConfig = app.useWidgetsConfig('crud', {})
const tableConfig = app.useComponentsConfig('table.data', {})

// 数据属性
const dataProp = tableConfig?.data?.dataProp || 'data'

const wSchema = app.useWidgetSchema(props.schema)

// 注册微件事件监听
app.useWidgetEmitter(wSchema, { searchOn: doSearch })

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
  return {
    searchResult: searchResult.value
  }
})

// ----- 生命周期相关 ----->
onMounted(async () => {
  const context = app.useContext()

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

  return actionAttrs
}

// ----- 表格相关 ----->

// 行属性类型
const columnPropTypes = computed(() => {
  const propTypes = innerColumns.value.reduce((acc: any, cur: any) => {
    if (cur.propType) acc[cur.propType] = cur.prop
    return acc
  }, (sTable.propTypes || {}) as any)

  return propTypes
})

const tableAttrs = computed(() => {
  return {
    border: sTable.border !== false,
    action: sActions.query,
    editable: sTable.editable,
    batchEditable: sTable.batchEditable,
    columns: innerColumns.value,
    noOperation: _.isBoolean(sTable.noOperation) ? sTable.noOperation : !sTable.operation,
    operationWidth: sTable.operation?.width,
    showFixed: sTable.showFixed !== false,
    showCheckbox: sTable.showCheckbox,
    noIndex: _.isBoolean(sTable.noIndex) ? sTable.noIndex : sTable.showCheckbox,
    selectableFn: sTable.checkboxSelectable,
    showSummary: sTable.showSummary,
    summaryText: sTable.summaryText || sTable.sumText,
    noPager: sTable.noPager,
    data: sActions.query?.data,
    loadMethod: tableLoadFn,
    ...sTable.innerAttrs
  }
})

const selectedRows = computed(() => {
  return tableRef.value?.selectedRows || []
})

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
async function handleDialogSubmit(model: any) {
  const actionCfg = activeAction.value
  if (!actionCfg) return

  const context = app.useContext(model)

  const extData = tpl.deepFilter(dialogAttrs.value?.extData, context)
  const payload = _.deepMerge({}, extData, model)

  await doAction(actionCfg.api, payload, actionCfg)
}

// 执行关闭
function handleDialogClose() {
  dialogClose.value = true
}

// ----- 通用代码 ----->

// 触发活动
async function triggerAction(actionCfg: any) {
  activeAction.value = actionCfg
  if (!actionCfg) return

  const context = app.useContext(actionCfg.contextData)

  const actionData = buildActionData(actionCfg, context)

  actionCfg.label = actionCfg.label || '操作'

  if (actionCfg.actionType === 'export') {
    await doAsyncExport(actionCfg.api, actionCfg, context)
  } else if (actionCfg.actionType === 'download') {
    if (!actionCfg.link) return
    const link = tpl.deepFilter(actionCfg.link, context)
    await fsApi.downloadFile!(link, actionCfg)
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
  } else {
    const messageCfg: any =
      tpl.filter(actionCfg.message, {
        data: actionCfg.contextData,
        selectedCount: selectedRows.value?.length
      }) || `确认${actionCfg.label}选中的记录？`

    let msgConfig: any = _.isString(messageCfg)
      ? {
          boxType: 'confirm',
          type: 'warning',
          showCancelButton: true,
          message: messageCfg
        }
      : {
          ...messageCfg,
          boxType: 'confirm' || messageCfg.boxType,
          type: messageCfg.type || 'warning',
          message: messageCfg.message
        }

    msgConfig.title = msgConfig.title || '提示'
    msgConfig = {
      showCancelButton: true,
      cancelButtonText: '取消',
      confirmButtonText: '确定',
      ...msgConfig
    }

    msgConfig = tpl.deepFilter(msgConfig, context)
    await MessageBox(msgConfig).then(() => {
      return doAction(actionCfg.api, actionData, actionCfg)
    })
  }
}

// 构建活动参数
function buildActionData(actionCfg: any, context: PageContext) {
  let actionData: any = {}

  if (typeof actionCfg.payload === 'function') {
    actionData = actionCfg.payload(context, { selection: selectedRows.value })
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
function doLayout() {
  tableRef.value?.doLayout()
}

// 执行活动
async function doAction(action: any, payload: any, options?: any) {
  if (options?.onAction) {
    const ctx = app.useContext(payload)

    const flag = await Promise.resolve().then(() => {
      return options.onAction!(ctx, options)
    })

    if (flag !== false && options?.reload !== false) return doSearch()

    return
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
      if (options?.reload !== false) return doSearch()
      if (options?.sucessMessage !== false) {
        Message.success(options?.sucessMessage || `${options.label || '操作'}成功！`)
      }
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
  }

  const queryAction = sActions.query || {}

  if (!queryAction.api) {
    tableRef.value.setData(queryAction.data || [])
    return
  }

  const pager = tableRef.value.pager

  let searchParams = getSearchParams()

  const context = app.useContext()

  if (sSearch.beforeSearch) {
    const beforeSearchRes = await Promise.resolve().then(() =>
      sSearch.beforeSearch({
        ...context,
        pager,
        resetPager,
        refreshPager,
        searchParams,
        queryAction
      })
    )

    if (!_.isUndefined(beforeSearchRes)) searchParams = beforeSearchRes
  }

  if (!refreshPager) {
    curSearchOptions.value = {
      pageIndex: pager.pageIndex,
      pageSize: pager.pageSize,
      noPager: sTable.noPager,
      action: { ...queryAction, type: 'query' },
      params: searchParams
    }
  }

  await apiRequest(curSearchOptions.value)
    .then(async res => {
      if (sSearch.afterSearch) {
        const afterSearchRes = await Promise.resolve().then(() =>
          sSearch.afterSearch(
            {
              ...context,
              pager,
              resetPager,
              searchParams,
              queryAction
            },
            res
          )
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

  appUtil.openDownloadsDialog()

  setTimeout(() => {
    Message.success(options?.successMessage || '导出成功！')
  }, 100)
}

function getSearchParams() {
  const queryAction = sActions.query || {}

  const context = app.useContext(searchModel)

  const apiParams = app.deepFilter(queryAction?.apiParams, context)
  const extData = app.deepFilter(sSearch?.extData, context)

  const searchParms = _.deepMerge(extData, apiParams, searchModel)

  return searchParms
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
  const parentProp = tableAttrs.value.parentProp
  const rowKey = tableAttrs.value.rowKey
  if (!parentProp || !rowKey) return

  const queryAction = sActions.query || {}
  if (!queryAction.api) return

  await apiRequest({
    pageIndex: 1,
    pageSize: 1000,
    noPager: sTable.noPager,
    action: { ...queryAction, type: 'query' },
    params: { [parentProp]: row[rowKey] }
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
$toolbar-height: 50px;

.w-crud {
  height: 100%;
  background: $section-color;
  padding: 16px 16px 8px 16px;
  box-sizing: border-box;
}

.w-crud__con {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.w-crud__search {
  border-bottom: 1px solid $border-color;
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
    height: calc(100% - $toolbar-height);
  }
}

.w-crud__toolbar {
  padding: 10px 0;
  display: flex;

  & > .toolbar {
    &__line {
      width: 4px;
      height: 16px;
      margin: 4px 8px 0 0;
      background-color: $primary;
      border-radius: 8px;
    }

    &__actions {
      flex: 1;
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
</style>
