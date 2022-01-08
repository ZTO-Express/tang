import { onUnmounted } from 'vue'
import { emitter } from '../../utils'
import { useAppContext } from './useContext'

import type { GenericFunction } from '@zto/zpage-core'

/** 使用schema */
export function useWidgetSchema(schema: any, payload?: any) {
  if (typeof schema === 'function') {
    // 应用上下文
    const context = useAppContext()

    return schema.call(null, context, payload)
  }

  return schema
}

/**
 * Widget
 * @param section
 * @returns
 */
export function useWidgetProps() {
  return {
    schema: {
      type: Object,
      required: true
    }
  }
}

/** 注册emitter事件 */
export function useWidgetEmitter(schema: any, handlerMap: Record<string, GenericFunction>) {
  if (!handlerMap) return

  Object.keys(handlerMap).forEach(key => {
    if (!isWidgetEventKey(key)) return

    const evtTypes = schema[key] as any
    const evtHandler = handlerMap[key] as any

    emitter.ons(evtTypes, evtHandler)
  })

  onUnmounted(() => {
    Object.keys(handlerMap).forEach(key => {
      if (!isWidgetEventKey(key)) return

      const evtTypes = schema[key] as any
      const evtHandler = handlerMap[key] as any

      emitter.offs(evtTypes, evtHandler)
    })
  })
}

/** 当前key是否Widget事件key */
export function isWidgetEventKey(key: string) {
  return typeof key === 'string' && key.endsWith('On') && key !== 'On'
}
