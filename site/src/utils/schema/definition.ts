import { _ } from '@zto/zpage'
import schemas from '@/../schemas/index.json'

import { SCHEMA_POSTFIX, SCHEMA_NAMES, SCHEMA_LABELS } from './consts'

import type {
  ZPageJsonSchema,
  ZPageJsonDefinition,
  ZPageJsonProperty,
  ZPageDevDefinition,
  ZPageDevCategory,
  ZPageDevSection,
  ZPageDevProperty,
  ZPageDevCategoryNode,
  ZPageJsonMeta,
  ZPageDevNode
} from '@/../typings'

import type { CategoryNameObject, SectionNameObject } from './types'

const __schemas = schemas as unknown as ZPageJsonSchema

const __defDefinitions: Record<string, ZPageDevDefinition> = {}

/** 查找指定的json definition并解析为dev definition */
export function getDevDefinition(ref: string): ZPageDevDefinition | undefined {
  let devDef: ZPageDevDefinition | undefined = __defDefinitions[ref]

  if (!devDef) {
    const jsonDef = getJsonDefinition(ref)
    if (!jsonDef) return undefined

    devDef = parseJsonDefinition(jsonDef)

    if (devDef) {
      __defDefinitions[ref] = devDef
    }
  }

  return devDef
}

/** 查找指定的definition */
export function getJsonDefinition(ref: string): ZPageJsonDefinition | undefined {
  const definitions = (__schemas.definitions || {}) as any

  const refName = getJsonDefinitionNameByRef(ref)
  return definitions[refName]
}

/**
 * 根据ui名称查询definition
 * @param uiName
 */
export function queryJsonDefinitionsByUI(uiName: string) {
  if (!uiName) return undefined
  return queryJsonDefinitions(it => it.ui === uiName)
}

/**
 * 根据多个ui名称查询definition
 * @param uiNames
 */
export function queryJsonDefinitionsByUIs(uiNames: string[] | undefined) {
  if (!uiNames) return []
  return queryJsonDefinitions(it => !!it?.ui && uiNames.includes(it.ui))
}

/**
 * 查询定义
 * @param predicate
 * @returns
 */
export function queryJsonDefinitions(predicate: (def: ZPageJsonDefinition) => boolean) {
  const definitions = (__schemas.definitions || {}) as Record<string, ZPageJsonDefinition>

  const defs = Object.values(definitions).filter(it => predicate(it))
  return defs
}

/**
 * 根据ref获取ref名称
 * @param ref
 * @returns
 */
export function getJsonDefinitionNameByRef(ref: string) {
  if (ref && ref.startsWith('#/definitions/')) {
    return ref.substring('#/definitions/'.length)
  }

  return ref
}

/**
 * 解析
 */
export function parseJsonDefinition(jsonDefinition?: ZPageJsonDefinition): ZPageDevDefinition | undefined {
  if (!jsonDefinition) return undefined

  const { schema, name, label } = jsonDefinition

  // 解析dev target对象
  let target = jsonDefinition.target
  if (!target) {
    if (name.endsWith(SCHEMA_POSTFIX)) {
      target = name.substring(0, name.length - SCHEMA_POSTFIX.length)
    } else {
      target = name
    }
  }

  /** 开发定义 */
  const definition: ZPageDevDefinition = {
    name,
    index: jsonDefinition.index || 1,
    level: 0,
    priority: jsonDefinition.priority || 10,
    label: label || name,
    schema,
    target,
    sections: [],
    categories: [],
    properties: []
  }

  parseJsonDefinitionProperties(jsonDefinition, definition)

  return definition
}

/**
 * 解析Json定义属性
 * @param definition 目标定义
 * @param jsonDefinition 目标json定义
 */
export function parseJsonDefinitionProperties(jsonDefinition: ZPageJsonDefinition, definition: ZPageDevDefinition) {
  Object.entries(jsonDefinition.properties || {}).forEach(([name, prop], index) => {
    const jsonProperty = prop as ZPageJsonProperty

    // 解析属性相关信息
    const devProperty = parseJsonProperty(jsonProperty, definition, jsonDefinition.meta)

    // 解析子属性，不支持下钻
    parseJsonPropertyProperties(jsonProperty, devProperty)
  })

  // 对所有节点今昔排序
  deepSortDevCategoryNode(definition)
}

/**
 * 深度排序分类节点
 * @param categoryNode
 */
