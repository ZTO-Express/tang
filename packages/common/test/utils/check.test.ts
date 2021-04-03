import * as util from '../../src/utils';

describe('utils/check：check实用方法', () => {
  it('验证 isUrl', () => {
    expect(util.isUrl('http://www.github.com')).toBe(true);
    expect(util.isUrl('https://www.github.com')).toBe(true);
    expect(util.isUrl('https://www.github.com/xxx')).toBe(true);
    expect(util.isUrl('https://www.github.com/xxx/y.json')).toBe(true);
    expect(util.isUrl('ftp://www.github.com')).toBe(false);
    expect(util.isUrl('/xxx/y.json')).toBe(false);
    expect(util.isUrl('xxx/y.json')).toBe(false);
    expect(util.isUrl('y.json')).toBe(false);
  });

  it('验证 isAbsolutePath', () => {
    expect(util.isAbsolutePath('/xxx/y.json')).toBe(true);
    expect(util.isAbsolutePath('c://xxxx/y.json')).toBe(true);
    expect(util.isAbsolutePath('c:/xxxx/y.json')).toBe(true);
    expect(util.isAbsolutePath('http://www.github.com')).toBe(false);
    expect(util.isAbsolutePath('xxx/y.json')).toBe(false);
    expect(util.isAbsolutePath('./xxx/y.json')).toBe(false);
    expect(util.isAbsolutePath('../xxx/y.json')).toBe(false);
  });

  it('验证 isRelativePath', () => {
    expect(util.isRelativePath('/xxx/y.json')).toBe(false);
    expect(util.isRelativePath('c://xxxx/y.json')).toBe(false);
    expect(util.isRelativePath('c:/xxxx/y.json')).toBe(false);
    expect(util.isRelativePath('http://www.github.com')).toBe(false);
    expect(util.isRelativePath('xxx/y.json')).toBe(false);
    expect(util.isRelativePath('./xxx/y.json')).toBe(true);
    expect(util.isRelativePath('../xxx/y.json')).toBe(true);
  });

  it('验证 isPath', () => {
    expect(util.isPath('/xxx/y.json')).toBe(true);
    expect(util.isPath('c://xxxx/y.json')).toBe(true);
    expect(util.isPath('c:/xxxx/y.json')).toBe(true);
    expect(util.isPath('http://www.github.com')).toBe(false);
    expect(util.isPath('xxx/y.json')).toBe(false);
    expect(util.isPath('./xxx/y.json')).toBe(true);
    expect(util.isPath('../xxx/y.json')).toBe(true);
  });

  it('验证isObject', () => {
    expect(util.isObject({})).toBe(true);

    expect(util.isObject(null)).toBe(false);
    expect(util.isObject(undefined)).toBe(false);
    expect(util.isObject(1234)).toBe(false);
    expect(util.isObject(new Date())).toBe(true);
    expect(util.isObject(new RegExp(''))).toBe(true);
    expect(util.isObject(new Function())).toBe(false);
  });

  it('验证 null undefined', () => {
    expect(util.isNull(null)).toBe(true);
    expect(util.isNull({})).toBe(false);
    expect(util.isNull(undefined)).toBe(false);
    expect(util.isNull(0)).toBe(false);
    expect(util.isNull('')).toBe(false);
    expect(util.isNull(NaN)).toBe(false);

    expect(util.isUndefined(null)).toBe(false);
    expect(util.isUndefined({})).toBe(false);
    expect(util.isUndefined(undefined)).toBe(true);
    expect(util.isUndefined(0)).toBe(false);
    expect(util.isUndefined('')).toBe(false);
    expect(util.isNull(NaN)).toBe(false);

    expect(util.isNil(null)).toBe(true);
    expect(util.isNil({})).toBe(false);
    expect(util.isNil(undefined)).toBe(true);
    expect(util.isNil(0)).toBe(false);
    expect(util.isNil('')).toBe(false);
    expect(util.isNull(NaN)).toBe(false);
  });

  it('isEmptyArray', () => {
    expect(util.isEmptyArray([])).toBe(true);
    expect(util.isEmptyArray(null)).toBe(false);
    expect(util.isEmptyArray(new Date())).toBe(false);
  });

  it('isEmptyObject', () => {
    expect(util.isEmptyObject({})).toBe(true);
    expect(util.isEmptyObject([])).toBe(false);
    expect(util.isEmptyObject({ a: 1 })).toBe(false);
    expect(util.isEmptyObject(null)).toBe(false);
    expect(util.isEmptyObject(new Date())).toBe(false);
  });

  it('isEmpty', () => {
    expect(util.isEmpty(undefined)).toBe(true);
    expect(util.isEmpty(null)).toBe(true);

    expect(util.isEmpty('')).toBe(true);
    expect(util.isEmpty('', { blank: false })).toBe(false);

    expect(util.isEmpty('  ')).toBe(false);
    expect(util.isEmpty('  ', { trimBlank: true })).toBe(true);

    expect(util.isEmpty(0)).toBe(false);
    expect(util.isEmpty(0, { zero: true })).toBe(true);

    expect(util.isEmpty('0')).toBe(false);
    expect(util.isEmpty('0', { zeroStr: true })).toBe(true);

    expect(util.isEmpty([])).toBe(false);
    expect(util.isEmpty([], { emptyArray: true })).toBe(true);

    expect(util.isEmpty({})).toBe(false);
    expect(util.isEmpty({}, { emptyObject: true })).toBe(true);
    expect(util.isEmpty(new Date(), { emptyObject: true })).toBe(false);
  });

  it('验证isPlainObject', () => {
    expect(util.isPlainObject({})).toBe(true);
    expect(util.isPlainObject(new Object())).toBe(true);

    expect(util.isPlainObject(undefined)).toBe(false);
    expect(util.isPlainObject(null)).toBe(false);
    expect(util.isPlainObject(new Date())).toBe(false);
    expect(util.isPlainObject(new RegExp(''))).toBe(false);
    expect(util.isPlainObject(new Error())).toBe(false);
    expect(util.isPlainObject(new Function())).toBe(false);
  });
  it('验证isString', () => {
    expect(util.isFunction({})).toBe(false);
    expect(util.isFunction(null)).toBe(false);
    expect(util.isFunction(undefined)).toBe(false);
    expect(util.isFunction(1234)).toBe(false);
    expect(util.isFunction(new Date())).toBe(false);
    expect(util.isFunction(new RegExp(''))).toBe(false);
    expect(util.isFunction(new Function())).toBe(true);
  });

  it('验证isString', () => {
    expect(util.isString('')).toBe(true);
    expect(util.isString({})).toBe(false);
    expect(util.isString(null)).toBe(false);
    expect(util.isString(undefined)).toBe(false);
    expect(util.isString(1234)).toBe(false);
    expect(util.isString(new Date())).toBe(false);
    expect(util.isString(new RegExp(''))).toBe(false);
    expect(util.isString(new Function())).toBe(false);
  });

  it('验证isSymbol', () => {
    expect(util.isSymbol(Symbol('xx'))).toBe(true);
    expect(util.isSymbol('')).toBe(false);
    expect(util.isSymbol({})).toBe(false);
    expect(util.isSymbol(null)).toBe(false);
    expect(util.isSymbol(undefined)).toBe(false);
    expect(util.isSymbol(1234)).toBe(false);
    expect(util.isSymbol(new Date())).toBe(false);
    expect(util.isSymbol(new RegExp(''))).toBe(false);
    expect(util.isSymbol(new Function())).toBe(false);
  });

  it('isPromise', () => {
    expect(util.isPromise(Promise.resolve())).toBe(true);
    expect(util.isPromise({ then: util.noop })).toBe(true);
    expect(util.isPromise(null)).toBe(false);
  });

  it('验证isPlainObject2', () => {
    class ExObj extends Object {}

    const exObj2: any = new ExObj();
    exObj2.constructor = { prototype: undefined };
    expect(util.isPlainObject(exObj2)).toBe(false);

    const exObj = new ExObj();
    expect(util.isPlainObject(exObj)).toBe(false);
    exObj.constructor = undefined;
    expect(util.isPlainObject(exObj)).toBe(true);

    class ExError extends Error {
      exProp: '';
    }
    const exError = new ExError();
    expect(util.isPlainObject(exError)).toBe(false);
  });
});
