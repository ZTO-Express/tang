import { InterfaceDeclaration, TypeNode } from 'ts-morph'

import { CommonTypeNames, DocTagNames, WidgetPropertyType } from '../types'

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
