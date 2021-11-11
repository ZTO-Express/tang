export interface Plugin {
  name: string
  install?: PromiseFunction
}
