<template>
  <c-error-page
    error-title="抱歉，您要访问的页面不存在"
    error-msg="有可能我们的网页正在维护或者您输入的网址不正确"
    link-msg="返回首页"
    logout-msg="退出登录"
    @link="handleLink"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function handleLink() {
  router.goHome()
}
</script>
