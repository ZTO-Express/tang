<template>
  <div class="c-form-item-uploader-item">
    {{ model[prop] }}
    <c-uploader v-bind="$attrs" v-model="model[prop]" :disabled="disabled" :multiple="false" />
    <div v-if="label" class="label" :class="{ required }">{{ label }}</div>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref, computed, watch } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    required?: boolean
    label?: string
    disabled?: boolean
  }>(),
  {
    required: false,
    disabled: false
  }
)
</script>

<style lang="scss" scoped>
.c-form-item-uploader-item {
  & > .label {
    width: 88px;
    text-align: center;
    padding: 0 5px 10px 5px;
    box-sizing: border-box;
    line-height: 1.1rem;
    color: gray;

    &.required::before {
      margin-right: 2px;
      color: var(--van-field-required-mark-color);
      content: '*';
    }
  }
}
</style>
