<template>
  <c-error-page error-msg="服务器异常" link-msg="返回首页" @link="handleLink" />
</template>

<script setup lang="ts">
import { useAppRouter } from '@zto/zpage'

const router = useAppRouter()

function handleLink() {
  router.goHome()
}
</script>
