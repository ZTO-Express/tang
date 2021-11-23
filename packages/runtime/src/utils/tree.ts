/** 处理树形相关操作 */

export interface TreeItem<T = any> {
  children?: TreeArray<T>
  [propName: string]: any
}

export type TreeArray<T = any> = Array<TreeItem<T>>

/**
 * 类似于 arr.map 方法，此方法主要针对类似下面示例的树形结构。
 * [
 *     {
 *         children: []
 *     },
 *     // 其他成员
 * ]
 *
 * @param {Tree} tree 树形数据
 * @param {Function} iterator 处理函数，返回的数据会被替换成新的。
 * @return {Tree} 返回处理过的 tree
 */
export function mapTree<T extends TreeItem>(
  tree: Array<T>,
  iterator: (item: T, key: number, level: number, paths: Array<T>) => T,
  level = 1,
  depthFirst = false,
  paths: Array<T> = []
) {
  return tree.map((item: any, index) => {
    if (depthFirst) {
      const children: TreeArray | undefined = item.children
        ? mapTree(item.children, iterator, level + 1, depthFirst, paths.concat(item))
        : undefined
      children && (item = { ...item, children })
      item = iterator(item, index, level, paths) || { ...(item as object) }
      return item
    }

    item = iterator(item, index, level, paths) || { ...(item as object) }

    if (item.children && item.children.splice) {
      item.children = mapTree(item.children, iterator, level + 1, depthFirst, paths.concat(item))
    }

    return item
  })
}

/**
 * 遍历树
 * @param tree
 * @param iterator
 */
export function eachTree<T extends TreeItem>(
  tree: Array<T>,
  iterator: (item: T, key: number, level: number, parent?: T) => any,
  level = 1,
  parent?: T
) {
  tree.forEach((item, index) => {
    iterator(item, index, level, parent)

    if (item.children && item.children.splice) {
      eachTree(item.children as any, iterator, level + 1, item)
    }
  })
}

/**
 * 在树中查找节点。
 * @param tree
 * @param iterator
 */
export function findTree<T extends TreeItem>(
  tree: Array<T>,
  iterator: (item: T, key: number, level: number, paths: Array<T>) => any
): T | null {
  let result: T | null = null

  everyTree(tree, (item, key, level, paths) => {
    if (iterator(item, key, level, paths)) {
      result = item
      return false
    }
    return true
  })

  return result
}

/**
 * 在树中查找节点, 返回下标数组。
 * @param tree
 * @param iterator
 */
export function findTreeIndex<T extends TreeItem>(
  tree: Array<T>,
  iterator: (item: T, key: number, level: number, paths: Array<T>) => any
): Array<number> | undefined {
  let idx: Array<number> = []

  findTree(tree, (item, index, level, paths) => {
    if (iterator(item, index, level, paths)) {
      idx = [index]

      paths = paths.concat()
      paths.unshift({
        children: tree
      } as any)

      for (let i = paths.length - 1; i > 0; i--) {
        const prev = paths[i - 1]
        const current = paths[i]
        idx.unshift(prev.children!.indexOf(current))
      }

      return true
    }
    return false
  })

  return idx.length ? idx : undefined
}

/**
 * 获取树指定路径值
 * @param tree
 * @param idx
 * @returns
 */
export function getTree<T extends TreeItem>(tree: Array<T>, idx: Array<number> | number): T | undefined | null {
  const indexes = Array.isArray(idx) ? idx.concat() : [idx]
  const lastIndex = indexes.pop()!
  let list: Array<T> | null = tree
  for (let i = 0, len = indexes.length; i < len; i++) {
    const index = indexes[i]
    if (!list![index]) {
      list = null
      break
    }
    list = list![index].children as any
  }
  return list ? list[lastIndex] : undefined
}

/**
 * 过滤树节点
 *
 * @param tree
 * @param iterator
 */
export function filterTree<T extends TreeItem>(
  tree: Array<T>,
  iterator: (item: T, key: number, level: number) => any,
  level = 1,
  depthFirst = false
) {
  if (depthFirst) {
    return tree
      .map((item) => {
        const children: TreeArray | undefined = item.children
          ? filterTree(item.children as Array<T>, iterator, level + 1, depthFirst)
          : undefined

        if (Array.isArray(children) && Array.isArray(item.children) && children.length !== item.children.length) {
          item = { ...item, children }
        }

        return item
      })
      .filter((item, index) => iterator(item, index, level))
  }

  return tree
    .filter((item, index) => iterator(item, index, level))
    .map((item) => {
      if (item.children && item.children.splice) {
        const children = filterTree(item.children as Array<T>, iterator, level + 1, depthFirst)

        if (Array.isArray(children) && Array.isArray(item.children) && children.length !== item.children.length) {
          item = { ...item, children }
        }
      }
      return item
    })
}

