import { ErrorCodes } from '../enums';
import { TangError } from './tang.error';

/**
 * 插件错误
 */

export class PresetError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Preset Error',
  ) {
    super(
      TangError.createBody(objectOrError, description, ErrorCodes.PRESET_ERROR),
      ErrorCodes.PRESET_ERROR,
    );
  }
}

export class InvalidPresetError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Invalid Preset',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.INVALID_PRESET,
      ),
      ErrorCodes.INVALID_PRESET,
    );
  }
}
