<template>
  <div class="c-form-item-uploaders">
    <c-form-item-uploader
      v-for="(it, index) in items"
      v-model="model[it.prop]"
      :key="`${it.prop}_${index}`"
      v-bind="{ required, ...itemAttrs, ...it }"
      :model="model"
    />
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref, computed } from '@zto/zpage'

import { UploaderItem } from '../../../typings'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    itemAttrs?: any
    items?: UploaderItem[] // image, camera,
    required?: boolean
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)
</script>

<style lang="scss" scoped>
.c-form-item-uploaders {
  display: flex;
  flex-wrap: wrap;
}

.uploader-item {
  & > .label {
    width: 88px;
    text-align: center;
    padding: 0 5px 5px 5px;
    box-sizing: border-box;
    line-height: 1.1rem;
    color: gray;
  }
}
</style>
