<template>
  <div class="c-error-page">
    <div v-if="background" class="c-error-page__bg">
      <img :src="background" alt="错误背景图" />
    </div>
    <div class="c-error-page__body">
      <img :src="picture || defaultErrorPic" alt="错误图" />
    </div>
    <div class="c-error-page__footer">
      <div class="c-error-page__title">{{ errorInfo.description }}</div>
      <div class="c-error-page__tip">{{ errorInfo.message }}</div>
      <div class="c-error-page__action">
        <el-button v-if="linkLabel" type="primary" size="small" v-preventReclick @click="handleLink">
          {{ linkLabel }}
        </el-button>
        <el-button v-if="isLogged" size="small" v-preventReclick @click="handleLogout">{{ logoutLabel }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useCurrentAppInstance } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    description?: string
    message?: string
    picture?: string
    background?: string
    link?: string
    linkLabel?: string
    logoutLabel?: string
  }>(),
  {
    link: 'home',
    linkLabel: '返回首页',
    logoutLabel: '重新登录'
  }
)

const DefaultErrorInfos: Record<string, any> = {
  '403': {
    description: '权限不足',
    message: '您可能没有权限访问当前系统，如有疑问请联系管理员'
  },
  '500': {
    description: '抱歉，您要访问的页面正在维护中',
    message: '有可能我们的网页正在维护，如有疑问请联系管理员'
  },
  '404': {
    description: '抱歉，您要访问的页面不存在',
    message: '有可能我们的网页正在维护或者您输入的网址不正确'
  }
}

const emit = defineEmits(['link', 'logout'])

const defaultErrorPic = 'https://fscdn.zto.com/fs21/M01/F6/77/CgRRhGGLgYWAXrUCAAA4nWZTAXY302.png'

const app = useCurrentAppInstance()

const router = app.router
const { appStore, userStore } = app.stores

const isLogged = computed(() => userStore.logged)
const isAppLoaded = computed(() => appStore.loaded)

const errorInfo = computed(() => {
  const currentRoute = router.currentRoute.value

  const defErrInfo = DefaultErrorInfos[currentRoute.name as string] || DefaultErrorInfos['500']
  const errParams = currentRoute.params

  return {
    description: props.description || errParams?.description || defErrInfo.description,
    message: props.message || errParams?.message || defErrInfo.message
  }
})

function handleLink() {
  if (!isAppLoaded.value) {
    window.location.href = window.location.origin
    return
  }

  if (props.link === 'home') router.goHome()
  else if (props.link) router.goto(props.link)

  emit('link')
}

function handleLogout() {
  app.logout()
}
</script>

<style lang="scss" scoped>
.c-error-page {
  display: flex;
  text-align: center;
  flex-direction: column;
  background: var(--bg-color);
  padding: 20px;
  height: 100%;

  &__bg {
    max-height: 150px;
  }

  &__body {
    display: flex;
    justify-content: center;

    img {
      max-width: 450px;
      max-height: 300px;
    }
  }

  &__title {
    height: 50px;
    line-height: 50px;
    font-weight: 700;
    font-size: 16px;
    margin-top: 24px;
    color: var(--title-color);
  }

  &__tip {
    color: var(--tip-color);
  }

  &__action {
    height: 50px;
    line-height: 50px;
    padding-top: 32px;
  }
}
</style>
