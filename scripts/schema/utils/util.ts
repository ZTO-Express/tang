import json5 from 'json5'
import { Schema } from 'ts-json-schema-generator'

/** 尝试使用json5解析json字符串 */
export function tryJsonParse(str: string) {
  if (typeof str === 'object') return str

  try {
    const _json5 = json5
    const data = _json5.parse(str)
    return data
  } catch (err) {
    return undefined
  }
}

/** 查找指定的definition */
export function getSchemaDefinition(schema: Schema, ref: string) {
  if (!schema.definitions) return undefined

  const refName = getRefNameByRef(ref)

  return schema.definitions[refName]
}

/**
 * 根据ref获取ref名称
 * @param ref
 * @returns
 */
export function getRefNameByRef(ref: string) {
  if (ref && ref.startsWith('#/definitions/')) {
    return ref.substring('#/definitions/'.length)
  }

  return ref
}
