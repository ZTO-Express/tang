<template>
  <div class="c-ui-property-category fs">
    <div v-if="categories?.length" class="sub-categories fs">
      <CUIPropertyCategories :categories="categories" :root-data="rootData" :data="categoryPropertyData()" />
    </div>
    <div v-if="isSingleUIProperty" class="single-ui-property fs">
      <CUIPropertyItem :property="category.properties[0]" :root-data="rootData" :data="categoryPropertyData()" />
    </div>
    <div v-else-if="sections?.length" class="sections fs">
      <div v-for="section in sections" :key="section.name" class="section-item">
        <CUIPropertySection :section="section" :root-data="rootData" :data="categoryPropertyData()" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _, warn, computed, reactive } from '@zto/zpage'

import { isDefaultProperty } from '../../utils'

import type { ZPageDevCategory } from '@/../typings'

const props = defineProps<{
  category: ZPageDevCategory
  rootData: any
  data: any
}>()

/** 分类json值 */
const categoryPropertyJson = computed(() => {
  return props.category.json
})

/**
 * 分类属性名
 */
const categoryPropertyName = computed(() => {
  return categoryPropertyJson.value?.name
})

/**
 * 分类
 */
const categories = computed(() => {
  return props.category?.categories || []
})

/**
 * 分区
 */
const sections = computed(() => {
  return props.category?.sections || []
})

/**
 * 分区
 */
const properties = computed(() => {
  return props.category?.properties || []
})

/**
 * 判断此分区下是否只有一个ui属性
 */
const isSingleUIProperty = computed(() => {
  if (categories.value?.length) return false

  return properties.value.length === 1 && !!properties.value[0].ui
})

/**
 * 初始化分类的模型数据
 */
function categoryPropertyData() {
  const propertyName = categoryPropertyName.value
  const propertyJson = categoryPropertyJson.value

  if (!propertyJson || !propertyName) return props.data

  // 存在默认值
  const isDefaultExists = isDefaultProperty(propertyJson)

  // 属性已设置
  const isPropertyExists = _.hasOwnProperty(props.data, propertyName)

  // 初始化当前属性
  if (propertyJson.data === 'sub') {
    if (!isPropertyExists) {
      if (isDefaultExists && !_.isObject(propertyJson.default)) {
        warn(`属性 ${propertyName} 的默认值必须为对象。`)
      }

      props.data[propertyName] = reactive({ ...(propertyJson.default as any) })
    }

    return props.data[propertyName]
  }

  if (!isPropertyExists) {
    props.data[propertyName] = propertyJson.default
  }

  return props.data
}
</script>

<style lang="scss" scoped>
.c-ui-property-category {
  & > .sections {
    overflow-y: auto;
    overflow-x: hidden;
  }

  .single-ui-property {
    & > :deep(.c-ui-property-item) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>

<style lang="scss">
.c-ui-property-category {
  .sub-categories {
    .el-tabs__item {
      font-size: 12px;
      height: 30px;
      line-height: 30px;
    }

    .el-tabs__nav-wrap.is-top {
      &::after {
        height: 1px;
      }

      .el-tabs__active-bar {
        display: none;
      }
    }
  }
}
</style>
