<!-- eslint-disable vue/no-mutating-props -->
<template>
  <van-slider v-model="model[prop]" v-bind="$attrs" :disabled="disabled" />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue } from '@zto/zpage'
import { Slider as VanSlider } from 'vant'

const { ref, useAttrs } = vue

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
