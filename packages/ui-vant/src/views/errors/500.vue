<template>
  <c-error-page error-msg="服务器异常" link-msg="返回首页" @link="handleLink" />
</template>

<script setup lang="ts">
import { useCurrentAppInstance } from '@zto/zpage'

const app = useCurrentAppInstance()

const router = app.router

function handleLink() {
  router.goHome()
}
</script>
