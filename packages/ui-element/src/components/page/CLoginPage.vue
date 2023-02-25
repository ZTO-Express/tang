<template>
  <div class="c-login-page">
    <WLogin />
  </div>
</template>

<script setup lang="ts">
import { useCurrentAppInstance } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    description?: string
    message?: string
    picture?: string
    background?: string
  }>(),
  {}
)

const app = useCurrentAppInstance()

const WLogin = app.resolveComponent('WLogin')
</script>

<style lang="scss" scoped>
.c-login-page {
  width: 100%;
  height: 100%;
}
</style>
