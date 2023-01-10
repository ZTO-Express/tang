<template>
  <el-form-item label="showCheckbox" prop="showCheckbox">
    <el-switch v-model="table.showCheckbox" inline-prompt active-text="是" inactive-text="否"></el-switch>
  </el-form-item>

  <el-form-item label="width" prop="width">
    <el-input-number v-model="table.operation.width" placeholder="请输入" style="width: 100%"></el-input-number>
  </el-form-item>

  <div>
    <VueDraggable
      tag="transition-group"
      :list="table.operation.items"
      item-key="id"
      handle=".handle-table-operation"
      v-bind="{
        animation: 200,
        group: groupName,
        disabled: false,
        ghostClass: 'ghost'
      }"
      @start="drag = true"
      @end="drag = false"
    >
      <template #item="{ element, index }">
        <div :key="element.label" class="drag-wrap handle-table-operation">
          <p>
            <i class="el-icon-menu"></i>
            {{ element.label || '按钮' + (index + 1) }}
            <i class="el-icon-delete" title="删除" @click.prevent="handleDelete(table.operation.items, index)"></i>
          </p>

          <EActionLink :item="element" :index="index"></EActionLink>
        </div>
      </template>
    </VueDraggable>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from '@zto/zpage'
import VueDraggable from 'vuedraggable'
import EActionLink from './ActionLink.vue'

const props = defineProps<{
  table: any
  groupName: string
}>()

const table = ref<any>(null)

const drag = ref<boolean>(false)

// const dragOptions = {
//   animation: 200,
//   group: 'people',
//   disabled: false,
//   ghostClass: 'ghost'
// }

onMounted(() => {
  table.value = props.table
})

watch(
  () => props.table,
  () => {
    table.value = props.table
  },
  { immediate: true, deep: true }
)

// 删除
const handleDelete = (items: any, index: number) => {
  if (index !== -1) {
    items.splice(index, 1)
  }
}
</script>

<style lang="scss" scoped>
.drag-wrap {
  padding: 4px;
  border-bottom: 1px dotted #ddd;

  &:hover {
    background: #ddd;
    border-radius: 4px;
  }
}

.handle-table-operation {
  cursor: move;
}

.el-icon-delete {
  cursor: pointer;
  float: right;
}
</style>
