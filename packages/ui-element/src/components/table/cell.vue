<template>
  <div class="c-table-cell text-ellipsis" :style="innerStyle" :class="innerClass">
    <i v-if="isIcon && iconAttrs?.prefix" class="cell-icon prefix" v-bind="iconAttrs" />
    <slot />
    <i v-if="isIcon && !iconAttrs?.prefix" class="cell-icon" v-bind="iconAttrs" />
  </div>
</template>

<script setup lang="ts">
import { _, tpl, computed } from '@zto/zpage'
import { getFullIconClass, parseCssClass } from '../../utils'

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

/** 单元格上下文 */
const cellContext = computed(() => {
  const context = props.app.useContext(props.scope)
  return context
})

/** 样式 */
const innerStyle = computed(() => {
  const configStyle = props.config?.style

  let _innerStyle = {}

  if (_.isFunction(configStyle)) {
    _innerStyle = configStyle(cellContext.value, props.config)
  } else if (configStyle) {
    _innerStyle = tpl.deepFilter(configStyle, cellContext.value)
  }

  return _innerStyle
})

/** 内部class */
const innerClass = computed(() => {
  let _innerClass = { 'expand-content': !!props.config?.expandColumn, ...parseCssClass(props.config?.class) }
  return _innerClass
})

/** icon属性 */
const iconAttrs = computed(() => {
  const iconCfg = tpl.deepFilter(props.config?.icon, cellContext.value)

  let _iconAttrs: any = {}

  if (_.isString(iconCfg)) {
    _iconAttrs.class = getFullIconClass(iconCfg)
  } else if (_.isObject(iconCfg)) {
    _iconAttrs = { ...iconCfg }
    _iconAttrs.class = getFullIconClass(iconCfg)
  }

  return _iconAttrs
})

/** 是否显示icon */
const isIcon = computed(() => {
  return !!iconAttrs.value?.class
})
</script>

<style lang="scss" scoped>
.c-table-cell {
  display: inline;

  & > i.cell-icon {
    margin-left: 2px;
    color: var(--primary);

    &.prefix {
      margin-left: 0px;
      margin-right: 2px;
    }
  }
}
</style>
