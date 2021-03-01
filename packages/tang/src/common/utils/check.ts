/**
 * 验证相关实用方法
 */

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
export function isObject(o: unknown) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

// 目标是否为null
export function isNull(o: unknown) {
  return !o && Object.prototype.toString.call(o) === '[object Null]';
}

// 目标是否为undefined
export function isUndefined(o: unknown) {
  return typeof o === 'undefined';
}

// 目标为null or undefined
export function isNullOrUndefined(o: unknown) {
  return isNull(o) || isUndefined(o);
}

// 目标是否普通对象
export function isPlainObject(o: unknown) {
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
}
