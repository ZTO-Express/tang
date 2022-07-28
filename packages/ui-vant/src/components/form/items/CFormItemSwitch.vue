<!-- eslint-disable vue/no-mutating-props -->
<template>
  <van-switch v-model="model[prop]" v-bind="$attrs" :disabled="disabled" />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref, useAttrs } from '@zto/zpage'
import { Switch as VanSwitch } from 'vant'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)
</script>
