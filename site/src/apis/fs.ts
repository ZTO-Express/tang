/** 资源管理相关Api */
import { fileUtil, tpl, App, defineAppApi } from '@zto/zpage'

import type { AppFsApi } from '@zto/zpage'

export default defineAppApi<AppFsApi>((app: App) => {
  return {
    baseUrl: app.env.apiUrl,

    config: { baseUrl: app.env.apiUrl },

    methods: api => {
      return {
        // 根据文件名获取外部文件访问地址
        async getFileUrls(fileIds: string[]) {
          const resp: any = await api.fetch({
            url: 'base.getEncryptFileUrls',
            data: { files: fileIds }
          })

          if (!resp) return []
          const urls = resp.map((it: any) => it)
          return urls
        },

        // 获取文件上传Token
        async getUploadToken() {
          return api.fetch({ url: 'base.generateUploadToken' })
        },

        // 删除文件
        async deleteFile(fileId: string) {
          return api.fetch({
            url: 'base.deleteFile',
            data: { fileName: fileId }
          })
        },

        // 获取下载列表文件下载地址
        async getDownloadsUrls(fileIds: string[]) {
          const result: any = await api.fetch({
            url: 'base.getFileUrlBatch',
            data: { fileNameList: fileIds }
          })

          const urls = result || []
          return urls
        },

        // 通过文件名（文件服务器文件唯一标识符）下载文件
        async downloadFile(fileId: string, options?: any) {
          const { Message } = app.useMessage()

          if (!fileId) {
            Message.warning('下载文件不能为空。')
            return
          }

          options = { withoutPostfix: false, ...options }

          // 改用新接口 add0822  新方法兼容老接口
          let downloadUrls
          if (options?.fileSource === 'downloads') {
            downloadUrls = await this.getDownloadsUrls!([fileId])
          } else {
            downloadUrls = await this.getFileUrls!([fileId])
          }

          // @ts-ignore
          let downloadName = options.fname || options.fileName || options.fileId
          if (downloadName) {
            if (options?.contextData) {
              downloadName = tpl.filter(downloadName, { data: options?.contextData })
            }
            const postfix = fileUtil.getFileNamePostfix(options)
            if (postfix) {
              downloadName = `${downloadName}_${postfix}`
            }
          } else {
            let { fname, fullname } = fileUtil.parseFileName(fileId)
            downloadName = options.withoutPostfix ? fname : fullname
          }

          if (options.fileExtName && !downloadName.endsWith(options.fileExtName)) {
            downloadName += options.fileExtName
          }

          await fileUtil.download(downloadUrls[0], {
            filename: downloadName
          })
        }
      }
    }
  }
})
