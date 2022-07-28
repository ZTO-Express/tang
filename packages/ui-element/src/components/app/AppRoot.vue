<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script setup lang="ts">
import { _, resolveComponent } from '@zto/zpage'

const RouterView = resolveComponent('router-view')
</script>
