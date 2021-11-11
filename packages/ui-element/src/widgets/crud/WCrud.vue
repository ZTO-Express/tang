<template>
  <div class="w-crud" :style="sectionStyle">
    <div class="w-crud__con" :class="{ 'no-toolbar': noToolbar }">
      <!-- 搜索区域 -->
      <el-collapse-transition v-if="!!sSearch">
        <div v-show="expandedSearch && sSearch?.hidden !== true" class="w-crud__search">
          <c-form
            ref="searchFormRef"
            v-bind="searchFormAttrs"
            :model="searchModel"
            @keyup="handleKeyup"
          >
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
                <el-button v-else :loading="searchLoading" type="primary" @click="handleSearch">
                  查询
                </el-button>
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
                <c-action
                  v-if="it.action"
                  v-bind="getToolbarActionAttrs(it)"
                  class="q-ml-md"
                ></c-action>
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
                      <el-button type="text" class="q-ml-md" @click="doSearch">
                        刷新
                        <i class="el-icon-refresh-right"></i>
                      </el-button>

                      <el-button
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
              :on-editor-submit="handleEditorSubmit"
              @fetch="handleTableFetch"
            >
              <template #operation="scope">
                <template
                  v-for="(it, index) in sTable?.operation?.items || []"
                  :key="`operation_${String(index)}`"
                >
                  <c-action
                    v-if="it.action"
                    v-bind="getOperationActionAttrs(it, scope)"
                    class="q-ml-sm"
                  ></c-action>
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
import { computed, reactive, ref, onMounted, nextTick } from 'vue'
import {
  _,
  tpl,
  emitter,
  useRouter,
  useWidgetEmitter,
  useWidgetSchema,
  useApiRequest,
  useAppContext
} from 'zpage'

import { useMessage } from '../../composables'
import { DEFAULT_ACTIONS } from './consts'

// 属性
const props = defineProps<{
  schema: GenericObject
}>()

const router = useRouter()

// api请求
const apiRequest = useApiRequest()

// 请求
const { MessageBox, Message } = useMessage()

const wSchema = await useWidgetSchema(props.schema)

// 注册微件事件监听
useWidgetEmitter(wSchema, {
  searchOn: doSearch
})

// 活动 schema
const sSection = await useWidgetSchema(wSchema.section || {})

// 活动 schema
const sActions = await useWidgetSchema(wSchema.actions || {})

// 查询 schema
const sSearch = await useWidgetSchema(wSchema.search || {})

// 工具栏 schema
const sToolbar = await useWidgetSchema(wSchema.toolbar || {})

// 表格 schema
const sTable = await useWidgetSchema(wSchema.table || {})
const innerColumns = ref<any[]>([])

innerColumns.value = Array.isArray(sTable.columns) ? sTable.columns : []

// 查询数据模型
const searchModel = reactive(sSearch?.model || {})

// 当前激活的活动
const activeAction = ref<any>({})

// 组件引用
const tableRef = ref<any>() // 表格组件
const dialogRef = ref<any>() // 弹出框
const searchFormRef = ref<any>() // 查询框

