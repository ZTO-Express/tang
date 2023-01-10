<template>
  <div class="c-doc-toc-nav">
    <ul class="nav-items">
      <template v-for="h in headers" :key="h.anchor">
        <li
          v-if="isHeaderVisible(h)"
          @click="handleItemClick(h)"
          :class="`level-${h.level} ${h.anchor === activeAnchor ? 'active' : ''}`"
        >
          <div v-if="h.anchor === activeAnchor" class="divider" />
          <span v-if="isHeaderVisible(h)" class="text">{{ h.title }}</span>
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from '@zto/zpage'

import type { DocHeader } from './util'

const props = defineProps<{
  headers: DocHeader[]
}>()

const emit = defineEmits(['anchor'])

const activeAnchor = ref<string>('')

/** 点击nav想 */
function handleItemClick(h: DocHeader) {
  activeAnchor.value = h.anchor

  emit('anchor', h)
}

function isHeaderVisible(h: DocHeader) {
  return h && h.level > 1 && h.level < 4
}
</script>

<style lang="scss" scoped>
$levelSpace: 15px;

ul.nav-items {
  padding-inline-start: 20px;
  border-left: 1px solid var(--border-color);

  & > li {
    cursor: pointer;
    padding: 3px 0;
    position: relative;

    .divider {
      position: absolute;
      top: 5px;
      left: -21px;
      background: var(--active);
      border-radius: 2px;
      width: 3px;
      height: 15px;
    }

    &.active {
      color: var(--active);
    }

    &.level {
      &-2 {
        padding-left: $levelSpace * 0;
      }

      &-3 {
        padding-left: $levelSpace * 1;
      }
    }
  }
}
</style>
