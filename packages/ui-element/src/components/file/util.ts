import { fileUtil } from '@zto/zpage'

import type { UploadData } from './types'

export const RescMimeTypes = {
  image: 'image/*',
  audio: 'audio/*',
  video: 'video/*',
  file: '*'
}

export const RescTypeNames = {
  image: '图片',
  audio: '音频',
  video: '视频',
  file: '文件'
}

/** 判断上传的文件是否是同一个文件
 * 目前从文件名，文件大小，以及最后修改时间三个维度判断
 */
export function isSameFile(file1?: File, file2?: File) {
  if (!file1 || !file2) {
    return false
  }
  return file1.name === file2.name && file1.size === file2.size && file1.lastModified === file2.lastModified
}

/** 判断文件是否为图片文件 */
export function isImageFile(file?: File) {
  if (!file || !file.type) return false
  return file.type.indexOf('image/') === 0
}

/** 文件结构:
 * fullpath = ${fpath}/${fullname}
 * fullname = ${name}__${postfix}.${ext}
 * fname = ${name}.${ext}
 * */
export function parseFileName(fullpath: string) {
  return fileUtil.parseFileName(fullpath)
}

// 随机码文件 针对oa
export function randomString(e: number) {
  e = e || 10
  let t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz12345678',
    a = t.length,
    n = ''
  for (let i = 0; i < e; i++) {
    n += t.charAt(Math.floor(Math.random() * a))
  }
  return n
}

/** 读取文件为url */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()

    reader.onload = function (event: any) {
      let url = event.target.result

      return resolve(url)
    }

    return reader.readAsDataURL(file)
  })
}

/** 获取文件缩略图 */
export async function getFileThumbnail(file: File): Promise<string> {
  if (!isImageFile(file)) {
    return ''
  }

  let url = await readFileAsDataUrl(file)

  return url
}

// 文件已经准备好上传
export function checkIsReadyForUpload(item: UploadData) {
  return item && item.file && !item.loading && !item.uploading && !item.canceled && !item.completed
}
