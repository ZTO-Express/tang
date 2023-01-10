import json5 from 'json5'

/** 解析json字符串 */
export function jsonParse(str: string) {
  if (typeof str === 'object') return str
  const data = json5.parse(str)
  return data
}

/** 尝试使用json5解析json字符串 */
export function tryJsonParse(str: string) {
  try {
    return jsonParse(str)
  } catch (err) {
    return undefined
  }
}

/**  json格式化 */
export function jsonStringify(json: any, options?: any) {
  if (typeof json === 'string') return json

  options = { space: 2, ...options }

  return json5.stringify(json, options)
}
