import { memoize } from '../../../src/utils/internal/memoize';

describe('utils/internal memoize：内部实用方法 memoize', () => {
  it('memoize', () => {
    const merged1 = memoize((o: any) => o, undefined as any);
    expect(merged1('a')).toBe('a');
    expect(merged1.cache.get('a')).toBe('a');
    expect(merged1('a')).toBe('a');

    memoize.Cache = undefined;

    const merged2 = memoize(
      (o: any) => o,
      (key: unknown) => key,
    );

    expect(merged2('a')).toBe('a');
    expect(merged2.cache.get('a')).toBe('a');
    expect(merged2('ab')).toBe('ab');

    const merged3 = memoize((o: any) => o, undefined as any);
    expect(merged3('a')).toBe('a');

    expect(() => memoize(undefined as any, {} as any)).toThrow(
      'Expected a function',
    );
  });

  it('memoize custom cache', () => {
    class TestCache {
      set(key: string) {
        return key;
      }
      has() {
        return true;
      }
      get() {
        return true;
      }
    }

    const merged4 = memoize((o: any) => o, undefined as any);
    expect(merged4('a')).toBe('a');
    merged4.cache = new TestCache() as any;
    expect(merged4('a')).toBe(true);

    merged4.cache.has = () => false;
    merged4(undefined);
    expect(merged4.cache.get('a')).toBe(true);
  });
});
