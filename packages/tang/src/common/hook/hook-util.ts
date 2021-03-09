import { TangError, TangHook, TangHookNames } from '../../@types';
import { throwError, Errors } from '../error';

export function throwInvalidHookError(
  hookName: TangHookNames,
  hook?: TangHook,
) {
  return throwError({
    code: Errors.INVALID_HOOK,
    message: `hook ${hookName}: 无效钩子函数`,
    hook: hook ? hook.name : undefined,
    plugin: hook ? hook.pluginName : undefined,
  });
}

export function throwHookError(
  err: string | TangError,
  hookName?: TangHookNames,
): never {
  if (typeof err === 'string') err = { message: err };
  err.code = Errors.HOOK_ERROR;
  if (hookName) err.hook = hookName;
  err.message = `钩子执行错误：${err.message}`;
  return throwError(err);
}
