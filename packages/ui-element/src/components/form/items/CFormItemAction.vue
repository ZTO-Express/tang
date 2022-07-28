<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <c-action
    class="c-form-item-action"
    :class="{ 'full-width': fullWidth }"
    v-bind="innerAttrs"
    :contextData="model"
    :label="actionLabel"
    :disabled="disabled"
    :after-trigger="afterTriggerMethod"
  />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _ } from '@zto/zpage'
import { useFormItem } from '../util'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop?: string
    propMap?: string
    disabled?: boolean
    actionLabel?: string
    fullWidth?: boolean
    afterTrigger?: Function
    resultPropsMap?: Record<string, string> // 将action请求结果映射到表单上
  }>(),
  {
    disabled: false
  }
)

const { innerAttrs } = useFormItem(props)

function afterTriggerMethod(options: any, payload: any, config: any) {
  if (props.afterTrigger) {
    props.afterTrigger(options, payload, config)
  }

  const propsMap = props.resultPropsMap || {}
  if (props.prop) propsMap[props.prop] = props.propMap || props.prop

  let data = payload || {}
  Object.keys(propsMap).forEach(key => {
    const mapKey = propsMap[key]
    if (mapKey && key) {
      _.set(props.model, key, data[mapKey])
    }
  })
}
</script>

<style lang="scss" scoped>
.c-form-item-action {
  &.full-width {
    :deep(button) {
      width: 100%;
    }
  }
}
</style>
