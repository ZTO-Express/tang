<template>
  <el-popover v-if="type === 'popover'" v-bind="$attrs" :content="content" :placement="$attrs.placement || 'top'">
    <slot v-if="!content">
      <div class="tip-content">{{ tipText }}</div>
    </slot>
    <template #reference>
      <span class="tip-reference">
        <slot name="reference">
          <el-icon>
            <InfoFilled size="18" />
          </el-icon>
        </slot>
      </span>
    </template>
  </el-popover>
  <div v-else class="upload-tip-text q-ml-md">
    <span v-if="content">{{ content }}</span>
    <span v-else>{{ tipText }}</span>
  </div>
</template>

<script setup lang="ts">
import { _, vue } from '@zto/zpage'
import { InfoFilled } from '@element-plus/icons'

const { computed } = vue

const props = withDefaults(
  defineProps<{
    type?: 'text' | 'popover'
    uploadProps?: Record<string, any>
    content?: string
  }>(),
  {
    type: 'text'
  }
)

const tipText = computed(() => {
  if (props.content) return props.content

  const texts: string[] = []

  const { accept, sizeLimit, countLimit } = props.uploadProps || {}

  if (accept) texts.push(`可上传${accept}`)
  if (sizeLimit) texts.push(`大小不超过${sizeLimit}MB`)
  if (!_.isNil(countLimit)) texts.push(`还可以上传${countLimit}张照片`)

  if (!texts.length) return ''

  return `备注：${texts.splice(0, texts.length).join('，')}${texts[texts.length - 1] || ''}`
})
</script>

<style lang="scss" scoped>
.tip-reference {
  margin-left: 5px;
  opacity: 0.6;
  vertical-align: middle;
  font-size: 16px;
  cursor: pointer;
}

.upload-tip-text {
  display: inline-block;
}
</style>
