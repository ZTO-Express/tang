<template>
  <div class="c-info-section">
    <slot name="header">
      <div v-if="title" class="section-title">{{ title }}</div>
    </slot>
    <div class="section-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, tpl } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    title?: string
  }>(),
  {}
)
</script>

<style lang="scss">
.c-info-section,
.info-section {
  --media-height: 150px;

  padding: 0 20px 10px;

  & > .section-title {
    padding: 5px;
    font-size: 14px;
    font-weight: bold;
  }

  & > .section-body {
    font-size: 12px;

    .el-form-item--mini.el-form-item {
      margin-bottom: 0px;
    }

    img.el-image__inner {
      height: var(--media-height);
    }

    video.c-video__inner {
      height: var(--media-height);
    }

    .empty {
      height: var(--media-height);
    }

    .error {
      height: var(--media-height);
    }

    .auto-item-height {
      img.el-image__inner,
      video.c-video__inner,
      .empty,
      .error {
        height: 100%;
      }
    }
  }
}
</style>
