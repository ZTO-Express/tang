<!-- eslint-disable vue/no-mutating-props -->
<template>
  <c-checkbox ref="fieldRef" v-model="model[prop]" v-bind="innerAttrs" :context-data="model" :disabled="disabled" />
  <!-- 下面代码，防止初始化时报错 -->
  <div style="display: none">{{ model[prop] }}</div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref, useCurrentAppInstance } from '@zto/zpage'
import { useFormItem } from '../util'

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

const app = useCurrentAppInstance()
const fieldRef = ref()

const { innerAttrs, allAttrs } = useFormItem(props)

// 注册微件事件监听
app.useWidgetEmitter(allAttrs.value, { fetchOn: doFetch })

async function doFetch() {
  await fieldRef.value?.fetchOptions()
}
</script>
