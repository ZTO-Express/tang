import { _ } from '@zto/zpage'

/**
 * 获取表单上下文
 * @param payload
 * @param context
 * @returns
 */
export function getActionPayload(payload: any, context: any) {
  const ctxData = context.data || {}

  if (_.isFunction(payload)) {
    return payload(context)
  } else if (Array.isArray(payload)) {
    return payload.reduce((obj: any, key: string) => {
      if (key) obj[key] = ctxData[key]
      return obj
    }, {})
  } else {
    return payload
  }
}
