<template>
  <div class="c-ui-table-column-settings">
    <CUIDefinitionProperties definition="UITableColumn" :root-data="rootData" :data="data" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from '@zto/zpage'

import { getJsonDefinition, parseJsonDefinition } from '@/utils/schema'

const props = defineProps<{
  rootData: any
  data: any
}>()
</script>
