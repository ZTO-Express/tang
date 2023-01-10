import { EnumType as TJSEnumType, EnumValue } from 'ts-json-schema-generator'
import type { DataOptionItem } from '../../types'

export class EnumType extends TJSEnumType {
  private options: DataOptionItem[]

  public constructor(id: string, options: DataOptionItem[]) {
    const values = options.map(it => it.value)

    super(id, values)

    this.options = options
  }

  public getOptions() {
    return this.options
  }
}
