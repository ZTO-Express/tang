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
