<template>
  <c-dialog ref="dialogRef" class="c-downloads-dialog" v-bind="dialogAttrs">
    <widget :schema="listSchema"></widget>
    <template #footer>
      <el-button @click="close">关闭</el-button>
    </template>
  </c-dialog>
</template>

<script setup lang="ts">
import { _, vue, useAppConfig } from '@zto/zpage'

const { computed, ref } = vue

const dialogRef = ref<any>()

const downloadsConfig = useAppConfig('header.downloads', {})
const dialogConfig = downloadsConfig.dialog || {}
const listConfig = downloadsConfig.list || {}

const dialogAttrs = computed(() => {
  const innerDialogAttrs = Object.assign(
    {
      width: '900px'
    },
    downloadsConfig?.dialog
  )

  return {
    title: dialogConfig.title || '下载列表',
    bodyStyle: dialogConfig.bodyStyle || 'height:80vh;',
    noPadding: true,
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
