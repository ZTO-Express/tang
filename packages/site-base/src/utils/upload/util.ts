import { fileUtil } from '@zto/zpage'
import sha1 from 'sha1'

import type { UploadSignature } from './types'

/** 生成签名 */
export function generateSignature(data: string): UploadSignature {
  const nonce = String(Math.random())
  const timestamp = String(+new Date())
  const arrayStr: string = [nonce, timestamp, data].sort().join('')
  let hexCharCode: string[] = []
  for (let i = 0; i < arrayStr.length; i++) {
    hexCharCode.push(arrayStr.charCodeAt(i).toString(10))
  }
  let signature = sha1(hexCharCode)

  return {
    nonce,
    timestamp,
    signature
  }
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
