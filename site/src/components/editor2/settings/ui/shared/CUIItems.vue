<template>
  <div class="c-ui-items">
    <Draggable :list="uiItems" item-key="id" :group="groupOptions" :clone="dragCloneMethod || innerDragCloneMethod">
      <template #item="{ element }">
        <div class="dragable-item drag-handler">
          <div class="section-label">{{ element.label }}</div>
        </div>
      </template>
    </Draggable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '@zto/zpage'
import { queryJsonDefinitionsByUIs } from '@/utils/schema'
import { uniqueUIItems } from '../../utils'

import type { ZPageJsonDefinition } from '@/../typings'

import Draggable from 'vuedraggable'

const props = withDefaults(
  defineProps<{
    items?: ZPageJsonDefinition[]
    uis?: string[]
    dragGroupName?: string
    dragCloneMethod?: Function
  }>(),
  {
    dragGroupName: 'uiItem'
  }
)

const groupOptions = { name: props.dragGroupName, pull: 'clone', put: false }

/**
 * 获取所有formItems定义
 */
const uiItems = computed(() => {
  let queriedItems = queryJsonDefinitionsByUIs(props.uis)
  const items = uniqueUIItems([...(props.items || []), ...queriedItems])

  return items
})

function innerDragCloneMethod(item: any) {
  const clonedItem = { name: item.name, label: item.label }
  return clonedItem
}
</script>

<style lang="scss" scoped>
.dragable-item {
  color: #666;
  border: 1px solid var(--border-color);
  padding: 4px 0;
  padding: 5px;
  text-align: center;
  border-radius: 3px;
  margin-bottom: 5px;

  &:hover {
    border: 1px solid var(--active);
  }
}
</style>
