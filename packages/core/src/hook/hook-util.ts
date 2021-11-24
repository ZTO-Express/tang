import { HookError, InvalidHookError } from '../errors'
import { isString } from '../utils/lodash'

import type { ZPageError } from '../errors'

// 钩子方法
export type HookFunction<T = any> = (
  context: T,
  ...args: any[]
) => Promise<unknown | void> | unknown | void

// 钩子
export interface Hook<T = any> {
  name?: string
  trigger?: string | string[] //触发钩子执行
  priority?: number // 钩子优先级
  apply?: HookFunction<T>
}

export function throwInvalidHookError(hookName: string, hook?: Hook | string) {
  throw new InvalidHookError({
    message: `hook ${hookName}: 无效钩子函数`,
    hook: hook && (isString(hook) ? hook : hook.name)
  })
}

export function throwHookError(err: string | ZPageError, hook?: Hook | string): never {
  const errBody: any = isString(err) ? { message: err } : err
  errBody.message = `钩子执行错误：${errBody.message}`
  errBody.hook = hook && (isString(hook) ? hook : hook.name)
  throw new HookError(errBody)
}
