// 钩子方法
export type HookFunction<T = any> = (
  context: T,
  ...args: any[]
) => Promise<unknown | void> | unknown | void;

// 钩子
export interface Hook<T = any> {
  name?: string;
  trigger?: string | string[]; //触发钩子执行
  priority?: number; // 钩子优先级
  apply?: HookFunction<T>;
}
