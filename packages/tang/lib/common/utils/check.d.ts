/**
 * 验证相关实用方法
 */
/**
 * 判断目标字符串是否url
 * @param str 目标字符串
 */
export declare function isUrl(str: string): boolean;
/**
 * 是否绝对路径
 * @param path 路径字符串
 */
export declare function isAbsolutePath(path: string): boolean;
/**
 * 是否相对路径
 * @param path 路径字符串
 */
export declare function isRelativePath(path: string): boolean;
export declare function isObject(o: unknown): boolean;
export declare function isNull(o: unknown): boolean;
export declare function isUndefined(o: unknown): boolean;
export declare function isNullOrUndefined(o: unknown): boolean;
export declare function isPlainObject(o: unknown): boolean;
