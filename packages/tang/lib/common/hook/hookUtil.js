"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwHookError = exports.throwInvalidHookError = void 0;
const error_1 = require("../error");
function throwInvalidHookError(hookName, hook) {
    return error_1.throwError({
        code: error_1.Errors.INVALID_HOOK,
        message: `hook ${hookName}: 无效钩子函数`,
        hook: hook ? hook.name : undefined,
        plugin: hook ? hook.pluginName : undefined,
    });
}
exports.throwInvalidHookError = throwInvalidHookError;
function throwHookError(err, hookName) {
    if (typeof err === 'string')
        err = { message: err };
    err.code = error_1.Errors.HOOK_ERROR;
    if (hookName)
        err.hook = hookName;
    err.message = `钩子执行错误：${err.message}`;
    return error_1.throwError(err);
}
exports.throwHookError = throwHookError;
