<template>
  <el-pagination
    v-model:page-size="innerPageSize"
    v-model:current-page="innerPageIndex"
    background
    :small="small"
    :page-sizes="innerPageSizes"
    :total="total || 0"
    :layout="innerLayout"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  ></el-pagination>
</template>

<script setup lang="ts">
import { vue, useConfig } from '@zto/zpage'

const { ref, nextTick } = vue
const emit = defineEmits(['fetch', 'update:pageSize', 'update:pageIndex'])

const props = withDefaults(
  defineProps<{
    small: boolean
    pageSizes?: Array<number> // 可选分页数
    layout?: string // 分页布局
    pageSize?: number // 可选分页数
    pageIndex?: number // 当前页码
    total: number // 总行数
  }>(),
  {
    small: false,
    total: 0
  }
)

const cfg = useConfig('components.pagination', {})

// 配置信息
const innerLayout = props.layout || cfg.layout
const innerPageSizes = props.pageSizes || cfg.pageSizes

const innerPageSize = ref<number>(props.pageSize || cfg.pageSize || 100)
const innerPageIndex = ref<number>(props.pageIndex || props.total > 0 ? 1 : 0)

/** 单页大小改变时触发 */
function handleSizeChange() {
  innerPageIndex.value = 1
  emit('update:pageSize', innerPageSize.value)
  execQuery()
}

/** 当前页改变时触发 */
function handleCurrentChange() {
  emit('update:pageIndex', innerPageIndex.value)
  execQuery()
}

/** 执行查询 */
function execQuery() {
  nextTick(() => {
    emit('fetch')
  })
}
</script>