export function deepSortDevCategoryNode(categoryNode: ZPageDevCategoryNode) {
  if (categoryNode.categories?.length) {
    categoryNode.categories = sortDevNode(categoryNode.categories)
  }

  categoryNode.sections = sortDevNode(categoryNode.sections)

  categoryNode.properties = sortDevNode(categoryNode.properties)

  categoryNode.categories.forEach(it => {
    deepSortDevCategoryNode(it)
  })

  categoryNode.sections.forEach(it => {
    it.properties = sortDevNode(it.properties)
  })
}

/** 对devNode进行排序 */
export function sortDevNode<T extends ZPageDevNode>(nodes: ZPageDevNode[]) {
  // 新增参考排序
  nodes.forEach(it => {
    it.__sortIndex = (it.priority || 10) * 100000 + it.index
  })

  const sortedNodes = _.sortBy<T>(nodes, '__sortIndex')

  // 移除参考排序
  sortedNodes.forEach(it => {
    delete it.__sortIndex
  })

  return sortedNodes
}

/**
 * 解析属性下的属性值，不支持下钻
 * @param jsonProperty
 * @param property
 * @param jsonMeta
 */
export function parseJsonPropertyProperties(jsonProperty: ZPageJsonProperty, property: ZPageDevProperty) {
  Object.entries(jsonProperty.properties || {}).forEach(([name, prop], index) => {
    const jsonProperty = prop as ZPageJsonProperty

    // 解析属性相关信息
    parseJsonProperty(jsonProperty, property.category, jsonProperty.meta)
  })
}

/**
 * 解析属性信息
 * @param categories 上一级分类
 * @param property 当前属性
 */
export function parseJsonProperty(
  jsonProperty: ZPageJsonProperty,
  categoryNode: ZPageDevCategoryNode,
  jsonMeta?: ZPageJsonMeta
) {
  // 先解析出来属性分类(解析完成后，分类会自动加入分类节点)
  const category = parseJsonPropertyCategory(jsonProperty, categoryNode, jsonMeta)

  // 初始化开发属性, 并将属性添加到制定的分类
  const property = initDevProperty(jsonProperty, category)

  // 解析属性section
  parseJsonPropertySection(jsonProperty, property, jsonMeta)

  return property
}

/** 根据json属性初始化dev属性 */
export function initDevProperty(
  jsonProperty: ZPageJsonProperty,
  category: ZPageDevCategory,
  initalData?: Partial<ZPageDevProperty>
): ZPageDevProperty {
  const property = {
    name: jsonProperty.name,
    label: jsonProperty.label || jsonProperty.name,
    index: jsonProperty.index || category.properties.length + 1,
    priority: jsonProperty.priority || 10,
    section: jsonProperty.section,
    readOnly: jsonProperty.readOnly,
    type: jsonProperty.type,
    data: jsonProperty.data,
    ui: jsonProperty.ui,
    default: jsonProperty.default,
    description: jsonProperty.description,
    category,
    json: jsonProperty,
    ...initalData
  } as ZPageDevProperty

  // 添加属性到分类
  if (!category.properties.some(it => it.name === property.name)) {
    category.properties.push(property)
  }

  return property
}

/**
 * 解析属性分类信息（因为比较复杂，单独拎出来, 防止逻辑混淆）
 */
