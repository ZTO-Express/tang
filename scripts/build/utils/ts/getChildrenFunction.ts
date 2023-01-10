import { TreeMode } from './types'

import type { Node, ts } from 'ts-morph'

/** 获取typescript节点子节点的方法 */
export function getChildrenFunction(mode: TreeMode): (node: Node) => Node<ts.Node>[] {
  switch (mode) {
    case TreeMode.getChildren:
      return getAllChildren
    case TreeMode.forEachChild:
      return forEachChild
    default:
      throw new Error(`Unhandled mode: ${mode}`)
  }

  function getAllChildren(node: Node) {
    return node.getChildren()
  }

  function forEachChild(node: Node) {
    const nodes: Node[] = []
    node.forEachChild(child => {
      nodes.push(child)
      return undefined
    })
    return nodes
  }
}
