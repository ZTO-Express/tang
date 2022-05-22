// 组件属性
export interface CmptAttrs {
  type?: string
  attrs?: CmptAttrs
  contextData?: any
  [prop: string]: any
}

// 获取组件属性方法
export type CmptAttrsMethod = (context: any, ...args: any[]) => CmptAttrs | string

// 组件属性配置
export type CmptConfig = CmptAttrs | CmptAttrsMethod | string
