import type { App } from '@zto/zpage'

/** 上传签名 */
export interface UploadSignature {
  signature: string
  nonce: string
  timestamp: string
}

/** 上传参数 */
export interface UploadParams {
  group: string // 文件组，如:private
  appid: string // appid
  filename: string // 文件名
  ext: string // 文件扩展名
  signature: string // 签名
  nonce: string
  timestamp: string
  upload_token: string
  filepath?: string // 文件存储路径
}

// 上传管理器构造函数配置项
export interface UploaderOptions {
  app: App
  file: File
  data: UploadParams
  filefield?: string
  config?: any
}
