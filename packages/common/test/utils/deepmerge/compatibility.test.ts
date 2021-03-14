import { deepmerge as merge } from '../../../src/utils/internal/deepmerge';

describe('utils/internal deepmerge：兼容性测试', () => {
  it('Without Object.getOwnPropertySymbols ', () => {
    const _getOwnPropertySymbols = Object.getOwnPropertySymbols;
    Object.getOwnPropertySymbols = undefined;

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

    const result = merge(target, source);

    Object.getOwnPropertySymbols = _getOwnPropertySymbols;

    expect(expected).toEqual(result);
  });
});
