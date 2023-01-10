import { BaseType, Definition, FunctionType, SubTypeFormatter, TypeFormatter } from 'ts-json-schema-generator'

/** Function格式化方法 */
export class FunctionTypeFormatter implements SubTypeFormatter {
  public supportsType(type: FunctionType): boolean {
    return type instanceof FunctionType
  }

  public getDefinition(type: FunctionType): Definition {
    return {
      type: 'object',
      properties: {
        isFunction: { type: 'boolean', const: true }
        // typeParameters:
        // returnType:
      }
    }
  }

  public getChildren(type: FunctionType): BaseType[] {
    return []
  }
}
