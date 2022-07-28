<template>
  <el-popover class="c-poptip" v-bind="$attrs" :trigger="trigger" :placement="placement" :title="innerTitle">
    <template #reference>
      <el-button class="btn-reference" :type="type || 'text'" :class="iconClass" :style="tipStyle">
        <span>{{ label }}</span>
      </el-button>
    </template>
    <slot>
      <content :content="innerContent" :context-data="contextData" />
    </slot>
  </el-popover>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _, computed, tpl, useCurrentAppInstance } from '@zto/zpage'
import { getFullIconClass } from '../../utils'

const app = useCurrentAppInstance()

const props = withDefaults(
  defineProps<{
    type?: string
    contextData?: any
    icon?: string | Record<string, any>
    label?: string
    title?: string
    color?: string
    content?: any
    html?: any
    tipStyle?: any
    trigger?: string
    placement?: string
  }>(),
  {
    trigger: 'hover',
    placement: 'top'
  }
)

const cmptContext = computed(() => {
  const context = app.useContext(props.contextData)
  return context
})

const innerTitle = computed(() => {
  if (!props.title) return ''
  return tpl.filter(props.title, cmptContext.value)
})

const innerContent = computed(() => {
  const content = props.content

  if (props.html) return { html: props.html }

  return content || ''
})

const iconClass = computed(() => {
  const iconCfg = tpl.deepFilter(props.icon, cmptContext.value)
  const _iconClass = getFullIconClass(iconCfg, 'el-icon-warning')
  return _iconClass
})
</script>

<style lang="scss" scoped>
.btn-reference {
  margin-left: 2px;
  color: var(--info);
}
</style>
