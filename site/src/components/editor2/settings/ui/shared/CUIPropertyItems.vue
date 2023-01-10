<template>
  <CUIPropertyItem
    v-for="property in properties || []"
    :key="property.name"
    :property="property"
    :root-data="rootData"
    :data="data"
  />
</template>

<script setup lang="ts">
import CUIPropertyItem from './CUIPropertyItem.vue'

import type { ZPageDevProperty } from '@/../typings'

const props = defineProps<{
  properties: Array<ZPageDevProperty>
  rootData: any
  data: any
}>()
</script>