export function parseJsonPropertyCategory(
  jsonProperty: ZPageJsonProperty,
  categoryNode: ZPageDevCategoryNode,
  jsonMeta?: ZPageJsonMeta
) {
  const categories = categoryNode.categories

  // 查找属性分类
  const propCatNameData = parseCategoryName(jsonProperty)

  // 是否存在子分类
  const isSubCategory = !!propCatNameData.subName

  // 根据路径获取属性分类
  let category: ZPageDevCategory | undefined = categories.find(it => it.name === propCatNameData.name)

  // 查看一级分类是否存在
  if (!category) {
    const catLevel = categoryNode.level + 1

    const catJsonMeta = (jsonMeta?.categories || {})[propCatNameData.name]
    const propJsonMeta = jsonProperty.meta?.category

    let catIndex: number
    let catPriority: number
    let catLabel: string

    if (isSubCategory) {
      // 存在子分类
      catIndex = catJsonMeta?.index || categories.length + 1
      catPriority = catJsonMeta?.priority || 10
      catLabel =
        catJsonMeta?.label || (SCHEMA_LABELS as any)[propCatNameData.name.toUpperCase()] || propCatNameData.name
    } else {
      // 不存在子分类(优先将解析数据交给子分类)
      catIndex = catJsonMeta?.index || propJsonMeta?.index || categories.length + 1
      catPriority = catJsonMeta?.priority || propJsonMeta?.priority || 10
      catLabel =
        propCatNameData.label ||
        catJsonMeta?.label ||
        propJsonMeta?.label ||
        (SCHEMA_LABELS as any)[propCatNameData.name.toUpperCase()] ||
        jsonProperty.label ||
        propCatNameData.name
    }

    category = {
      name: propCatNameData.name,
      label: catLabel,
      index: catIndex,
      level: catLevel,
      priority: catPriority,
      parent: categoryNode,
      categories: [],
      sections: [],
      properties: []
    }

    categories.push(category)

    if (!isSubCategory) {
      category.json = jsonProperty
    }
  }

  // 不存在子分类则直接返回
  if (!isSubCategory) return category

  const subName = propCatNameData.subName

  // 二级分类是否存在
  let sCategory: ZPageDevCategory | undefined = category.categories.find(it => it.name === subName)

  const sCatJsonMeta = (jsonMeta?.categories || {})[propCatNameData.fullName]
  const sPropJsonMeta = jsonProperty.meta?.category

  if (!sCategory) {
    const sCatIndex = sCatJsonMeta?.index || sPropJsonMeta?.index || categories.length + 1
    const sCatPriority = sCatJsonMeta?.priority || sPropJsonMeta?.priority || 10
    const sCatLabel =
      propCatNameData.subLabel ||
      sCatJsonMeta?.label ||
      sPropJsonMeta?.label ||
      (SCHEMA_LABELS as any)[subName!.toUpperCase()] ||
      jsonProperty.label ||
      subName

    const sCatLevel = category.level + 1

    sCategory = {
      name: propCatNameData.subName!,
      label: sCatLabel,
      index: sCatIndex,
      priority: sCatPriority,
      level: sCatLevel,
      parent: category,
      categories: [],
      sections: [],
      properties: [],
      json: jsonProperty
    }

    category.categories.push(sCategory)
  }

  return sCategory
}

/**
 * 解析属性分区信息
 * @param jsonProperty
 * @param categoryNode
 * @param jsonMeta
 */
export function parseJsonPropertySection(
  jsonProperty: ZPageJsonProperty,
  property: ZPageDevProperty,
  jsonMeta?: ZPageJsonMeta
) {
  const sections = property.category.sections

  const propCatNameData = parseCategoryName(jsonProperty)
  const propSecNameData = parseSectionName(jsonProperty.section)

  // 根据路径获取属性分类
  let section: ZPageDevSection | undefined = sections.find(it => it.name === propSecNameData.name)

  if (!section) {
    const catJsonMeta = (jsonMeta?.categories || {})[propCatNameData.fullName]
    const secJsonMeta = (catJsonMeta?.sections || {})[propSecNameData.name]

    const propJsonMeta = jsonProperty.meta?.section

    let secIndex = secJsonMeta?.index || propJsonMeta?.index || sections.length + 1
    let secPriority = secJsonMeta?.priority || propJsonMeta?.priority || 10
    let secLabel = propSecNameData.label || secJsonMeta?.label || propJsonMeta?.label || property.label

    section = {
      name: propSecNameData.name,
      index: secIndex,
      priority: secPriority,
      label: secLabel,
      properties: []
    }

    sections.push(section)
  }

  section.properties.push(property)

  return section
}

/**
 * 解析属性名
 * @param categoryName
 */
export function parseCategoryName(jsonProperty?: ZPageJsonProperty): CategoryNameObject {
  // 名字未设置，则返回默认
  if (!jsonProperty?.category) {
    return { name: SCHEMA_NAMES.DEFAULT, fullName: SCHEMA_NAMES.DEFAULT, label: SCHEMA_LABELS.DEFAULT }
  }

  const categoryName: string = jsonProperty.category === true ? jsonProperty.name : String(jsonProperty.category)

  // 查找属性分类
  let [fullName, fullLabel] = categoryName.split(':')

  let [name, subName] = fullName.split('.')
  let [label, subLabel] = (fullLabel || '').split('.')

  if (subName && !subLabel) {
    // 优先设置子节点label
    subLabel = label
    label = ''
  }

  return { name, subName, label, subLabel, fullName }
}

/**
 * 解析分区名称
 * @param sectionName
 * @returns
 */
export function parseSectionName(sectionName?: string): SectionNameObject {
  // 名字未设置，则返回默认
  if (!sectionName) {
    return { name: SCHEMA_NAMES.DEFAULT, label: SCHEMA_LABELS.DEFAULT }
  }

  // 查找属性分类
  let [name, label] = sectionName.split(':')

  return { name, label }
}
