<template>
  <el-form-item label="label" prop="label">
    <el-input v-model="item.label" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item label="prop" prop="prop">
    <el-input v-model="item.prop" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item label="placeholder" prop="placeholder">
    <el-input v-model="item.placeholder" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item label="span" prop="span">
    <el-input-number
      v-model="item.span"
      :precision="0"
      :step="1"
      :min="0"
      :max="24"
      placeholder="请输入"
      style="width: 100%"
    />
  </el-form-item>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from '@zto/zpage'

const props = defineProps<{
  item: any
  index: any
}>()

const item = ref<any>(null)

onMounted(() => {
  item.value = props.item
})

watch(
  () => props.item,
  () => {
    item.value = props.item
  },
  { immediate: true, deep: true }
)
</script>
