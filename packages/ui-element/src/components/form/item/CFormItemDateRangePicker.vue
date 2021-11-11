<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="c-form-item-date-range-picker">
    <c-date-range-picker
      v-model:from="model[prop]"
      v-model:to="model[toProp]"
      v-bind="$attrs"
      :disabled="disabled"
    />
    <z-form-item :prop="toProp"></z-form-item>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    model: GenericObject
    prop: string
    toProp: string
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)
</script>
