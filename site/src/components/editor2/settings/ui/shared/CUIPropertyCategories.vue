<template>
  <div class="c-ui-property-categories fs">
    <!-- 只有一个分类则不显示分区 -->
    <template v-if="categories?.length === 1">
      <CUIPropertyCategory :category="categories[0]" :root-data="rootData" :data="data" />
    </template>
    <template v-else>
      <el-tabs v-model="activeTabName" class="editor-header-tabs fs">
        <el-tab-pane v-for="cat in categories" class="header-tab-panel fs" :key="cat.name" :name="cat.name">
          <template #label>
            <span>{{ cat.label }}</span>
          </template>
          <div class="settings-body fs">
            <CUIPropertyCategory :category="cat" :root-data="rootData" :data="data" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from '@zto/zpage'

import type { ZPageDevCategory } from '@/../typings'

const props = defineProps<{
  categories: ZPageDevCategory[]
  rootData: any
  data: any
}>()

// 当前激活按钮
const activeTabName = ref<string>('')

/**
 * 分类
 */
const categories = computed(() => {
  return props.categories || []
})

/** 监听分类变化 */
watch(
  () => categories.value,
  () => {
    if (!activeTabName.value && categories.value.length) {
      activeTabName.value = categories.value[0].name
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.editor-header-tabs {
  & > :deep(.el-tabs__content) {
    height: calc(100% - 40px);
  }
}
</style>
