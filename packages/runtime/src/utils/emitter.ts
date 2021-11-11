import mitt from 'mitt'
import type { Handler } from 'mitt'

export class Emitter {
  private _emitter = mitt()

  get all() {
    return this._emitter.all
  }

  get on() {
    return this._emitter.on
  }

  get off() {
    return this._emitter.off
  }

  get emit() {
    return this._emitter.emit
  }

  // 批量监听
  ons(keys: string[] | string | undefined, handler: Handler<unknown> | undefined) {
    if (typeof keys === 'string') keys = [keys]
    if (!Array.isArray(keys) || !handler) return

    keys.forEach(key => {
      this.on(key, handler)
    })
  }

  // 批量解除监听
  offs(keys: string[] | string | undefined, handler: Handler<unknown> | undefined) {
    if (typeof keys === 'string') keys = [keys]
    if (!Array.isArray(keys) || !handler) return

    keys.forEach(key => {
      this.off(key, handler)
    })
  }

  // 批量发送事件
  emits(keys: string[] | string | undefined, payload: any) {
    if (typeof keys === 'string') keys = [keys]
    if (!Array.isArray(keys)) return

    keys.forEach(key => {
      this.emit(key, payload)
    })
  }
}

export const emitter = new Emitter()
