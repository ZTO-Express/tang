import { deepmerge as merge } from '../../../src/utils/internal/deepmerge';

describe('utils/internal deepmerge：merge', () => {
  it('add keys in target that do not exist at the root', () => {
    const src = { key1: 'value1', key2: 'value2' };
    const target = {};

    const res = merge(target, src);

    expect(target).toEqual({});
    expect(res).toEqual(src);
  });

  it('merge existing simple keys in target at the roots', () => {
    const src = { key1: 'changed', key2: 'value2' };
    const target = { key1: 'value1', key3: 'value3' };

    const expected = {
      key1: 'changed',
      key2: 'value2',
      key3: 'value3',
    };

    expect(target).toEqual({ key1: 'value1', key3: 'value3' });
    expect(merge(target, src)).toEqual(expected);
  });

  it('merge nested objects into target', () => {
    const src = {
      key1: {
        subkey1: 'changed',
        subkey3: 'added',
      },
    };
    const target = {
      key1: {
        subkey1: 'value1',
        subkey2: 'value2',
      },
    };

    const expected = {
      key1: {
        subkey1: 'changed',
        subkey2: 'value2',
        subkey3: 'added',
      },
    };

    expect(target).toEqual({
      key1: {
        subkey1: 'value1',
        subkey2: 'value2',
      },
    });

    expect(merge(target, src)).toEqual(expected);
  });

  it('replace simple key with nested object in target', () => {
    const src = {
      key1: {
        subkey1: 'subvalue1',
        subkey2: 'subvalue2',
      },
    };
    const target = {
      key1: 'value1',
      key2: 'value2',
    };

    const expected = {
      key1: {
        subkey1: 'subvalue1',
        subkey2: 'subvalue2',
      },
      key2: 'value2',
    };

    expect(target).toEqual({ key1: 'value1', key2: 'value2' });
    expect(merge(target, src)).toEqual(expected);
  });

  it('should add nested object in target', () => {
    const src = {
      b: {
        c: {},
      },
    };

    const target = {
      a: {},
    };

    const expected = {
      a: {},
      b: {
        c: {},
      },
    };

    expect(merge(target, src)).toEqual(expected);
  });

  it('should clone source and target', () => {
    const src = {
      b: {
        c: 'foo',
      },
    };

    const target = {
      a: {
        d: 'bar',
      },
    };

    const expected = {
      a: {
        d: 'bar',
      },
      b: {
        c: 'foo',
      },
    };

    const merged = merge(target, src, { clone: true });

    expect(merged).toEqual(expected);
    expect(merged.a).toEqual(target.a);
    expect(merged.b).toEqual(src.b);
  });

  it('should clone source and target', () => {
    const src = {
      b: {
        c: 'foo',
      },
    };

    const target = {
      a: {
        d: 'bar',
      },
    };

    const merged = merge(target, src);

    expect(merged.a).toEqual(target.a);
    expect(merged.b).toEqual(src.b);
  });

  it('should replace object with simple key in target', () => {
    const src = { key1: 'value1' };
    const target = {
      key1: {
        subkey1: 'subvalue1',
        subkey2: 'subvalue2',
      },
      key2: 'value2',
    };

    const expected = { key1: 'value1', key2: 'value2' };

    expect(target).toEqual({
      key1: {
        subkey1: 'subvalue1',
        subkey2: 'subvalue2',
      },
      key2: 'value2',
    });

    expect(merge(target, src)).toEqual(expected);
  });

  it('should replace objects with arrays', () => {
    const target = { key1: { subkey: 'one' } };

    const src = { key1: ['subkey'] };

    const expected = { key1: ['subkey'] };

    expect(merge(target, src)).toEqual(expected);
  });

  it('should replace arrays with objects', () => {
    const target = { key1: ['subkey'] };

    const src = { key1: { subkey: 'one' } };

    const expected = { key1: { subkey: 'one' } };

    expect(merge(target, src)).toEqual(expected);
  });

  it('should replace dates with arrays', () => {
    const target = { key1: new Date() };

    const src = { key1: ['subkey'] };

    const expected = { key1: ['subkey'] };

    expect(merge(target, src)).toEqual(expected);
  });

  it('should replace null with arrays', () => {
    const target: any = {
      key1: null,
    };

    const src = {
      key1: ['subkey'],
    };

    const expected = {
      key1: ['subkey'],
    };

    expect(merge(target, src)).toEqual(expected);
  });

  it('should work on simple array', () => {
    const src = ['one', 'three'];
    const target = ['one', 'two'];

    const expected = ['one', 'two', 'one', 'three'];

    expect(merge(target, src)).toEqual(expected);
    expect(Array.isArray(merge(target, src))).toBeTruthy();
  });

  it('should work on another simple array', () => {
    const target = ['a1', 'a2', 'c1', 'f1', 'p1'];
    const src = ['t1', 's1', 'c2', 'r1', 'p2', 'p3'];

    const expected = [
      'a1',
      'a2',
      'c1',
      'f1',
      'p1',
      't1',
      's1',
      'c2',
      'r1',
      'p2',
      'p3',
    ];

    expect(target).toEqual(['a1', 'a2', 'c1', 'f1', 'p1']);
    expect(merge(target, src)).toEqual(expected);
    expect(Array.isArray(merge(target, src))).toBeTruthy();
  });

  it('should work on array properties', () => {
    const src = {
      key1: ['one', 'three'],
      key2: ['four'],
    };
    const target = {
      key1: ['one', 'two'],
    };

    const expected = {
      key1: ['one', 'two', 'one', 'three'],
      key2: ['four'],
    };

    expect(merge(target, src)).toEqual(expected);
    expect(Array.isArray(merge(target, src).key1)).toBeTruthy();
    expect(Array.isArray(merge(target, src).key2)).toBeTruthy();
  });

  it('should work on array properties with clone option', () => {
    const src = {
      key1: ['one', 'three'],
      key2: ['four'],
    };
    const target = {
      key1: ['one', 'two'],
    };

    expect(target).toEqual({
      key1: ['one', 'two'],
    });
    const merged = merge(target, src, { clone: true });
    expect(merged.key1).not.toBe(src.key1);
    expect(merged.key1).not.toBe(target.key1);
    expect(merged.key2).not.toBe(src.key2);
  });

  it('should work on array of objects', () => {
    const src = [{ key1: ['one', 'three'], key2: ['one'] }, { key3: ['five'] }];
    const target = [{ key1: ['one', 'two'] }, { key3: ['four'] }];

    const expected = [
      { key1: ['one', 'two'] },
      { key3: ['four'] },
      { key1: ['one', 'three'], key2: ['one'] },
      { key3: ['five'] },
    ];

    expect(merge(target, src)).toEqual(expected);
    expect(Array.isArray(merge(target, src))).toBeTruthy();
    expect(Array.isArray(merge(target, src)[0].key1)).toBeTruthy();
  });

  it('should work on array of objects with clone option', () => {
    const src = [{ key1: ['one', 'three'], key2: ['one'] }, { key3: ['five'] }];
    const target = [{ key1: ['one', 'two'] }, { key3: ['four'] }];

    const expected = [
      { key1: ['one', 'two'] },
      { key3: ['four'] },
      { key1: ['one', 'three'], key2: ['one'] },
      { key3: ['five'] },
    ];

    const merged = merge(target, src, { clone: true });
    expect(merged).toEqual(expected);
    expect(Array.isArray(merge(target, src))).toBeTruthy();
    expect(Array.isArray(merge(target, src)[0].key1)).toBeTruthy();
    expect(merged[0].key1).not.toBe(src[0].key1);
    expect(merged[0].key1).not.toBe(target[0].key1);
    expect(merged[0].key2).not.toBe(src[0].key2);
    expect(merged[1].key3).not.toBe(src[1].key3);
    expect(merged[1].key3).not.toBe(target[1].key3);
  });

  it('should treat regular expressions like primitive values', () => {
    const target = { key1: /abc/ };
    const src = { key1: /efg/ };
    const expected = { key1: /efg/ };

    expect(merge(target, src)).toEqual(expected);
    // t.deepEqual(merge(target, src).key1.it('efg'), true);
  });

  it(
    'should treat regular expressions like primitive values and should not' +
      ' clone even with clone option',
    () => {
      const target = { key1: /abc/ };
      const src = { key1: /efg/ };

      const output = merge(target, src, { clone: true });
      expect(output.key1).toBe(src.key1);
    },
  );

  it('should treat dates like primitives', () => {
    const monday = new Date('2016-09-27T01:08:12.761Z');
    const tuesday = new Date('2016-09-28T01:18:12.761Z');

    const target = {
      key: monday,
    };
    const source = {
      key: tuesday,
    };

    const expected = {
      key: tuesday,
    };
    const actual = merge(target, source);

    expect(actual).toEqual(expected);
    expect(actual.key.valueOf()).toBe(tuesday.valueOf());
  });

  it(
    'should treat dates like primitives and should not clone even with clone' +
      ' option',
    () => {
      const monday = new Date('2016-09-27T01:08:12.761Z');
      const tuesday = new Date('2016-09-28T01:18:12.761Z');

      const target = {
        key: monday,
      };
      const source = {
        key: tuesday,
      };

      const actual = merge(target, source, { clone: true });

      expect(actual.key).toBe(tuesday);
    },
  );

  it('should work on array with null in it', () => {
    const target: any = [];
    const src: any = [null];
    const expected: any = [null];

    expect(merge(target, src)).toEqual(expected);
  });

  it("should clone array's element if it is object", () => {
    const a = { key: 'yup' };
    const target: any = [];
    const source = [a];

    const output = merge(target, source, { clone: true });

    expect(output[0]).not.toBe(a);
    expect(output[0].key).toBe('yup');
  });

  it('should clone an array property when there is no target array', () => {
    const someObject = {};
    const target = {};
    const source = { ary: [someObject] };
    const output = merge(target, source, { clone: true });

    expect(output).toEqual({ ary: [{}] });
    expect(output.ary[0]).not.toBe(someObject);
  });

  it('should overwrite values when property is initialised but undefined', () => {
    const target1: any = { value: [] };
    const target2: any = { value: null };
    const target3: any = { value: 2 };

    const src: any = { value: undefined };

    function hasUndefinedProperty(o: any) {
      expect(o.hasOwnProperty('value')).toBeTruthy();
      expect(typeof o.value).toBe('undefined');
    }

    hasUndefinedProperty(merge(target1, src));
    hasUndefinedProperty(merge(target2, src));
    hasUndefinedProperty(merge(target3, src));
  });

  it('dates should copy correctly in an array', () => {
    const monday = new Date('2016-09-27T01:08:12.761Z');
    const tuesday = new Date('2016-09-28T01:18:12.761Z');

    const target = [monday, 'dude'];
    const source = [tuesday, 'lol'];

    const expected = [monday, 'dude', tuesday, 'lol'];
    const actual = merge(target, source);

    expect(actual).toEqual(expected);
  });

  it('should handle custom merge functions', () => {
    const target = {
      letters: ['a', 'b'],
      people: {
        first: 'Alex',
        second: 'Bert',
      },
    };

    const source = {
      letters: ['c'],
      people: {
        first: 'Smith',
        second: 'Bertson',
        third: 'Car',
      },
    };

    const mergePeople = (target: any, source: any, options: any) => {
      const keys = new Set(Object.keys(target).concat(Object.keys(source)));
      const destination: any = {};
      keys.forEach(key => {
        if (key in target && key in source) {
          destination[key] = `${target[key]}-${source[key]}`;
        } else if (key in target) {
          destination[key] = target[key];
        } else {
          destination[key] = source[key];
        }
      });
      return destination;
    };

    const options: any = {
      customMerge: (key: any, options: any) => {
        if (key === 'people') {
          return mergePeople;
        }

        return merge;
      },
    };

    const expected = {
      letters: ['a', 'b', 'c'],
      people: {
        first: 'Alex-Smith',
        second: 'Bert-Bertson',
        third: 'Car',
      },
    };

    const actual = merge(target, source, options);
    expect(actual).toEqual(expected);
  });

  it('should handle custom merge functions', () => {
    const target = {
      letters: ['a', 'b'],
      people: {
        first: 'Alex',
        second: 'Bert',
      },
    };

    const source = {
      letters: ['c'],
      people: {
        first: 'Smith',
        second: 'Bertson',
        third: 'Car',
      },
    };

    const mergeLetters = (target: any, source: any, options: any) => {
      return 'merged letters';
    };

    const options: any = {
      customMerge: (key: any, options: any) => {
        if (key === 'letters') {
          return mergeLetters;
        }
        return undefined;
      },
    };

    const expected = {
      letters: 'merged letters',
      people: {
        first: 'Smith',
        second: 'Bertson',
        third: 'Car',
      },
    };

    const actual = merge(target, source, options);
    expect(actual).toEqual(expected);
  });

  it('should merge correctly if custom merge is not a valid function', () => {
    const target = {
      letters: ['a', 'b'],
      people: {
        first: 'Alex',
        second: 'Bert',
      },
    };

    const source = {
      letters: ['c'],
      people: {
        first: 'Smith',
        second: 'Bertson',
        third: 'Car',
      },
    };

    const options: any = {
      customMerge: (key: any, options: any) => {
        return false;
      },
    };

    const expected = {
      letters: ['a', 'b', 'c'],
      people: {
        first: 'Smith',
        second: 'Bertson',
        third: 'Car',
      },
    };

    const actual = merge(target, source, options);
    expect(actual).toEqual(expected);
  });

  it('copy symbol keys in target that do not exist on the target', () => {
    const mySymbol = Symbol();
    const src = { [mySymbol]: 'value1' };
    const target = {};

    const res = merge(target, src);

    expect(res[mySymbol]).toBe('value1');
    expect(Object.getOwnPropertySymbols(res)).toEqual(
      Object.getOwnPropertySymbols(src),
    );
  });

  it('copy symbol keys in target that do exist on the target', () => {
    const mySymbol = Symbol();
    const src = { [mySymbol]: 'value1' };
    const target = { [mySymbol]: 'wat' };

    const res = merge(target, src);

    expect(res[mySymbol]).toBe('value1');
  });

  it('Falsey properties should be mergeable', () => {
    const uniqueValue = {};

    const target = {
      wat: false,
    };

    const source = {
      wat: false,
    };

    let customMergeWasCalled = false;

    const result = merge(target, source, {
      isMergeableObject: function () {
        return true;
      },
      customMerge: function () {
        return function () {
          customMergeWasCalled = true;
          return uniqueValue;
        };
      },
    });

    expect(result.wat).toBe(uniqueValue);
    expect(customMergeWasCalled).toBeTruthy();
  });
});
