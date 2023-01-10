<template>
  <header>
    <div class="operate">
      <el-button type="success" @click="handlePreview">{{ isPreview ? '退出预览' : '预览' }}</el-button>
      <el-button type="info" :data-schema="props.schema" @click="handleCopy">复制</el-button>
      <el-button type="warning" @click="handleSave">保存</el-button>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref, useCurrentAppInstance, setClipboardText } from '@zto/zpage'

const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()
const route = app.useRoute()
const { Message } = app.useMessage()
const emit = defineEmits(['preview'])
const isPreview = ref(false)

const handlePreview = () => {
  isPreview.value = !isPreview.value
  Message.success(`${isPreview.value ? '进入预览模式' : '退出预览模式'}`)
  // const element = document.getElementById('editor-preview-warpper')
  // element?.requestFullscreen()
  emit('preview', isPreview.value)
}

const handleCopy = () => {
  // console.log(props.schema)
  setClipboardText(JSON.stringify(props.schema))
    .then(() => {
      Message.success('复制成功')
    })
    .catch(error => {
      console.log('复制失败：', error)
      Message.error('复制失败', error)
    })
}

const handleSave = () => {
  Message.success('此功能暂时保存在本地session，保存成功！')
  sessionStorage.setItem(route.path, JSON.stringify(props.schema))
}
</script>

<style lang="scss" scoped>
header {
  height: 40px;
  padding: 0 10px;
  background-color: rgba(26, 120, 254, 0.85);
  position: relative;

  .operate {
    float: right;
    height: 100%;
    display: flex;
    align-items: center;
  }
}
</style>
