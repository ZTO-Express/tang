import { deepmergeAll as mergeAll } from '../../../src/utils/internal/deepmerge';

describe('utils/internal deepmerge：merge-all', () => {
  it('throw error if first argument is not an array', () => {
    expect(
      mergeAll.bind(
        null as any,
        { example: true } as any,
        { another: '2' } as any,
      ),
    ).toThrow();
  });

  it('return an empty object if first argument is an array with no elements', () => {
    expect(mergeAll([])).toEqual({});
  });

  it('Work just fine if first argument is an array with least than two elements', () => {
    const actual = mergeAll([{ example: true }]);
    const expected = { example: true };
    expect(actual).toEqual(expected);
  });

  it('execute correctly if options object were not passed', () => {
    const arrayToMerge = [{ example: true }, { another: '123' }];

    expect(mergeAll.bind(null, arrayToMerge)).toBeTruthy();
  });

  it('execute correctly if options object were passed', () => {
    const arrayToMerge = [{ example: true }, { another: '123' }];
    expect(mergeAll.bind(null, arrayToMerge, { clone: true })).toBeTruthy();
  });

  it('invoke merge on every item in array should result with all props', () => {
    const firstObject = { first: true };
    const secondObject = { second: false };
    const thirdObject = { third: 123 };
    const fourthObject = { fourth: 'some string' };

    const mergedObject = mergeAll([
      firstObject,
      secondObject,
      thirdObject,
      fourthObject,
    ]) as any;

    expect(mergedObject.first === true).toBeTruthy();
    expect(mergedObject.second === false).toBeTruthy();
    expect(mergedObject.third === 123).toBeTruthy();
    expect(mergedObject.fourth === 'some string').toBeTruthy();
  });

  it('invoke merge on every item in array with clone should clone all elements', () => {
    const firstObject = { a: { d: 123 } };
    const secondObject = { b: { e: true } };
    const thirdObject = { c: { f: 'string' } };

    const mergedWithClone: any = mergeAll(
      [firstObject, secondObject, thirdObject],
      {
        clone: true,
      },
    );

    expect(mergedWithClone.a).not.toBe(firstObject.a);
    expect(mergedWithClone.b).not.toBe(secondObject.b);
    expect(mergedWithClone.c).not.toBe(thirdObject.c);
  });

  it('invoke merge on every item in array clone=false should not clone all elements', () => {
    const firstObject = { a: { d: 123 } };
    const secondObject = { b: { e: true } };
    const thirdObject = { c: { f: 'string' } };

    const mergedWithoutClone: any = mergeAll(
      [firstObject, secondObject, thirdObject],
      { clone: false },
    );

    expect(mergedWithoutClone.a).toBe(firstObject.a);
    expect(mergedWithoutClone.b).toBe(secondObject.b);
    expect(mergedWithoutClone.c).toBe(thirdObject.c);
  });

  it('invoke merge on every item in array without clone should clone all elements', () => {
    const firstObject = { a: { d: 123 } };
    const secondObject = { b: { e: true } };
    const thirdObject = { c: { f: 'string' } };

    const mergedWithoutClone: any = mergeAll([
      firstObject,
      secondObject,
      thirdObject,
    ]);

    expect(mergedWithoutClone.a).not.toBe(firstObject.a);
    expect(mergedWithoutClone.b).not.toBe(secondObject.b);
    expect(mergedWithoutClone.c).not.toBe(thirdObject.c);
  });
});
