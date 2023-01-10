<template>
  <div class="c-ui-action-set-settings fs">
    <div class="side">
      <el-scrollbar height="100%">
        <CUIItems :uis="['action']" :dragCloneMethod="dragCloneMethod" />
      </el-scrollbar>
    </div>
    <div class="body">
      <el-scrollbar class="settings-scrollbar" height="100%" always>
        <CUIDraggablePropertiesItems :items="actionItems">
          <template #itemLabel="{ item }">
            {{ item.name }}
          </template>
          <template #itemBody="{ rootData, item }">
            <CUIActionSettings :root-data="rootData" :data="item" />
          </template>
        </CUIDraggablePropertiesItems>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _, ref, computed, watch } from '@zto/zpage'

import { parseUIActionItem } from '../../../utils'

import type { ZPageDevProperty, ZPageJsonDefinition } from '@/../typings'

const props = defineProps<{
  property: ZPageDevProperty
  rootData: any
  data: any
}>()

/** 活动项 */
const actionItems = ref<any[]>([])

/** 活动项编码 */
const actionItemIndex = ref<number>((actionItems.value?.length || 0) + 1)

const propertyName = computed(() => {
  return props.property?.name
})

watch(
  () => [props.data, props.property],
  () => {
    syncActionItemsFromSet()
  },
  { immediate: true }
)

watch(
  () => actionItems.value,
  () => {
    syncActionSetFromItems()
  },
  { deep: true }
)

/**
 * 克隆方法
 * @param item
 */
function dragCloneMethod(item: ZPageJsonDefinition) {
  const actionItem = parseUIActionItem(item, actionItemIndex.value)

  if (!actionItem) return undefined

  if (actionItem.label) {
    actionItem.label += actionItemIndex.value
  }

  actionItemIndex.value++

  return actionItem
}

/**
 * 从行为项同步行为set
 */
function syncActionSetFromItems() {
  const _actionSet = _.arrayToObject(actionItems.value, 'name')

  props.data[propertyName.value] = _actionSet || {}

  return _actionSet
}

/**
 * 从行为set同步行为项
 */
function syncActionItemsFromSet() {
  if (!props.data || !propertyName.value) return

  // 设置默认内容
  if (!props.data[propertyName.value]) {
    props.data[propertyName.value] = {}
  }

  /**
   * action对象转换为数组
   */
  const _actionArr = _.objectToArray(props.data[propertyName.value], (item, key) => {
    item.name = key
    return item
  })

  actionItems.value = _actionArr

  if (!actionItems.value.length) {
    addItem({ name: 'query', type: 'api', api: 'api/query' })
  }
}

/** 新增项 */
function addItem(itemData: any) {
  actionItems.value.push(itemData)
}
</script>

<style lang="scss" scoped>
.c-ui-action-set-settings {
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
