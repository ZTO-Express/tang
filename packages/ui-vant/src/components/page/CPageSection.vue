<template>
  <div class="c-page-section">
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
import { computed, useSlots } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    title?: string
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
      border-top-left-radius: var(--border-radius);
      border-top-right-radius: var(--border-radius);
    }
  }
}
</style>

<style lang="scss" scoped>
.c-page-section {
  position: relative;
  background: var(--section-color);
  border-radius: var(--border-radius);
  box-shadow: 0 0 3px 0 var(--border-color);
  margin-top: var(--section-gutter);

  .body-con {
    padding: var(--section-padding);
    box-sizing: border-box;
  }

  .footer-con {
    padding: var(--section-padding);
  }
}
</style>
