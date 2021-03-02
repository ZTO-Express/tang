import * as deepmerge from 'deepmerge';
/**
 * 首字母大写
 * @param str 目标字符串
 */
export declare function capitalizeFirst(str: string): string;
/**
 * 返回数组
 * @param items 为数组返回原值，为空则空数组，否则返回目标为唯一项的数组
 */
export declare function ensureArray<T>(items: (T | null | undefined)[] | T | null | undefined): T[];
/**
 * 查找目标key
 */
export declare function findBy<T>(items: any[], key: string, val: any): T | undefined;
/**
 * 根据目标key进行排序，排序将产生新的数组
 */
export declare function sortBy<T>(items: any[], sortKey: string, options?: number | {
    sortOrder?: number;
    defaultValue?: any;
}): T[];
/** 深度克隆，并支持循环应用 */
export declare function deepClone(obj: any, cache?: any[]): any;
/**
 * 深度合并，合并后会产生新的对象
 * @param args 被和并的对象
 */
export declare function deepMerge(...args: any[]): object;
/**
 * 深度合并，合并后会产生新的对象
 * @param args 被和并的对象
 */
export declare function deepMerge2(args: any[], options?: deepmerge.Options): object;
