import { ErrorCodes } from './enums'
import { ZPageError } from './zpage.error'

/**
 * 钩子错误
 */
export class HookError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = 'Hook Error') {
    super(objectOrError, description, ErrorCodes.HOOK_ERROR)
  }
}

export class InvalidHookError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = 'Invalid Hook') {
    super(objectOrError, description, ErrorCodes.HOOK_ERROR)
  }
}
