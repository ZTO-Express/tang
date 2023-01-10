<template>
  <el-row class="mb-4">
    <c-checkbox v-model="checkbox1" v-bind="innerAttrs1"></c-checkbox>
  </el-row>

  <el-row class="mb-4">
    <c-checkbox v-model="checkbox2" v-bind="innerAttrs2"></c-checkbox>
  </el-row>
</template>

<script lang="ts" setup>
import { ref } from '@zto/zpage'

const checkbox1 = ref()
const checkbox2 = ref('B')

const innerAttrs1 = ref<any>({
  checkType: 'radio',
  options: [
    {
      label: 'Option A',
      value: 'A'
    },
    {
      label: 'Option B',
      value: 'B'
    },
    {
      label: 'Option C',
      value: 'C'
    },
    {
      label: 'Option D',
      value: 'D'
    }
  ]
})

const innerAttrs2 = ref<any>({
  checkType: 'radio',
  options: [
    {
      label: 'Option A',
      value: 'A'
    },
    {
      label: 'Option B',
      value: 'B'
    },
    {
      label: 'Option C',
      value: 'C'
    },
    {
      label: 'Option D',
      value: 'D'
    }
  ]
})
</script>
