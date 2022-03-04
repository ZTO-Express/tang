<template>
  <el-drawer v-modal="isShow">
    <template #title>
      <div class="drawer-title">
        <slot name="title">{{ title }}</slot>
      </div>
    </template>
    <div class="drawer-body-con">
      <slot />
    </div>
  </el-drawer>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue, vueRouter, tpl, noop, _, useApiRequest, useAppContext } from '@zto/zpage'
import { useMessage } from '../../composables'

import type { GenericFunction } from '@zto/zpage'

const { ref, watch } = vue
const { onBeforeRouteUpdate } = vueRouter

const props = withDefaults(
  defineProps<{
    title?: string
  }>(),
  {}
)

const emit = defineEmits(['close', 'submit'])

const isShow = ref(false)

const { Message } = useMessage()
const apiRequest = useApiRequest()

let __callbacks__: GenericFunction[] = []

const dataModel = ref<any>({})

const drawerVisible = ref(true)

// 路由变化时关闭drawer
onBeforeRouteUpdate(() => {
  close()
})

/**
 * 展示
 */
function show(payload: any, callback?: GenericFunction) {
  isShow.value = true
}

/**
 * 关闭
 */
function close(options?: any) {
  // 关闭状态不处理
  if (!isShow.value) return
  isShow.value = false

  // callback清除
  __callbacks__ && (__callbacks__.length = 0)

  emit('close', { model: dataModel.value })
}

/** 提交表单 */
async function doSubmit(options?: any) {}

defineExpose({
  show,
  close
})
</script>

<style lang="scss" scoped>
.c-drawer {
  .drawer-title {
    font-size: 14px;
    font-weight: bold;
  }

  &.no-padding {
    .el-drawer__body {
      padding: 0;
    }
  }
}
</style>
