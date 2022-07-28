<template>
  <div class="c-page-header">
    <div class="header__prefix">
      <slot name="prefix">
        <div v-if="isShowBack" class="header-back">
          <el-button icon="el-icon-back" type="text" v-preventReclick @click="handleBack">返回</el-button>
          <el-divider direction="vertical"></el-divider>
        </div>
      </slot>
    </div>
    <div class="header__content">
      <slot>{{ pageTitle }}</slot>
      <slot name="tip">
        <c-poptip v-if="pageTip" v-bind="pageTip"></c-poptip>
      </slot>
    </div>
    <div class="header__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { _, computed, useCurrentAppInstance } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    title?: string
    tip?: any
    isBack?: boolean
    noBack?: boolean
  }>(),
  {}
)

const app = useCurrentAppInstance()

const router = app.router
const route = app.useRoute()

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

const pageTip = computed(() => {
  if (!props.tip) return undefined

  let tipAttrs: any = { placement: 'bottom' }

  if (_.isObject(props.tip)) {
    tipAttrs = { ...tipAttrs, ...props.tip }
  } else {
    tipAttrs.content = String(props.tip)
  }

  return tipAttrs
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
  background: var(--title-bg-color);

  & > .header__content {
    flex: 1;
    color: var(--title-color);
    font-weight: bold;
    font-size: 14px;
  }
}
</style>
