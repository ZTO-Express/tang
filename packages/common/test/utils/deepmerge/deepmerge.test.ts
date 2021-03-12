import {
  deepmerge as merge,
  deepmergeAll as mergeAll,
  DeepmergeOptions,
} from '../../../src/utils/internal/deepmerge';

describe('utils/internal deepmerge：内部实用方法 deepmerge', () => {
  it('deepmerge', () => {
    const x = {
      foo: 'abc',
      bar: 'def',
      wat: 42,
    };

    const y = {
      foo: 'cba',
      bar: 'fed',
      wat: 42,
    };

    const z = {
      baz: '123',
      quux: '456',
      wat: 42,
    };

    let merged1 = merge(x, y);
    let merged2 = merge(x, z);
    let merged3 = mergeAll([x, y, z]);

    merged1.foo;
    merged1.bar;
    merged2.foo;
    merged2.baz;

    const options1: DeepmergeOptions = {
      clone: true,
      isMergeableObject(obj) {
        return false;
      },
    };

    const options2: DeepmergeOptions = {
      arrayMerge(target, source, options) {
        target.length;
        source.length;
        options.isMergeableObject(target);

        return [];
      },
      clone: true,
      isMergeableObject(obj) {
        return false;
      },
    };

    const options3: DeepmergeOptions = {
      customMerge: (key: string) => {
        if (key === 'foo') {
          return (target, source) => target + source;
        }
        return undefined;
      },
    };

    merged1 = merge(x, y, options1);
    merged2 = merge(x, z, options2);
    merged3 = mergeAll([x, y, z], options1);

    const merged4 = merge(x, y, options3);
  });
});
