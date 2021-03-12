import { ErrorCodes } from '../enums';
import { TangError } from './tang.error';

/**
 * 钩子错误
 */

export class HookError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Hook Error',
  ) {
    super(
      TangError.createBody(objectOrError, description, ErrorCodes.HOOK_ERROR),
      ErrorCodes.HOOK_ERROR,
    );
  }
}

export class InvalidHookError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Invalid Hook',
  ) {
    super(
      TangError.createBody(objectOrError, description, ErrorCodes.INVALID_HOOK),
      ErrorCodes.INVALID_HOOK,
    );
  }
}
