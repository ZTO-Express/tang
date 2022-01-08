<template>
  <c-dialog class="c-import-dialog" ref="dialogRef" v-bind="dialogAttrs">
    <div v-loading="loading" class="import-body-con">
      <div class="trigger-con">
        <c-file-trigger :accept="fileAccept" @file-selected="handleFileSelected">
          <slot name="trigger">
            <el-button type="primary">选择文件</el-button>
          </slot>
        </c-file-trigger>
        <div class="file-list-con text-center">
          <c-file-list :model-value="fileList" max-item-width="100%" @delete="handleFileDeleted">
            <template #no-data>请选择要上传的文件文件</template>
          </c-file-list>
        </div>
      </div>

      <div class="tip-con">
        <slot name="tip">
          {{ props.tip || `请先下载模板，数据不能超过${maxCount}条。文件大小不能超过${maxFileSize}MB。` }}
        </slot>
      </div>

      <div class="footer-con">
        <slot name="footer">
          <div class="template-download">
            <el-button type="text" @click="handleDownloadTemplate">下载导入模版</el-button>
          </div>
        </slot>
      </div>
    </div>
  </c-dialog>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue, useConfig, useRescs, useApiRequest, fileUtil } from '@zto/zpage'

import { useMessage } from '../../composables'
import * as xlsxUtil from '../../utils/xlsx'

import type { GenericFunction, ApiRequestAction } from '@zto/zpage'

const { computed, ref } = vue

const props = withDefaults(
  defineProps<{
    template: string
    title?: string
    tip?: string
    maxCount?: number
    maxFileSize?: number // 文件大小限制，单位MB
    api?: ApiRequestAction
    apiParams?: any
    dataProp?: string // 导出数据的属性
    dialog?: any
    filterEmpty?: boolean
    successMessage?: string
    closeAfterSuccess?: boolean
    parseMethod?: GenericFunction
    importMethod?: GenericFunction
    transformMethod?: GenericFunction
    onSubmit?: GenericFunction
  }>(),
  {
    closeAfterSuccess: true,
    dataProp: 'data',
    maxCount: 3000,
    maxFileSize: 10,
    filterEmpty: true
  }
)

const { Message } = useMessage()
const apiRequest = useApiRequest()

const loading = ref(false)
const dialogRef = ref<any>()

const dialogAttrs = computed(() => {
  const bodyStyle = 'padding: 10px 30px'
  return {
    title: props.title,
    noPadding: true,
    bodyStyle,
    onSubmit: handleDialogSubmit,
    ...props.dialog
  }
})

const fileImportCfg = useConfig('components.fileImport', {})

const importTemplates = useRescs('import_templates', {})

const selectedFile = ref()

const fileList = computed(() => {
  return selectedFile.value ? [selectedFile.value] : []
})

const templateData = computed(() => {
  return importTemplates[props.template]
})

const fileAccept = computed(() => {
  return templateData.value?.accept || '.xlsx'
})

// 文件选中后触发
async function handleFileSelected(file: any) {
  const exceededFileSize = file.size / 1024 / 1024 > props.maxFileSize

  if (exceededFileSize) {
    Message.warning(`文件大小不能超过${props.maxFileSize}MB。`)
    return
  }

  selectedFile.value = file
}

function handleFileDeleted() {
  selectedFile.value = null
}

// 下载模版
function handleDownloadTemplate() {
  const template = templateData.value
  if (!template) {
    throw new Error('请提供当前导入。')
  }

  fileUtil.download(template.url)
}

// 执行提交
async function handleDialogSubmit() {
  const file = selectedFile.value

  if (!selectedFile.value) {
    Message.warning('请先选择要上传的文件。')
    return
  }

  try {
    loading.value = true

    let data = await innerParseMethod(file, {
      filterEmpty: props.filterEmpty
    })

    if (!data?.length) {
      throw new Error('没有需要上传的数据。')
    }

    if (data.length >= props.maxCount) {
      throw new Error(`数据不能超过${props.maxCount}条`)
    }

    await innerImportMethod(data)

    if (props.successMessage) {
      Message.success(props.successMessage)
    }

    await Promise.resolve().then(() => {
      if (props.onSubmit) {
        return props.onSubmit(data)
      }
    })

    if (props.closeAfterSuccess) {
      clear()
      close()
    }

    loading.value = false
  } catch (err: any) {
    loading.value = false
    Message.error(err.message || '解析或导入数据出错。')
  }
}

async function innerParseMethod(file: any, options: any) {
  const parseMethod = props.parseMethod || fileImportCfg.parseMethod
  if (parseMethod) {
    return parseMethod(file, { ...options, template: templateData.value })
  }
  return doParseFile(file, options)
}

async function innerImportMethod(data: any) {
  const importMethod = props.importMethod || fileImportCfg.importMethod

  let importData = data
  if (props.transformMethod) {
    importData = await props.transformMethod(data)
  }

  const payload = {
    [props.dataProp]: importData,
    ...props.apiParams
  }

  if (importMethod) {
    return importMethod(payload)
  } else if (props.api) {
    return doApiImport(payload)
  }
}

// 解析文件
async function doParseFile(file: any, options?: any) {
  let data: any[] = []

  if (fileImportCfg.parseFile) {
    data = await fileImportCfg.parseFile(file)
  } else {
    data = await xlsxUtil.parseFile(file)
  }

  // 移除第一行
  data.shift()

  if (!data || !data.length) return

  let result = data

  if (options.filterEmpty) {
    result = data.filter((dt: any) => {
      return !!dt.length
    })
  }

  const columns = templateData.value?.columns as any[]

  if (columns?.length) {
    result = result.map((dt: any) => {
      const it: any = {}

      columns.forEach((col, idx) => {
        if (!col) return

        if (typeof col === 'string') {
          col = { prop: col }
        }

        let val = dt[idx]

        if (val === undefined) {
          val = ''
        } else {
          switch (col.type) {
            case 'number':
              val = parseFloat(val)
              break
            case 'int':
            case 'integer':
              val = parseInt(val)
              break
            default:
              val = String(val)
              break
          }
        }

        if (col.prop) {
          it[col.prop] = val
        }
      })
      return it
    })
  }
  return result
}

// 执行导入
async function doApiImport(payload: any) {
  if (!props.api) throw new Error('api不存在')

  await apiRequest({
    action: props.api as string,
    data: payload
  })
}

function clear() {
  selectedFile.value = null
}

// 显示对话框
function show() {
  dialogRef.value.show()
}

// 关闭对话框
function close() {
  dialogRef.value.close()
}

defineExpose({ show, close, clear })
</script>

<style lang="scss" scoped>
.trigger-con {
  padding: 10px 0;
}

.tip-con {
  font-size: 12px;
  opacity: 0.8;
  padding: 10px 0;
}

.file-list-con {
  :deep(.file-item) {
    background: white;
  }
}

.template-download {
  text-align: right;
  font-weight: normal;
}
</style>
