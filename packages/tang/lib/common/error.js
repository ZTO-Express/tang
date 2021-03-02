"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errDeprecation = exports.errNotImplemented = exports.errInvalidArguments = exports.throwError = exports.Errors = void 0;
// 错误代码
var Errors;
(function (Errors) {
    Errors["DEPRECATED_FEATURE"] = "DEPRECATED_FEATURE";
    Errors["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    Errors["ALREADY_CLOSED"] = "ALREADY_CLOSED";
    Errors["BAD_LOADER"] = "BAD_LOADER";
    Errors["BAD_PARSER"] = "BAD_PARSER";
    Errors["BAD_GENERATOR"] = "BAD_GENERATOR";
    Errors["BAD_OUTPUTER"] = "BAD_OUTPUTER";
    Errors["INVALID_ARGUMENTS"] = "INVALID_ARGUMENTS";
    Errors["INVALID_HOOK"] = "INVALID_HOOK";
    Errors["HOOK_ERROR"] = "HOOK_ERROR";
    Errors["CANNOT_EMIT_FROM_OPTIONS_HOOK"] = "CANNOT_EMIT_FROM_OPTIONS_HOOK";
    Errors["EXTERNAL_SYNTHETIC_EXPORTS"] = "EXTERNAL_SYNTHETIC_EXPORTS";
    Errors["FILE_NAME_CONFLICT"] = "FILE_NAME_CONFLICT";
    Errors["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    Errors["INPUT_HOOK_IN_OUTPUT_PLUGIN"] = "INPUT_HOOK_IN_OUTPUT_PLUGIN";
    Errors["INVALID_OPTION"] = "INVALID_OPTION";
    Errors["INVALID_PLUGIN_HOOK"] = "INVALID_PLUGIN_HOOK";
    Errors["PLUGIN_ERROR"] = "PLUGIN_ERROR";
    Errors["UNEXPECTED_NAMED_IMPORT"] = "UNEXPECTED_NAMED_IMPORT";
    Errors["VALIDATION_ERROR"] = "VALIDATION_ERROR";
})(Errors = exports.Errors || (exports.Errors = {}));
// 抛出错误
function throwError(base) {
    let baseErr;
    if (typeof base === 'string') {
        baseErr = { message: base };
    }
    else {
        baseErr = base;
    }
    if (!(base instanceof Error))
        base = Object.assign(new Error(baseErr.message), base);
    throw base;
}
exports.throwError = throwError;
// 无效参数
function errInvalidArguments(errorData) {
    return Object.assign({ code: Errors.INVALID_ARGUMENTS }, (typeof errorData === 'string' ? { message: errorData } : errorData));
}
exports.errInvalidArguments = errInvalidArguments;
// 功能未实现提示
function errNotImplemented(errorData) {
    return Object.assign({ code: Errors.NOT_IMPLEMENTED }, (typeof errorData === 'string' ? { message: errorData } : errorData));
}
exports.errNotImplemented = errNotImplemented;
// 废弃功能异常
function errDeprecation(errorData) {
    return Object.assign({ code: Errors.DEPRECATED_FEATURE }, (typeof errorData === 'string' ? { message: errorData } : errorData));
}
exports.errDeprecation = errDeprecation;
