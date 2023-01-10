<template>
  <div v-if="devDefinition" class="c-ui-definition-properties">
    <Cmpt v-if="uiCmptAttrs.config" v-bind="uiCmptAttrs" />
    <div v-else-if="definition" class="property-items">
      <CUIPropertyItems :properties="visibleProperties" :root-data="rootData" :data="data" />

      <el-collapse v-if="advancedProperties.length" class="column-items-collapse" v-model="collapsedName">
        <el-collapse-item title="更多" name="advanced">
          <CUIPropertyItems :properties="advancedProperties" :root-data="rootData" :data="data" />
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _, ref, computed } from '@zto/zpage'

import { getDevDefinition, SCHEMA_NAMES } from '@/utils/schema'
import { getNodeUISettingsConfig } from '../../utils'

import type { ZPageDevDefinition, ZPageDevProperty } from '@/../typings'

const props = withDefaults(
  defineProps<{
    definition: string | ZPageDevDefinition
    rootData: any
    data: any
    visibleLength: number
    ignoredProperties: string[]
  }>(),
  {
    visibleLength: 2,
    ignoredProperties: () => []
  }
)

const collapsedName = ref<string>('')

/**
 * 开发定义
 */
const devDefinition = computed(() => {
  if (!props.definition) return undefined

  if (_.isString(props.definition)) {
    const def = getDevDefinition(props.definition)
    return def
  }

  return props.definition as unknown as ZPageDevDefinition
})

const visiblePropertyLength = computed(() => {
  return props.visibleLength
})

/** ui配置 */
const uiSettingsConfig = computed(() => {
  if (!devDefinition.value) return undefined

  const config = getNodeUISettingsConfig(devDefinition.value)
  return config
})

/**
 * ui组件属性
 */
const uiCmptAttrs = computed(() => {
  return {
    config: uiSettingsConfig.value?.cmpt,
    definition: devDefinition.value,
    rootData: props.rootData,
    data: props.data
  }
})

/**
 * 所有默认属性
 */
const defaultProperties = computed(() => {
  if (!devDefinition.value) return []

  const defaultCategory = devDefinition.value?.categories.find(it => it.name === SCHEMA_NAMES.DEFAULT)
  return ignoreProperties(defaultCategory?.properties || [])
})

/**
 * 常用属性（一般不超过4个,一直可见）
 */
const visibleProperties = computed(() => {
  return defaultProperties.value.slice(0, visiblePropertyLength.value)
})

/**
 * 扩展属性
 */
const advancedProperties = computed(() => {
  const extendedProperties = defaultProperties.value.slice(visiblePropertyLength.value)
  const advancedCategory = devDefinition.value?.categories.find(it => it.name === SCHEMA_NAMES.ADVANCED)
  return [...extendedProperties, ...ignoreProperties(advancedCategory?.properties || [])]
})

/**
 * 忽略掉指定属性
 */
function ignoreProperties(properties: ZPageDevProperty[]) {
  if (!props.ignoredProperties?.length) return [...properties]

  const filteredProperties = properties.filter(p => !props.ignoredProperties.includes(p.name))

  return filteredProperties
}
</script>

<style lang="scss">
.c-ui-definition-properties {
  position: relative;

  .column-items-collapse {
    border-top: 0px;

    .el-collapse-item {
      &__header {
        background: var(--bg-color);
        border-bottom: 0px;
        opacity: 0.8;
        height: 30px;
        line-height: 30px;
        font-weight: normal;
        font-size: 12px;
        padding-left: 10px;
      }

      &__wrap {
        border-bottom: 0px;
      }

      &__content {
        padding-bottom: 5px;
      }
    }
  }
}
</style>
