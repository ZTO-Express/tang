import type { ZPageJsonDefinition } from '@/../typings'

/**
 * UI项
 */
export interface UIItem extends ZPageJsonDefinition {}

/**
 * UI分组
 */
export interface UIItemGroup {
  /**
   * 分组名称
   */
  name: string
  /**
   * 分组标签
   */
  label: string

  /**
   * 排序号
   */
  index?: string

  /**
   * 分组
   */
  items: UIItem[]
}

/**
 * 分区名称解析后的对象
 */
export interface SectionNameObject {
  name: string // 名称
  label?: string // 标签
}

/**
 * 分类名称解析后的对象
 */
export interface CategoryNameObject {
  fullName: string // 全名称
  name: string // 名称
  label?: string // 标签
  subName?: string // 子名称
  subLabel?: string // 子标签
  fullLabel?: string // 这个一般没有实用意义，但仍然保留
}
