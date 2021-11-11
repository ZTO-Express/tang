<template>
  <c-error-page error-msg="服务器异常" link-msg="返回首页" @link="handleLink" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function handleLink() {
  router.goHome()
}
</script>
