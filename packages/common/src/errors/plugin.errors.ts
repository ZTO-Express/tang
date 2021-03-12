import { ErrorCodes } from '../enums';
import { TangError } from './tang.error';

/**
 * 插件错误
 */

export class PluginError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Plugin Error',
  ) {
    super(
      TangError.createBody(objectOrError, description, ErrorCodes.PLUGIN_ERROR),
      ErrorCodes.PLUGIN_ERROR,
    );
  }
}

export class InvalidPluginError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Invalid Plugin',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.INVALID_PLUGIN,
      ),
      ErrorCodes.INVALID_PLUGIN,
    );
  }
}

export class PluginHookError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Plugin Hook Error',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.PLUGIN_HOOK_ERROR,
      ),
      ErrorCodes.PLUGIN_HOOK_ERROR,
    );
  }
}

export class PluginProcessorError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Plugin Processor Error',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.PLUGIN_PROCESSOR_ERROR,
      ),
      ErrorCodes.PLUGIN_PROCESSOR_ERROR,
    );
  }
}
