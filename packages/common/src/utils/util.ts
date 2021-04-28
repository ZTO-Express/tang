import { GenericFunction } from '../declarations';
import { deepmergeAll, DeepmergeOptions } from './internal/deepmerge';
import { baseGet, baseSet, baseUnset, last } from './internal';
import { isEmpty, isNil, isObject, isPlainObject } from './check';

/** 返回数组最后一个元素 */
export const arryLast = last;

/** 无操作 */
export const noop = () => {
  /** noop */
};

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

    if (a_v === b_v) return 0;
    if (!a_v) return -1 * sortOrder; // 升序时，不存在则默认往后拍，降序相反
    if (!b_v) return 1 * sortOrder; // 同上
    return (a_v > b_v ? 1 : -1) * sortOrder;
  });

  return _items;
}

/**
 * 浅度比较对象是否相等
 * @param obj1
 * @param obj2
 * @returns
 */
export function equal(obj1: any, obj2: any) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * 深度比较两个对象是否相等
 * @param obj1
 * @param obj2
 * @returns
 */
export function deepEqual(obj1: any, obj2: any) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !deepEqual(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
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
  const items = args.filter(it => !isNil(it));
  return deepmergeAll(items, {
    isMergeableObject: isPlainObject,
  });
}

/**
 * 深度合并，合并后会产生新的对象
 * @param args 被和并的对象
 */
export function deepMerge2(args: any[], options?: DeepmergeOptions) {
  const items = args.filter(it => !isNil(it));

  const opts = Object.assign(
    {
      isMergeableObject: isPlainObject,
    },
    options,
  );
  return deepmergeAll(items, opts);
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
export function set(
  object: unknown,
  path: string | string[],
  value: unknown,
  customizer?: Function,
) {
  customizer = typeof customizer === 'function' ? customizer : undefined;
  return object == null ? object : baseSet(object, path, value, customizer);
}

/** 移除对象指定路径值 */
export function unset(object: unknown, path: string | string[]) {
  return object == null ? true : baseUnset(object, path);
}

export type OmitFilterFn = (val: any, key: string, object: unknown) => boolean;

/**
 * @param object 需要移除属性的对象
 * @param props 需要移除的属性
 * @param filter 过滤方法，返回true则保留，否则排除
 */
export function omit(
  object: unknown,
  props?: string | string[] | OmitFilterFn,
  filter?: OmitFilterFn,
): any {
  if (typeof props === 'string') {
    props = [props];
  } else if (typeof props === 'function') {
    filter = props;
    props = [];
  }

  if (!isObject(object)) return {};

  const isFunction = typeof filter === 'function';
  const keys = Object.keys(object);
  const res: any = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = (object as any)[key];

    if (
      !props ||
      (props.indexOf(key) === -1 && (!isFunction || filter(val, key, object)))
    ) {
      res[key] = val;
    }
  }
  return res;
}

/**
 * 过滤对象所有为Nil的属性
 * @param object 需要移除属性的对象
 */
export function omitNil(object: unknown) {
  return omit(object, val => !isNil(val));
}

/**
 * 过滤对象所有为Empty的属性
 * @param object 需要移除属性的对象
 */
export function omitEmpty(object: unknown) {
  return omit(object, val => !isEmpty(val));
}

/**
 * 简单的从目标中选取指定选项生成新的对象
 * @param source
 * @param keys
 * @returns
 */
export function pick(source: any, ...keys: string[]) {
  return keys.reduce((result: { [key: string]: any }, key) => {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }

    return result;
  }, {});
}

/**
 * 延时时间
 * @param seconds
 * @returns
 */
export async function delay<T>(fn: GenericFunction, seconds = 1): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Promise.resolve()
        .then(() => {
          return fn.call(undefined);
        })
        .then(result => {
          resolve(result as T);
        })
        .catch(err => {
          reject(err);
        });
    }, seconds);
  });
}
