export declare enum Errors {
    DEPRECATED_FEATURE = "DEPRECATED_FEATURE",
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
    ALREADY_CLOSED = "ALREADY_CLOSED",
    BAD_LOADER = "BAD_LOADER",
    BAD_PARSER = "BAD_PARSER",
    BAD_GENERATOR = "BAD_GENERATOR",
    BAD_OUTPUTER = "BAD_OUTPUTER",
    INVALID_ARGUMENTS = "INVALID_ARGUMENTS",
    INVALID_HOOK = "INVALID_HOOK",
    HOOK_ERROR = "HOOK_ERROR",
    CANNOT_EMIT_FROM_OPTIONS_HOOK = "CANNOT_EMIT_FROM_OPTIONS_HOOK",
    EXTERNAL_SYNTHETIC_EXPORTS = "EXTERNAL_SYNTHETIC_EXPORTS",
    FILE_NAME_CONFLICT = "FILE_NAME_CONFLICT",
    FILE_NOT_FOUND = "FILE_NOT_FOUND",
    INPUT_HOOK_IN_OUTPUT_PLUGIN = "INPUT_HOOK_IN_OUTPUT_PLUGIN",
    INVALID_OPTION = "INVALID_OPTION",
    INVALID_PLUGIN_HOOK = "INVALID_PLUGIN_HOOK",
    PLUGIN_ERROR = "PLUGIN_ERROR",
    UNEXPECTED_NAMED_IMPORT = "UNEXPECTED_NAMED_IMPORT",
    VALIDATION_ERROR = "VALIDATION_ERROR"
}
export declare function throwError(base: string | Error | TangError): never;
export declare function errInvalidArguments(errorData: string | TangWarning): {
    chunkName?: string;
    cycle?: string[];
    guess?: string;
    message: string;
    code: string;
    name?: string;
    hook?: string;
    plugin?: string;
    url?: string;
};
export declare function errNotImplemented(errorData: string | TangWarning): {
    chunkName?: string;
    cycle?: string[];
    guess?: string;
    message: string;
    code: string;
    name?: string;
    hook?: string;
    plugin?: string;
    url?: string;
};
export declare function errDeprecation(errorData: string | TangWarning): {
    chunkName?: string;
    cycle?: string[];
    guess?: string;
    message: string;
    code: string;
    name?: string;
    hook?: string;
    plugin?: string;
    url?: string;
};
