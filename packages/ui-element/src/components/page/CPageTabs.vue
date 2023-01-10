<template>
  <el-tabs
    class="c-page-tabs"
    :class="{ fh: fullHeight, 'show-pane': showPane }"
    :model-value="modelValue"
    :tab-position="tabPosition"
    @tab-click="handleTabClick"
  >
    <el-tab-pane
      v-for="item in newTabItems"
      class="page-tab-pane"
      :key="item.value"
      :label="item.label"
      :name="item.value"
    >
      <slot v-if="showPane" v-bind="item" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, useCurrentAppInstance } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    tabItems?: Array<any>
    tabPosition?: string
    fullHeight?: boolean
    showPane?: boolean
  }>(),
  {
    tabItems: () => [],
    tabPosition: 'top',
    modelValue: '',
    fullHeight: false,
    showPane: false
  }
)

const emit = defineEmits(['update:modelValue', 'change'])

const app = useCurrentAppInstance()
// 根据权限筛选出新的newTabItems数据
const newTabItems = computed(() => {
  return props.tabItems.filter(item => app.checkPermission(item.perm))
})

// newTabItems数据查找是否有配置的默认值default
const isHasDefault = computed(() => {
  return newTabItems.value.filter(item => item.value === props.modelValue).length > 0
})

onMounted(() => {
  // 如果newTabItems数据里面没有匹配到默认值default，则设置第一个
  if (!isHasDefault.value) {
    emit('update:modelValue', newTabItems.value?.[0]?.value)
  }
})

function handleTabClick(tab: any) {
  const tabName = tab.paneName

  if (tabName !== props.modelValue) {
    emit('update:modelValue', tabName)

    const item = newTabItems.value.find(it => it.value === tabName)
    emit('change', item)
  }
}
</script>

<style lang="scss" scoped>
.c-page-tabs {
  background: white;

  &.show-pane {
    :deep(.el-tabs__content) {
      height: calc(100% - 55px);
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }
}

.page-tab-pane {
  overflow-y: auto;
}

:deep(.el-tabs__nav-wrap) {
  &.is-top {
    padding: 0 20px;
  }
}

:deep(.el-tabs__item) {
  &:not(.is-active) {
    opacity: 0.5;
  }
}
</style>
