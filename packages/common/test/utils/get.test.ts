import { get } from '../../src/utils';
import { stringToPath } from '../../src/utils/internal';
import { empties, symbol } from '../util';

describe('utils/util：get方法', () => {
  it('get should get string keyed property values', () => {
    const object = { a: 1 };

    ['a', ['a']].forEach(path => {
      expect(get(object, path)).toBe(1);
    });
  });

  it('get should preserve the sign of `0`', () => {
    const object = { '-0': 'a', '0': 'b' },
      props = [-0, Object(-0), 0, Object(0)];

    const actual = props.map(key => {
      return get(object, key);
    });

    expect(actual).toEqual(['a', 'a', 'b', 'b']);
  });

  it('get should get symbol keyed property values', () => {
    if (Symbol) {
      const object: any = {};
      object[symbol] = 1;

      expect(get(object, symbol as any)).toBe(1);
    }
  });

  it('get should get deep property values', () => {
    const object = { a: { b: 2 } };

    ['a.b', ['a', 'b']].forEach((path: any) => {
      expect(get(object, path)).toBe(2);
    });
  });

  it('get should get a key over a path', () => {
    const object = { 'a.b': 1, a: { b: 2 } };

    ['a.b', ['a.b']].forEach((path: any) => {
      expect(get(object, path)).toBe(1);
    });
  });

  it('get should not coerce array paths to strings', () => {
    const object = { 'a,b,c': 3, a: { b: { c: 4 } } };
    expect(get(object, ['a', 'b', 'c'])).toBe(4);
  });

  it('get should not ignore empty brackets', () => {
    const object = { a: { '': 1 } };
    expect(get(object, 'a[]')).toBe(1);
  });

  it('get should handle empty paths', () => {
    [
      ['', ''],
      [[], ['']],
    ].forEach(pair => {
      expect(get({}, pair[0])).toBeUndefined();
      expect(get({ '': 3 }, pair[1])).toBe(3);
    });
  });

  it('get should handle complex paths', () => {
    const object = {
      a: {
        '-1.23': { '["b"]': { c: { "['d']": { e: { f: { g: 8 } } } } } },
      },
    };

    const paths = [
      'a[-1.23]["[\\"b\\"]"].c[\'[\\\'d\\\']\'][e][f].g',
      ['a', '-1.23', '["b"]', 'c', "['d']", 'e', 'f', 'g'],
    ];

    const pathArr = stringToPath(paths[0]);

    paths.forEach(path => {
      expect(get(object, path)).toBe(8);
    });
  });

  it('get should return `undefined` when `object` is nullish', () => {
    ['constructor', ['constructor']].forEach(path => {
      expect(get(null, path)).toBeUndefined();
      expect(get(undefined, path)).toBeUndefined();
    });
  });

  it('get should return `undefined` for deep paths when `object` is nullish', () => {
    const values: any[] = [null, undefined],
      expected = values.map(() => {
        /** noop */
      }),
      paths = [
        'constructor.prototype.valueOf',
        ['constructor', 'prototype', 'valueOf'],
      ];

    paths.forEach(path => {
      const actual = values.map(value => {
        return get(value, path);
      });

      expect(actual).toEqual(expected);
    });
  });

  it('get should return `undefined` if parts of `path` are missing', () => {
    const object: any = { a: [, null] };

    ['a[1].b.c', ['a', '1', 'b', 'c']].forEach(path => {
      expect(get(object, path)).toBe(undefined);
    });
  });

  it('get should be able to return `null` values', () => {
    const object: any = { a: { b: null } };

    ['a.b', ['a', 'b']].forEach(path => {
      expect(get(object, path)).toBe(null);
    });
  });

  it('get should follow `path` over non-plain objects', () => {
    const paths = ['a.b', ['a', 'b']];
    const numberProto: any = Number.prototype;

    paths.forEach(path => {
      numberProto.a = { b: 2 };
      expect(get(0, path)).toBe(2);
      delete numberProto.a;
    });
  });

  it('get should return the default value for `undefined` values', () => {
    const object = { a: {} },
      values = empties.concat(true, new Date(), 1, /x/, 'a'),
      expected = values.map(value => {
        return [value, value];
      });

    ['a.b', ['a', 'b']].forEach(path => {
      const actual = values.map(value => {
        return [get(object, path, value), get(null, path, value)];
      });

      expect(actual).toEqual(expected);
    });
  });

  it('get should return the default value when `path` is empty', () => {
    expect(get({}, [], 'a')).toBe('a');
  });
});
