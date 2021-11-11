<template>
  <div class="tab-nav-button">
    <span :class="`nav-prev ${scrollable?.prev ? '' : 'disabled'}`" @click="scrollPrev">
      <el-icon class="icon-arrow">
        <arrow-left />
      </el-icon>
    </span>
    <span :class="`nav-next ${scrollable?.next ? '' : 'disabled'}`" @click="scrollNext">
      <el-icon class="icon-arrow">
        <arrow-right />
      </el-icon>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight } from '@element-plus/icons'

const props = defineProps<{
  scrollable?: GenericObject
  currentOffset: number
  setOffset: GenericFunction
  navWidth: number
  containerWidth: number
}>()

function scrollPrev() {
  const { containerWidth, currentOffset, setOffset } = props
  if (!currentOffset) return
  let newOffset = currentOffset - containerWidth
  newOffset < 0 && (newOffset = 0)

  setOffset(newOffset)
}

function scrollNext() {
  const { containerWidth, navWidth, currentOffset, setOffset } = props
  let newOffset = navWidth - currentOffset
  if (newOffset <= containerWidth) return
  newOffset > containerWidth * 2
    ? (newOffset = currentOffset + containerWidth)
    : (newOffset = navWidth - containerWidth)

  setOffset(newOffset)
}
</script>

<style lang="scss" scoped>
.tab-nav-button {
  .icon-arrow {
    border: 1px solid $primary;
    border-radius: 50%;
    padding: 2px;
    color: $primary;
    font-size: 12px;
  }

  .nav-prev {
    padding: 0 5px 0 15px;
  }

  .nav-next {
    padding: 0 15px 0 5px;
  }
}
</style>
