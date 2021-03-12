import { sortBy, ensureArray } from '../utils';

import { throwInvalidHookError, throwHookError } from './hook-util';
import { Hook, HookContext } from '../interfaces';

export class HookDriver {
  hooks: Hook[];

  constructor(hooks: Hook[]) {
    this.hooks = sortBy<Hook>(hooks, 'priority', {
      defaultValue: 10,
    });
  }

  // 异步并行执行钩子，忽略返回值
  hookParallel(
    hookName: string,
    context: HookContext,
    args?: any[],
  ): Promise<unknown | void> {
    const promises: Promise<unknown | void>[] = [];
    for (let i = 0; i < this.hooks.length; i++) {
      const hookPromise = this.runHook(hookName, context, args, i);
      if (!hookPromise) continue;
      promises.push(hookPromise);
    }
    return Promise.all(promises).then(() => {
      /** noop */
    });
  }

  // 异步顺序执行钩子，忽略返回值
  hookSeq(hookName: string, context: HookContext, args?: any): Promise<void> {
    let promise = Promise.resolve();
    for (let i = 0; i < this.hooks.length; i++) {
      promise = promise.then(
        () => this.runHook(hookName, context, args, i) as Promise<void>,
      );
    }
    return promise;
  }

  /**
   * 运行异步钩子并返回结果
   * @param hookName 钩子名称，必须存在于TangHooks中
   * @param args 钩子运行参数
   * @param hookIndex `this.hooks[]`中钩子的索引位置.
   * @param permitValues 如果为true，运行传入值作为钩子
   */
  private runHook(
    hookName: string,
    context: HookContext,
    args: any[],
    hookIndex: number,
  ): Promise<any> {
    const hook = this.hooks[hookIndex];

    if (!this.testHook(hookName, hook)) return undefined as any;

    const hookFn: any = hook.apply;

    return Promise.resolve()
      .then(() => {
        return hookFn.call(this, context, ...(args || []).slice(1));
      })
      .catch(err => throwHookError(err, hookName));
  }

  /** 判断钩子是否满足执行条件 */
  private testHook(hookName: string, hook: Hook) {
    if (!hookName || !hook) return false;

    if (typeof hook.apply !== 'function') throwInvalidHookError(hookName, hook);

    if (hook.name && hook.name.endsWith(`:hook:${hookName}`)) return true;

    if (hook.trigger === '*') return true;

    const hookTrigger = ensureArray(hook.trigger) as string[];
    if (hookTrigger.includes(hookName)) return true;

    return false;
  }
}