// ----- 生命周期相关 ----->
onMounted(async () => {
  const context = useAppContext()

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
const sectionStyle = computed(() => {
  return {
    height: sSection.height || '100%'
  }
})

// ----- 查询相关 ----->

// 表格加载
const searchLoading = ref(false)

// 收起查询
const expandedSearch = ref<boolean>(!!sSearch)

if (sSearch?.items?.length) {
  sSearch?.items.forEach((it: any) => {
    if (_.isUndefined(searchModel[it.prop])) {
      searchModel[it.prop] = it.default || null
    }
  })
}

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
  await searchFormRef.value.validate()
  await doSearch()
}

// 按键查询
function handleKeyup(event: KeyboardEvent) {
  if (event.code == 'Enter') doSearch()
}

// 执行重设
function handleSearchReset() {
  searchFormRef.value.resetFields()
}

function toggleExpandSearch() {
  expandedSearch.value = !expandedSearch.value
}

// ----- 工具栏相关 ----->

const noToolbar = sToolbar.hidden === true

// 获取工具栏动作属性
function getToolbarActionAttrs(config: any) {
  const name = config.action
  const actionAttrs = Object.assign(
    {
      name,
      trigger: () => triggerAction(actionAttrs)
    },
    (DEFAULT_ACTIONS as any)[name],
    { ...sActions[config.action] },
    _.omit(config, ['action'])
  )

  if (actionAttrs.actionType === 'import') {
    actionAttrs.successMessage = actionAttrs.successMessage || '数据导入成功！'
    actionAttrs.onSubmit =
      actionAttrs.onSubmit ||
      (() => {
        doSearch()
      })
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
    operationWidth: sTable.operation?.width,
    noPager: sTable.noPager,
    noOperation: sTable.noOperation,
    showFixed: sTable.showFixed !== false,
    showCheckbox: sTable.showCheckbox,
    showSummary: sTable.showSummary,
    summaryText: sTable.summaryText || sTable.sumText,
    data: sActions.query?.data,
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

function handleTableFetch() {
  doSearch()
}

// 获取操作列活动熟悉
function getOperationActionAttrs(options: any, scope: any) {
  const name = options.action

  const defConfig = (DEFAULT_ACTIONS as any)[name]
  const actConfig = sActions[name] || {}
  const optConfig = _.omit(options, ['action'])

  // 单独处理innerAttrs，节约性能
  const innerAttrs = _.deepMerge(
    {
      button: {
        type: 'text'
      }
    },
    defConfig?.innerAttrs,
    actConfig?.innerAttrs,
    optConfig?.innerAttrs
  )

  const payload = _.deepMerge(
    {},
    actConfig.payload || optConfig.payload || scope.row,
    actConfig.defaults,
    optConfig.defaults
  )

  const actionAttrs = Object.assign(
    {
      contextData: scope,
      name,
      scope
    },
    defConfig,
    actConfig,
    optConfig,
    { innerAttrs }
  )

  actionAttrs.payload = payload
  actionAttrs.trigger = () => {
    triggerAction(actionAttrs, scope)
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

  const title = actionCfg.title || actionCfg.label
  const dialogAttrs = actionCfg.dialog || {}

  return { title, ...dialogAttrs }
})

// 执行提交
async function handleDialogSubmit(model: any) {
  const actionCfg = activeAction.value
  if (!actionCfg) return

  const context = useAppContext(model)
  const payload = _.deepMerge({}, tpl.deepFilter(dialogAttrs.value?.extData, context), model)

  await doAction(actionCfg.api, payload, actionCfg)
}

// 执行关闭
function handleDialogClose() {
  dialogClose.value = true
}

// ----- 通用代码 ----->

// 触发活动
async function triggerAction(actionCfg: any, data?: any) {
  activeAction.value = actionCfg
  if (!actionCfg) return

  const ctx = useAppContext(data)

  const payload = buildActionPlayload(actionCfg, data)

  actionCfg.label = actionCfg.label || '操作'

  if (actionCfg.link) {
    const link = tpl.deepFilter(actionCfg.link, ctx)
    await router.goto(link)
  } else if (actionCfg.event) {
    emitter.emits(actionCfg.event, payload)
  } else if (actionCfg.dialog) {
    dialogClose.value = false
    nextTick(() => {
      dialogRef.value?.show(payload)
    })
  } else {
    const messageCfg = actionCfg.message || `确认${actionCfg.label}选中的记录？`

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
    msgConfig = Object.assign(
      {
        cancelButtonText: '取消',
        confirmButtonText: '确定'
      },
      msgConfig
    )

    msgConfig = tpl.deepFilter(msgConfig, ctx)
    await MessageBox(msgConfig).then(() => {
      return doAction(actionCfg.api, payload, actionCfg)
    })
  }
}

// 构建活动参数
function buildActionPlayload(actionCfg: any, data?: any) {
  const ctx = useAppContext(data)

  let payload = tpl.deepFilter(actionCfg.payload, ctx)

  // 处理选中项
  if (actionCfg.targetType === 'selected') {
    // 判断当前有没有选中项
    if (!selectedRows.value.length) {
      const noSelectMessage = actionCfg.noSelectMessage || `请先选择需要${actionCfg.label}的记录`
      Message.warning(noSelectMessage)

      throw new Error('没有选择行')
    }

    // 批量参数
    if (actionCfg.batchPayload) {
      const batchPayloadTmpl = actionCfg.batchPayload
      const batchPayload: any = {}

      Object.keys(batchPayloadTmpl).forEach(key => {
        if (!Array.isArray(batchPayloadTmpl[key])) {
          batchPayload[key] = tpl.deepFilter(batchPayloadTmpl[key], ctx)
        } else if (batchPayloadTmpl[key][0]) {
          const batchTmpl = batchPayloadTmpl[key][0]
          batchPayload[key] = []

          selectedRows.value.forEach((row: any) => {
            const _data = Object.assign({}, data, { row })
            const _ctx = useAppContext(_data)

            batchPayload[key].push(tpl.deepFilter(batchTmpl, _ctx))
          })
        }
      })

      payload = Object.assign({}, payload, batchPayload)
    }
  }

  return payload
}

// 执行活动
async function doAction(action: any, payload: any, options?: any) {
  dialogLoading.value = true

  await apiRequest({
    action,
    data: payload
  })
    .then(res => {
      if (options?.reload !== false) doSearch()
      if (options?.sucessMessage !== false) {
        Message.success(options?.sucessMessage || `${options.label || '操作'}成功！`)
      }
    })
    .finally(() => {
      dialogLoading.value = false
    })
}

// 执行查询
async function doSearch() {
  const queryAction = sActions.query || {}

  if (!queryAction.api) {
    tableRef.value?.setData(queryAction.data || [])
    return
  }

  const pager = tableRef.value.pager
  searchLoading.value = true
  // 当前微件上下文件
  const context = useAppContext(searchModel)
  const searchParms = _.deepMerge({}, tpl.deepFilter(sSearch?.extData, context), searchModel)
  await apiRequest({
    pageIndex: pager.pageIndex,
    pageSize: pager.pageSize,
    noPager: sTable.noPager,
    action: { ...queryAction, type: 'query' },
    params: searchParms
  })
    .then(res => {
      tableRef.value?.setData(res)
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
