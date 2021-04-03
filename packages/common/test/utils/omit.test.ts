import { omit, omitNil, omitEmpty } from '../../src/utils';

describe('utils/util：omit方法', () => {
  it('should omit a key from the object', () => {
    expect(omit({ a: 'a', b: 'b', c: 'c' }, 'a')).toEqual({ b: 'b', c: 'c' });
    expect(omit({ aaa: 'a', bbb: 'b', ccc: 'c' }, 'aaa')).toEqual({
      bbb: 'b',
      ccc: 'c',
    });
  });

  it('should omit an array of keys from the object', () => {
    expect(omit({ a: 'a', b: 'b', c: 'c' }, ['a', 'c'])).toEqual({ b: 'b' });
  });

  it('should return the object if no keys are given', () => {
    expect(omit({ a: 'a', b: 'b', c: 'c' })).toEqual({
      a: 'a',
      b: 'b',
      c: 'c',
    });
  });

  it('should return a new object when no keys are given', () => {
    const obj = { a: 'a', b: 'b', c: 'c' };
    expect(omit(obj) !== obj).toBe(true);
  });

  it('should take a filter function as the last argument', () => {
    const foo = omit({ a: 'a', b: 'b', c: 'c' }, function (val, key) {
      return key === 'a';
    });
    const bar = omit({ a: 'a', b: 'b', c: () => {} }, function (val, key) {
      return typeof val !== 'function';
    });
    expect(foo).toEqual({ a: 'a' });
    expect(bar).toEqual({ a: 'a', b: 'b' });
  });

  it('should copy properties to a new object', () => {
    const foo = { a: 'a', b: 'b', c: 'c', d: 'd' };
    const bar = omit(foo, ['d'], function (val, key) {
      return key === 'a' || key === 'd';
    });
    expect(foo).toEqual({ a: 'a', b: 'b', c: 'c', d: 'd' });
    expect(bar).toEqual({ a: 'a' });
  });

  it('should return an empty object if the first arg is not an object', () => {
    expect((omit as any)(null, { a: 'a', b: 'b', c: 'c' })).toEqual({});
  });

  it('should return an empty object if no object is specified', () => {
    expect((omit as any)()).toEqual({});
  });

  it('omitNil', () => {
    expect(omitNil(undefined)).toEqual({});
    expect(omitNil(null)).toEqual({});
    expect(omitNil(0)).toEqual({});
    expect(omitNil(new Date())).toEqual({});

    expect(omitNil({ a: 'a', b: undefined, c: null, d: '' })).toEqual({
      a: 'a',
      d: '',
    });
  });

  it('omitEmpty', () => {
    expect(omitEmpty(undefined)).toEqual({});
    expect(omitEmpty(null)).toEqual({});
    expect(omitEmpty(0)).toEqual({});
    expect(omitEmpty(new Date())).toEqual({});

    expect(omitEmpty({ a: 'a', b: undefined, c: null, d: '' })).toEqual({
      a: 'a',
    });
  });
});
