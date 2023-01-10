<template>
  <section>
    <!-- 编辑区域-元组件（可拖拽） -->
    <ESMeta :group-name="groupName"></ESMeta>

    <!-- 编辑区域-主内容 -->
    <ESMain :schema="schema" @drag-group="onDragGroup"></ESMain>
  </section>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from '@zto/zpage'
import ESMeta from './components/ESMeta.vue'
import ESMain from './components/ESMain.vue'

const props = defineProps<{
  schema: Record<string, any>
}>()

const schema = ref(props.schema)

// const drag = ref<boolean>(false)

// 可拖拽group映射groupName
const groupName = ref('')
// onDragGroup自组件外传
const onDragGroup = (val: string) => {
  groupName.value = val
}
</script>

<style lang="scss" scoped>
section {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
  background: #fff;
}
</style>
