<template>
  <van-cell :title="label">
    <template v-if="showLabelSlot" #icon>
      <tooltip :tooltip="tooltip" style="margin-right: 0.1rem; line-height: 0.6rem"></tooltip>
    </template>

    <van-popover v-model="showPopover" placement="bottom-end" trigger="click">
      <div class="popover">{{ displayText }}</div>
      <template #reference>
        <div class="text">{{ displayText }}</div>
      </template>
    </van-popover>
  </van-cell>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue } from '@zto/zpage'
import Tooltip from './tooltip.vue'

import type { GenericFunction } from '@zto/zpage'

const { ref, computed } = vue

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    label?: string
    showLabelSlot?: boolean
    formatter?: GenericFunction
    tooltip?: any
  }>(),
  {}
)

const showPopover = ref<boolean>(false)

const displayText = computed(() => {
  return (props.formatter && props.formatter(props.model)) || props.model[props.prop]
})
</script>

<style scoped lang="scss">
.popover {
  color: #666;
  font-size: 0.35rem;
  padding: 0.23rem;
  max-width: 300px;
}

.text {
  color: #666;
  max-width: 150px;
  @include text-ellipsis();
}
</style>
