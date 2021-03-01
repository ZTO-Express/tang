import { TangHookContext } from '../../../src/common/types';
import { HookDriver } from '../../../src/common';

describe('common/HookDriver：钩子驱动', () => {
  it('并行执行钩子 hookParallel', () => {
    const hookDriver = new HookDriver([
      {
        name: 'load',
        async apply(context: TangHookContext) {
          return;
        },
      },
    ]);
  });
});
