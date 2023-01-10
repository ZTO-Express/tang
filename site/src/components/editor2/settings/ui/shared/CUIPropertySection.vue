<template>
  <div v-if="sectionProperties.length" class="c-ui-property-section">
    <div v-if="!isDefaultSection" class="section-title">{{ section.label }}</div>
    <div class="section-body">
      <CUIPropertyItems :properties="sectionProperties" :root-data="rootData" :data="data" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from '@zto/zpage'

import { SCHEMA_NAMES } from '@/utils/schema'

import CUIPropertyItems from './CUIPropertyItems.vue'

import type { ZPageDevSection } from '@/../typings'

const props = defineProps<{
  section: ZPageDevSection
  rootData: any
  data: any
}>()

/**
 * 属性
 */
const sectionProperties = computed(() => {
  return props.section?.properties || []
})

const isDefaultSection = computed(() => {
  return props.section?.name === SCHEMA_NAMES.DEFAULT
})
</script>
