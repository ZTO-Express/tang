// 特定类型对象
export interface GenericObject<T = any> {
  [key: string]: T;
}

// 通用配置对象
export interface GenericConfigObject<T = any> {
  [key: string]: T;
}

// 通用方法
export type GenericFunction = (...args: any[]) => any;
