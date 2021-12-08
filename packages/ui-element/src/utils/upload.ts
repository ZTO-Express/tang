/** 上传文件 */

import { useConfig } from '@zto/zpage'

export interface UploadStoreOptions {
  [prop: string]: any
}

export interface UploadOptions {
  storePath?: string
  storeGroup?: string
  storeOptions?: UploadStoreOptions
  [prop: string]: any
}

/** 执行文件上传 */
export async function upload(file: File, options?: UploadOptions) {
  const uploadFn = useConfig('components.file.upload')
  const result = await uploadFn(file, options)

  return result
}
