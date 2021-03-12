import { TangCompilation, TangCompiler } from './tang.compiler';
import { Hook } from './hook';
import { Document } from './document';
import {
  TangLoader,
  TangGenerator,
  TangParser,
  TangOutputer,
  TangGeneration,
  TangOutput,
} from './tang.processor';

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
export type TangHookFunction = (
  context: TangHookContext,
  ...args: any[]
) => Promise<unknown | void> | unknown | void;

// 钩子执行上下文
export interface TangHookContext {
  compiler?: TangCompiler;

  loader?: TangLoader;
  parser?: TangParser;
  generator?: TangGenerator;
  outputer?: TangOutputer;

  document?: Document;
  compilation?: TangCompilation;
  generation?: TangGeneration;
  output?: TangOutput;

  [key: string]: unknown;
}

// 钩子
export interface TangHook extends Hook {
  trigger?: TangHookNames | '*' | TangHookNames[]; //触发钩子执行
  plugin?: string; // 钩子所属插件
  apply?: TangHookFunction;
}
