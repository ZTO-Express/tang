import { ErrorCodes } from './enums'
import { ZPageError } from './zpage.error'

/**
 * 插件错误
 */
export class PluginError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = 'Plugin Error') {
    super(objectOrError, description, ErrorCodes.PLUGIN_ERROR)
  }
}

export class InvalidPluginError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = 'Invalid Plugin') {
    super(objectOrError, description, ErrorCodes.INVALID_PLUGIN)
  }
}

export class PluginHookError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = 'Plugin Hook Error') {
    super(objectOrError, description, ErrorCodes.PLUGIN_HOOK_ERROR)
  }
}

export class PluginLoadError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = 'Plugin Load Error') {
    super(objectOrError, description, ErrorCodes.PLUGIN_LOAD_ERROR)
  }
}
