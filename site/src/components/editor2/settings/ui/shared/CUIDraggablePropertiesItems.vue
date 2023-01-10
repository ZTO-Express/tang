<template>
  <Draggable
    class="c-ui-draggable-properties-items draggable-container"
    :list="items"
    item-key="id"
    handle=".draggable-column-item .drag-handler"
    v-bind="innerDragOptions"
    @start="dragging = true"
    @end="dragging = false"
  >
    <template #item="{ element, index }">
      <div class="draggable-column-item">
        <div class="item-header">
          <slot name="itemHeader" v-bind="{ rootData, item: element, items, index }">
            <div class="title drag-handler">
              <slot name="itemTitle" v-bind="{ rootData, item: element, items, index }">
                <i class="el-icon-menu" />

                <span class="q-ml-sm">
                  <slot name="itemLabel" v-bind="{ rootData, item: element, items, index }">
                    {{ element.label || '项目' + (index + 1) }}
                  </slot>
                </span>
              </slot>
            </div>
            <div class="extra">
              <slot name="itemExtra" v-bind="{ rootData, item: element, items, index }">
                <i class="el-icon-delete" title="删除" @click.prevent="handleItemDelete(index)" />
              </slot>
            </div>
          </slot>
        </div>
        <div class="item-body">
          <slot name="itemBody" v-bind="{ rootData, item: element, items, index }" />
        </div>
      </div>
    </template>
  </Draggable>
</template>

<script setup lang="ts">
import { ref, computed, useCurrentAppInstance } from '@zto/zpage'

import Draggable from 'vuedraggable'

const app = useCurrentAppInstance()

const { MessageBox } = app.useMessage()

const props = withDefaults(
  defineProps<{
    items: any[]
    rootData: any
    dragGroupName: string
    dragOptions: Record<string, any>
  }>(),
  {
    dragGroupName: 'uiItem'
  }
)

const innerDragOptions = computed(() => {
  return {
    group: props.dragGroupName,
    animation: 200,
    disabled: false,
    ghostClass: 'ghost',
    ...props.dragOptions
  }
})

const emit = defineEmits(['delete'])

const dragging = ref<boolean>(false)

/**
 * 删除对应项
 * @param index
 */
async function handleItemDelete(index: number) {
  if (index < 0 || index >= props.items.length) return

  // await MessageBox.confirm('删除当前项将无法恢复，确认删除。', '提示', {
  //   confirmButtonText: '继续删除',
  //   cancelButtonText: '取消',
  //   type: 'warning'
  // }).then(() => {
  //   props.items.splice(index, 1)
  //   emit('delete', props.items[index], index)
  // })

  props.items.splice(index, 1)
  emit('delete', props.items[index], index)
}
</script>

<style lang="scss" scoped>
.draggable-container {
  min-height: 20px;
}

.draggable-column-item {
  border: 1px solid var(--bg-color);
  padding: 5px;
  margin-bottom: 5px;

  & > .item-header {
    display: flex;
    padding: 5px;
    background: var(--bg-color);

    & > .title {
      flex: 1;
    }

    & > .extra {
      width: 100px;
      text-align: right;

      i {
        cursor: pointer;
      }
    }
  }

  & > .item-footer {
    display: flex;
    padding: 5px;
  }
}
</style>
