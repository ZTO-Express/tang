// 错误代码
export enum Errors {
  DEPRECATED_FEATURE = 'DEPRECATED_FEATURE',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  ALREADY_CLOSED = 'ALREADY_CLOSED',
  BAD_LOADER = 'BAD_LOADER',
  BAD_PARSER = 'BAD_PARSER',
  BAD_GENERATOR = 'BAD_GENERATOR',
  BAD_OUTPUTER = 'BAD_OUTPUTER',
  INVALID_ARGUMENTS = 'INVALID_ARGUMENTS',
  INVALID_HOOK = 'INVALID_HOOK',
  HOOK_ERROR = 'HOOK_ERROR',
  CANNOT_EMIT_FROM_OPTIONS_HOOK = 'CANNOT_EMIT_FROM_OPTIONS_HOOK',
  EXTERNAL_SYNTHETIC_EXPORTS = 'EXTERNAL_SYNTHETIC_EXPORTS',
  FILE_NAME_CONFLICT = 'FILE_NAME_CONFLICT',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INPUT_HOOK_IN_OUTPUT_PLUGIN = 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
  INVALID_OPTION = 'INVALID_OPTION',
  INVALID_PLUGIN_HOOK = 'INVALID_PLUGIN_HOOK',
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  UNEXPECTED_NAMED_IMPORT = 'UNEXPECTED_NAMED_IMPORT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// 抛出错误
export function throwError(base: string | Error | TangError): never {
  let baseErr: any;

  if (typeof base === 'string') {
    baseErr = { message: base };
  } else {
    baseErr = base;
  }

  if (!(base instanceof Error))
    base = Object.assign(new Error(baseErr.message), base);

  throw base;
}

// 无效参数
export function errInvalidArguments(errorData: string | TangWarning) {
  return {
    code: Errors.INVALID_ARGUMENTS,
    ...(typeof errorData === 'string' ? { message: errorData } : errorData),
  };
}

// 功能未实现提示
export function errNotImplemented(errorData: string | TangWarning) {
  return {
    code: Errors.NOT_IMPLEMENTED,
    ...(typeof errorData === 'string' ? { message: errorData } : errorData),
  };
}

// 废弃功能异常
export function errDeprecation(errorData: string | TangWarning) {
  return {
    code: Errors.DEPRECATED_FEATURE,
    ...(typeof errorData === 'string' ? { message: errorData } : errorData),
  };
}
