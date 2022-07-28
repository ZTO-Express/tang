import type { App } from '@zto/zpage'

// 图片ViewerKey
export const C_IMAGE_VIEWER_KEY = Symbol('CImageViewer')

// 图片源类型 path: 需要请求url才能显示，url: 直接显示
export type ImageSrcType = 'path' | 'url'

// 图片属性
export interface ImageProps {
  src?: string | string[]
  srcType?: ImageSrcType
  label?: string
  emptyText?: string
  showCount?: boolean // 是否显示图片张数（label不为true有效）
  fit?: string
  preview?: boolean
  initialIndex?: number
  hideOnClickModal?: boolean
}

// 图片上下文
export interface ImageContext extends ImageProps {
  innerUrl: string
  innerSrcs: string[]
}

// 图片查看器上下文
export interface ImageViewerContext {
  show: (img: ImageContext) => void
  addImage: (img: ImageContext) => void
  removeImage: (img: ImageContext) => void
}

/** 图片显示信息 */
export interface ImageDisplayInfo {
  srcType?: ImageSrcType
  src?: string
  url?: string
  label?: string
}

/** 获取图片地址 */
export async function getImageUrls(app: App, srcs: string[], srcType?: ImageSrcType) {
  let urls: string[] = []

  if (srcType === 'url') {
    urls = srcs
  } else {
    if (!srcs?.length) return []

    const { fsApi } = app.apis

    urls = await fsApi.getFileUrls!(srcs)
  }

  return urls
}
