<template>
  <el-button :type="buttonType" :size="size" @click="handleClick">
    <slot>
      {{ isExpanded ? hideLabelText || '收起' : expandLabelText || '展开' }}
    </slot>
    <span v-if="showIcon" class="arrow-icon">
      <i :class="isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
    </span>
  </el-button>
</template>

<script setup lang="ts">
import { vue } from '@zto/zpage'
const { ref, watch } = vue

const props = withDefaults(
  defineProps<{
    buttonType?: string
    modelValue?: boolean
    showIcon?: boolean
    reversed?: boolean
    size?: string
    expandLabelText?: string
    hideLabelText?: string
  }>(),
  {
    buttonType: 'primary',
    modelValue: false,
    showIcon: true,
    reversed: false,
    size: '',
    expandLabelText: '',
    hideLabelText: ''
  }
)

const emit = defineEmits(['update:modelValue'])

const modelValue = ref<boolean>(props.modelValue)

let isExpanded = ref<boolean>(props.reversed ? !modelValue.value : modelValue.value)

watch(
  () => modelValue,
  (cur) => {
    isExpanded.value = cur.value
  }
)

watch(
  () => isExpanded,
  () => {
    emit('update:modelValue', isExpanded)
  }
)

function handleClick() {
  isExpanded.value = !isExpanded.value
}
</script>

<style lang="scss" scoped>
.arrow-icon {
  margin-left: 5px;
}
</style>
