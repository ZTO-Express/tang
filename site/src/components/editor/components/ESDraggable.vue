<template>
  <VueDraggable
    tag="transition-group"
    :list="lists"
    item-key="id"
    handle=".handle"
    v-bind="dragOptions"
    @start="drag = true"
    @end="drag = false"
  >
    <template #item="{ element, index }">
      <div :key="element.label" class="drag-wrap">
        <p class="handle">
          <i class="el-icon-menu"></i>
          {{ element.label || label + (index + 1) }}
          <i class="el-icon-delete" title="删除" @click.prevent="handleDelete(lists, index)"></i>
        </p>

        <slot name="item" :element="element" :index="index"></slot>
      </div>
    </template>
  </VueDraggable>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from '@zto/zpage'
import VueDraggable from 'vuedraggable'

const props = withDefaults(
  defineProps<{
    lists: any[]
    label?: string
    groupName?: string
    disabled?: boolean
    ghostClass?: string
  }>(),
  {
    label: '组件',
    groupName: 'basic',
    disabled: false,
    ghostClass: 'ghost'
  }
)

// 可拖拽区域的列表数据
const lists = ref(props.lists)
// 拖住组件的配置
const dragOptions = ref({
  animation: 200,
  group: props.groupName,
  disabled: props.disabled,
  ghostClass: props.ghostClass
})
// 拖拽值
const drag = ref(false)

// 删除
const handleDelete = (items: any, index: number) => {
  if (index !== -1) {
    items.splice(index, 1)
  }
}
</script>

<style lang="scss" scoped>
.handle {
  cursor: move;

  &:hover {
    background: #ccc;
    border-radius: 4px;
  }
}

.drag-wrap {
  padding: 4px;
  border-bottom: 1px dotted #ddd;

  &:hover {
    background: #ddd;
    border-radius: 4px;
  }
}

.el-icon-delete {
  cursor: pointer;
  float: right;
}
</style>
