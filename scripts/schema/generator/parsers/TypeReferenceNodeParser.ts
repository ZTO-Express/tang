import {
  Context,
  NodeParser,
  BaseType,
  TypeReferenceNodeParser as TJSTypeReferenceNodeParser
} from 'ts-json-schema-generator'

import ts from 'typescript'

/**
 * 解析类型参考节点
 */
export class TypeReferenceNodeParser extends TJSTypeReferenceNodeParser {
  public constructor(protected typeChecker: ts.TypeChecker, protected childNodeParser: NodeParser) {
    super(typeChecker, childNodeParser)
  }

  public createType(node: ts.TypeReferenceNode, context: Context): BaseType | undefined {
    const typeSymbol = this.typeChecker.getSymbolAtLocation(node.typeName)!
    if (typeSymbol.flags & ts.SymbolFlags.Alias) {
      const aliasedSymbol = this.typeChecker.getAliasedSymbol(typeSymbol)
      if (!aliasedSymbol.declarations) {
        return undefined
      }
    }

    return super.createType(node, context)
  }
}
