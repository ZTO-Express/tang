<template>
  <div class="c-more-action q-ml-sm">
    <el-tooltip v-bind="$attrs">
      <el-button type="text" v-show="isShow">
        {{ $attrs.label || '更多操作' }}
        <i class="el-icon-arrow-down"></i>
      </el-button>
      <template #content>
        <div ref="contentRef">
          <slot></slot>
        </div>
      </template>
    </el-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUpdated } from '@zto/zpage'

// content ref
const contentRef = ref<any>()
// 是否显示label
const isShow = ref<Boolean>(true)

onMounted(() => {
  isShow.value = contentRef.value.children.length > 0
})

onUpdated(() => {
  isShow.value = contentRef.value.children.length > 0
})
</script>


<style lang="scss" scoped>
.c-more-action {
  display: inline-block;
}
</style>
