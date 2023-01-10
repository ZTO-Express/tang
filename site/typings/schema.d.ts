import type { Schema } from 'ts-json-schema-generator'
import type { DataOptionItem } from '@zto/zpage'

/**
 * 通用结构
 */
export interface ZPageJsonSchema extends Schema {}

/**
 * 为了保持独立性，元数据作用范围只限于当前定义/属性
 */
export interface ZPageJsonMeta {
  priority?: number
  categories?: ZPageJsonNodeCategoriesMeta
  category?: ZPageJsonNodeCategoryMeta
  section?: ZPageJsonNodeSectionMeta
}

/**
 * json分类集合元数据
 */
export interface ZPageJsonNodeCategoriesMeta {
  [categoryName: string]: ZPageJsonNodeCategoryMeta
}

/**
 * json分类元数据
 */
export interface ZPageJsonNodeCategoryMeta {
  name: string
  label?: string
  index?: number
  priority?: number
  categories?: ZPageJsonNodeCategoriesMeta
  sections?: ZPageJsonNodeSectionsMeta
}

/**
 * json分区集合元数据
 */
export interface ZPageJsonNodeSectionsMeta {
  [sectionName: string]: ZPageJsonNodeSectionMeta
}

/**
 * json分区元数据
 */
export interface ZPageJsonNodeSectionMeta {
  name: string
  label?: string
  index?: number
  priority?: number
}

/**
 * 属性
 */
export interface ZPageJsonNode extends ZPageJsonSchema {
  /**
   * 名称
   */
  name: string

  /**
   * 标签
   */
  label?: string

  /**
   * 排序号
   */
  index?: number

  /**
   * 优先级
   */
  priority?: number

  /**
   * 字符串
   */
  type?: string

  /**
   * 分类
   */
  category?: boolean | string

  /**
   * 分区
   */
  section?: string

  /**
   * 数据类型
   */
  data?: string

  /**
   * ui类型
   */
  ui?: string

  /**
   * 元数据
   */
  meta?: ZPageJsonNodeMeta
}

/**
 * 属性
 */
export interface ZPageJsonDefinition extends ZPageJsonNode {
  /**
   * 当前节点schema类型
   */
  schema?: string

  /**
   * 目标
   */
  target?: string
}

/**
 * 属性
 */
export interface ZPageJsonProperty extends ZPageJsonNode {}

/**
 * 节点
 */
export interface ZPageDevSchema {}

export interface ZPageDevNode extends ZPageDevSchema {
  /**
   * 定义名
   */
  name: string

  /**
   * 分类标签
   */
  label: string

  /**
   * 节点排序，一般从1开始
   */
  index: number

  /**
   * 优先级，默认10，0最高，1次级
   */
  priority: number

  /**
   * 类型名
   */
  type?: string

  /**
   * data类型
   */
  data?: string

  /**
   * ui属性
   */
  ui?: string

  /**
   * 默认值
   */
  default?: any

  /**
   * 节点分区
   */
  section?: string

  /**
   * 描述
   */
  description?: string

  /**
   * 内部节点，一般不进行展示
   */
  inner?: boolean

  /**
   * 可扩展
   */
  [prop: string]: any
}

/**
 * 支持分类的节点
 */
export interface ZPageDevCategoryNode extends ZPageDevNode {
  // 最高1级
  level: number

  /**
   * 子分类
   */
  categories: ZPageDevCategory[]

  /**
   * 分区
   */
  sections: ZPageDevSection[]

  /**
   * 所有属性
   */
  properties: ZPageDevProperty[]
}

/**
 * 结构定义
 */
export interface ZPageDevDefinition extends ZPageDevCategoryNode {
  /**
   * 结构类型
   */
  schema?: string

  /**
   * 定义目标，一般为结构对应的目标组件或者微件
   * e.g. CPage, WSchema
   */
  target?: string

  /**
   * 定义的基本永远为0(顶级级别)
   */
  level: 0
}

/**
 * 属性支持嵌套
 */
export interface ZPageDevCategory extends ZPageDevCategoryNode {
  /**
   * category所在属性名称，属性名称由分类属性解析而来，没有则表示没有属性
   */
  propertyName?: string

  /**
   * 分类所属分类
   */
  parent: ZPageDevCategoryNode

  /**
   * json属性数据
   */
  json?: ZPageJsonNode
}

/**
 * 属性分区
 */
export interface ZPageDevSection extends ZPageDevNode {
  /**
   * 属性集合
   */
  properties: ZPageDevProperty[]
}

/**
 * 属性
 */
export interface ZPageDevProperty extends ZPageDevNode {
  /**
   * 是否必填
   */
  required?: boolean

  /**
   * 是否只读
   */
  readOnly?: boolean

  /**
   * 内部属性
   */
  properties?: Array<ZPageDevProperty>

  /**
   * 所属分类
   */
  category: ZPageDevCategory

  /** 对应json节点 */
  json: ZPageJsonNode
}
