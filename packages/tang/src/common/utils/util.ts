import * as deepmerge from 'deepmerge';
import { baseGet, baseSet } from './internal';
import { isNullOrUndefined, isPlainObject } from './check';

/**
 * 返回数组
 * @param items 为数组返回原值，为空则空数组，否则返回目标为唯一项的数组
 */
export function ensureArray<T>(
  items: (T | null | undefined)[] | T | null | undefined,
): T[] {
  if (Array.isArray(items)) {
    return items.filter(Boolean) as T[];
  }
  if (items || (typeof items === 'number' && items === 0)) {
    return [items];
  }
  return [];
}

/**
 * 查找目标key
 */
export function findBy<T>(items: any[], key: string, val: any): T | undefined {
  if (!items || !items.length) return undefined;

  const result = items.find(item => {
    if (!item) return false;
    return item[key] === val;
  });

  return result;
}

/**
 * 根据目标key进行排序，排序将产生新的数组
 */
export function sortBy<T>(
  items: any[],
  sortKey: string,
  options?: number | { sortOrder?: number; defaultValue?: any },
): T[] {
  if (!items || !items.length) return [];

  let opts: any = { sortOrder: 1, defaultValue: undefined };

  if (typeof options === 'number') {
    opts = { sortOrder: options };
  } else {
    opts = Object.assign(opts, options);
  }

  const sortOrder = opts.sortOrder || 1;
  const defaultValue = opts.defaultValue;

  const _items = [...items];

  _items.sort((a, b) => {
    const a_v = !a || a[sortKey] === undefined ? defaultValue : a[sortKey];
    const b_v = !b || b[sortKey] === undefined ? defaultValue : b[sortKey];

    if (!a_v) return -1 * sortOrder; // 升序时，不存在则默认往后拍，降序相反
    if (!b_v) return 1 * sortOrder; // 同上
    if (a_v === b_v) return 0;
    return (a_v > b_v ? 1 : -1) * sortOrder;
  });

  return _items;
}

/** 深度克隆，并支持循环应用 */
export function deepClone(obj: any, cache: any[] = []) {
  if (null == obj || 'object' != typeof obj) return obj;

  // 处理日期
  if (obj instanceof Date) {
    const dt = new Date();
    dt.setTime(obj.getTime());
    return dt;
  }

  // 如果obj命中，则当前为循环引用
  const hit = cache.find(c => c.original === obj);
  if (hit) return hit.copy;

  const copy: any = Array.isArray(obj) ? [] : {};

  // 将copy放入缓存以备后续检查循环引用
  cache.push({ original: obj, copy });

  Object.keys(obj).forEach(key => {
    copy[key] = deepClone((<any>obj)[key], cache);
  });

  return copy;
}

/**
 * 深度合并，合并后会产生新的对象
 * @param args 被和并的对象
 */
export function deepMerge(...args: any[]) {
  const items = args.filter(it => !isNullOrUndefined(it));
  return deepmerge.all(items, {
    isMergeableObject: isPlainObject,
  });
}

/**
 * 深度合并，合并后会产生新的对象
 * @param args 被和并的对象
 */
export function deepMerge2(args: any[], options?: deepmerge.Options) {
  const items = args.filter(it => !isNullOrUndefined(it));

  const opts = Object.assign(
    {
      isMergeableObject: isPlainObject,
    },
    options,
  );
  return deepmerge.all(items, opts);
}

/** 获取指定路径对象值 */
export function get(
  object: unknown,
  path: string | string[],
  defaultValue?: unknown,
) {
  const result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

/** 设置指定对象路径值 */
export function set(object: unknown, path: string | string[], value: unknown) {
  return object == null ? object : baseSet(object, path, value);
}
