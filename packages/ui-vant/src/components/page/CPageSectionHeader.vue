<template>
  <div class="c-page-section-header">
    <div class="header__prefix">
      <slot name="prefix"></slot>
    </div>
    <div class="header__content">
      <slot>{{ sectionTitle }}</slot>
    </div>
    <div class="header__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { vue } from '@zto/zpage'

const { computed } = vue

const props = withDefaults(
  defineProps<{
    title?: string
  }>(),
  {}
)
const sectionTitle = computed(() => {
  return props.title
})
</script>

<style lang="scss" scoped>
.c-page-section-header {
  display: flex;
  box-sizing: border-box;
  padding: 0 20px;
  line-height: 40px;
  background: $title-bg-color;

  & > .header__content {
    flex: 1;
    color: $title-color;
    font-weight: bold;
    font-size: 14px;
  }
}
</style>
