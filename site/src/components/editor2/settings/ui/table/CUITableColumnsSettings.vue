<template>
  <div class="c-ui-table-columns-settings fs">
    <div class="header">
      <c-button type="primary" label="新增" @click="handleItemAdd" />
    </div>
    <div class="body">
      <el-scrollbar class="settings-scrollbar" height="100%" always>
        <CUITableColumnsDraggable :root-data="rootData" :columns="columns" />
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from '@zto/zpage'

import type { ZPageDevProperty, ZPageJsonDefinition } from '@/../typings'

const props = defineProps<{
  property: ZPageDevProperty
  rootData: any
  data: any
}>()

const columns = ref<any[]>([])

/** 项编码 */
const itemIndex = ref<number>((columns.value?.length || 0) + 1)

watch(
  () => [props.data, props.property],
  () => {
    if (!props.data || !props.property?.name) return

    // 设置默认内容
    if (!props.data[props.property?.name]) {
      props.data[props.property?.name] = []
    }

    columns.value = props.data[props.property?.name]

    if (!columns.value.length) {
      addItem()
    }
  },
  {
    immediate: true
  }
)

/**
 * 新增项
 */
function handleItemAdd() {
  addItem()
}

/**
 * 新增项
 */
function addItem() {
  const item = { label: `表格列`, prop: 'prop', children: [] }

  if (item.label) {
    item.label += itemIndex.value
  }

  if (item.prop) {
    item.prop = `${item.prop}${itemIndex.value}`
  }

  columns.value.push(item)

  itemIndex.value++
}
</script>

<style lang="scss">
.c-ui-table-columns-settings {
  & > .header {
    padding: 5px;
  }

  & > .body {
    height: calc(100% - 40px);

    flex: 1;
    padding-left: 5px;
    box-sizing: border-box;

    .settings-scrollbar {
      overflow-x: hidden;
      padding-right: 15px;
    }
  }
}
</style>
