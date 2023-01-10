import json5 from 'json5'
import { ts, TypeNode } from 'ts-morph'
import { CommonTypeNames, DocTagNames } from './types'
import type { InterfaceDeclaration } from 'ts-morph'
import type { WidgetPropertyType } from './types'

/** 判断是否Widget接口 */
export function isWidgetInterface(it: InterfaceDeclaration) {
  // 微件接口必须对外导出
  if (!it.isExported) return false

  const jsDoc = it.getJsDocs()[0]
  if (!jsDoc) return false

  // 判断是否存在 Widget注解
  const isWidget = jsDoc.getTags().some(it => (it.getTagName() || '').trim() === DocTagNames.WIDGET)

  return isWidget
}

/** 判断是否可扩展类型节点类型 */
export function isExtensibleInterface(it: InterfaceDeclaration) {
  const isExtensible = it.getHeritageClauses().some(it => {
    return it.getTypeNodes().some(_it => _it.getText() === CommonTypeNames.EXTENSIBLE)
  })

  return isExtensible
}

/** 判断是否可扩展类型节点类型 */
export function isPromiseFunctionNodeType(typeNode: TypeNode) {
  if (!TypeNode.isFunctionTypeNode(typeNode)) return false

  return typeNode.getReturnTypeNode()?.getType()?.getText() === CommonTypeNames.PROMISE
}

/** 获取全新初始化属性类型 */
export function initialWidgetPropertyType(initialData?: Partial<WidgetPropertyType>): WidgetPropertyType {
  return {
    typeName: '',
    isTypeReference: true,
    isArray: false,
    isRecord: false,
    isInterface: false,
    isTypeLiteral: false,
    isFunction: false,
    isUnionType: false,
    isPromiseFunction: false,

    isExtensible: false,
    properties: [],

    ...initialData
  }
}

/** 尝试使用json5解析json字符串 */
export function tryJsonParse(str: string) {
  try {
    const data = json5.parse(str)
    return data
  } catch (err) {
    return undefined
  }
}
