<template>
  <div class="c-doc-schema-tree">
    <template v-if="type === 'desc' || type === 'description'">
      <CDocSchemaDesc :name="schemaName" />
    </template>
    <template v-else>
      <h2 :id="headerId">配置结构</h2>
      <CDocSchemaTree :name="schemaName" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { uuid, computed } from '@zto/zpage'
import { getJsonDefinition } from '@/utils/schema'

const headerId = uuid()

const props = withDefaults(
  defineProps<{
    name: string
    type: 'tree' | 'desc' | 'description'
  }>(),
  {
    type: 'desc'
  }
)

const schemaName = computed(() => {
  return `${props.name}Schema`
})
</script>
