import { deepmerge as merge } from '../../../src/utils/internal/deepmerge';

function isMergeableObject(value: any) {
  const stringValue = Object.prototype.toString.call(value);
  return (
    !!value &&
    typeof value === 'object' &&
    !(stringValue === '[object RegExp]' || stringValue === '[object Date]')
  );
}

describe('utils/internal deepmerge：prototype-poisoning', () => {
  it('merging objects with own __proto__', () => {
    const user = {};
    const malicious = JSON.parse('{ "__proto__": { "admin": true } }');
    const mergedObject: any = merge(user, malicious);
    expect(mergedObject.__proto__.admin).toBeFalsy();
    expect(mergedObject.admin).toBeFalsy();
  });

  it('merging objects with plain and non-plain properties', () => {
    const plainSymbolKey = Symbol('plainSymbolKey');
    const parent = {
      parentKey: 'should be undefined',
    };

    const target = Object.create(parent);
    target.plainKey = 'should be replaced';
    target[plainSymbolKey] = 'should also be replaced';

    const source = {
      parentKey: 'foo',
      plainKey: 'bar',
      newKey: 'baz',
      [plainSymbolKey]: 'qux',
    };

    const mergedObject = merge(target, source);
    expect(undefined).toBe(mergedObject.parentKey);
    expect('bar').toBe(mergedObject.plainKey);
    expect('baz').toBe(mergedObject.newKey);
    expect('qux').toBe(mergedObject[plainSymbolKey]);
  });

  // the following cases come from the thread here: https://github.com/TehShrike/deepmerge/pull/164
  it('merging strings works with a custom string merge', () => {
    const target = { name: 'Alexander' };
    const source = { name: 'Hamilton' };
    function customMerge(key: any, options: any) {
      if (key === 'name') {
        return function (target: any, source: any, options: any) {
          return target[0] + '. ' + source.substring(0, 3);
        };
      } else {
        return merge;
      }
    }

    function mergeable(target: any) {
      return (
        isMergeableObject(target) ||
        (typeof target === 'string' && target.length > 1)
      );
    }

    expect('A. Ham').toBe(
      merge(target, source, {
        customMerge: customMerge,
        isMergeableObject: mergeable,
      } as any).name,
    );
  });

  it('merging objects with null prototype', () => {
    const target = Object.create(null);
    const source = Object.create(null);
    target.wheels = 4;
    target.trunk = { toolbox: ['hammer'] };
    source.trunk = { toolbox: ['wrench'] };
    source.engine = 'v8';
    const expected = {
      wheels: 4,
      engine: 'v8',
      trunk: {
        toolbox: ['hammer', 'wrench'],
      },
    };

    expect(expected).toEqual(merge(target, source));
  });
});
