export enum ErrorCodes {
  // 应用错误
  DEPRECATED_FEATURE = 'DEPRECATED_FEATURE',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  INVALID_ARGUMENTS = 'INVALID_ARGUMENTS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_OPTION = 'INVALID_OPTION',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NOT_FOUND = 'NOT_FOUND',

  // 预设错误
  PRESET_ERROR = 'PRESET_ERROR',
  INVALID_PRESET = 'INVALID_PRESET',

  // 插件错误
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  INVALID_PLUGIN = 'INVALID_PLUGIN',
  PLUGIN_HOOK_ERROR = 'PLUGIN_HOOK_ERROR',
  PLUGIN_PROCESSOR_ERROR = 'PLUGIN_PROCESSOR_ERROR',

  // 钩子错误
  HOOK_ERROR = 'HOOK_ERROR',
  INVALID_HOOK = 'INVALID_HOOK',

  // 处理器错误
  INVALID_PROCESSOR = 'INVALID_PROCESSOR',
  PROCESSOR_ERROR = 'PROCESSOR_ERROR',
  LOADER_ERROR = 'LOADER_ERROR',
  PARSER_ERROR = 'PARSER_ERROR',
  GENERATOR_ERROR = 'GENERATOR_ERROR',
  OUTPUTER_ERROR = 'OUTPUTER_ERROR',
}
