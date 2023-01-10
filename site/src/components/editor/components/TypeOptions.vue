<!-- <template>
  <el-form-item
    label="options"
    :prop="'search.items.' + props.index + '.options'"
    :rules="[
      {
        required: true,
        message: '请输入options',
        trigger: ['blur', 'change']
      }
    ]"
  >
    <el-row v-for="(option, key) in item.options" :key="key">
      <el-col :span="10">
        <el-form-item
          label=""
          :prop="'search.items.' + props.index + '.options.' + key + '.label'"
          :rules="[
            {
              required: true,
              message: '请输入label',
              trigger: ['blur', 'change']
            }
          ]"
        >
          <el-input v-model="option.label" placeholder="请输入" style="width: 100%"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item
          label=""
          :prop="'search.items.' + props.index + '.options.' + key + '.value'"
          :rules="[
            {
              required: true,
              message: '请输入value',
              trigger: ['blur', 'change']
            }
          ]"
        >
          <el-input v-model="option.value" placeholder="请输入" style="width: 100%"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-button type="text" @click.prevent="handleDelete(option)">删除</el-button>
      </el-col>
    </el-row>
    <el-button @click="handleAdd">新增选项</el-button>
  </el-form-item>
</template> -->

<template>
  <el-form-item label="options" prop="options">
    <el-row v-for="(option, key) in item.options" :key="key">
      <el-col :span="10">
        <el-form-item label="" prop="label">
          <el-input v-model="option.label" placeholder="请输入" style="width: 100%"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item label="" prop="value">
          <el-input v-model="option.value" placeholder="请输入" style="width: 100%"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-button type="text" @click.prevent="handleDelete(option)">删除</el-button>
      </el-col>
    </el-row>
    <el-button @click="handleAdd">新增选项</el-button>
  </el-form-item>
</template>

<script lang="ts" setup>
import { reactive } from '@zto/zpage'

const props = defineProps<{
  item: any
  index: any
}>()

const item = reactive<any>(props.item)

item.options = item.options || [
  { label: '选项1', value: 1 },
  { label: '选项2', value: 2 }
]

const handleAdd = () => {
  const len = item.options.length
  item.options.push({
    label: `选项${len + 1}`,
    value: len + 1
  })
}

const handleDelete = (option: any) => {
  const index = item.options.indexOf(option)
  if (index !== -1) {
    item.options.splice(index, 1)
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-form-item__content) {
  height: auto;
}
</style>
