/**
 * 验证相关实用方法
 */
import { getTag } from './internal';

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
export function isUrl(str: string) {
  return regexs.url.test(str);
}

/** 判断是否为路径 */
export function isPath(path: string) {
  return isAbsolutePath(path) || isRelativePath(path);
}

/**
 * 是否绝对路径
 * @param path 路径字符串
 */
export function isAbsolutePath(path: string) {
  return regexs.absolutePath.test(path);
}

/**
 * 是否相对路径
 * @param path 路径字符串
 */
export function isRelativePath(path: string) {
  return regexs.relativePath.test(path);
}

// 目标是否对象
export const isObject = (fn: any): fn is object =>
  !isNil(fn) && typeof fn === 'object';

// 目标是否为null
export const isNull = (o: any) => getTag(o) === '[object Null]';

// 目标是否为undefined
export const isUndefined = (o: any) => getTag(o) === '[object Undefined]';

// 目标为null or undefined
export const isNil = (o: any) => isNull(o) || isUndefined(o);

// 是否为function
export const isFunction = (o: any) => typeof o === 'function';

// 是否为Promise对象
export const isPromise = (o: any) => isObject(o) && isFunction((o as any).then);

// 是否String
export const isString = (o: any): o is string => typeof o === 'string';

// 是否Symbol
export const isSymbol = (o: any): o is symbol => typeof o === 'symbol';

// 目标是否普通对象
export const isPlainObject = (o: any) => {
  if (isObject(o) === false) return false;

  // If has modified constructor
  const ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};
