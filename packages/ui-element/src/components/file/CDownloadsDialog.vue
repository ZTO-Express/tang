<template>
  <c-dialog ref="dialogRef" class="c-downloads-dialog" v-bind="dialogAttrs">
    <widget :schema="listSchema"></widget>
    <template #footer>
      <el-button @click="close">关闭</el-button>
    </template>
  </c-dialog>
</template>

<script setup lang="ts">
import { _, computed, ref, useCurrentAppInstance } from '@zto/zpage'

const dialogRef = ref<any>()

const app = useCurrentAppInstance()

const downloadsConfig = app.useAppConfig('header.downloads', {})

const dialogConfig = downloadsConfig.dialog || {}
const listConfig = downloadsConfig.list || {}

const dialogAttrs = computed(() => {
  const innerDialogAttrs = { width: '900px', top: '5vh', ...downloadsConfig?.dialog }

  return {
    title: dialogConfig.title || '下载列表',
    bodyStyle: dialogConfig.bodyStyle,
    bodyHeight: dialogConfig.bodyHeight || '80vh',
    noPadding: true,
    noFooter: dialogConfig.noFooter,
    innerAttrs: {
      dialog: _.omit(innerDialogAttrs, 'title')
    }
  }
})

const listSchema = computed(() => {
  const schemaAttrs = Object.assign(
    {
      type: 'crud',
      search: {
        hidden: true
      },
      actions: {
        query: downloadsConfig.query
      }
    },
    listConfig
  )

  return schemaAttrs
})

function show() {
  dialogRef.value.show()
}

function close() {
  dialogRef.value.close()
}

defineExpose({
  show,
  close
})
</script>
