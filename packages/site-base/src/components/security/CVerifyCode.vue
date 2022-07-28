<template>
  <div class="c-verify-code">
    <img v-if="imageUrl" :src="imageUrl" @click="fetchVerifyData" />
  </div>
</template>

<script setup lang="ts">
import { _, ref, watch, computed, onMounted, useCurrentAppInstance } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    verifyType?: string // 验证码类型(image: 默认)
    api?: string
    apiParams?: any
    secret?: string // 验证码密钥
    secretProp?: string // 密钥字段
    imageProp?: string // 返回数据图像所在字段（如果是图片验证码）
    imageType?: string // 图片类型，url, base64，base64-png, base64-jpeg
    base64Prefix?: string // 如果图片是base64并且没有此前缀，则自动加上此前缀
  }>(),
  {}
)

const emit = defineEmits(['change', 'update:secert'])

const app = useCurrentAppInstance()

const appApi = app.api
const verifyConfig = app.useComponentsConfig('verifyCode', {})

const verifyData = ref<any>({})

/** 验证选项 */
const verifyOptions = computed(() => {
  return {
    verifyType: 'image',
    imageProp: 'url',
    imageType: 'base64',
    secretProp: 'uuid',
    ...verifyConfig,
    ..._.omitEmpty(props)
  }
})

/** 验证码图片地址 */
const imageUrl = computed(() => {
  const url = getImageUrl()
  return url
})

watch(
  () => verifyData.value,
  () => {
    const secert = verifyData.value[verifyOptions.value.secretProp]
    emit('change', secert, verifyData.value)
    emit('update:secert', secert)
  }
)

onMounted(() => {
  reset()
})

function reset() {
  fetchVerifyData()
}

/** 获取验证码信息 */
async function fetchVerifyData() {
  let res: any = null

  if (verifyOptions.value.api) {
    res = await appApi.request({
      url: verifyOptions.value.api,
      data: props.apiParams
    })
  } else {
    res = await appApi.getVerifyCode()
  }

  verifyData.value = res
}

/** 获取图片地址url */
function getImageUrl() {
  if (verifyOptions.value.verifyType !== 'image' || !verifyData) return ''

  const imageProp = verifyOptions.value.imageProp

  let url = verifyData?.value[imageProp] || ''
  if (!url) return url

  let base64Prefix = props.base64Prefix

  switch (props.imageType) {
    case 'url':
      return url
    case 'base64':
    case 'base64-jpeg':
      base64Prefix = base64Prefix || 'data:image/jpeg;base64,'
      break
    case 'base64-png':
      base64Prefix = base64Prefix || 'data:image/png;base64,'
      break
  }

  if (base64Prefix && !url.startsWith(base64Prefix)) {
    url = base64Prefix + url
  }

  return url
}

defineExpose({
  reset
})
</script>

<style lang="scss" scoped>
.c-verify-code {
  display: inline-block;
  height: 100%;
  max-width: 100%;
  img {
    cursor: pointer;
    height: 100%;
  }
}
</style>
