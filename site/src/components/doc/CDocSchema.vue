<template>
  <div class="c-doc-schema">
    <widget v-if="widgetSchema" :schema="widgetSchema" />
  </div>
</template>

<script setup lang="ts">
import { _, sizePx, watch, computed, onMounted, onBeforeUnmount, useCurrentAppInstance } from '@zto/zpage'
import { jsonParse } from '../../utils'

const props = defineProps<{
  lang?: string
  code?: string
  meta?: string
}>()

const codeText = computed(() => {
  if (!props.code) return ''

  const decodedCode = decodeURIComponent(props.code)
  return decodedCode
})

const widgetSchema = computed(() => {
  try {
    const decodedCode = codeText.value
    if (!decodedCode) return null

    let s = jsonParse(decodedCode)

    if (props.meta === 'definition') {
      s = parseDefinitionSchema(s)
    }

    s.type = s.type || 'html'
    return s
  } catch (ex: any) {
    return { type: 'html', html: ex?.message }
  }
})

/** 解析分析schema */
function parseDefinitionSchema(json: any) {
  const s: any = _.deepMerge(
    {
      ctype: 'c-table',
      noPager: true,
      autoHeight: true,
      maxHeight: 500,
      noOperation: true,
      rowKey: 'name',
      noIndex: true,
      defaultExpandAll: true,
      border: true,
      data: json.properties || [],
      columns: [
        { label: '名称', prop: 'name', width: '200', expandColumn: true },
        { label: '说明', prop: 'desc', minWidth: '200', align: 'left', class: 'text-wrap' },
        { label: '类型', prop: 'type', width: '100' },
        { label: '可选值', prop: 'enum', width: '100' },
        { label: '默认值', prop: 'default', width: '100' }
      ]
    },
    { ...json?.widget }
  )

  return s
}
</script>

<style lang="scss">
.c-doc-schema {
  .c-table-cell.text-wrap {
    white-space: normal;
    overflow: visible;
    text-overflow: initial;
  }
}
</style>
