import { ErrorCodes } from '../enums';
import { TangError } from './tang.error';

/**
 * 应用错误
 */

// 作废功能
export class DeprecatedError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Deprecated Error',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.DEPRECATED_FEATURE,
      ),
      ErrorCodes.DEPRECATED_FEATURE,
    );
  }
}

// 作废功能
export class InvalidArguments extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Invalid Arguments',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.INVALID_ARGUMENTS,
      ),
      ErrorCodes.INVALID_ARGUMENTS,
    );
  }
}

// 功能未实现提示
export class NotImplementedError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Not Implemented',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.NOT_IMPLEMENTED,
      ),
      ErrorCodes.NOT_IMPLEMENTED,
    );
  }
}
