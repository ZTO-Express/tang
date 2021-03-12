export interface DeepmergeOptions {
  arrayMerge?(target: any[], source: any[], options?: DeepmergeOptions): any[];
  clone?: boolean;
  customMerge?: (
    key: string,
    options?: DeepmergeOptions,
  ) => ((x: any, y: any) => any) | undefined;
  isMergeableObject?(value: object): boolean;
  cloneUnlessOtherwiseSpecified?: (
    value: any,
    options?: DeepmergeOptions,
  ) => any;
}

/** 默认是否可合并对象 */
const defaultIsMergeableObject = (value: unknown) => {
  const tag = Object.prototype.toString.call(value);
  return (
    !!value &&
    typeof value === 'object' &&
    tag !== '[object RegExp]' &&
    tag !== '[object Date]'
  );
};

function emptyTarget(val: unknown) {
  return Array.isArray(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value: any, options?: DeepmergeOptions) {
  return options.clone !== false && options.isMergeableObject(value)
    ? deepmerge(emptyTarget(value), value, options)
    : value;
}

function defaultArrayMerge(
  target: any[],
  source: any[],
  options?: DeepmergeOptions,
) {
  return target.concat(source).map(function (element) {
    return cloneUnlessOtherwiseSpecified(element, options);
  });
}

function getMergeFunction(key: string, options: any) {
  if (!options.customMerge) {
    return deepmerge;
  }
  const customMerge = options.customMerge(key);
  return typeof customMerge === 'function' ? customMerge : deepmerge;
}

function getEnumerableOwnPropertySymbols(target: object): any[] {
  return Object.getOwnPropertySymbols
    ? Object.getOwnPropertySymbols(target).filter(function (symbol) {
        return target.propertyIsEnumerable(symbol);
      })
    : [];
}

function getKeys(target: object) {
  return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
}

function propertyIsOnObject(object: object, property: string) {
  try {
    return property in object;
  } catch (_) {
    return false;
  }
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target: any, key: string) {
  return (
    propertyIsOnObject(target, key) && // Properties are safe to merge if they don't exist in the target yet,
    !(
      Object.hasOwnProperty.call(target, key) && // unsafe if they exist up the prototype chain,
      Object.propertyIsEnumerable.call(target, key)
    )
  ); // and also unsafe if they're nonenumerable.
}

function mergeObject(target: any, source: any, options: any) {
  const destination: any = {};
  if (options.isMergeableObject(target)) {
    getKeys(target).forEach(function (key) {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    });
  }
  getKeys(source).forEach(function (key) {
    if (propertyIsUnsafe(target, key)) {
      return;
    }

    if (
      propertyIsOnObject(target, key) &&
      options.isMergeableObject(source[key])
    ) {
      destination[key] = getMergeFunction(key, options)(
        target[key],
        source[key],
        options,
      );
    } else {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    }
  });
  return destination;
}

export function deepmerge<T1, T2>(
  x: Partial<T1>,
  y: Partial<T2>,
  options?: DeepmergeOptions,
): T1 & T2;
export function deepmerge<T>(
  target: Partial<T>,
  source: Partial<T>,
  options?: DeepmergeOptions,
): T {
  options = options || {};
  options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  options.isMergeableObject =
    options.isMergeableObject || defaultIsMergeableObject;
  // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
  // implementations can use it. The caller may not replace it.
  options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

  const sourceIsArray = Array.isArray(source);
  const targetIsArray = Array.isArray(target);
  const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, options);
  } else if (sourceIsArray) {
    return options.arrayMerge(target as any, source as any, options) as any;
  } else {
    return mergeObject(target, source, options);
  }
}

export function deepmergeAll(
  objects: object[],
  options?: DeepmergeOptions,
): object;
export function deepmergeAll<T>(
  array: Partial<T>[],
  options: DeepmergeOptions,
) {
  if (!Array.isArray(array)) {
    throw new Error('first argument should be an array');
  }

  return array.reduce(function (prev, next) {
    return deepmerge(prev, next, options);
  }, {});
}
