import { sortBy } from '../utils';

import {
  TangHookContext,
  TangHook,
  TangHookNames,
  TangHooks,
  TangParallelHookNames,
  TangSequentialHookNames,
} from '../types';

import { throwInvalidHookError, throwHookError } from './hookUtil';

/**
 * 获取Promise的返回的内部类型
 * @example ResolveValue<Promise<string>> -> string
 */
type ResolveValue<T> = T extends Promise<infer K> ? K : T;

/**
 * 确保多个类型的合并为Promie
 * @example EnsurePromise<string | Promise<string>> -> Promise<string>
 */
type EnsurePromise<T> = Promise<ResolveValue<T>>;

export class HookDriver {
  private hooks: TangHook[];

  constructor(hooks: TangHook[]) {
    this.hooks = sortBy<TangHook>(hooks || [], 'priority', {
      defaultValue: 10,
    });
  }

  // 异步并行执行钩子，忽略返回值
  hookParallel<H extends TangParallelHookNames>(
    hookName: H,
    context: TangHookContext,
    args?: Parameters<TangHooks[H]>,
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < this.hooks.length; i++) {
      const hookPromise = this.runHook(hookName, context, args, i, false);
      if (!hookPromise) continue;
      promises.push(hookPromise);
    }
    return Promise.all(promises).then(() => {
      /** noop */
    });
  }

  // 异步顺序执行钩子，忽略返回值
  hookSeq<H extends TangSequentialHookNames>(
    hookName: H,
    context: TangHookContext,
    args?: Parameters<TangHooks[H]>,
  ): Promise<void> {
    let promise = Promise.resolve();
    for (let i = 0; i < this.hooks.length; i++) {
      promise = promise.then(
        () => this.runHook(hookName, context, args, i, false) as Promise<void>,
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
  private runHook<H extends TangHookNames>(
    hookName: H,
    context: TangHookContext,
    args: Parameters<TangHooks[H]>,
    hookIndex: number,
    permitValues: boolean,
  ): EnsurePromise<ReturnType<TangHooks[H]>> {
    const hook = this.hooks[hookIndex];
    if (!hook || hook.name !== hookName) return undefined as any;

    return Promise.resolve()
      .then(() => {
        // 是否允许钩子函数部位函数
        if (typeof hook !== 'function') {
          if (permitValues) return hook;
          return throwInvalidHookError(hookName);
        }
        return (hook as Function).apply(context, args);
      })
      .catch(err => throwHookError(err, { hook: hookName }));
  }
}
