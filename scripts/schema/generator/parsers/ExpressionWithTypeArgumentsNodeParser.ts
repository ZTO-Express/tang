import {
  Context,
  NodeParser,
  BaseType,
  ExpressionWithTypeArgumentsNodeParser as TJSExpressionWithTypeArgumentsNodeParser
} from 'ts-json-schema-generator'

import ts from 'typescript'

export class ExpressionWithTypeArgumentsNodeParser extends TJSExpressionWithTypeArgumentsNodeParser {
  public constructor(protected typeChecker: ts.TypeChecker, protected childNodeParser: NodeParser) {
    super(typeChecker, childNodeParser)
  }

  public createType(node: ts.ExpressionWithTypeArguments, context: Context): BaseType | undefined {
    const typeSymbol = this.typeChecker.getSymbolAtLocation(node.expression)!
    if (typeSymbol.flags & ts.SymbolFlags.Alias) {
      const aliasedSymbol = this.typeChecker.getAliasedSymbol(typeSymbol)
      if (!aliasedSymbol.declarations) return undefined
    }

    return super.createType(node, context)
  }
}
