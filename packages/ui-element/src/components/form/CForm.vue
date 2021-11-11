<template>
  <el-form ref="formRef" v-bind="$attrs" :label-width="innerLabelWidth">
    <slot />
  </el-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useConfig } from 'zpage'

const formConfig = useConfig('components.form', {})

const props = defineProps<{
  labelWidth?: number | string
}>()

const formRef = ref<any>()

const innerLabelWidth = computed(() => {
  return props.labelWidth || formConfig.labelWidth || 80
})

function validate(...args: any[]) {
  return formRef.value.validate(...args)
}

function resetFields() {
  return formRef.value.resetFields()
}

defineExpose({
  innerForm: formRef.value,
  validate,
  resetFields
})
</script>
