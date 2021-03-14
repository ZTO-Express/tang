import { toKey } from '../../src/utils/internal';
import { unset } from '../../src/utils';
import { symbol, numberProto, stringProto } from '../util';

describe('utils/util：unset方法', () => {
  it('unset null', () => {
    expect(unset(undefined, 'a')).toBe(true);
  });

  it('should unset property values', () => {
    ['a', ['a']].forEach(path => {
      const object: any = { a: 1, c: 2 };
      expect(unset(object, path)).toBe(true);
      expect(object).toEqual({ c: 2 });
    });
  });

  it('should preserve the sign of `0`', () => {
    const props = [-0, Object(-0), 0, Object(0)],
      expected = props.map(() => [true, false]);

    const actual = props.map(key => {
      const object: any = { '-0': 'a', '0': 'b' };
      return [unset(object, key), toKey(key) in object];
    });

    expect(actual).toEqual(expected);
  });

  it('should unset symbol keyed property values', () => {
    if (Symbol) {
      const object: any = {};
      object[symbol] = 1;

      expect(unset(object, symbol as any)).toBe(true);
      expect(!(symbol in object)).toBe(true);
    }
  });

  it('should unset deep property values', () => {
    ['a.b', ['a', 'b']].forEach(path => {
      const object: any = { a: { b: null } };
      expect(unset(object, path)).toBe(true);
      expect(object).toEqual({ a: {} });
    });
  });

  it('should handle complex paths', () => {
    const paths = [
      'a[-1.23]["[\\"b\\"]"].c[\'[\\\'d\\\']\'][e][f].g',
      ['a', '-1.23', '["b"]', 'c', "['d']", 'e', 'f', 'g'],
    ];

    paths.forEach(path => {
      const object: any = {
        a: {
          '-1.23': {
            '["b"]': { c: { "['d']": { e: { f: { g: 8 } } } } },
          },
        },
      };
      expect(unset(object, path)).toBe(true);
      expect(!('g' in object.a[-1.23]['["b"]'].c["['d']"]['e'].f)).toBe(true);
    });
  });

  it('should return `true` for nonexistent paths', () => {
    const object: any = { a: { b: { c: null } } };

    ['z', 'a.z', 'a.b.z', 'a.b.c.z'].forEach(path => {
      expect(unset(object, path)).toBe(true);
    });

    expect(object).toEqual({ a: { b: { c: null } } });
  });

  it('should not error when `object` is nullish', () => {
    const values: any = [null, undefined],
      expected = [
        [true, true],
        [true, true],
      ];

    const actual = values.map((value: any) => {
      try {
        return [unset(value, 'a.b'), unset(value, ['a', 'b'])];
      } catch (e) {
        return e.message;
      }
    });

    expect(actual).toEqual(expected);
  });

  it('should follow `path` over non-plain objects', () => {
    const object: any = { a: '' },
      paths = ['constructor.prototype.a', ['constructor', 'prototype', 'a']];

    paths.forEach(path => {
      numberProto.a = 1;

      const actual = unset(0 as any, path);
      expect(actual).toBe(true);
      expect(!('a' in numberProto)).toBe(true);

      delete numberProto.a;
    });

    ['a.replace.b', ['a', 'replace', 'b']].forEach(path => {
      stringProto.replace.b = 1;

      const actual = unset(object, path);
      expect(actual).toBe(true);
      expect(!('a' in stringProto.replace)).toBe(true);

      delete stringProto.replace.b;
    });
  });

  // it('should return `false` for non-configurable properties', () => {
  //   const object: any = {};

  //   Object.defineProperty(object, 'a', {
  //     configurable: false,
  //     enumerable: true,
  //     writable: true,
  //     value: 1,
  //   });
  //   expect(unset(object, 'a')).toBe(false);
  // });
});
