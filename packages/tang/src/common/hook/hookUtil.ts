import { TangError } from '../types';
import { throwError, Errors } from '../error';

export function throwInvalidHookError(hookName: string) {
  return throwError({
    code: 'INVALID_HOOK',
    message: `运行钩子函数错误 ${hookName}。`,
  });
}

export function throwHookError(
  err: string | TangError,
  { hook, id }: { hook?: string; id?: string } = {},
): never {
  if (typeof err === 'string') err = { message: err };
  if (err.code && err.code !== Errors.HOOK_ERROR) {
    err.pluginCode = err.code;
  }
  err.code = Errors.HOOK_ERROR;
  if (hook) {
    err.hook = hook;
  }
  if (id) {
    err.id = id;
  }
  return throwError(err);
}
