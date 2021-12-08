import axios from 'axios'
import { useApi } from '@zto/zpage'
import { filesize } from './filesize'

interface FileNameParseResult {
  name: string
  fpath: string
  fname: string
  fullname: string
  fullpath: string
  postfix: string
  ext: string
}

interface ReadFileOptions {
  readAs: 'dataUrl' | 'binaryString' | 'text' | 'arrayBuffer'
  encoding?: string
}

export const size = filesize

// 读取文件
export async function read(file: File, options: ReadFileOptions) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (e: any) {
      if (!e.target) {
        reject('读取数据错误')
      } else {
        resolve(e.target.result)
      }
    }

    switch (options.readAs) {
      case 'dataUrl':
        reader.readAsDataURL(file)
        break
      case 'binaryString':
        reader.readAsBinaryString(file)
        break
      case 'text':
        reader.readAsText(file, options.encoding)
        break
      case 'arrayBuffer':
        reader.readAsArrayBuffer(file)
        break
      default:
        reject('无效读取参数')
    }
  })
}

/** 文件结构:
 * fullpath = ${fpath}/${fullname}
 * fullname = ${name}__${postfix}.${ext}
 * fname = ${name}.${ext}
 * */
export function parseFileName(fullpath: string) {
  if (!fullpath) {
    return {
      name: '',
      fpath: '',
      fname: '',
      fullname: '',
      fullpath: '',
      postfix: '',
      ext: ''
    }
  }

  const extIndex = fullpath.lastIndexOf('.')

  let ext = ''
  let nakepath = fullpath // 去掉扩展名的文件

  if (extIndex >= 0) {
    ext = fullpath.slice(extIndex + 1)
    nakepath = fullpath.slice(0, extIndex)
  }

  let fpath = ''
  let name = nakepath
  let fullname = fullpath
  const pathIndex = nakepath.lastIndexOf('/')

  if (pathIndex >= 0) {
    fpath = nakepath.slice(0, pathIndex)
    name = nakepath.slice(pathIndex + 1)
    fullname = fullpath.slice(pathIndex + 1)
  }

  // 计算后缀和文件名
  const postfixIndex = fullname.lastIndexOf('__')
  let postfix = ''
  let fname = fullname
  if (postfixIndex > 0) {
    postfix = fullname.slice(postfixIndex + 2)
    name = fullname.slice(0, postfixIndex)

    if (ext) {
      fname = `${name}.${ext}`
    }
  }

  return {
    name, // 文件名（不包含后缀和扩展名）
    fpath, // 路径（不包含文件名）
    fname, // 文件名（不包含后缀）
    fullname, // 完整文件名
    fullpath, // 完整路径
    postfix, // 后缀
    ext // 扩展名
  }
}

// 获取文件mimetype
export function getFileMimeType(filename: string) {
  const { ext } = parseFileName(filename)

  let filetype: string | undefined = undefined

  switch (ext) {
    case 'xls':
    case 'xlsx':
      filetype = 'application/ms-excel'
      break
  }

  return filetype
}

export async function getUrlByPath(name: string) {
  const fsApi = useApi('fs')

  const urls = await fsApi.getUrlsByPaths([name])
  return urls[0]
}

export async function getUrlsByPaths(names: string[]) {
  const fsApi = useApi('fs')

  const urls = await fsApi.getUrlsByPaths(names)
  return urls
}

// 导入模板文件下载（返回文件流）
export async function download(url: string, options?: any) {
  options = Object.assign({}, options)
  let filetype = options.filetype
  let filename = options.filename

  if (!filename) {
    const lastPathIndex = url.lastIndexOf('/')
    if (lastPathIndex < 0) {
      filename = url
    } else {
      filename = url.substr(lastPathIndex + 1)
    }
  }

  let { ext } = parseFileName(filename)

  if (!filetype) {
    filetype = getFileMimeType(filename)
  }

  const res = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    responseType: 'blob'
  })

  // eslint-disable-next-line eqeqeq
  if (res && res.status == 200) {
    if (res.data && res.data.type) {
      if (res.data.type === 'image/jpeg' && ext !== 'jpg' && ext !== 'jpeg') {
        filename += '.jpeg'
      }
      filetype = res.data.type
    }
    let blob = new Blob([res.data], { type: filetype })

    let downloadElement = document.createElement('a')
    let href = window.URL.createObjectURL(blob) // 创建下载的链接
    downloadElement.href = href
    downloadElement.download = decodeURIComponent(filename) // 下载后文件名
    document.body.appendChild(downloadElement)
    downloadElement.click() // 点击下载
    document.body.removeChild(downloadElement) // 下载完成移除元素
    window.URL.revokeObjectURL(href) // 释放掉blob对象
    return
  }
}
