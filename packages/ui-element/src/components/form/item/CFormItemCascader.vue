<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <el-cascader
    v-model="model[prop]"
    v-bind="$attrs"
    :placeholder="$attrs.placeholder || '请选择'"
    :disabled="disabled"
    :options="options || []"
  />
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    model: GenericObject
    prop: string
    disabled?: boolean
    options?: GenericObject
  }>(),
  {
    disabled: false
  }
)
</script>
