<template>
  <div :class="`c-file-trigger border border-${borderStyle}`">
    <form ref="formRef">
      <input
        ref="fileRef"
        type="file"
        :disabled="disabled"
        :accept="accept"
        :multiple="multipleStr"
        @change="handleFileSelected()"
      />
    </form>
    <slot> </slot>
  </div>
</template>

<script setup lang="ts">
import { vue } from '@zpage/zpage'
const { computed, ref } = vue

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    accept?: string
    multiple?: boolean
    border?: string | boolean
  }>(),
  {
    disabled: false,
    multiple: false
  }
)

const emit = defineEmits(['selected', 'file-selected'])

const formRef = ref<any>()
const fileRef = ref<any>()

const multipleStr = computed(() => {
  return props.multiple ? 'true' : 'false'
})

const borderStyle = computed(() => {
  let border = props.border

  if (typeof border === 'boolean') {
    if (border === false) {
      border = 'none'
    } else if (border === true) {
      border = 'dashed'
    }
  }
  border = border || 'dashed'
  return border
})

// 文件选择完成触发
function handleFileSelected() {
  const files = getFiles()

  if (!files.length) return

  if (props.multiple) {
    emit('file-selected', files)
  } else {
    emit('file-selected', files[0])
  }

  emit('selected', files)

  formRef.value.reset()
}

function getFiles() {
  let input = fileRef.value
  return [...input.files]
}

function reset() {
  let input = fileRef.value
  input.value = ''

  if (!/safari/i.test(navigator.userAgent)) {
    input.type = ''
    input.type = 'file'
  }
}
</script>

<style lang="scss" scoped>
.c-file-trigger {
  position: relative;
  display: inline-block;

  &.border {
    border-color: #d9d9d9;
    border-radius: 4px;

    &-none {
      border: 0;
    }
    &-dashed {
      border: 1px dashed;
    }
  }

  input {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 100;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0;
    cursor: pointer;
    font-size: 0; // 设置font-size为0， 否则cursor样式无效
  }
}
</style>
