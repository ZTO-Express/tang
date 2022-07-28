/**
 * vue相关引用模块垫片
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<unknown, unknown, any>
  export default component
}

declare module '*.png'
declare module '*.jpg'
declare module '*.svg'
