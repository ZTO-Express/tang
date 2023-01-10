<template>
  <el-row class="mb-4">
    <el-col :span="12">
      <c-date-range-picker v-model="value1" v-bind="innerAttrs1"></c-date-range-picker>
    </el-col>
  </el-row>

  <el-row class="mb-4">
    <el-col :span="12">
      <c-date-range-picker v-model="value2" v-bind="innerAttrs2"></c-date-range-picker>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref } from '@zto/zpage'

const value1 = ref()
const value2 = ref(['2022-11-11', '2022-12-12'])

const innerAttrs1 = ref<any>({
  disabled: true,
  clearable: true,
  rangeSeparator: '-',
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期'
})

const innerAttrs2 = ref<any>({
  disabled: true,
  clearable: true,
  rangeSeparator: '-',
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期'
})
</script>
