<template>
  <van-field
    v-model="model[prop]"
    v-bind="$attrs"
    :name="prop"
    :type="inputType"
    :placeholder="$attrs.placeholder || '请输入'"
    :rows="rows"
    :input-align="inputAlign"
    :disabled="disabled"
  >
    <template v-if="$attrs.showLabelSlot" #left-icon>
      <tooltip :tooltip="$attrs.tooltip"></tooltip>
    </template>
  </van-field>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue } from '@zto/zpage'
import Tooltip from './tooltip.vue'

const { ref, computed } = vue

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    inputType?: string
    inputAlign?: string
    disabled?: boolean
    rows?: number
  }>(),
  {
    inputType: 'text',
    inputAlign: 'right',
    disabled: false,
    rows: 2
  }
)
</script>
