<template>
  <div class="c-ui-property-item">
    <Cmpt v-if="cmptAttrs.config && !forceFormMode" v-bind="cmptAttrs" />
    <CUIPropertyFormItems
      v-else-if="formAttrs?.items?.length"
      :property="property"
      :root-data="rootData"
      :data="data"
      :form-attrs="formAttrs"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from '@zto/zpage'

import { getNodeUISettingsConfig, useUIProperty } from '../../utils'

import type { ZPageDevProperty } from '@/../typings'

const props = defineProps<{
  property: ZPageDevProperty
  rootData: any
  data: any

  /**
   * 强制展示表单模式，一般用于自定义组件想要复用属性项的情况
   */
  forceFormMode: boolean
}>()

useUIProperty(props)

const propertyName = computed(() => {
  return props.property.name
})

watch(
  () => props.data,
  () => {
    // 初始化属性值
    if (propertyName.value && props.property.properties?.length) {
      if (!props.data[propertyName.value]) {
        props.data[propertyName.value] = {}
      }
    }
  },
  {
    immediate: true
  }
)

/** ui配置 */
const uiSettingsConfig = computed(() => {
  const config = getNodeUISettingsConfig(props.property)
  return config
})

/**
 * ui组件属性
 */
const cmptAttrs = computed(() => {
  return {
    config: uiSettingsConfig.value?.cmpt,
    property: props.property,
    rootData: props.rootData,
    data: props.data
  }
})

/**
 * 表单项属性
 */
const formAttrs = computed(() => {
  return uiSettingsConfig.value?.form
})

/**
 * 内部属性(暂不支持)
 */
const innerProperties = computed(() => {
  return props.property.properties
})
</script>

<style lang="scss" scoped>
.form-items {
  display: flex;

  & > .items-body {
    flex: 1;
  }
}
</style>
