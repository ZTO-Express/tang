import { useConfig } from '../../config'

/** 获取pages */
export const usePages = () => {
  return useConfig('pages')
}

/** 获取页面 */
export const usePage = (path: string) => {
  const pages = usePages()

  if (!pages?.length) return undefined

  const page = pages.find((it: any) => it?.path === path)
  return page
}
