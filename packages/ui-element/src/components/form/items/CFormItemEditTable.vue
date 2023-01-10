<template>
  <div class="c-form-item-edit-table" :style="tableStyle">
    <CTable ref="tableRef" v-bind="innerTableAttrs">
      <template #operation="scope">
        <slot v-bind="scope" name="action">
          <el-button
            v-bind="innerActionAttrs"
            :disabled="!checkIsAllowAdd(scope)"
            @click="handleInsertRow(scope.$index, scope)"
          >
            +
          </el-button>
          <el-button
            v-bind="innerActionAttrs"
            class="action-item"
            :disabled="!checkIsAllowRemove(scope)"
            @click="handleRemoveRow(scope.$index, scope)"
          >
            -
          </el-button>
        </slot>
      </template>
    </CTable>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _, ref, watch, onMounted, computed, useAttrs, sizePx } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    height?: number | string
    noIndex?: boolean
    disabled?: boolean
    autoAppendFirst?: boolean // 自动添加第一行
  }>(),
  {
    noIndex: true,
    autoAppendFirst: true
  }
)

const attrs = useAttrs()

const tableRef = ref()

/** 表格属性 */
const innerTableAttrs = computed(() => {
  return {
    ...attrs,
    disabled: props.disabled,
    editable: true,
    operationWidth: 110,
    noPager: true,
    noIndex: props.noIndex
  }
})

const innerForm = computed(() => {
  return tableRef.value?.innerForm
})

/** 活动按钮属性 */
const innerActionAttrs = computed(() => {
  return { type: 'default' }
})

/** 表格行 */
const tableRows = computed(() => {
  return props.model[props.prop]
})

const tableStyle = computed(() => {
  const _style: any = {}
  if (props.height) {
    _style.height = sizePx(props.height)
  }
  return { ..._style }
})

watch(
  () => props.model[props.prop],
  () => {
    resetTableData()
  }
)

onMounted(() => {
  resetTableData()
})

/** 执行插入 */
function handleInsertRow(index: number, scope: any) {
  insertRow(index)
}

/** 删除行 */
function handleRemoveRow(index: number, scope: any) {
  removeRow(index)
}

/** 是否允许删除 */
function checkIsAllowRemove(scope: any) {
  return scope.$index !== 0 && props.disabled !== true
}

/** 是否允许新增 */
function checkIsAllowAdd(scope: any) {
  return props.disabled !== true
}

async function resetTableData() {
  if (!tableRef.value) return

  if (props.model[props.prop] !== tableRef.value.tableData.data) {
    await tableRef.value.setData({ data: props.model[props.prop] })

    props.model[props.prop] = tableRef.value.tableData.data
  }

  if (props.autoAppendFirst && !tableRows.value?.length && !innerForm.value?.disabled) {
    appendRow()
  }
}

/** 添加空行 */
function appendRow(data?: any) {
  tableRef.value?.appendRow(data || {})
}

/** 添加空行 */
function insertRow(index: number, data?: any) {
  tableRef.value?.insertRow(index, data)
}

/** 删除行 */
function removeRow(index: number) {
  tableRef.value?.removeRow(index)
}

defineExpose({
  innerTable: tableRef.value,
  tableRows: tableRows.value,
  checkIsAllowRemove,
  checkIsAllowAdd,
  appendRow,
  insertRow,
  removeRow,
  resetTableData
})
</script>
