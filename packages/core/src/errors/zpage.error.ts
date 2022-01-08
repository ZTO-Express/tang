import { isString, isObject } from '../utils/lodash'

export class ZPageError extends Error {
  constructor(readonly body: any, readonly description: string, readonly code: string) {
    super()

    this.name = 'ZPageError'
    this._initMessage()
  }

  private _initMessage() {
    this.message = this.getBodyText()
  }

  getBodyText() {
    const errorBody = this.body

    const defaultText = '未知错误'

    if (!errorBody) return defaultText

    if (isString(errorBody)) return errorBody

    return errorBody?.message || errorBody?.text || errorBody?.description || defaultText
  }

  static createBody(objectOrError: object | string, message?: string, code?: string) {
    if (!objectOrError) {
      return { code, message }
    }
    return isObject(objectOrError) && !Array.isArray(objectOrError)
      ? objectOrError
      : { code, message, error: objectOrError }
  }
}
