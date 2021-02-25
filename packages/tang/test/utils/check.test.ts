import { check } from '../../src/utils';

describe('utils/check：check实用方法', () => {
  it('验证 isUrl', () => {
    expect(check.isUrl('http://www.github.com')).toBeTruthy();
    expect(check.isUrl('https://www.github.com')).toBeTruthy();
    expect(check.isUrl('https://www.github.com/xxx')).toBeTruthy();
    expect(check.isUrl('https://www.github.com/xxx/y.json')).toBeTruthy();
    expect(check.isUrl('ftp://www.github.com')).toBeFalsy();
    expect(check.isUrl('/xxx/y.json')).toBeFalsy();
    expect(check.isUrl('xxx/y.json')).toBeFalsy();
    expect(check.isUrl('y.json')).toBeFalsy();
  });

  it('验证 isAbsolutePath', () => {
    expect(check.isAbsolutePath('/xxx/y.json')).toBeTruthy();
    expect(check.isAbsolutePath('c://xxxx/y.json')).toBeTruthy();
    expect(check.isAbsolutePath('c:/xxxx/y.json')).toBeTruthy();
    expect(check.isAbsolutePath('http://www.github.com')).toBeFalsy();
    expect(check.isAbsolutePath('xxx/y.json')).toBeFalsy();
    expect(check.isAbsolutePath('./xxx/y.json')).toBeFalsy();
    expect(check.isAbsolutePath('../xxx/y.json')).toBeFalsy();
  });

  it('验证 isRelativePath', () => {
    expect(check.isRelativePath('/xxx/y.json')).toBeFalsy();
    expect(check.isRelativePath('c://xxxx/y.json')).toBeFalsy();
    expect(check.isRelativePath('c:/xxxx/y.json')).toBeFalsy();
    expect(check.isRelativePath('http://www.github.com')).toBeFalsy();
    expect(check.isRelativePath('xxx/y.json')).toBeFalsy();
    expect(check.isRelativePath('./xxx/y.json')).toBeTruthy();
    expect(check.isRelativePath('../xxx/y.json')).toBeTruthy();
  });

  it('验证isObject', () => {
    expect(check.isObject({})).toBeTruthy();

    expect(check.isObject(null)).toBeFalsy();
    expect(check.isObject(undefined)).toBeFalsy();
    expect(check.isObject(1234)).toBeFalsy();
    expect(check.isObject(new Date())).toBeFalsy();
    expect(check.isObject(new RegExp(''))).toBeFalsy();
    expect(check.isObject(new Function())).toBeFalsy();
  });

  it('验证 null undefined', () => {
    expect(check.isNull(null)).toBeTruthy();
    expect(check.isNull({})).toBeFalsy();
    expect(check.isNull(undefined)).toBeFalsy();
    expect(check.isNull(0)).toBeFalsy();
    expect(check.isNull('')).toBeFalsy();
    expect(check.isNull(NaN)).toBeFalsy();

    expect(check.isUndefined(null)).toBeFalsy();
    expect(check.isUndefined({})).toBeFalsy();
    expect(check.isUndefined(undefined)).toBeTruthy();
    expect(check.isUndefined(0)).toBeFalsy();
    expect(check.isUndefined('')).toBeFalsy();
    expect(check.isNull(NaN)).toBeFalsy();

    expect(check.isNullOrUndefined(null)).toBeTruthy();
    expect(check.isNullOrUndefined({})).toBeFalsy();
    expect(check.isNullOrUndefined(undefined)).toBeTruthy();
    expect(check.isNullOrUndefined(0)).toBeFalsy();
    expect(check.isNullOrUndefined('')).toBeFalsy();
    expect(check.isNull(NaN)).toBeFalsy();
  });

  it('验证isPlainObject', () => {
    expect(check.isPlainObject({})).toBeTruthy();
    expect(check.isPlainObject(new Object())).toBeTruthy();

    expect(check.isPlainObject(undefined)).toBeFalsy();
    expect(check.isPlainObject(null)).toBeFalsy();
    expect(check.isPlainObject(new Date())).toBeFalsy();
    expect(check.isPlainObject(new RegExp(''))).toBeFalsy();
    expect(check.isPlainObject(new Error())).toBeFalsy();
    expect(check.isPlainObject(new Function())).toBeFalsy();
  });
});
