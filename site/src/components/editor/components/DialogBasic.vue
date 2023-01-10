<template>
  <div style="padding: 4px">
    <el-form-item label="width" prop="width">
      <el-input-number v-model="item.width" placeholder="请输入" style="width: 100%"></el-input-number>
    </el-form-item>

    <el-form-item label="labelWidth" prop="labelWidth">
      <el-input-number v-model="item.labelWidth" placeholder="请输入" style="width: 100%"></el-input-number>
    </el-form-item>

    <el-form-item label="itemSpan" prop="itemSpan">
      <el-input-number
        v-model="item.itemSpan"
        :precision="0"
        :step="1"
        :min="0"
        :max="24"
        placeholder="请输入"
        style="width: 100%"
      ></el-input-number>
    </el-form-item>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from '@zto/zpage'

const props = defineProps<{
  item: any
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

<style lang="scss" scoped></style>
