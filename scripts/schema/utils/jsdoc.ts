import ts from 'typescript'

import { DataOptionItem } from '../types'
import { tryJsonParse } from './util'

/**
 * 获取节点的jsDoc
 */
export function getNodeJsDoc(node: ts.Node) {
  const jsDocs = (node as any)?.jsDoc
  if (!jsDocs?.length) return undefined

  return jsDocs[0]
}

/**
 *
 * @param tagName 获取jsDoc的tag 值
 */
export function getNodeJsDocTag(node: ts.Node, tagName: string) {
  const jsDoc = getNodeJsDoc(node)

  const tag = (jsDoc?.tags || []).find(it => it.tagName.getText() === tagName)
  return tag?.comment
}

/**
 *
 * @param tagName 获取jsDoc的tag 值
 */
export function getNodeJsDocComment(node: ts.Node) {
  const jsDoc = getNodeJsDoc(node)
  return jsDoc?.comment
}

/**
 * 解析多个值（以|分割）
 * @param vals
 * @returns
 */
export function parseJsDocOptions(opts: string): DataOptionItem[] {
  opts = (opts || '').trim()

  if (!opts) return []

  if (opts.startsWith('[')) {
    return tryJsonParse(opts)
  } else if (opts.startsWith('{')) {
    const obj = tryJsonParse(opts)
    if (!obj) return []

    const _opts = Object.keys(obj).reduce((col, key) => {
      col.push({ value: key, label: obj[key] })
      return col
    }, [] as DataOptionItem[])

    return _opts
  }

  const _opts = opts.split('|').reduce((col, cur) => {
    const item = parseJsDocOption(cur)
    if (item) col.push(item)
    return col
  }, [] as DataOptionItem[])

  return _opts
}

/** 解析文档值 */
export function parseJsDocOption(opt: string): DataOptionItem | undefined {
  if (!opt) return undefined

  let _item: any = undefined

  if (opt !== undefined && opt !== 'undefined') {
    const parts = opt.split(':')

    const val = parseJsDocValue(parts[0])

    if (parts.length === 1) {
      return { value: val, label: parts[0] }
    } else {
      return { value: val, label: parts[1] }
    }
  }

  return _item
}

/** 解析文档值 */
export function parseJsDocValue(val: string) {
  let _val: any = undefined

  if (val !== undefined && val !== 'undefined') {
    try {
      _val = JSON.parse(val)
    } catch (ex: any) {
      _val = val
    }
  }

  return _val
}
