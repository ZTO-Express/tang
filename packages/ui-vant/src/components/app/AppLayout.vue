<template>
  <div class="c-app fs">
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '@zpage/zpage'

const store = useAppStore()

const cachedPageKeys = computed(() => {
  const keys = store?.getters.visitedPages.map((it: any) => it.key)
  return keys
})
</script>

<style lang="scss" scoped></style>
