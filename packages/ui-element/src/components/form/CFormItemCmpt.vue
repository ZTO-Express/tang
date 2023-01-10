<template>
  <component
    v-if="config.componentType"
    :is="config.componentType"
    v-bind="config"
    :model="config.innerModel || model"
    :prop="config.innerProp || config.prop"
    :disabled="typeof config.disabled !== 'undefined' ? config.disabled : config.isDisabled"
    :clearable="typeof config.clearable !== 'undefined' ? config.clearable : clearable"
    :style="{ width: config.width || itemWidth }"
  />
</template>

<script setup lang="ts">
import { _ } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: Record<string, any> // 传进来的共享的model表单值对象
    config: Record<string, any> // 属性
    clearable?: boolean
    itemWidth?: number | string
  }>(),
  {
    clearable: false
  }
)
</script>
