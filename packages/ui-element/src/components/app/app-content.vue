<template>
  <router-view v-slot="{ Component }">
    <template v-if="Component">
      <transition mode="out-in">
        <keep-alive :include="cachedPageKeys">
          <suspense>
            <component :is="Component" />
            <template #fallback>
              <div>加载中...</div>
            </template>
          </suspense>
        </keep-alive>
      </transition>
    </template>
  </router-view>
</template>

<script setup lang="ts">
import { vue, useAppStore } from '@zto/zpage'

const { computed } = vue

const store = useAppStore()

const cachedPageKeys = computed(() => {
  const keys = store.getters.visitedPages.map((it: any) => it.key)
  return keys
})
</script>
