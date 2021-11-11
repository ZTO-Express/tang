/** 字符串自然比较 */
export function simpleCompare(a1: any, b1: any, dir: -1 | 1 = 1) {
  let ret: number

  if (typeof a1 === 'number' && typeof b1 === 'number') {
    ret = a1 < b1 ? -1 : a1 === b1 ? 0 : 1
  } else {
    ret = String(a1).localeCompare(String(b1))
  }

  return ret * dir
}
