<template>
  <div class="c-doc-schema-tree">
    <div v-if="definition" class="tree">definition: {{ definition }}</div>
    <div v-else class="no-data">暂未找到配置结构</div>
  </div>
</template>

<script setup lang="ts">
import { uuid, computed } from '@zto/zpage'
import { getJsonDefinition } from '@/utils/schema'

const headerId = uuid()

const props = defineProps<{
  name: string
}>()

const definition = computed(() => {
  const def = getJsonDefinition(props.name)
  if (!def) return undefined

  return def
})
</script>
