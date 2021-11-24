<template>
  <div class="c-error-page">
    <div v-if="bgPic" class="c-error-page__bg">
      <img :src="bgPic" alt="错误背景图" />
    </div>
    <div class="c-error-page__body"><img :src="errorPic" alt="错误图" /></div>
    <div class="c-error-page__footer">
      <div class="c-error-page__title">{{ errorTitle }}</div>
      <div class="c-error-page__tip">{{ errorMsg }}</div>
      <div v-if="linkMsg" class="c-error-page__action">
        <Button type="primary" size="medium" @click="handleLink">{{ linkMsg }}</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppRouter } from '@zto/zpage'

const props = defineProps<{
  bgPic?: string
  errorPic?: string
  errorTitle?: string
  errorMsg?: string
  link?: string
  linkMsg?: string
}>()

const emit = defineEmits(['link'])

const router = useAppRouter()

function handleLink() {
  if (props.link) router.goto(props.link)
  emit('link')
}
</script>

<style lang="scss" scoped>
.c-error-page {
  display: flex;
  text-align: center;
  flex-direction: column;
  background: $bg-color;
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
    color: $title-color;
  }

  &__tip {
    color: $tip-color;
  }

  &__action {
    height: 50px;
    line-height: 50px;
    padding-top: 32px;
  }
}
</style>
