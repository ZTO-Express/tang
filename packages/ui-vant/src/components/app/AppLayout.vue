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
import { computed, useCurrentAppInstance } from '@zto/zpage'

const app = useCurrentAppInstance()

const { pagesStore } = app.stores

const cachedPageKeys = computed(() => {
  const keys = pagesStore.visited.map((it: any) => it.key)
  return keys
})
</script>

<style lang="scss" scoped></style>
