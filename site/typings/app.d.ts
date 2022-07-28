import type {
  AppEnv,
  AppStartOptions,
  NavMenuItemConfig,
  AppExtensionOptions,
  AppConfigOptions,
  PartialPageSchema,
  MetaAppMetadata
} from '@zto/zpage'

/** 环境类型 */
export interface SiteAppEnv {
  readonly name: string // 当前环境名
  readonly appId: string // appId
  readonly appNs: string // app网关命名空间
  readonly hostUrl: string // 宿主应用地址
  readonly apiUrl: string // api域名
  readonly iamUrl: string // 一帐通地址
  readonly fsUrl: string // 文件服务器域名
  readonly fsAppId: string // 文件服务器域名
  readonly bmapAK: string // 百度地图access key
  readonly extraHeaders?: Record<string, string> // 额外的头文件
}

export interface KtAppStartOptions {
  name: string

  container?: Element | SVGStringList

  isDebug?: boolean // 当前是否调试模式

  isMicro?: boolean // 当前应用是否微应用

  envMap?: EnvMap

  config?: AppConfigOptions

  pages?: PartialPageSchema[]

  extensions?: AppExtensionOptions

  beforeStart?: (startOptions: AppStartOptions, options: any) => void

  meta?: (app: App) => MetaAppMetadata
}

export interface GlobMapItem<T> {
  default?: T
  page?: T
}

export type GlobMap<T> = Record<string, GlobMapItem<T>>
