<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-radio-group
    v-model="model[prop]"
    v-bind="$attrs"
    :disabled="disabled"
    style="height: 28px"
    @change="handleChange"
  >
    <template v-if="buttonType === 'button'">
      <el-radio-button
        v-for="(item, index) in options"
        :key="'radio' + index"
        :label="item[optionValueProp]"
      >
        {{ item[optionLabelProp] }}
      </el-radio-button>
    </template>
    <template v-else>
      <el-radio
        v-for="(item, index) in options"
        :key="'radio' + index"
        :label="item[optionValueProp]"
      >
        {{ item[optionLabelProp] }}
      </el-radio>
    </template>
  </el-radio-group>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    model: GenericObject
    prop: string
    options: Array<any>
    buttonType?: string
    optionValueProp?: string
    optionLabelProp?: string
    disabled?: boolean
    onChange?: GenericFunction
  }>(),
  {
    buttonType: 'radio', // button
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
