<template>
  <div class="c-page-header">
    <div class="header__prefix">
      <slot name="prefix">
        <div v-if="isShowBack" class="header-back">
          <van-button icon="back" type="text" @click="handleBack">返回</van-button>
        </div>
      </slot>
    </div>
    <div class="header__content">
      <slot>{{ pageTitle }}</slot>
    </div>
    <div class="header__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '@zto/zpage'

const router = useRouter()

const props = withDefaults(
  defineProps<{
    title?: string
    isBack?: boolean
    noBack?: boolean
  }>(),
  {}
)

const route = useRoute()

const routeMeta = computed(() => {
  return route.meta || {}
})

const isShowBack = computed(() => {
  if (props.isBack) return true
  if (props.noBack) return false

  return !!routeMeta.value?.refererKey
})

const pageTitle = computed(() => {
  return props.title || routeMeta.value?.label
})

function handleBack() {
  router.goBack()
}
</script>

<style lang="scss" scoped>
.c-page-header {
  display: flex;
  box-sizing: border-box;
  padding: 0 20px;
  line-height: 40px;
  background: $title-bg-color;

  & > .header__content {
    flex: 1;
    color: $title-color;
    font-weight: bold;
    font-size: 14px;
  }
}
</style>
