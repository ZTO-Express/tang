<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-switch
    v-model="model[prop]"
    v-bind="innerAttrs"
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :disabled="disabled"
    :before-change="innerBeforeChangeMethod"
    @change="handleSwitchChange"
  />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { useFormItem } from '../util'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    disabled?: boolean
    beforeChange?: Function
    activeValue?: any
    inactiveValue?: any
  }>(),
  {
    disabled: false,
    activeValue: 1,
    inactiveValue: 0
  }
)

// 当值为['', null, undefined]，默认值调整为false
if (['', null, undefined].includes(props.model[props.prop])) {
  props.model[props.prop] = props.inactiveValue
}

const { app, innerAttrs, handleChange } = useFormItem(props, {
  customeChangeEvent: true
})

const innerBeforeChangeMethod = () => {
  if (props.beforeChange) {
    const context = app.useContext(props.model)
    return props.beforeChange(props.model, context)
  }
  return true
}

function handleSwitchChange(val: any) {
  handleChange(val)
}
</script>
