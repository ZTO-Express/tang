<template>
  <el-row class="mb-4">
    <el-col :span="12">
      <c-action @click="handleOpen">打开抽屉</c-action>
      <c-drawer ref="drawerRef" v-bind="innerAttrs1"></c-drawer>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref } from '@zto/zpage'

const drawerRef = ref()

const innerAttrs1 = ref<any>({
  title: '抽屉'
})

const handleOpen = () => {
  drawerRef.value.show()
}
</script>
