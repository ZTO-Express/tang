"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.stderr = void 0;
// 输出标准错误
exports.stderr = console.error.bind(console);
// 处理常用错误方法
function handleError(err) {
    let description = err.message || err;
    if (err.name)
        description = `${err.name}: ${description}`;
    const message = err.plugin
        ? `(plugin ${err.plugin}) ${description}`
        : description;
    exports.stderr(`[!] ${message.toString()}`);
    if (err.url)
        exports.stderr(err.url);
    if (err.stack)
        exports.stderr(err.stack);
    exports.stderr('');
}
exports.handleError = handleError;
