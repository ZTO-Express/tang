<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="c-form-item c-form-item-date-range-picker">
    <c-date-range-picker
      v-model:from="model[prop]"
      v-model:to="model[toProp]"
      v-bind="innerAttrs"
      :disabled="disabled"
      @change="handleChange"
    />
    <el-form-item :prop="toProp"></el-form-item>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref, inject } from '@zto/zpage'
import { C_FORM_KEY } from '../../../consts'
import { useFormItem } from '../util'

const cForm = inject<any>(C_FORM_KEY)

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    toProp: string
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const { innerAttrs } = useFormItem(props)

// 值发生变化后，调用form的校验，解决值发生变化后没校验的问题
function handleChange(){
  if (cForm){
    cForm.validateFields([props.prop, props.toProp])
  }
}
</script>
