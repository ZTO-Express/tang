// 特定类型对象
export interface SpecialObject<T = unknown> {
  [key: string]: T;
}

// 通用配置对象
export interface GenericConfigObject<T = unknown> {
  [key: string]: T;
}