/**
 * 判断树中每个节点是否满足某个条件。
 * @param tree
 * @param iterator
 */
export function everyTree<T extends TreeItem>(
  tree: Array<T>,
  iterator: (item: T, key: number, level: number, paths: Array<T>, indexes: Array<number>) => boolean,
  level = 1,
  paths: Array<T> = [],
  indexes: Array<number> = []
): boolean {
  return tree.every((item, index) => {
    const value: any = iterator(item, index, level, paths, indexes)

    if (value && item.children && item.children.splice) {
      return everyTree(item.children as Array<T>, iterator, level + 1, paths.concat(item), indexes.concat(index))
    }

    return value
  })
}

/**
 * 判断树中是否有某些节点满足某个条件。
 * @param tree
 * @param iterator
 */
export function someTree<T extends TreeItem>(
  tree: Array<T>,
  iterator: (item: T, key: number, level: number, paths: Array<T>) => boolean
): boolean {
  let result = false

  everyTree(tree, (item: T, key: number, level: number, paths: Array<T>) => {
    if (iterator(item, key, level, paths)) {
      result = true
      return false
    }
    return true
  })

  return result
}

/**
 * 将树打平变成一维数组，可以传入第二个参数实现打平节点中的其他属性。
 *
 * 比如：
 *
 * flattenTree([
 *     {
 *         id: 1,
 *         children: [
 *              { id: 2 },
 *              { id: 3 },
 *         ]
 *     }
 * ], item => item.id); // 输出位 [1, 2, 3]
 *
 * @param tree
 * @param mapper
 */
export function flattenTree<T extends TreeItem>(tree: Array<T>): Array<T>
export function flattenTree<T extends TreeItem, U>(tree: Array<T>, mapper: (value: T, index: number) => U): Array<U>
export function flattenTree<T extends TreeItem, U>(tree: Array<T>, mapper?: (value: T, index: number) => U): Array<U> {
  let flattened: Array<any> = []
  eachTree(tree, (item, index) => flattened.push(mapper ? mapper(item, index) : item))
  return flattened
}

/**
 * 操作树，遵循 imutable, 每次返回一个新的树。
 * 类似数组的 splice 不同的地方这个方法不修改原始数据，
 * 同时第二个参数不是下标，而是下标数组，分别代表每一层的下标。
 *
 * 至于如何获取下标数组，请查看 findTreeIndex
 *
 * @param tree
 * @param idx
 * @param deleteCount
 * @param ...items
 */
export function spliceTree<T extends TreeItem>(
  tree: Array<T>,
  idx: Array<number> | number,
  deleteCount = 0,
  ...items: Array<T>
): Array<T> {
  const list = tree.concat()
  if (typeof idx === 'number') {
    list.splice(idx, deleteCount, ...items)
  } else if (Array.isArray(idx) && idx.length) {
    idx = idx.concat()
    const lastIdx = idx.pop()!
    let host = idx.reduce((list: any[], idx) => {
      const child = {
        ...list[idx],
        children: list[idx].children ? list[idx].children!.concat() : []
      }
      list[idx] = child
      return child.children
    }, list)
    host.splice(lastIdx, deleteCount, ...items)
  }

  return list
}

/**
 * 计算树的深度
 * @param tree
 */
export function getTreeDepth<T extends TreeItem>(tree: Array<T>): number {
  return Math.max(
    ...tree.map((item) => {
      if (Array.isArray(item.children)) {
        return 1 + getTreeDepth(item.children)
      }

      return 1
    })
  )
}

/**
 * 从树中获取某个值的所有祖先
 * @param tree
 * @param value
 */
export function getTreeAncestors<T extends TreeItem>(tree: Array<T>, value: T, includeSelf = false): Array<T> | null {
  let ancestors: Array<T> | null = null

  findTree(tree, (item, index, level, paths) => {
    if (item === value) {
      ancestors = paths
      if (includeSelf) {
        ancestors.push(item)
      }
      return true
    }
    return false
  })

  return ancestors
}

/**
 * 从树中获取某个值的上级
 * @param tree
 * @param value
 */
export function getTreeParent<T extends TreeItem>(tree: Array<T>, value: T) {
  const ancestors = getTreeAncestors(tree, value)
  return ancestors?.length ? ancestors[ancestors.length - 1] : null
}
