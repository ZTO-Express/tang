import { toKey } from '../../src/utils/internal';
import { set, unset, noop, isObject } from '../../src/utils';
import { symbol } from '../util';

describe('utils/util：set方法', () => {
  const oldValue = 1,
    value = 2,
    updater = value;

  it('set should set property values', () => {
    ['a', ['a']].forEach(path => {
      const object = { a: oldValue },
        actual = set(object, path, updater);

      expect(actual).toEqual(object);
      expect(object.a).toEqual(value);
    });
  });

  it('set should preserve the sign of `0`', () => {
    const props = [-0, Object(-0), 0, Object(0)],
      expected = props.map(() => value);

    const actual = props.map(key => {
      const object: any = { '-0': 'a', '0': 'b' };
      set(object, key, updater);

      return object[toKey(key)];
    });

    expect(actual).toEqual(expected);
  });

  it('set should unset symbol keyed property values', () => {
    if (Symbol) {
      const object: any = {};
      object[symbol] = 1;

      expect(unset(object, symbol as any)).toBe(true);
      expect(!(symbol in object)).toBe(true);
    }
  });

  it('set should set deep property values', () => {
    ['a.b', ['a', 'b']].forEach(path => {
      const object = { a: { b: oldValue } },
        actual = set(object, path, updater);

      expect(actual).toEqual(object);
      expect(object.a.b).toEqual(value);
    });
  });

  it('set should set a key over a path', () => {
    ['a.b', ['a.b']].forEach(path => {
      const object = { 'a.b': oldValue },
        actual = set(object, path, updater);

      expect(actual).toEqual(object);
      expect(object).toEqual({ 'a.b': value });
    });
  });

  it('set should not coerce array paths to strings', () => {
    const object = { 'a,b,c': 1, a: { b: { c: 1 } } };

    set(object, ['a', 'b', 'c'], updater);
    expect(object.a.b.c).toBe(value);
  });

  it('set should not ignore empty brackets', () => {
    const object = {};

    set(object, 'a[]', updater);
    expect(object).toEqual({ a: { '': value } });
  });

  it('set should handle empty paths', () => {
    [
      ['', ''],
      [[], ['']],
    ].forEach((pair, index) => {
      const object = {};

      set(object, pair[0], updater);
      expect(object).toEqual(index ? {} : { '': value });

      set(object, pair[1], updater);
      expect(object).toEqual({ '': value });
    });
  });

  it('set should handle complex paths', () => {
    const object: any = {
      a: {
        '1.23': {
          '["b"]': { c: { "['d']": { e: { f: { g: oldValue } } } } },
        },
      },
    };

    const paths = [
      'a[-1.23]["[\\"b\\"]"].c[\'[\\\'d\\\']\'][e][f].g',
      ['a', '-1.23', '["b"]', 'c', "['d']", 'e', 'f', 'g'],
    ];

    paths.forEach(path => {
      set(object, path, updater);
      expect(object.a[-1.23]['["b"]'].c["['d']"]['e'].f.g).toBe(value);
      object.a[-1.23]['["b"]'].c["['d']"]['e'].f.g = oldValue;
    });
  });

  it('set should create parts of `path` that are missing', () => {
    const object: any = {};

    ['a[1].b.c', ['a', '1', 'b', 'c']].forEach(path => {
      const actual = set(object, path, updater);

      expect(actual).toEqual(object);
      expect(actual).toEqual({ a: [undefined, { b: { c: value } }] });
      expect(!('0' in object.a)).toBe(true);

      delete object.a;
    });
  });

  it('set should not error when `object` is nullish', () => {
    const values: any = [null, undefined],
      expected: any = [
        [null, null],
        [undefined, undefined],
      ];

    const actual = values.map((value: any) => {
      try {
        return [set(value, 'a.b', updater), set(value, ['a', 'b'], updater)];
      } catch (e) {
        return e.message;
      }
    });

    expect(actual).toEqual(expected);
  });

  it('set should overwrite primitives in the path', () => {
    ['a.b', ['a', 'b']].forEach(path => {
      const object = { a: '' };

      set(object, path, updater);
      expect(object).toEqual({ a: { b: 2 } });
    });
  });

  it('set should not create an array for missing non-index property names that start with numbers', () => {
    const object = {};

    set(object, ['1a', '2b', '3c'], updater);
    expect(object).toEqual({ '1a': { '2b': { '3c': value } } });
  });

  it('set should not assign values that are the same as their destinations', () => {
    ['a', ['a'], { a: 1 }, NaN].forEach(value => {
      const object: any = {},
        updater = value;
      let pass = true;

      Object.defineProperty(object, 'a', {
        configurable: true,
        enumerable: true,
        get: () => value,
        set: () => {
          pass = false;
        },
      });

      set(object, 'a', updater);
      expect(pass).toBe(true);
    });
  });

  it('should work with a `customizer` callback', () => {
    const actual = set({ '0': {} }, '[0][1][2]', 3, (value: any) => {
      return isObject(value) ? undefined : {};
    });

    expect(actual).toEqual({ '0': { '1': { '2': 3 } } });
  });

  it('should work with a `customizer` that returns `undefined`', function () {
    const actual = set({}, 'a[0].b.c', 4, noop);
    expect(actual).toEqual({ a: [{ b: { c: 4 } }] });
  });
});
