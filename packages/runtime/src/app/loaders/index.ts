import { useConfig } from '../../config'
import { authLoaders } from './auth'
import { pageLoaders } from './page'

import type { AppAuthLoader, AppPageLoader, AppLoader } from '../../typings'

const __appLoaders: Record<string, AppLoader[]> = {
  auth: authLoaders,
  page: pageLoaders
}

/** 获取loader */
export function useLoader<T extends AppLoader>(type: keyof typeof __appLoaders, name: string | T) {
  if (!type || !name) return undefined

  if (typeof name === 'object') {
    return name
  }

  const loaders = __appLoaders[type] || []
  const loader = loaders.find((it) => it.name === name)
  return loader as T | undefined
}

/** 获取auth loader, 默认获取当前配置的loader */
export function useAuthLoader(name?: string): AppAuthLoader | undefined {
  if (!name) name = useConfig('app.auth', {}).loader
  if (!name) return undefined

  return useLoader<AppAuthLoader>('auth', name)
}

/** 获取page loader, 默认获取当前配置的loader */
export function usePageLoader(name?: string): AppPageLoader | undefined {
  if (!name) name = useConfig('app.page', {}).loader
  if (!name) return undefined

  return useLoader<AppPageLoader>('page', name)
}
