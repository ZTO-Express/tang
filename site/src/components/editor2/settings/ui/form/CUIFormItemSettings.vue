<template>
  <div class="c-ui-form-item-settings">
    <CUIDefinitionProperties :definition="devDefinition" :root-data="rootData" :data="data" />
  </div>
</template>

<script setup lang="ts">
import { computed } from '@zto/zpage'
import { getDevDefinitionByFormItemData } from '../../utils'

const props = defineProps<{
  rootData: any
  data: any
}>()

/**
 * 表单定义
 */
const devDefinition = computed(() => {
  const def = getDevDefinitionByFormItemData(props.data)

  return def
})
</script>
