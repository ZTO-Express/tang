/** 内部方法，只向内部暴露 */
import { memoize } from './memoize';

const charCodeOfDot = '.'.charCodeAt(0);

export const MAX_MEMOIZE_SIZE = 500;
export const MAX_SAFE_INTEGER = 9007199254740991;

/** Used as references for various `Number` constants. */
export const INFINITY = 1 / 0;

const regexs = Object.freeze({
  reIsUint: /^(?:0|[1-9]\d*)$/,
  reEscapeChar: /\\(\\)?/g,
  rePropName: RegExp(
    // Match anything that isn't a dot or bracket.
    '[^.[\\]]+' +
      '|' +
      // Or match property names within brackets.
      '\\[(?:' +
      // Match a non-string expression.
      '([^"\'][^[]*)' +
      '|' +
      // Or match strings (supports escaping characters).
      '(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2' +
      ')\\]' +
      '|' +
      // Or match "" as the space between consecutive dots or empty brackets.
      '(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))',
    'g',
  ),
  reIsDeepProp: /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
  reIsPlainProp: /^\w*$/,
});

/** 获取对象tag */
export function getTag(value: unknown) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
}

/** 检查value是否symbol类型 */
export function isSymbol(value: any) {
  const type = typeof value;
  return (
    type == 'symbol' ||
    (type === 'object' && value != null && getTag(value) == '[object Symbol]')
  );
}
/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
export function isIndex(value: any, length?: number) {
  const type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return (
    !!length &&
    (type === 'number' || (type !== 'symbol' && regexs.reIsUint.test(value))) &&
    value > -1 &&
    value % 1 == 0 &&
    value < length
  );
}

/** 检查目标是否属性名但不是属性路径 */
export function isKey(value: unknown, object?: unknown) {
  if (Array.isArray(value)) {
    return false;
  }
  const type = typeof value;
  if (
    type === 'number' ||
    type === 'boolean' ||
    value == null ||
    isSymbol(value)
  ) {
    return true;
  }

  const valueStr = value as string;
  return (
    regexs.reIsPlainProp.test(valueStr) ||
    !regexs.reIsDeepProp.test(valueStr) ||
    (object != null && valueStr in Object(object))
  );
}

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
export function toKey(value: any) {
  if (typeof value === 'string' || isSymbol(value)) {
    return value;
  }
  const result = `${value}`;
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

/**
 * A specialized version of `memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
export function memoizeCapped(func: Function) {
  const result = memoize(func, (key: unknown) => {
    const { cache } = result;
    if (cache.size >= MAX_MEMOIZE_SIZE) cache.clear();
    return key;
  });

  return result;
}

/** 字符串转换为路径数组 */
export const stringToPath = memoizeCapped((string: string) => {
  const result = [];
  if (string.charCodeAt(0) === charCodeOfDot) {
    result.push('');
  }
  string.replace(
    regexs.rePropName,
    (match: string, expression: string, quote: string, subString: string) => {
      let key = match;
      if (quote) {
        key = subString.replace(regexs.reEscapeChar, '$1');
      } else if (expression) {
        key = expression.trim();
      }
      result.push(key);

      return '';
    },
  );
  return result;
});

/** 转换路径 */
export function castPath(value: string | string[], object?: unknown) {
  if (Array.isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(value);
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * 采用如下标准判断相等
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 */
export function eq(value: unknown, other: unknown) {
  return value === other || (value !== value && other !== other);
}

/** 基础赋值 */
export function baseAssignValue(object: any, key: string, value: any) {
  if (key == '__proto__') {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      value: value,
      writable: true,
    });
  } else {
    object[key] = value;
  }
}
/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent.
 */
export function assignValue(object: any, key: string, value: any) {
  const objValue = object[key];

  if (!(hasOwnProperty.call(object, key) && eq(objValue, value))) {
    if (value !== 0 || 1 / value === 1 / objValue) {
      baseAssignValue(object, key, value);
    }
  }
  // 这段代码肯定不会走
  //  else if (value === undefined && !(key in object)) {
  //   baseAssignValue(object, key, value);
  // }
}

/** 获取指定路径对象值， 不支持默认值 */
export function baseGet(object: any, path: string | string[]) {
  path = castPath(path, object);

  let index = 0;
  const length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return index && index == length ? object : undefined;
}

export function isObjectOrFunction(value: unknown) {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

/** 设置指定对象路径值 不支持默认值 */
export function baseSet(
  object: unknown,
  path: string | string[],
  value: unknown,
  customizer?: Function,
) {
  if (!isObjectOrFunction(object)) {
    return object;
  }
  path = castPath(path, object);

  const length = path.length;
  const lastIndex = length - 1;

  let index = -1;
  let nested = object as any;

  while (nested != null && ++index < length) {
    const key = toKey(path[index]);
    let newValue = value;

    if (index != lastIndex) {
      const objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObjectOrFunction(objValue)
          ? objValue
          : isIndex(path[index + 1])
          ? []
          : {};
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

/**
 * Gets the parent value at `path` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */
export function parent(object: any, path: string[]) {
  return path.length < 2 ? object : baseGet(object, path.slice(0, -1));
}

/**
 * Gets the last element of `array`.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * last([1, 2, 3])
 * // => 3
 */
export function last(array: any[]) {
  const length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

/**
 * The base implementation of `unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */
export function baseUnset(object: any, path: string | string[]) {
  const paths: string[] = castPath(path, object);
  object = parent(object, paths);
  return object == null || delete object[toKey(last(paths))];
}
