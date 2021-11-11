import { ErrorCodes } from './enums'
import { ZPageError } from './zpage.error'

/**
 * 插件错误
 */

export class PluginError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = 'Plugin Error') {
    super(
      ZPageError.createBody(objectOrError, description, ErrorCodes.PLUGIN_ERROR),
      ErrorCodes.PLUGIN_ERROR
    )
  }
}

export class InvalidPluginError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = 'Invalid Plugin') {
    super(
      ZPageError.createBody(objectOrError, description, ErrorCodes.INVALID_PLUGIN),
      ErrorCodes.INVALID_PLUGIN
    )
  }
}

export class PluginHookError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = 'Plugin Hook Error') {
    super(
      ZPageError.createBody(objectOrError, description, ErrorCodes.PLUGIN_HOOK_ERROR),
      ErrorCodes.PLUGIN_HOOK_ERROR
    )
  }
}

export class PluginLoaderError extends ZPageError {
  constructor(objectOrError?: string | object | any, description = 'Plugin Loader Error') {
    super(
      ZPageError.createBody(objectOrError, description, ErrorCodes.PLUGIN_LOADER_ERROR),
      ErrorCodes.PLUGIN_LOADER_ERROR
    )
  }
}
