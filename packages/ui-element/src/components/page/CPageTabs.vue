<template>
  <el-tabs
    class="c-page-tabs"
    :class="{ fh: fullHeight, 'show-pane': showPane }"
    :model-value="modelValue"
    :tab-position="tabPosition"
    @tab-click="handleTabClick"
  >
    <el-tab-pane v-for="item in tabItems" :key="item.value" :label="item.label" :name="item.value">
      <slot v-if="showPane" v-bind="item" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { vue } from '@zto/zpage'

const { ref, watch, onMounted } = vue

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

function handleTabClick(tab: any) {
  const tabName = tab.paneName

  if (tabName !== props.modelValue) {
    emit('update:modelValue', tabName)

    const item = props.tabItems.find((it) => it.value === tabName)
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
