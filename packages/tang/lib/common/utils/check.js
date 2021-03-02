"use strict";
/**
 * 验证相关实用方法
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlainObject = exports.isNullOrUndefined = exports.isUndefined = exports.isNull = exports.isObject = exports.isRelativePath = exports.isAbsolutePath = exports.isUrl = void 0;
// 正则表达式
const regexs = Object.freeze({
    absolutePath: /^(?:\/|(?:[A-Za-z]:)?[\\|/])/,
    relativePath: /^\.?\.\//,
    url: /^((http|https):\/\/){1}(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[/\?\:]?.*$/,
});
/**
 * 判断目标字符串是否url
 * @param str 目标字符串
 */
function isUrl(str) {
    return regexs.url.test(str);
}
exports.isUrl = isUrl;
/**
 * 是否绝对路径
 * @param path 路径字符串
 */
function isAbsolutePath(path) {
    return regexs.absolutePath.test(path);
}
exports.isAbsolutePath = isAbsolutePath;
/**
 * 是否相对路径
 * @param path 路径字符串
 */
function isRelativePath(path) {
    return regexs.relativePath.test(path);
}
exports.isRelativePath = isRelativePath;
// 目标是否对象
function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
}
exports.isObject = isObject;
// 目标是否为null
function isNull(o) {
    return !o && Object.prototype.toString.call(o) === '[object Null]';
}
exports.isNull = isNull;
// 目标是否为undefined
function isUndefined(o) {
    return typeof o === 'undefined';
}
exports.isUndefined = isUndefined;
// 目标为null or undefined
function isNullOrUndefined(o) {
    return isNull(o) || isUndefined(o);
}
exports.isNullOrUndefined = isNullOrUndefined;
// 目标是否普通对象
function isPlainObject(o) {
    if (isObject(o) === false)
        return false;
    // If has modified constructor
    const ctor = o.constructor;
    if (ctor === undefined)
        return true;
    // If has modified prototype
    const prot = ctor.prototype;
    if (isObject(prot) === false)
        return false;
    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
    }
    // Most likely a plain Object
    return true;
}
exports.isPlainObject = isPlainObject;
