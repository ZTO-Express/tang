// 钩子方法
export type HookFunction = (
  context: HookContext,
  ...args: any[]
) => Promise<unknown | void> | unknown | void;

// 钩子执行上下文
export interface HookContext {
  [key: string]: unknown;
}

// 钩子
export interface Hook {
  name?: string;
  trigger?: string | string[]; //触发钩子执行
  priority?: number; // 钩子优先级
  apply?: HookFunction;
}
