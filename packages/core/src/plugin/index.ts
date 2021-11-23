import type { PromiseFunction } from '../global'

export interface Plugin {
  name: string
  install?: PromiseFunction
}
