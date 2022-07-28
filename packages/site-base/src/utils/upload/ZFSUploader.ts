import { observable } from '@zto/zpage'
import { request } from './request'
import { generateSignature, parseFileName, randomString } from './util'

import type { AppContextOptions } from '@zto/zpage'
import type { UploaderOptions, UploadParams } from './types'

const { Observable } = observable

export class ZFSUploader {
  config: any = {
    retryCount: 3
  }

  retryCount = 0
  aborted = false
  progress: any = null
  xhrList: any[] = []
  xhrHandler = (xhr: any) => this.xhrList.push(xhr)
  onData = (e?: any) => {}
  onError = (err?: any) => {}
  onComplete = (e?: any) => {}
  uploadUrl: string
  filefield = 'uploadfile'
  file: File
  data: UploadParams

  constructor(options: UploaderOptions, handlers: object) {
    const env = options.app.env

    this.config = Object.assign(this.config, options.config)
    this.uploadUrl = `${env.fsUrl}/UploadFile`
    this.filefield = options.filefield || this.filefield
    this.file = options.file
    this.data = options.data
    Object.assign(this, handlers)
  }

  static async upload(file: File, options: AppContextOptions) {
    const app = options.app
    const env = app.env

    options = {
      onProgress: (e: any) => {},
      onUpload: (e: any) => {},
      ...options
    }

    let uptoken = await app.getUploadToken().catch((err: any) => {
      return Promise.reject({
        noBreaking: true, // 非中断错误，可以重新尝试
        message: err
      })
    })

    const signature = generateSignature(uptoken)

    let parsedFileName = parseFileName(file.name)

    // 存储路径
    let filePath = `fs/${options.storePath || 'tmp/'}`
    filePath = filePath.lastIndexOf('/') === filePath.length - 1 ? filePath.substring(filePath.length - 1) : filePath
    let fileName = randomString(8)
    //中文 oa有问题 替换成随机串
    let storePath = `${filePath}/${fileName}__${+new Date()}`
    // let storePath = `${filePath}/${parsedFileName.name}__${+new Date()}`
    let storeGroup = options.storeGroup || 'private'

    let uploadParams: UploadParams = {
      group: storeGroup,
      appid: env.fsAppId || '',
      signature: signature.signature,
      nonce: signature.nonce,
      timestamp: signature.timestamp,
      upload_token: uptoken,
      ext: parsedFileName.ext,
      filename: storePath
    }

    let uploadOptions = {
      app,
      file,
      data: uploadParams
    }

    return new Promise((resolve, reject) => {
      const observable = new Observable((observer: observable.Observer) => {
        const uploader = new ZFSUploader(uploadOptions, {
          onData: (e: any) => observer.next(e),
          onError: (e: any) => observer.error(e),
          onComplete: (e: any) => observer.complete(e)
        })
        uploader.putFile()
        return uploader.stop.bind(uploader)
      })

      const subscription = observable.subscribe({
        next(res: any) {
          options.onProgress(res)
        },
        error(err: any) {
          reject(err)
        },
        complete(result: any) {
          if (result && result.status) {
            resolve(result)
          } else {
            reject(result)
          }
        }
      })

      options.onUpload({ subscription, observable })
    })
  }

  async putFile() {
    this.aborted = false

    return this.directUpload().then(
      (res: any) => {
        this.onComplete(res.data)
      },
      (err: any) => {
        this.clear()

        let needRetry = err.isRequestError && err.code === 0 && !this.aborted
        let notReachRetryCount = ++this.retryCount <= this.config.retryCount
        if (needRetry && notReachRetryCount) {
          this.putFile()
          return
        }

        this.onError(err)
      }
    )
  }

  clear() {
    this.xhrList.forEach(xhr => xhr.abort())
    this.xhrList = []
  }

  stop() {
    this.clear()
    this.aborted = true
  }

  // 直传
  directUpload() {
    let formData = new FormData()

    formData.append(this.filefield, this.file)

    if (this.data) {
      Object.keys(this.data).forEach(key => {
        formData.append(key, (this.data as any)[key])
      })
    }

    return request(this.uploadUrl, {
      method: 'POST',
      body: formData,
      onProgress: (data: any) => {
        this.updateDirectProgress(data.loaded, data.total)
      },
      onCreate: this.xhrHandler
    }).then((res: any) => {
      this.finishDirectProgress()
      return res
    })
  }

  updateDirectProgress(loaded: number, total: number) {
    // 当请求未完成时可能进度会达到100，所以total + 1来防止这种情况出现
    this.progress = { total: this.getProgressInfoItem(loaded, total + 1) }
    this.onData(this.progress)
  }

  finishDirectProgress() {
    // 在某些浏览器环境下，xhr 的 progress 事件无法被触发，progress 为 null， 这里 fake 下
    if (!this.progress) {
      this.progress = { total: this.getProgressInfoItem(this.file.size, this.file.size) }
      this.onData(this.progress)
      return
    }

    let total = this.progress.total
    this.progress = { total: this.getProgressInfoItem(total.loaded + 1, total.size) }
    this.onData(this.progress)
  }

  getProgressInfoItem(loaded: number, size: number) {
    return {
      loaded: loaded,
      size: size,
      percent: (loaded / size) * 100
    }
  }
}
