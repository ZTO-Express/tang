import { defineAppConfig } from '@zto/zpage'

import { exportData, parseFile } from '../utils/xlsx'
import { ZFSUploader } from '../utils/upload'

import type { App, AppComponentsConfig, AppContextOptions } from '@zto/zpage'

export default defineAppConfig<AppComponentsConfig>((app: App) => ({
  cmpt: {
    prefixs: ['el-']
  },

  verifyCode: {
    imageProp: 'base64Code'
  },

  fuzzySelect: {
    pageSize: 40
  },

  formItem: {
    input: { maxlength: 100 },
    textarea: { maxlength: 200 }
  },

  table: {
    data: {
      summaryProp: 'sum'
    }
  },

  pagination: {
    layout: 'sizes, prev, pager, next, jumper, ->, total',
    pageSizes: [10, 15, 50, 100],
    pageSize: 15
  },

  xlsx: {
    exportData,
    parseFile
  },

  file: {
    upload: {
      remoteDelete: false,
      storePath: 'kt',
      fn: (file: File, options: AppContextOptions) => {
        return ZFSUploader.upload(file, options)
      }
    }
  }
}))
