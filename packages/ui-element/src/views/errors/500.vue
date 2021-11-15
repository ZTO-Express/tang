<template>
  <c-error-page
    error-title="抱歉，您要访问的页面正在维护中"
    error-msg="有可能我们的网页正在维护，如有疑问请联系管理员"
    link-msg="返回首页"
    logout-msg="退出登录"
    @link="handleLink"
  />
</template>

<script setup lang="ts">
import { useAppRouter } from '@zpage/zpage'

const router = useAppRouter()

function handleLink() {
  router.goHome()
}
</script>
