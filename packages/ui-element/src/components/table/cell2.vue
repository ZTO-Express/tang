<template>
  <div v-if="config" class="c-table-cell text-ellipsis">
    <c-action v-if="config.action" text-ellipsis v-bind="config.action" :context-data="scope">
      {{ innerText }}
    </c-action>
    <content v-else-if="config" v-bind="contentAttrs" :context-data="scope"></content>
    <!-- <slot /> -->
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from '@zto/zpage'

import type { App } from '@zto/zpage'

// 属性
const props = withDefaults(
  defineProps<{
    app: App
    scope: Record<string, any>
    config?: Record<string, any>
  }>(),
  {}
)

/** 内部字符串信息 */
const innerText = computed(() => {
  const app = props.app
  const scope = props.scope
  const config = props.config || {}
  const prop = config.prop

  let innerText = props.scope.row[prop]

  if (config.tpl) {
    innerText = app.filter(config.tpl, scope)
    scope.row.__innerTexts[prop] = innerText
  }

  /** 格式化字段 */
  if (config.formatter) {
    innerText = config.formatter(scope.row, config, scope.row[prop], scope.$index, scope)
  }

  return innerText
})

/** 内容属性 */
const contentAttrs = computed(() => {
  const _contentAttrs = { text: innerText.value, ...props.config }
  return _contentAttrs
})

watch(
  () => innerText,
  () => {
    if (props.scope.row && props.config?.prop) {
      props.scope.row.__innerTexts[props.config.prop] = innerText
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.c-table-cell {
  display: inline;
}
</style>
