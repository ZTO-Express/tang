import { ErrorCodes } from './enums'
import { ZPageError } from './zpage.error'

export class AppError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = '应用错误') {
    super(objectOrError, description, ErrorCodes.APP_ERROR)
  }
}

export class AppAuthError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = '应用认证错误') {
    super(objectOrError, description, ErrorCodes.APP_AUTH_ERROR)
  }
}

export class AppLoadError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = '应用加载错误') {
    super(objectOrError, description, ErrorCodes.APP_LOAD_ERROR)
  }
}

export class AppStartError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = '应用启动错误') {
    super(objectOrError, description, ErrorCodes.APP_START_ERROR)
  }
}
