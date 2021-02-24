import { ensureArray, findBy, sortBy, clone } from '../../src/utils';

describe('utils/util：通用实用方法', () => {
  it('ensureArray：确保对象转换为数组', async () => {
    expect(ensureArray([1, 2])).toEqual([1, 2]);
    expect(ensureArray([{ a: 1, b: 2 }])).toEqual([{ a: 1, b: 2 }]);

    expect(ensureArray(1)).toEqual([1]);
    expect(ensureArray(0)).toEqual([0]);
    expect(ensureArray({ a: 1, b: 2 })).toEqual([{ a: 1, b: 2 }]);

    expect(ensureArray(null)).toEqual([]);
    expect(ensureArray(undefined)).toEqual([]);
    expect(ensureArray(NaN)).toEqual([]);
  });

  it('findBy：根据key查找对象', async () => {
    expect(findBy([0, 1, 2], 'a', 1)).toBeUndefined();

    expect(
      findBy([{ a: 1 }, { a: 2, b: 3 }, { a: 2, b: 6, c: 6 }], 'a', 1),
    ).toStrictEqual({ a: 1 });

    expect(
      findBy([{ a: 1 }, { a: 2, b: 3 }, { a: 2, b: 6, c: 6 }], 'a', 2),
    ).toStrictEqual({ a: 2, b: 3 });

    expect(
      findBy([{ a: 1 }, { a: 2, b: 3 }, { a: 2, b: 6, c: 6 }], 'b', 10),
    ).toBeUndefined();
  });

  it('sortBy：根据key排序对象', async () => {
    const items1 = [0, 1, 2];
    const items2 = [{ a: 1 }, { a: 2, b: 3 }, { a: 2, b: 6, c: 6 }];

    // 排序将产生新的数组
    expect(sortBy(items1, 'a') === items1).toBeFalsy();

    // 排序结果与新结果相同
    expect(sortBy(items1, 'a')).toStrictEqual(items1);

    expect(sortBy(items2, 'a')).toStrictEqual([
      { a: 1 },
      { a: 2, b: 3 },
      { a: 2, b: 6, c: 6 },
    ]);

    expect(sortBy(items2, 'b')).toStrictEqual([
      { a: 1 },
      { a: 2, b: 3 },
      { a: 2, b: 6, c: 6 },
    ]);

    expect(sortBy(items2, 'b', -1)).toStrictEqual([
      { a: 2, b: 6, c: 6 },
      { a: 2, b: 3 },
      { a: 1 },
    ]);

    expect(sortBy(items2, 'b', { sortOrder: -1 })).toStrictEqual([
      { a: 2, b: 6, c: 6 },
      { a: 2, b: 3 },
      { a: 1 },
    ]);
  });

  it('sortBy：根据key排序对象，复杂排序', async () => {
    const items2 = [{ a: 1 }, { a: 2, b: 3 }, { a: 2, b: 6, c: 6 }];

    expect(sortBy(items2, 'b', { defaultValue: 2 })).toStrictEqual([
      { a: 1 },
      { a: 2, b: 3 },
      { a: 2, b: 6, c: 6 },
    ]);

    expect(
      sortBy(items2, 'b', { sortOrder: 1, defaultValue: 5 }),
    ).toStrictEqual([{ a: 2, b: 3 }, { a: 1 }, { a: 2, b: 6, c: 6 }]);

    expect(
      sortBy(items2, 'b', { sortOrder: -1, defaultValue: 10 }),
    ).toStrictEqual([{ a: 1 }, { a: 2, b: 6, c: 6 }, { a: 2, b: 3 }]);
  });

  it('clone：克隆对象', async () => {
    expect(clone([1, 2])).toEqual([1, 2]);
    expect(clone({ a: 1, b: 1 })).toEqual({ a: 1, b: 1 });

    const obj1 = { a: 1, b: 1 };
    expect(clone(obj1) === obj1).toBeFalsy();

    const obj2 = { a: 1, b: 1, c: [{ c1: 1, c2: 2 }] };
    expect(clone(obj2)).toEqual(obj2);

    // 循环引用
    const obj3: any = { a: 1, b: 1, c: [{ c1: 1, c2: 2 }] };
    obj3.d = obj3;
    expect(clone(obj3).d).toEqual(obj3);

    // 日期类型
    const dt1 = new Date(2017, 1, 2);
    const dt2 = clone(dt1);

    expect(dt2).toEqual(dt1);
  });
});
