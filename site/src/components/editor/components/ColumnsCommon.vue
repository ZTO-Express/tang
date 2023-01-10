<template>
  <el-form-item
    label="label"
    :prop="'table.columns.' + props.index + '.label'"
    :rules="
      item.rules || [
        {
          required: true,
          message: '请输入label',
          trigger: ['blur', 'change']
        }
      ]
    "
  >
    <el-input v-model="item.label" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item
    label="prop"
    :prop="'table.columns.' + props.index + '.prop'"
    :rules="
      item.rules || [
        {
          required: true,
          message: '请输入prop',
          trigger: ['blur', 'change']
        }
      ]
    "
  >
    <el-input v-model="item.prop" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item label="width" prop="width">
    <el-input v-model="item.width" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item label="minWidth" prop="minWidth">
    <el-input v-model="item.minWidth" placeholder="请输入" style="width: 100%"></el-input>
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
