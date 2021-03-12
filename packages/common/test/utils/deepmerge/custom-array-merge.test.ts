import { deepmerge as merge } from '../../../src/utils/internal/deepmerge';

describe('utils/internal deepmerge：custom-array-merge', () => {
  it('custom merge array', () => {
    let mergeFunctionCalled = false;
    function overwriteMerge(target: any, source: any, options: any) {
      mergeFunctionCalled = true;
      expect(options.arrayMerge).toBe(overwriteMerge);

      return source;
    }
    const destination = {
      someArray: [1, 2],
      someObject: { what: 'yes' },
    };
    const source = {
      someArray: [1, 2, 3],
    };

    const actual = merge(destination, source, { arrayMerge: overwriteMerge });
    const expected = {
      someArray: [1, 2, 3],
      someObject: { what: 'yes' },
    };

    expect(mergeFunctionCalled).toBeTruthy();
    expect(actual).toEqual(expected);
  });

  it('merge top-level arrays', () => {
    function overwriteMerge(a: any, b: any) {
      return b;
    }
    const actual = merge([1, 2], [1, 2], { arrayMerge: overwriteMerge });
    const expected = [1, 2];

    expect(actual).toEqual(expected);
  });

  it('cloner function is available for merge functions to use', () => {
    let customMergeWasCalled = false;
    function cloneMerge(target: any, source: any, options: any) {
      customMergeWasCalled = true;
      expect(options.cloneUnlessOtherwiseSpecified).toBeTruthy();
      return target.concat(source).map(function (element: any) {
        return options.cloneUnlessOtherwiseSpecified(element, options);
      });
    }

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

    expect(merge(target, src, { arrayMerge: cloneMerge })).toEqual(expected);
    expect(customMergeWasCalled).toBeTruthy();
    expect(Array.isArray(merge(target, src).key1)).toBeTruthy();
    expect(Array.isArray(merge(target, src).key2)).toBeTruthy();
  });
});
