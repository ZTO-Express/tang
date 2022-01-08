<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div>{{$attrs.default}}</div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>
<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    disabled?: boolean
    maxlength?: number
  }>(),
  {
    disabled: false
  }
)
</script>
