<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="c-form-item-content">
    <div v-if="innerIconClass" class="icon">
      <i :class="innerIconClass"></i>
    </div>
    <div class="content">
      <content :content="innerContent" :context-data="model" />
    </div>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _, computed } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    content?: any
    icon?: string | boolean
    iconType?: string
    html?: any
  }>(),
  {
    icon: false
  }
)

const innerIconClass = computed(() => {
  let icon = props.icon
  let iconType = props.iconType

  if (!icon && !iconType) return ''

  if (_.isBoolean(icon)) icon = `el-icon-${iconType}`
  return `${icon} ${iconType}`
})

const innerContent = computed(() => {
  const content = props.content

  if (props.html) return { html: props.html }
  return content || ''
})
</script>

<style lang="scss" scoped>
.c-form-item-content {
  display: flex;

  & > .icon {
    font-size: 24px;

    & > i {
      color: var(--warning);

      &.success {
        color: var(--success);
      }

      &.error,
      &.danger {
        color: var(--danger);
      }

      &.info {
        color: var(--info);
      }
    }
  }

  & > .content {
    flex: 1;
    line-height: initial;
    line-height: 24px;
    padding: 0 10px;
  }
}
</style>
