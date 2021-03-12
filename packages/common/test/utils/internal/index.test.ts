import {
  getTag,
  isSymbol,
  isKey,
  toKey,
  castPath,
  memoizeCapped,
  assignValue,
  stringToPath,
} from '../../../src/utils/internal';

describe('utils/internal：内部实用方法', () => {
  it('getTag 获取对象标签', () => {
    expect(getTag(null)).toBe('[object Null]');
    expect(getTag(undefined)).toBe('[object Undefined]');
    expect(getTag(Symbol('X'))).toBe('[object Symbol]');
    expect(getTag(new RegExp(''))).toBe('[object RegExp]');
    expect(getTag(new Date())).toBe('[object Date]');
    expect(getTag([])).toBe('[object Array]');
    expect(getTag(new Array([]))).toBe('[object Array]');
    expect(getTag(new Map())).toBe('[object Map]');
  });

  it('isSymbol 判断目标是否Symbol', () => {
    expect(isSymbol(Symbol('X'))).toBeTruthy();
    expect(isSymbol(null)).toBeFalsy();
    expect(isSymbol(undefined)).toBeFalsy();
    expect(isSymbol(new RegExp(''))).toBeFalsy();
    expect(isSymbol([])).toBeFalsy();
  });

  it('isKey 判断目标是否Key', () => {
    expect(isKey('b', { a: 1 })).toBeTruthy();
    expect(isKey('a', { a: 1 })).toBeTruthy();
    expect(isKey('getDate', new Date())).toBeTruthy();

    expect(isKey(Symbol('X'))).toBeTruthy();
    expect(isKey(null)).toBeTruthy();
    expect(isKey(undefined)).toBeTruthy();
    expect(isKey(0)).toBeTruthy();
    expect(isKey(1)).toBeTruthy();
    expect(isKey(true)).toBeTruthy();
    expect(isKey('a.b')).toBeFalsy();
    expect(isKey([])).toBeFalsy();
    expect(isKey(new RegExp(''))).toBeTruthy();
  });

  it('toKey 转换目标是为Key', () => {
    const symbol1 = Symbol('X');
    expect(toKey(symbol1)).toBe(symbol1);
    expect(toKey('x')).toBe('x');
    expect(toKey(0)).toBe('0');
    expect(toKey(1)).toBe('1');
    expect(toKey(-0)).toBe('-0');
  });

  it('castPath 转换字符串为路径', () => {
    expect(castPath('.a')).toEqual(['', 'a']);
    expect(castPath('a.b')).toEqual(['a', 'b']);
    expect(castPath('a[0].b')).toEqual(['a', '0', 'b']);
    expect(castPath(['', 'a'])).toEqual(['', 'a']);
    expect(castPath(['a', 'b'])).toEqual(['a', 'b']);
    expect(castPath('.a|b')).toEqual(['', 'a|b']);
  });

  it('stringToPath 测试', () => {
    debugger;
    stringToPath('a.b.c');
  });

  it('memoize 缓存', () => {
    expect(() => memoizeCapped('a' as any)).toThrow('Expected a function');
    expect(memoizeCapped((str: string) => str)('a')).toBe('a');
  });

  it('assignValue', () => {
    const obj: any = { a: 1, b: 2 };
    assignValue(obj, 'b', undefined);
    expect(obj.b).toBeUndefined();

    assignValue(obj, 'toString', undefined);
    expect(obj.toString).toBeUndefined();

    assignValue(obj, 'b', undefined);
    expect(obj.toString).toBeUndefined();

    class TestObj {
      name: any = undefined;
    }

    (TestObj as any).prototype.gender = undefined;

    const o = new TestObj();

    assignValue(o, 'gender', undefined);
    expect(obj.gender).toBeUndefined();

    assignValue(o, 'name', undefined);
    expect(obj.name).toBeUndefined();

    assignValue(o, '__proto__', 'test');
    expect((o as any).__proto__).toBe('test');
  });
});
