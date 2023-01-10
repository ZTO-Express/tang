<template>
  <div class="c-ui-context-payload-settings">
    <CUIPropertyFormItems
      :property="property"
      :root-data="rootData"
      :data="data"
      :form-item-attrs="formItemAttrs"
    ></CUIPropertyFormItems>
  </div>
</template>

<script setup lang="ts">
import { _, ref, computed, watch } from '@zto/zpage'

import type { ZPageDevProperty, ZPageJsonDefinition } from '@/../typings'

const props = defineProps<{
  property: ZPageDevProperty
  rootData: any
  data: any
}>()

const formItemAttrs = computed(() => {
  return {}
})
</script>

<style lang="scss" scoped>
.c-ui-context-payload-settings {
}
</style>
