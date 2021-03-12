import { Hook } from '../interfaces';
import { HookError, InvalidHookError, TangError } from '../errors';
import { isString } from '../utils';

export function throwInvalidHookError(hookName: string, hook?: Hook | string) {
  throw new InvalidHookError({
    message: `hook ${hookName}: 无效钩子函数`,
    hook: hook && (isString(hook) ? hook : hook.name),
  });
}

export function throwHookError(
  err: string | TangError,
  hook?: Hook | string,
): never {
  const errBody: any = isString(err) ? { message: err } : err;
  errBody.message = `钩子执行错误：${errBody.message}`;
  errBody.hook = hook && (isString(hook) ? hook : hook.name);
  throw new HookError(errBody);
}
