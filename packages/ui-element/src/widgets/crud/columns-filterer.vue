<template>
  <el-popover popper-class="column-filterer" placement="bottom-end" :width="180" trigger="click" @hide="handleHide">
    <template #reference>
      <el-badge
        class="filter-badge"
        type="warning"
        :value="filteredColumnProps.length"
        :hidden="!filteredColumnProps.length"
      >
        <el-button type="text" class="q-ml-md">
          列筛选
          <i class="el-icon-setting"></i>
        </el-button>
      </el-badge>
    </template>
    <div class="filterer-header">
      <el-button type="text" class="q-ml-md" @click="handleReset">重置</el-button>
      <el-button type="text" class="q-ml-md" @click="handleConfirm">确定</el-button>
    </div>
    <div class="filterer-body">
      <el-checkbox-group class="filterer-checkbox-group" v-model="checks">
        <el-checkbox v-for="item in allLeafColumns" class="filterer-checkbox" :key="item.prop" :label="item.prop">
          {{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { _, ref, computed, watch, onMounted, onBeforeUnmount, useCurrentAppInstance } from '@zto/zpage'
import { CRUD_COLUMNS_FILTER_DATA_KEY } from './consts'

import type { TableColumn } from '../../components/table/types'

// 属性
const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    name?: string
    filterable?: boolean
    storable?: boolean // 是否可持久化
    contextData?: Record<string, any>
  }>(),
  {
    filterable: true,
    storable: true
  }
)

const emit = defineEmits(['change'])

const app = useCurrentAppInstance()

/** 选中项 */
const checks = ref<string[]>([])

const currentRoute = app.currentRoute.value
const currentFilterKey = getFilterKey()

const allLeafColumns = computed(() => {
  const _leafColumns = retrieveLeafColumns(props.columns)
  return _leafColumns
})

/** 所有列 */
const allColumnProps = computed(() => {
  // 获取所有叶子列（考虑多级表头）
  const _leafColumnProps = allLeafColumns.value.map(it => it.prop).filter(p => !!p)
  return _leafColumnProps
})

/** 已保存的隐藏列属性 */
const filteredColumnProps = computed(() => {
  const filteredColumnProps = allColumnProps.value.filter(it => !checks.value.includes(it))
  return filteredColumnProps || []
})

/** 可见列 */
const visibleColumns = computed(() => {
  const _vColumns = retrieveVisibleColumns(props.columns, filteredColumnProps.value)
  return _vColumns
})

onMounted(() => {
  tryInitFilterData()

  active()
})

onBeforeUnmount(() => {})

/** 重置 */
function handleReset() {
  reset()
}

/** 配置生效 */
function handleConfirm() {
  active()
}

/** 弹框隐藏时触发 */
function handleHide() {
  tryInitFilterData()
}

/** 重置选项 */
function reset() {
  checks.value = [...allColumnProps.value]
}

/** 配置生效 */
function active() {
  emit('change', visibleColumns.value)
  saveFilterData()
}

/** 尝试初始化过滤事件 */
function tryInitFilterData() {
  let visibleProps = [...allColumnProps.value]

  // 记录移除的属性
  const filteredProps = getCurrentFilterProps()

  if (filteredProps.length) {
    visibleProps = visibleProps.filter(it => !filteredProps.includes(it))
  }

  checks.value = visibleProps
}

/** 获取当前过滤的过滤器属性 */
function getCurrentFilterProps() {
  const filterData = getFilterData()

  const filteredProps = filterData.cruds[currentFilterKey] || []
  return filteredProps || []
}

/** 获取filterData */
function getFilterData() {
  let filterData = app.getAppData(CRUD_COLUMNS_FILTER_DATA_KEY)

  if (!filterData) {
    const filterDataText = app.storage.local.get(CRUD_COLUMNS_FILTER_DATA_KEY)
    try {
      filterData = JSON.parse(filterDataText)

      if (filterData) {
        app.setAppData(CRUD_COLUMNS_FILTER_DATA_KEY, filterData)
      }
    } catch (err) {}
  }

  filterData = { cruds: {}, ...filterData }

  return filterData
}

/** 设置持久化 */
function saveFilterData(filteredProps?: string[]) {
  const filterData = getFilterData()

  // 如果checks包含所有的属性则直接删除（注意！存储的是移除的key）
  if (!filteredProps) {
    filteredProps = allColumnProps.value.filter(it => !checks.value.includes(it))
  }

  if (!filteredProps.length) {
    delete filterData.cruds[currentFilterKey]
  } else {
    filterData.cruds[currentFilterKey] = [...filteredProps]
  }

  app.setAppData(CRUD_COLUMNS_FILTER_DATA_KEY, filterData)

  // 临时路由不进行持久化
  if (!currentRoute.meta?.isTemp || !props.storable) {
    const filterDataText = JSON.stringify(filterData)
    app.storage.local.set(CRUD_COLUMNS_FILTER_DATA_KEY, filterDataText)
  }
}

/** 获取过期key */
function getFilterKey() {
  const routeKey = currentRoute.name!.toString() || currentRoute.path
  if (props.name) return `${routeKey}-${props.name}`
  return routeKey
}

/** 计算可见列 */
function retrieveVisibleColumns(columns: any[], filteredColumnProps: string[] = []) {
  if (!columns?.length || !filteredColumnProps?.length) return columns

  let visibleColumns: any[] = []

  columns.forEach(it => {
    // 不应当修改原列
    const _col = { ...it }

    if (it.children?.length) {
      const _children = retrieveVisibleColumns(it.children, filteredColumnProps)

      if (_children.length) {
        _col.children = _children
        visibleColumns.push(_col)
      }
    } else if (!filteredColumnProps.includes(it.prop)) {
      visibleColumns.push(_col)
    }
  })

  return visibleColumns
}

/** 计算所有子列 */
function retrieveLeafColumns(columns: any[], leafColumns: any[] = []) {
  if (!columns?.length) return leafColumns

  columns.forEach(it => {
    if (!it.children?.length) leafColumns.push(it)

    retrieveLeafColumns(it.children, leafColumns)
  })

  return leafColumns
}

/** 获取列过滤信息 */
function getColumnFilterData() {
  const filterData = getFilterData()
  const filteredProps = getCurrentFilterProps()

  return {
    filteredProps,
    columns: props.columns,
    visibleColumns: visibleColumns,
    filterData
  }
}

defineExpose({
  reset,
  visibleColumns,
  getColumnFilterData
})
</script>

<style lang="scss" scoped>
.filter-badge {
  :deep(.el-badge__content) {
    transform: scale(0.8);
    right: -10px;
    top: -5px;
  }
}
</style>

<style lang="scss">
.el-popover.column-filterer {
  padding: 0px;

  .filterer-header {
    border-bottom: 1px solid var(--border-color);
    text-align: right;
    padding: 2px 16px;
  }

  .filterer-checkbox-group {
    max-height: 200px;
    overflow-y: auto;
    padding: 10px;
  }

  .filterer-checkbox {
    display: block;
  }
}
</style>
