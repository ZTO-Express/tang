<template>
  <div class="c-editor-settings fs">
    <!-- <div id="editorUIItemsContainer"></div> -->
    <div class="settins-body">
      <c-form class="fs" :model="data">
        <CUIPropertyCategories v-if="categories.length" :categories="categories" :root-data="data" :data="data" />
      </c-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from '@zto/zpage'

import type { ZPageDevDefinition } from '@/../typings'

const props = defineProps<{
  definition: ZPageDevDefinition
  data: any
}>()

/**
 * 分类
 */
const categories = computed(() => {
  return props.definition?.categories || []
})
</script>

<style lang="scss" scoped>
.c-editor-settings {
  display: flex;

  #editorUIItemsContainer {
    width: 50px;
  }

  .settins-body {
    flex: 1;
  }
}
</style>

<style lang="scss">
.c-editor-settings {
  .c-form-items {
    // 编辑器下默认所有表单横向排列
    .el-form-item {
      display: block;
      margin-bottom: 5px;

      &__label {
        line-height: 20px;
      }
    }

    &.inline .el-form-item {
      display: flex;
    }
  }
}
</style>
