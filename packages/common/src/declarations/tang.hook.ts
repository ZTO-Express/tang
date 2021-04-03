import { TangCompileContext } from './tang.compiler';
import { Hook, HookFunction } from './hook';

// Tang内置钩子函数
export interface TangHooks {
  // 加载开始
  load: TangHookFunction;

  // 解析开始
  parse: TangHookFunction;

  // 加载结束
  loaded: TangHookFunction;

  // 生成开始
  generate: TangHookFunction;

  // 输出开始
  output: TangHookFunction;

  // 生成结束
  generated: TangHookFunction;
}

export type TangHookNames = keyof TangHooks;

// 并行执行的钩子
export type TangParallelHookNames = 'generated';

// 顺序执行的钩子
export type TangSequentialHookNames = Exclude<
  TangHookNames,
  TangParallelHookNames
>;

// 钩子方法
export type TangHookFunction = HookFunction<TangCompileContext>;

// 钩子
export interface TangHook extends Hook<TangCompileContext> {
  trigger?: TangHookNames | '*' | TangHookNames[]; //触发钩子执行
  plugin?: string; // 钩子所属插件
}
