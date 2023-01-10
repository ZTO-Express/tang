<template>
  <el-popover popper-class="column-filterer" placement="bottom-end" :width="180" trigger="click">
    <template #reference>
      <el-button type="text" class="q-ml-md">
        列筛选
        <i class="el-icon-setting"></i>
      </el-button>
    </template>
    <div class="filterer-header">
      <el-button type="text" class="q-ml-md" @click="handleReset">重置</el-button>
    </div>
    <div class="filterer-body">
      <el-checkbox-group class="filterer-checkbox-group" v-model="checks">
        <el-checkbox v-for="item in columns" class="filterer-checkbox" :key="item.prop" :label="item.prop">
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

/** 所有列 */
const allColumnProps = computed(() => {
  return props.columns.map(it => it.prop).filter(p => !!p)
})

/** 可见列 */
const visibleColumns = computed(() => {
  const columns = props.columns.filter(it => !it.prop || checks.value.includes(it.prop))
  return columns
})

watch(
  () => visibleColumns.value,
  (cur, old) => {
    if (cur !== old) {
      emit('change', visibleColumns.value)
    }
  }
)

onMounted(() => {
  tryInitFilterData()
})

onBeforeUnmount(() => {
  if (!props.filterable) return

  saveFilterData()
})

/** 重置 */
function handleReset() {
  reset()
}

/** 尝试初始化过滤事件 */
function tryInitFilterData() {
  const filterData = getFilterData()

  let visibleProps = [...allColumnProps.value]

  // 记录移除的属性
  const removedProps = filterData.cruds[currentFilterKey] || []
  if (removedProps.length) {
    visibleProps = visibleProps.filter(it => !removedProps.includes(it))
  }

  checks.value = visibleProps
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
function saveFilterData() {
  const filterData = getFilterData()

  // 如果checks包含所有的属性则直接删除（注意！存储的是移除的key）
  const removedProps = allColumnProps.value.filter(it => !checks.value.includes(it))

  if (!removedProps.length) {
    delete filterData.cruds[currentFilterKey]
  } else {
    filterData.cruds[currentFilterKey] = [...removedProps]
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

/** 重置选项 */
function reset() {
  checks.value = []

  for (let c of props.columns) {
    checks.value.push(c.prop)
  }
}

defineExpose({
  reset,
  visibleColumns
})
</script>

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
