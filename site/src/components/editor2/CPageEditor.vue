<template>
  <!-- header -->
  <div class="c-page-editor">
    <c-page-header>
      <template #extra>
        <!-- <c-button label="查看源码" @click="handleOpenSourceDialog" /> -->
        <!-- <c-button label="刷新预览" @click="reloadPreview" /> -->
      </template>
    </c-page-header>
    <div class="editor-body">
      <div class="editor-side">
        <Settings v-if="definition" :definition="definition" :data="schemaData" />
      </div>
      <div class="editor-content">
        <c-page-tabs
          class="editor-header-tabs"
          v-model="editorTabName"
          :tab-items="editorTabItems"
          show-pane
          full-height
          @change="handleEditorTabChange"
        >
          <template #default="scope">
            <div v-if="scope.value === 'preview'" class="fs preview-wrapper">
              <widget v-if="previewSchemaData?.type" :schema="previewSchemaData" />
            </div>
            <div v-else-if="scope.value === 'source'" class="fs source-wrapper">
              <MonacoEditor
                ref="sourceEditorRef"
                theme="vs"
                :options="sourceEditorOptions"
                language="json"
                v-model:value="schemaText"
                @editorDidMount="handleSourceEditorDidMount"
              ></MonacoEditor>
            </div>
          </template>
        </c-page-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { _, ref, computed, watch, nextTick, onMounted } from '@zto/zpage'

import { getJsonDefinition, parseJsonDefinition, queryJsonDefinitions } from '@/utils/schema'

import MonacoEditor from 'monaco-editor-vue3'
import Settings from './settings/settings.vue'

const schemaData = ref<any>({})
const schemaText = ref<any>()

const previewSchemaData = ref<any>({})

const definitionName = ref('WCrudPageSchema')

const sourceEditorOptions = {
  colorDecorators: true,
  lineHeight: 18,
  tabSize: 2,
  scrollBeyondLastLine: false,
  readOnly: true,
  automaticLayout: true
}

const sourceEditorRef = ref<any>()

const editorTabName = ref<string>('preview')

const editorTabItems = computed(() => {
  return [
    { value: 'preview', label: '预览' },
    { value: 'source', label: '源码' }
  ]
})

/**
 * 所有页面微件
 */
const definitions = computed(() => {
  const definitions = queryJsonDefinitions(it => it.schema === 'widget' && it.ui === 'page')
  return definitions
})

const definitionSchema = computed(() => {
  const def = getJsonDefinition(definitionName.value)
  if (!def) return undefined
  return def
})

const definition = computed(() => {
  const def = parseJsonDefinition(definitionSchema.value)
  return def
})

watch(
  () => definition.value?.target,
  () => {
    schemaData.value = {
      type: definition.value?.target
    }
  },
  { immediate: true }
)

watch(
  () => schemaData.value,
  (cur, old) => {
    reloadPreview()
  },
  { deep: true }
)

onMounted(() => {
  reloadPreview()
})

/** 重新加载预览 */
function reloadPreview() {
  if (!schemaData.value?.type) return

  previewSchemaData.value = null

  nextTick(() => {
    previewSchemaData.value = { ...schemaData.value }
  })
}

/**
 * 触发标签
 */
function handleEditorTabChange(tab: any) {
  if (tab.value === 'source') {
    schemaText.value = JSON.stringify(schemaData.value || {}, null, 2)
  } else if (tab.value === 'preview') {
    // TODO: 目前暂不支持反写
    // const jsonData = tryJsonParse(schemaText.value)
    // if (jsonData) {
    //   schemaData.value = undefined
    //   nextTick(() => {
    //     schemaData.value = jsonData
    //   })
    // }
  }
}

/** 编辑器加载时间 */
function handleSourceEditorDidMount(editor: any) {
  // 设为只读
  // editor.updateOptions({ readOnly: true })
}
</script>

<style lang="scss" scoped>
$side-width: 320px;
$header-height: 40px;

.c-page-editor {
  height: 100%;
  background: white;
  box-sizing: border-box;
}

.editor-header {
  height: $header-height;
  padding: 10px;
  box-sizing: border-box;
  background: var(--primary);
  color: white;
}

.editor-body {
  display: flex;
  height: calc(100% - $header-height);
  padding: 5px;
  box-sizing: border-box;

  .editor-side {
    width: $side-width;
    border-right: 1px solid var(--border-color);
  }

  .editor-content {
    width: calc(100% - $side-width);
  }
}

.preview-wrapper {
  :deep(.c-page) {
    min-width: 100%;
  }
}
</style>

<style lang="scss">
.editor-header-tabs {
  .el-tabs__header {
    margin: 0 0 5px;

    .el-tabs__item {
      padding: 0 10px;
      height: 35px;
      line-height: 35px;
    }

    .el-tabs__item.is-top {
      padding-left: 10px;
    }
  }
}
</style>
