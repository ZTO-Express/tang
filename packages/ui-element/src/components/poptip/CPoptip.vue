<template>
  <el-popover class="c-poptip" :title="title">
    <template #reference>
      <el-button
        v-if="label || icon"
        class="btn-reference"
        :type="type || 'text'"
        :icon="icon || 'el-icon-warning'"
        :style="tipStyle"
      >
        <span>{{ label }}</span>
      </el-button>
    </template>
    <slot>
      <span>{{ innerContent }}</span>
    </slot>
  </el-popover>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { computed, renderHtml, useCurrentAppInstance } from '@zto/zpage'

const app = useCurrentAppInstance()

const props = defineProps<{
  type?: string
  contextData?: any
  icon?: string
  label?: string
  title?: string
  content?: any
  tipStyle?: any
}>()

const innerContent = computed(() => {
  const context = app.useContext(props.contextData)
  return renderHtml(props.content, context)
})
</script>

<style lang="scss" scoped>
.btn-reference {
  margin-left: 2px;
}
</style>
