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

// 目标已存在
export class AlreadyExistsError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Already Exists',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.ALREADY_EXISTS,
      ),
      ErrorCodes.ALREADY_EXISTS,
    );
  }
}

// 目标未找到
export class NotFoundError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Not Found',
  ) {
    super(
      TangError.createBody(objectOrError, description, ErrorCodes.NOT_FOUND),
      ErrorCodes.NOT_FOUND,
    );
  }
}

// 命令/方法执行失败
export class ExecuteFailedError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Execute Failed',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.EXECUTE_FAILED,
      ),
      ErrorCodes.EXECUTE_FAILED,
    );
  }
}
