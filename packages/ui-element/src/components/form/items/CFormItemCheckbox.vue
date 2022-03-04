<!-- eslint-disable vue/no-mutating-props -->
<template>
  <c-checkbox ref="fieldRef" v-model="model[prop]" v-bind="$attrs" :disabled="disabled" />
  <!-- 下面代码，防止初始化时报错 -->
  <div style="display: none">{{ model[prop] }}</div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue, useWidgetEmitter } from '@zto/zpage'
const { ref, useAttrs } = vue
const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    disabled?: boolean
    maxlength?: number
  }>(),
  {
    disabled: false
  }
)

const attrs = useAttrs()
const fieldRef = ref()

// 注册微件事件监听
useWidgetEmitter(attrs, {
  fetchOn: doFetch
})

async function doFetch() {
  await fieldRef.value?.fetchOptions()
}
</script>
