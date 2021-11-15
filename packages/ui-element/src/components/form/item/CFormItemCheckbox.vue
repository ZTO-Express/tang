<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-checkbox-group
    v-model="model[prop]"
    v-bind="$attrs"
    :disabled="disabled"
    style="height: 28px"
    @change="handleChange"
  >
    <template v-if="buttonType === 'button'">
      <el-checkbox-button
        v-for="(item, index) in options"
        :key="'radio' + index"
        :label="item[optionValueProp]"
      >
        {{ item[optionLabelProp] }}
      </el-checkbox-button>
    </template>
    <template v-else>
      <el-checkbox
        v-for="(item, index) in options"
        :key="'checkbox' + index"
        :label="item[optionValueProp]"
      >
        {{ item[optionLabelProp] }}
      </el-checkbox>
    </template>
  </el-checkbox-group>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue } from '@zpage/zpage'
const { ref } = vue

const props = withDefaults(
  defineProps<{
    model: GenericObject
    prop: string
    buttonType?: string
    options: Array<any>
    optionValueProp?: string
    optionLabelProp?: string
    disabled?: boolean
    onChange?: GenericFunction
  }>(),
  {
    buttonType: 'check', // button
    optionValueProp: 'value',
    optionLabelProp: 'label',
    disabled: false
  }
)

function handleChange(payload: any) {
  if (!props.onChange) return
  props.onChange(props.model, payload)
}
</script>
