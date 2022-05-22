/** 上传文件 */

import { _, useCurrentAppInstance } from '@zto/zpage'

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
  const app = useCurrentAppInstance(false, true)

  const uploadCfg = app?.useComponentsConfig('file.upload')

  const uploadFn = uploadCfg?.fn
  const realOptions = _.omitNil(options)
  const uploadOptions = { ...uploadCfg, ...realOptions }

  const result = await uploadFn(file, uploadOptions)

  return result
}
