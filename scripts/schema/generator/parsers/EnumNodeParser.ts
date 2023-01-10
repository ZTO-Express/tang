import { Context, BaseType, isNodeHidden, getKey, EnumNodeParser as TJSEnumNodeParser } from 'ts-json-schema-generator'
import ts from 'typescript'

import { EnumType } from '../types'
import { getNodeJsDocComment, getNodeJsDocTag } from '../../utils'

import type { DataOptionItem } from '../../types'

/**
 * 解析枚举节点
 */
export class EnumNodeParser extends TJSEnumNodeParser {
  public constructor(protected typeChecker: ts.TypeChecker) {
    super(typeChecker)
  }

  public createType(node: ts.EnumDeclaration | ts.EnumMember, context: Context): BaseType {
    const members = node.kind === ts.SyntaxKind.EnumDeclaration ? node.members.slice() : [node]

    const options = members
      .filter((member: ts.EnumMember) => !isNodeHidden(member))
      .map((member, idx) => {
        const value = super.getMemberValue(member, idx)

        const label = getNodeJsDocComment(member) || String(value)
        let indexTag = getNodeJsDocTag(member, 'index')
        const index = isNaN(indexTag) ? idx : parseInt(indexTag)

        return { value, label, index }
      }) as DataOptionItem[]

    return new EnumType(`enum-${getKey(node, context)}`, options)
  }
}
