<template>
  <el-row class="mb-4">
    <el-col :span="12">
      <c-action @click="handleOpen">打开弹窗</c-action>
      <c-dialog ref="dialogRef" v-bind="innerAttrs1"></c-dialog>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref } from '@zto/zpage'

const dialogRef = ref()

const innerAttrs1 = ref<any>({
  title: '弹窗',
  loading: false,
  width: '50%',
  size: 'large'
})

const handleOpen = () => {
  dialogRef.value.show()
}
</script>
