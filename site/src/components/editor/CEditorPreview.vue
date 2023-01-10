<template>
  <section id="editor-preview-warpper">
    <WCrud :schema="schema"></WCrud>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from '@zto/zpage'

const props = defineProps<{
  schema: Record<string, any>
}>()

const schema = ref<any>(null)

onMounted(() => {
  schema.value = props.schema
})

watch(
  () => props.schema,
  () => {
    schema.value = props.schema
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
section {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;

  .w-crud {
    width: 100%;
  }
}
</style>
