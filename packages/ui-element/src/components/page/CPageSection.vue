<template>
  <div class="c-page-section" :class="{ top }">
    <div v-if="isHeader" class="header-con">
      <slot name="header">
        <c-page-section-header :title="title">
          <template #extra>
            <slot name="headerExtra"></slot>
          </template>
        </c-page-section-header>
      </slot>
    </div>

    <div v-if="isBody" class="body-con">
      <slot />
    </div>

    <div v-if="isFooter" class="footer-con">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    top?: boolean
  }>(),
  {}
)

const slots = useSlots()

const isHeader = computed(() => !!props.title || !!slots.header)

const isFooter = computed(() => !!slots.footer)

const isBody = computed(() => !!slots.default)
</script>

<style lang="scss">
.c-page-section {
  & > .header-con {
    & > .c-page-section-header {
      border-top-left-radius: $border-radius;
      border-top-right-radius: $border-radius;
    }
  }
}
</style>

<style lang="scss" scoped>
.c-page-section {
  position: relative;
  background: $section-color;
  border-radius: $border-radius;
  box-shadow: 0 0 3px 0 $border-color;
  margin-top: $section-gutter;

  .body-con {
    padding: $section-padding;
    box-sizing: border-box;
  }

  .footer-con {
    padding: $section-padding;
  }

  &.top {
    margin-top: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}
</style>
