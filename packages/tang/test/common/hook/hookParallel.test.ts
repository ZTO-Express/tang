import { HookDriver, util } from '../../../src/common';

describe('common/HookDriver：钩子驱动并行执行 hookParallel', () => {
  const simpleLoadHooks = [
    {
      name: 'simple_load1',
      trigger: ['load', 'parse'],
      apply: (context: TangHookContext) => {
        context.test_load = 'simple_load1';
      },
    },
    {
      name: 'simple_load2',
      trigger: ['load'],
      apply: async (context: TangHookContext) => {
        context.test_load = 'simple_load2';
      },
    },
    {
      name: 'simple_parse2',
      trigger: ['parse'],
      async apply(context: TangHookContext) {
        context.test_load = 'simple_parse2';
      },
    },
    {
      name: 'simple:hook:parse',
      priority: 20,
      apply: (context: TangHookContext) => {
        context.test_load = 'simple_parse1';
      },
    },
    {
      name: 'simple:hook:generated',
      apply(context: TangHookContext) {
        context.test_generated1 = 'test_generated1';
      },
    },
    {
      name: 'simple',
      trigger: ['generated'],
      async apply(context: TangHookContext) {
        context.test_generated2 = 'test_generated2';
      },
    },
  ];

  it('顺序执行钩子 hookSeq', async () => {
    const hookContext: any = {};
    const hooks = util.deepClone(simpleLoadHooks) as any;
    const hookDriver = new HookDriver(hooks);

    await hookDriver.hookParallel('generated', hookContext);
    expect(hookContext).toMatchObject({
      test_generated1: 'test_generated1',
      test_generated2: 'test_generated2',
    });

    hookDriver.hooks.unshift({
      name: 'simplex:hook:generated',
      apply: () => {
        debugger;
        throw new Error('simple2_parse error');
      },
    });

    await expect(() =>
      hookDriver.hookParallel('generated', hookContext),
    ).rejects.toThrow('simple2_parse error');
  });
});
