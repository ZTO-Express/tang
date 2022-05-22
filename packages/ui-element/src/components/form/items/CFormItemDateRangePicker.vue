<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="c-form-item-date-range-picker">
    <c-date-range-picker
      v-model:from="model[prop]"
      v-model:to="model[toProp]"
      v-bind="$attrs"
      :disabled="disabled"
      @change="handleChange"
    />
    <el-form-item :prop="toProp"></el-form-item>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref } from '@zto/zpage'

import { useFormItem } from '../util'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    toProp: string
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const { handleChange } = useFormItem(props)
</script>
