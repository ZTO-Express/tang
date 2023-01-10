<template>
  <div v-if="devDefinition" class="c-ui-action-item-settings">
    <CUIDefinitionProperties
      :definition="devDefinition"
      :ignoredProperties="['type']"
      :root-data="rootData"
      :data="data"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from '@zto/zpage'
import { getDevDefinitionByActionData } from '../../../utils'

const props = defineProps<{
  rootData: any
  data: any
}>()

/**
 * 活动定义
 */
const devDefinition = computed(() => {
  const def = getDevDefinitionByActionData(props.data)

  return def
})
</script>
