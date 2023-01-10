<template>
  <div class="c-ui-table-column-draggable">
    <CUIDraggablePropertiesItems :items="columns" dragGroupName="uiColumn">
      <template #itemBody="{ rootData, item }">
        <div class="item-body">
          <CUITableColumnSettings :root-data="rootData" :data="item" />
        </div>
        <div class="item-footer">
          <c-button type="primary" label="新增子列" @click="handleSubItemAdd(item)" />
        </div>
        <div class="sub-column">
          <CUITableColumnsDraggable v-if="item.children?.length" :root-data="rootData" :columns="item.children" />
        </div>
      </template>
    </CUIDraggablePropertiesItems>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from '@zto/zpage'

const props = defineProps<{
  rootData: any
  columns: any[]
}>()

/** 项编码 */
const itemIndex = ref<number>((props.columns.length || 0) + 1)

/**
 * 新增项
 */
function handleSubItemAdd(parent: any) {
  addItem(parent)
}

/**
 * 新增项
 */
function addItem(parent: any) {
  const item = { label: `表格列`, prop: 'prop', children: [] }

  if (item.label) {
    item.label += itemIndex.value
  }

  if (item.prop) {
    item.prop = `${item.prop}${itemIndex.value}`
  }

  parent.children = parent.children || []
  parent.children.push(item)

  itemIndex.value++
}
</script>

<style lang="scss" scoped>
.sub-column {
  padding-left: 10px;
}
</style>
