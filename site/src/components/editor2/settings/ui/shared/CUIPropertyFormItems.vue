<template>
  <div class="c-ui-property-form-items">
    <div class="header">
      <div class="title">
        <slot name="title">
          {{ property.label }}
        </slot>
      </div>
      <div class="extra">
        <slot name="extra" v-bind="{ property, rootData, data }">
          <div class="tip">
            <c-poptip v-if="innerTip" icon="info" :html="innerTip" />
          </div>
        </slot>
      </div>
    </div>

    <div class="body">
      <div class="form-body">
        <slot name="formBody">
          <CFormItems :show-operation="false" v-bind="innerFormAttrs" :model="data" />
        </slot>
      </div>
      <div class="form-extra">
        <slot name="formExtra"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from '@zto/zpage'

import type { ZPageDevProperty } from '@/../typings'

const props = defineProps<{
  property: ZPageDevProperty
  rootData: any
  data: any
  tip?: string
  formAttrs?: any
  formItemAttrs?: any
}>()

/**
 * 提示信息
 */
const innerTip = computed(() => {
  return props.tip || props.property?.description
})

/**
 * 表格属性
 */
const innerFormAttrs = computed(() => {
  const property = props.property

  let formItems = props.formAttrs?.items || []

  if (!formItems.length) {
    formItems = [{ type: 'input', label: property.label, prop: property.name, ...props.formItemAttrs }]
  }

  return { span: 24, ...props.formAttrs, items: formItems }
})
</script>

<style lang="scss" scoped>
.c-ui-property-form-items {
  position: relative;

  & > .header {
    color: var(--text-color);
    display: flex;
    font-size: 12px;
    line-height: 28px;
    padding: 0 2px;

    & > .title {
      flex: 1;
    }
  }

  & > .body {
    display: flex;

    & > .form-body {
      flex: 1;

      :deep(.el-form-item__label) {
        display: none;
      }
    }
  }
}
</style>
