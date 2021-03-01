import * as util from '../../../src/common/utils';

describe('utils/check：check实用方法', () => {
  it('验证 isUrl', () => {
    expect(util.isUrl('http://www.github.com')).toBeTruthy();
    expect(util.isUrl('https://www.github.com')).toBeTruthy();
    expect(util.isUrl('https://www.github.com/xxx')).toBeTruthy();
    expect(util.isUrl('https://www.github.com/xxx/y.json')).toBeTruthy();
    expect(util.isUrl('ftp://www.github.com')).toBeFalsy();
    expect(util.isUrl('/xxx/y.json')).toBeFalsy();
    expect(util.isUrl('xxx/y.json')).toBeFalsy();
    expect(util.isUrl('y.json')).toBeFalsy();
  });

  it('验证 isAbsolutePath', () => {
    expect(util.isAbsolutePath('/xxx/y.json')).toBeTruthy();
    expect(util.isAbsolutePath('c://xxxx/y.json')).toBeTruthy();
    expect(util.isAbsolutePath('c:/xxxx/y.json')).toBeTruthy();
    expect(util.isAbsolutePath('http://www.github.com')).toBeFalsy();
    expect(util.isAbsolutePath('xxx/y.json')).toBeFalsy();
    expect(util.isAbsolutePath('./xxx/y.json')).toBeFalsy();
    expect(util.isAbsolutePath('../xxx/y.json')).toBeFalsy();
  });

  it('验证 isRelativePath', () => {
    expect(util.isRelativePath('/xxx/y.json')).toBeFalsy();
    expect(util.isRelativePath('c://xxxx/y.json')).toBeFalsy();
    expect(util.isRelativePath('c:/xxxx/y.json')).toBeFalsy();
    expect(util.isRelativePath('http://www.github.com')).toBeFalsy();
    expect(util.isRelativePath('xxx/y.json')).toBeFalsy();
    expect(util.isRelativePath('./xxx/y.json')).toBeTruthy();
    expect(util.isRelativePath('../xxx/y.json')).toBeTruthy();
  });

  it('验证isObject', () => {
    expect(util.isObject({})).toBeTruthy();

    expect(util.isObject(null)).toBeFalsy();
    expect(util.isObject(undefined)).toBeFalsy();
    expect(util.isObject(1234)).toBeFalsy();
    expect(util.isObject(new Date())).toBeFalsy();
    expect(util.isObject(new RegExp(''))).toBeFalsy();
    expect(util.isObject(new Function())).toBeFalsy();
  });

  it('验证 null undefined', () => {
    expect(util.isNull(null)).toBeTruthy();
    expect(util.isNull({})).toBeFalsy();
    expect(util.isNull(undefined)).toBeFalsy();
    expect(util.isNull(0)).toBeFalsy();
    expect(util.isNull('')).toBeFalsy();
    expect(util.isNull(NaN)).toBeFalsy();

    expect(util.isUndefined(null)).toBeFalsy();
    expect(util.isUndefined({})).toBeFalsy();
    expect(util.isUndefined(undefined)).toBeTruthy();
    expect(util.isUndefined(0)).toBeFalsy();
    expect(util.isUndefined('')).toBeFalsy();
    expect(util.isNull(NaN)).toBeFalsy();

    expect(util.isNullOrUndefined(null)).toBeTruthy();
    expect(util.isNullOrUndefined({})).toBeFalsy();
    expect(util.isNullOrUndefined(undefined)).toBeTruthy();
    expect(util.isNullOrUndefined(0)).toBeFalsy();
    expect(util.isNullOrUndefined('')).toBeFalsy();
    expect(util.isNull(NaN)).toBeFalsy();
  });

  it('验证isPlainObject', () => {
    expect(util.isPlainObject({})).toBeTruthy();
    expect(util.isPlainObject(new Object())).toBeTruthy();

    expect(util.isPlainObject(undefined)).toBeFalsy();
    expect(util.isPlainObject(null)).toBeFalsy();
    expect(util.isPlainObject(new Date())).toBeFalsy();
    expect(util.isPlainObject(new RegExp(''))).toBeFalsy();
    expect(util.isPlainObject(new Error())).toBeFalsy();
    expect(util.isPlainObject(new Function())).toBeFalsy();
  });

  it('验证isPlainObject2', () => {
    class ExObj extends Object {}

    const exObj2: any = new ExObj();
    exObj2.constructor = { prototype: undefined };
    expect(util.isPlainObject(exObj2)).toBeFalsy();

    const exObj = new ExObj();
    expect(util.isPlainObject(exObj)).toBeFalsy();
    exObj.constructor = undefined;
    expect(util.isPlainObject(exObj)).toBeTruthy();

    class ExError extends Error {
      exProp: '';
    }
    const exError = new ExError();
    expect(util.isPlainObject(exError)).toBeFalsy();
  });
});
