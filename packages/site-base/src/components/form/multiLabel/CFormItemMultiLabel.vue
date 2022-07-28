<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="c-form-item-multi-label">
    <div class="label-select">
      <el-select v-model="selectValue" @change="handleSelect">
        <el-option 
          v-for="(item, index) in props.labelOptions" 
          :key="item.value" 
          :label="item.label||'label'" 
          :value="item.value||'value'"
        >
        </el-option>
      </el-select>
    </div>
    <div class="c-form-item c-form-item-date-range-picker">
      <c-date-range-picker
        v-model:from="model[prop]"
        v-model:to="model[toProp]"
        v-bind="innerAttrs"
        :disabled="disabled"
      />
      <el-form-item :prop="toProp"></el-form-item>
    </div>
  </div>
  
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from '@zto/zpage'

import { useFormItem } from '../util'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    disabled?: boolean
    labelOptions: any
  }>(),
  {
    disabled: false
  }
)

// prop 和 toProp 默认第一条option
const prop = ref(props.labelOptions[0].prop)
const toProp = ref(props.labelOptions[0].toProp)

// 保存初始化的prop和toProp值
const defaultPropValue = ref()
const defaultToPropValue = ref()
onMounted(() => {
  defaultPropValue.value = props.model[prop.value]
  defaultToPropValue.value = props.model[toProp.value]
})
const selectValue = ref(props.labelOptions[0].value) // 下拉框选中值,默认选中第一条

function handleSelect(selectVal: any) {
  props.model[prop.value] = undefined
  props.model[toProp.value] = undefined
  const labelOptions = props.labelOptions
  const selectOptionList = labelOptions.filter((option: any) => option.value === selectVal)
  const selectOption = selectOptionList[0]
  // 切换维度之后，时间重置为初始化时间
  prop.value = selectOption.prop
  toProp.value = selectOption.toProp
  props.model[prop.value] = defaultPropValue.value
  props.model[toProp.value] = defaultToPropValue.value
}

const { innerAttrs } = useFormItem(props)
</script>

<style lang='scss' scoped>
.c-form-item-multi-label {
  display: flex;
  .label-select {
    width: 100px
  }
  .c-form-item-date-range-picker {
    margin-left: 10px;
  }
}

:deep(.label-select .el-input__inner) {
  padding-left: 4px;
  padding-right: 15px;
}
:deep(.el-input__suffix) {
  width: 20px;
  height: 20px;
}
</style>