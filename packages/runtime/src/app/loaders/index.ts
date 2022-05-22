import { authLoaders } from './auth'
import { pageLoaders } from './page'

import type { AppLoader } from '../../typings'

export function getInnerLoaders(): AppLoader[] {
  return [...authLoaders, ...pageLoaders]
}

/** 合并两个加载器 */
export function mergeLoaders(targetLoaders?: AppLoader[], sourceLoaders?: AppLoader[]) {
  targetLoaders = targetLoaders || []
  sourceLoaders = sourceLoaders || []

  const _loaders = [...targetLoaders]

  sourceLoaders.forEach(it => {
    const existsIndex = _loaders.findIndex(_it => _it.type === it.type && _it.name === it.name)
    if (existsIndex > -1) {
      _loaders[existsIndex] = it
    } else {
      _loaders.push(it)
    }
  })

  return _loaders
}
