<template>
  <div class="property-item-extra">
    <slot v-bind="{ property, rootData, data }">
      <div class="tip">
        <c-poptip v-if="property.description" icon="info" :html="property.description" />
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from '@zto/zpage'

import type { ZPageDevProperty } from '@/../typings'

const props = defineProps<{
  property: ZPageDevProperty
  rootData: any
  data: any
}>()
</script>

<style lang="scss" scoped>
.property-item-extra {
  position: absolute;
  z-index: 100;
  right: 5px;
  top: 0px;

  .tip {
    :deep(button) {
      padding: 0px;
      min-height: 0px;
    }
  }
}
</style>
