import type { GenericFunction } from '@zto/zpage'
import type { UploadStoreOptions } from '../../utils/upload'

/** 文件资源类型 */
export type RescType = 'image' | 'audio' | 'video' | 'office' | 'file'

export interface FileListItem {
  name?: string
  url: string
  fileSource?: number
}

/** 响应式编程中订阅对象 (参考 rxjs) */
export interface Subscription {
  unsubscribe: Function
}

// 上传状态
export enum UploadStatus {
  loading = 'loading',
  loaded = 'loaded',
  uploading = 'uploading',
  uploaded = 'uploaded',
  canceled = 'canceled',
  done = 'done',
  failed = 'failed'
}

/** 上传的数据项 */
export interface UploadData {
  key: string // 上传项key
  id?: string // 文件标识
  name?: string // 文件名
  url?: string // 文件路径
  file?: File // 上传的文件
  thumbnail?: string // 上传文件的缩略图
  status?: UploadStatus // 状态
  message?: string // 上传信息
  progress?: number // 上传进度
  subscription?: Subscription // 文件上传订阅主体
  fsizeExceeded?: boolean // 文件是否超过大小限制
  errorMessage?: string
}

export interface UploadStatusInfo {
  status: '' | 'uploading' | 'done' | 'failed'
  message?: string
}

/** 上传的数据集合，设计为 key: value以提高获取子项的效率 */
export interface UploadDataItems {
  [key: string]: UploadData
}

/** 上传时为上传接口提供的额外参数 */
export interface UploadOpenOptions {
  extra?: any
}

/** 存储组，公有文件上传为“public”，私有文件上传为“private”。公有文件指可通过文件路径直接访问 */
export type UploadStoreGroup = 'private' | 'public'

export interface UploadFileItem {
  id?: string
  name?: string
  url?: string
  [prop: string]: any
}

/** 上传时打开上传窗口需要传递的参数 */
export interface UploadOpenParams {
  files?: File[] // 需要上传的文件
  params?: any // 附加参数
  multiple?: boolean // 是否为多文件上传
  accept?: string // 接收文件的类型
  rescType?: string // 接收资源的类型
  sizeLimit?: number // 文件大小限制
  countLimit?: number // 文件数量限制
  storePath?: string // 文件存储路径
  storeGroup?: UploadStoreGroup // 存储组，公有文件上传为“public”，私有文件上传为“private”。公有文件指可通过文件路径直接访问
  storeOptions?: UploadStoreOptions
  autoUpload?: boolean // 是否自动上传
  onUploaded?: GenericFunction // 上传回调函数
}
