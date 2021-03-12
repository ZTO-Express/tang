import { deepmerge as merge } from '../../../src/utils/internal/deepmerge';

describe('utils/internal deepmerge：custom-is-mergeable-object.test', () => {
  it('isMergeableObject function copying object over object', () => {
    const src = { key: { isMergeable: false }, baz: 'yes' };
    const target = { key: { foo: 'wat' }, baz: 'whatever' };

    function isMergeableObject(object: any) {
      return (
        object && typeof object === 'object' && object.isMergeable !== false
      );
    }

    const res = merge(target, src, {
      isMergeableObject: isMergeableObject,
    });

    expect(res).toEqual({ key: { isMergeable: false }, baz: 'yes' });
    expect(res.key).toBe(src.key);
  });

  it('isMergeableObject function copying object over nothing', () => {
    const src = { key: { isMergeable: false, foo: 'bar' }, baz: 'yes' };
    const target = { baz: 'whatever' };

    function isMergeableObject(object: any) {
      return (
        object && typeof object === 'object' && object.isMergeable !== false
      );
    }

    const res = merge(target, src, {
      isMergeableObject: isMergeableObject,
    });

    expect(res).toEqual({
      key: { isMergeable: false, foo: 'bar' },
      baz: 'yes',
    });
    expect(res.key).toBe(src.key);
  });
});
