<template>
  <el-row class="mb-4">
    <c-checkbox v-model="checkbox1" v-bind="innerAttrs1"></c-checkbox>
  </el-row>
</template>

<script lang="ts" setup>
import { ref } from '@zto/zpage'

const checkbox1 = ref(['A', 'D'])

const innerAttrs1 = ref<any>({
  checkType: 'checkbox',
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
      value: 'C',
      disabled: true
    },
    {
      label: 'Option D',
      value: 'D',
      disabled: true
    }
  ]
})
</script>
