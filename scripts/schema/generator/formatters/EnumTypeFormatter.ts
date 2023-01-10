import { BaseType, Definition, FunctionType, SubTypeFormatter, typeName, uniqueArray } from 'ts-json-schema-generator'

import { EnumType } from '../types'

/** Function格式化方法 */
export class EnumTypeFormatter implements SubTypeFormatter {
  public supportsType(type: EnumType): boolean {
    return type instanceof EnumType
  }

  public getDefinition(type: EnumType): Definition {
    const values = uniqueArray(type.getValues())
    const types = uniqueArray(values.map(typeName))
    const options = type.getOptions()

    return { type: types.length === 1 ? types[0] : types, enum: values, options }

    // NOTE: We want to use "const" when referencing an enum member.
    // However, this formatter is used both for enum members and enum types,
    // so the side effect is that an enum type that contains just a single
    // value is represented as "const" too.

    // return values.length === 1
    //   ? { type: types[0], const: values[0] }
    //   : { type: types.length === 1 ? types[0] : types, enum: values }
  }

  public getChildren(type: FunctionType): BaseType[] {
    return []
  }
}
