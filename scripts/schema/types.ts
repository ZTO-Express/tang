import type { JSDocLink, JSDocLinkCode, JSDocLinkPlain, JSDocText } from 'ts-morph'

/** 注释tag名 */
export enum DocTagNames {
  WIDGET = 'widget', // 是否微件（及微件名）
  DEFAULT = 'default', // 默认值
  DEFAULT_TEXT = 'defaultText', // 默认值文本
  OPTIONS = 'options', // 可选值
  OPTIONS_TEXT = 'optionsText', // 可选项
  REF_TYPE = 'refType', // 参考类型（合并类型时指定参考类型）
  REF_TYPE_TEXT = 'refTypeText', // 参考类型文本
  REFS = 'refs', // 参考
  REFS_TEXT = 'refsText' // 参考文本
}

/** 类型名 */
export enum CommonTypeNames {
  EXTENSIBLE = 'Extensible', // 可扩展类型名
  RECORD = 'Record', // Record类型
  ARRAY = 'Array', // Array类型
  PROMISE = 'Promise' // Promise类型
}

/** 数据选项 */
export interface DataOptionItem {
  value: number | string | null
  label: string
  [prop: string]: any
}

/** Schema生成选项 */
export interface SchemaGenerateOptions {
  /** 入口文件 */
  entry?: string

  /** 需要解析的类型名称 */
  type?: string

  /** ts配置文件路径 */
  tsconfigPath?: string

  [prop: string]: any
}

export interface SchemaInfo {
  name: string // Schema名称
  type: string // 类型名称
  description?: string // 接口描述
  properties?: WidgetProperty[] // Schema属性
  doc?: Doc | null // 文档信息
  tags?: DocTags // 文档标签
  isExtensible: boolean // 是否可扩展
}

/** 微件结构 */
export interface WidgetSchema extends SchemaInfo {
  name: string // 微件名称
}

/** 微件属性 */
export interface WidgetProperty extends SchemaInfo {
  readonly: boolean // 是否只读
  required: boolean // 是否必须
  options?: DataOptionItem[] // 可选值
  optionsText?: string // 可选值文本
  default?: any // 默认值
  defaultText?: string // 默认值文本
  refs?: DocRef[] // 文档参考
  isFunction: boolean // 是否方法
  referenceType?: WidgetPropertyType // 属性参考类型
}

/** 属性详细类型信息 */
export interface WidgetPropertyType {
  typeName: string // 类型名称

  isTypeReference: boolean // 是否参考类型
  isArray: boolean // 是否数组类型 -> innerType
  isRecord: boolean // 是否Record类型 -> innerType
  isInterface: boolean // 是否接口 -> innerType
  isTypeLiteral: boolean // 是否类型表达式

  isFunction: boolean // 是否方法类型, properties 对应返回类型
  isPromiseFunction: boolean // 是否Promise方法
  isUnionType: boolean // 是否合并类型, 对应联系类型中的，参考类型属性

  isExtensible: boolean // 属性是否可扩展

  properties: WidgetProperty[] // 子属性

  // parameters?: WidgetProperty[] // Function参数属性

  // returnType?: WidgetPropertyType // Function参数属性

  doc?: Doc | null // 文档
}

export type JSDocComment = string | (JSDocText | JSDocLink | JSDocLinkCode | JSDocLinkPlain | undefined)[] | undefined

/** 文档 */
export interface Doc {
  description?: string // 文档描述
  comment?: JSDocComment // 文档comment
  tags: DocTags // 文档tag
}

/** 文档tag数据 */
export interface DocTags {
  isWidget?: boolean
  widgetName?: string // 微件名
  default?: any // 默认值
  defaultText?: string // 默认值文本
  options?: DataOptionItem[] // 可选值
  optionsText?: string // 可选值文本
  refType?: WidgetPropertyType // 参考类型
  refTypeText?: string // 参考类型文本
  refs?: DocRef[] // 参考
  refsText?: string // 参考文本
  [prop: string]: any
}

/** 文档参考 */
export interface DocRef {
  [prop: string]: any
}
