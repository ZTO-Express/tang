import json5 from 'json5'

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
