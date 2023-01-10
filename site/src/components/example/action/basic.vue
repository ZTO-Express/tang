<template>
  <el-row class="mb-4">
    <c-action class="mr-10">default</c-action>
    <c-action name="default" class="mr-10"></c-action>
    <c-action label="default" class="mr-10"></c-action>
    <c-action label="disabled" disabled class="mr-10"></c-action>
    <c-action label="text" button-type="text" class="mr-10"></c-action>
    <c-action label="link" button-type="link" class="mr-10"></c-action>
    <c-action label="default" button-type="default" class="mr-10"></c-action>
    <c-action label="primary" button-type="primary" class="mr-10"></c-action>
    <c-action label="success" button-type="success" class="mr-10"></c-action>
    <c-action label="info" button-type="info" class="mr-10"></c-action>
    <c-action label="warning" button-type="warning" class="mr-10"></c-action>
    <c-action label="danger" button-type="danger" class="mr-10"></c-action>
  </el-row>

  <el-row class="mb-4">
    <c-action label="link" :inner-attrs="innerAttrs1" class="mr-10"></c-action>
    <c-action label="text" :inner-attrs="innerAttrs2" class="mr-10"></c-action>
    <c-action label="primary" :inner-attrs="innerAttrs3" class="mr-10"></c-action>
  </el-row>
</template>

<script lang="ts" setup>
import { ref } from '@zto/zpage'

const innerAttrs1 = ref<any>({
  button: {
    type: 'text',
    label: 'text' // 无效
  }
})

const innerAttrs2 = ref<any>({
  button: {
    type: 'link',
    label: 'link' // 无效
  }
})

const innerAttrs3 = ref<any>({
  button: {
    type: 'primary',
    label: 'primary', // 无效
    disabled: true // 无效
  }
})
</script>
