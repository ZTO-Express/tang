<template>
  <div class="c-drawer-action">
    <el-button v-bind="buttonAttrs" :disabled="disabled" @click="handleClick">
      {{ label }}
    </el-button>

    <c-drawer :title="title">
      <!-- <widget :schema="drawerSchema"></widget> -->
    </c-drawer>
  </div>
</template>

<script setup lang="ts">
import { _, computed, useAttrs, useCurrentAppInstance } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    label: string
    title?: string
    disabled?: boolean
    contextData?: any // 数据上下文
    beforeTrigger?: Function
    onTrigger?: Function
    afterTrigger?: Function
  }>(),
  {
    disabled: false
  }
)

const attrs = useAttrs()

const app = useCurrentAppInstance()

const actionContext = computed(() => {
  const context = app.useContext(props.contextData)
  return context
})

const buttonAttrs = computed(() => {
  return
})

function handleClick() {}

/** 触发活动 */
async function trigger() {
  const flag = await onBeforeTrigger()
  if (flag === false) return

  if (props.onTrigger) return props.onTrigger()

  await onAfterTrigger()
}

function onBeforeTrigger() {
  return Promise.resolve().then(() => {
    if (props.beforeTrigger) return props.beforeTrigger(actionContext.value)
  })
}

function onAfterTrigger() {
  return Promise.resolve().then(() => {
    if (props.afterTrigger) return props.afterTrigger(actionContext.value, attrs)
  })
}

defineExpose({
  trigger
})
</script>

<style lang="scss" scoped>
.c-drawer-action {
  display: inline-block;
}
</style>
