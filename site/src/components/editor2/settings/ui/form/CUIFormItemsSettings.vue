<template>
  <div class="c-ui-form-items-settings fs">
    <div class="side">
      <el-scrollbar height="100%">
        <CUIItems :uis="['formItem']" :dragCloneMethod="dragCloneMethod" />
      </el-scrollbar>
    </div>
    <div class="body">
      <el-scrollbar class="settings-scrollbar" height="100%" always>
        <CUIDraggablePropertiesItems :items="formItems">
          <template #itemBody="{ rootData, item }">
            <CUIFormItemSettings :root-data="rootData" :data="item" />
          </template>
        </CUIDraggablePropertiesItems>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from '@zto/zpage'

import { parseUIFormItem } from '../../utils'

import type { ZPageDevProperty, ZPageJsonDefinition } from '@/../typings'

const props = defineProps<{
  property: ZPageDevProperty
  rootData: any
  data: any
}>()

/** 表单项 */
const formItems = ref<any[]>([])

/** 表单项编码 */
const formItemIndex = ref<number>((formItems.value?.length || 0) + 1)

watch(
  () => [props.data, props.property],
  () => {
    if (!props.data || !props.property?.name) return

    // 设置默认内容
    if (!props.data[props.property?.name]) {
      props.data[props.property?.name] = []
    }

    formItems.value = props.data[props.property?.name]

    if (!formItems.value.length) {
      addItem({ type: 'input', label: '输入框1', prop: 'prop1' })
    }
  },
  {
    immediate: true
  }
)

/**
 * 克隆方法
 * @param item
 */
function dragCloneMethod(item: ZPageJsonDefinition) {
  const formItem = parseUIFormItem(item)
  if (!formItem) return undefined

  if (formItem.label) {
    formItem.label += formItemIndex.value
  }

  if (formItem.prop) {
    formItem.prop = `${formItem.prop}${formItemIndex.value}`
  }

  formItemIndex.value++

  return formItem
}

/** 新增项 */
function addItem(itemData: any) {
  formItems.value.push(itemData)
}
</script>

<style lang="scss" scoped>
.c-ui-form-items-settings {
  display: flex;

  & > .side {
    width: 70px;
    padding-right: 5px;
    border-right: 1px solid var(--border-color);
  }

  & > .body {
    flex: 1;
    padding-left: 5px;
    box-sizing: border-box;

    .settings-scrollbar {
      overflow-x: hidden;
      padding-right: 15px;
    }
  }
}
</style>
