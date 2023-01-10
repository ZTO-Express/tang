<template>
  <div class="c-doc-schema-desc">
    <p v-if="definition?.description" class="content">{{ definition.description }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from '@zto/zpage'
import { getJsonDefinition } from '@/utils/schema'

const props = defineProps<{
  name: string
}>()

const definition = computed(() => {
  const def = getJsonDefinition(props.name)
  if (!def) return undefined
  return def
})
</script>
