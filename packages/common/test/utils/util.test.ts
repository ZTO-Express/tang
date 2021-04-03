import {
  ensureArray,
  findBy,
  sortBy,
  deepClone,
  deepMerge,
  deepMerge2,
  get,
  set,
  pick,
  delay,
} from '../../src/utils';

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
    expect(findBy(undefined, 'x', 'y')).toBeUndefined();
    expect(findBy(null, 'x', 'y')).toBeUndefined();
    expect(findBy([], 'x', 'y')).toBeUndefined();

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
    const items2 = [{ a: 2, b: 3 }, { a: 1 }, { a: 2, b: 6, c: 6 }];

    expect(sortBy(undefined, 'a')).toEqual([]);
    expect(sortBy([], 'a')).toEqual([]);

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

    // 0也是默认顺序排列
    expect(sortBy(items2, 'b', { sortOrder: 0 })).toStrictEqual([
      { a: 1 },
      { a: 2, b: 3 },
      { a: 2, b: 6, c: 6 },
    ]);

    expect(sortBy(items2, 'b', { sortOrder: null })).toStrictEqual([
      { a: 1 },
      { a: 2, b: 3 },
      { a: 2, b: 6, c: 6 },
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

  it('deepClone：深度克隆对象', async () => {
    expect(deepClone(undefined)).toEqual(undefined);
    expect(deepClone(null)).toEqual(null);
    expect(deepClone(2)).toEqual(2);

    expect(deepClone([1, 2])).toEqual([1, 2]);
    expect(deepClone({ a: 1, b: 1 })).toEqual({ a: 1, b: 1 });

    const obj1 = { a: 1, b: 1 };
    expect(deepClone(obj1) === obj1).toBeFalsy();

    const obj2 = { a: 1, b: 1, c: [{ c1: 1, c2: 2 }] };
    expect(deepClone(obj2)).toEqual(obj2);

    // 循环引用
    const obj3: any = { a: 1, b: 1, c: [{ c1: 1, c2: 2 }] };
    obj3.d = obj3;
    expect(deepClone(obj3).d).toEqual(obj3);

    // 日期类型
    const dt1 = new Date(2017, 1, 2);
    const dt2 = deepClone(dt1);

    expect(dt2).toEqual(dt1);
  });

  it('deepMerge：深度Merge', async () => {
    const a = { a1: 'a.1' };
    const b = { b1: 'b.1' };

    const aa1: any = { a1: 'a.1', aa: { a11: 'a.1.1' } };
    const ab1 = { a1: 'a.1', b1: 'b.1' };

    expect(deepMerge(a, undefined)).toStrictEqual(a);
    expect(deepMerge(undefined, a)).toStrictEqual(a);

    expect(deepMerge(a, null)).toStrictEqual(a);
    expect(deepMerge(null, a)).toStrictEqual(a);

    expect(deepMerge(new Date(), a)).toStrictEqual(a);
    expect(deepMerge(new Function(), a)).toStrictEqual(a);
    expect(deepMerge(1, a)).toStrictEqual(a);
    expect(deepMerge(NaN, a)).toStrictEqual(a);
    expect(deepMerge({ a1: null }, a)).toStrictEqual(a);
    expect(deepMerge({ a1: undefined }, a)).toStrictEqual(a);

    expect(deepMerge(a, b)).not.toBe(a);
    expect(deepMerge(a, b)).toStrictEqual(ab1);
    expect(deepMerge({}, a, b)).toStrictEqual(ab1);

    const m1 = deepMerge(a, b, aa1);
    expect(m1).toStrictEqual(Object.assign({}, a, b, aa1));
    aa1['x-aa'] = 'x.aa';
    expect(m1).not.toStrictEqual(Object.assign({}, a, b, aa1));
  });

  it('deepMerge：深度Merge2', async () => {
    const d_aa1: any = {
      a1: 'a.1',
      aa: {
        a11: 'a.1.1',
        a12: 'a.1.2',
        aaa: { a111: 'a.1.1', a11x: 'a.1.x1' },
      },
    };

    const d_aa2: any = {
      a2: 'a.2',
      aa: {
        a11: 'a.1.1',
        a13: 'a.1.3',
        aaa: { a111: 'a.1.1', a112: 'a.1.2', a11x: 'a.1.x2' },
      },
    };

    const d_m1: any = deepMerge(d_aa1, d_aa2);
    expect(d_m1).toStrictEqual({
      a1: 'a.1',
      a2: 'a.2',
      aa: {
        a11: 'a.1.1',
        a12: 'a.1.2',
        a13: 'a.1.3',
        aaa: {
          a111: 'a.1.1',
          a112: 'a.1.2',
          a11x: 'a.1.x2',
        },
      },
    });
  });

  it('deepMerge2：深度Merge方法2', async () => {
    const data1 = { items: [{ name: 1 }, { name: 2 }] };
    const data2 = { items: [{ name: 1 }, { name: 3 }] };

    const options = {
      arrayMerge: (target: any, source: any, options: any) => [
        ...source,
        ...target,
      ],
    };

    const result: any = deepMerge2([data1.items, data2.items]);
    expect(result.length).toBe(4);
  });

  it('get 获取路径', async () => {
    const data1 = { items: [{ name: 1 }, { name: 2 }] };
    const data2 = { items: [{ name: 1 }, { name: 3 }] };

    expect(get(null, 'items[0].name.x', 'x')).toBe('x');
    expect(get(undefined, 'items[0].name.x', 'x')).toBe('x');

    expect(get(data1, 'items')).toBe(data1.items);
    expect(get(data1, 'items[0]')).toBe(data1.items[0]);
    expect(get(data1, 'items[0].name')).toBe(data1.items[0].name);
    expect(get(data1, 'items[0].name.x')).toBeUndefined();
    expect(get(data1, 'items[0].name.x', 'x')).toBe('x');
  });

  it('set 设置路径值', async () => {
    const data1 = { items: [{ name: 1 }, { name: 2 }] };
    const data2 = { items: [{ name: 1 }, { name: 3 }] };

    expect(set(null, 'a.b', 'x')).toBeNull();
    expect(set(undefined, 'a.b', 'x')).toBeUndefined();
    expect(set(1, 'a.b', 'x')).toBe(1);
    expect(set('1', 'a.b', 'x')).toBe('1');

    expect(get(set(data1, 'a.b', 'x'), 'a.b')).toBe('x');
    expect(get(set(data1, 'items[0].name', 'x'), 'items[0].name')).toBe('x');
    expect(get(set(data1, 'items[0].name.x', 'x'), 'items[0].name.x')).toBe(
      'x',
    );

    expect(get(set(data1, 'a.b', undefined), 'a.b')).toBeUndefined();
  });

  it('pick', () => {
    expect(
      pick(
        {
          name: 'David',
          first: 1,
          second: 2,
        },
        'first',
        'second',
      ),
    ).toEqual({
      first: 1,
      second: 2,
    });

    expect(
      pick(
        {
          name: 'David',
          first: 1,
        },
        'first',
        'second',
      ),
    ).toEqual({
      first: 1,
    });
  });

  it('delay 延时调试', async () => {
    await delay(() => {
      console.log('ok');
    });

    await delay(() => {
      console.log('ok');
    }, 10);

    const result = await delay(() => 'test');
    expect(result).toBe('test');

    const result2 = await delay(() => Promise.resolve('test2'));
    expect(result2).toBe('test2');

    await expect(() => {
      return delay(() => {
        throw new Error('test error');
      });
    }).rejects.toThrow('test error');
  });
});
