<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <c-upload
    v-model="model[prop]"
    v-bind="$attrs"
    :disabled="disabled"
    :on-completed="handleCompleted"
    :on-delete="handleDelete"
  />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue, useApiRequest } from '@zto/zpage'
import { fileUtil, GenericFunction, useAppContext } from '@zto/zpage-runtime'
const { ref } = vue

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    nameProp: string
    disabled?: boolean
    onCompleted?: GenericFunction
    onDelete?: GenericFunction
  }>(),
  {
    disabled: false
  }
)

const apiRequest = useApiRequest()

const context = useAppContext(props.model)

async function handleCompleted(file: any) {
  if (props.onCompleted) {
    return props.onCompleted(file, context)
  }
}

async function handleDelete(file: any) {
  if (props.onDelete) {
    return props.onDelete(file, context)
  }
}
</script>
