import { HookContext, HookDriver } from '../../src';
import * as testUtil from '../util';

describe('common/HookDriver：钩子驱动并行执行 hookParallel', () => {
  const simpleLoadHooks = [
    {
      name: 'simple_load1',
      trigger: ['load', 'parse'],
      apply: (context: HookContext) => {
        context.test_load = 'simple_load1';
      },
    },
    {
      name: 'simple_load2',
      trigger: ['load'],
      apply: async (context: HookContext) => {
        context.test_load = 'simple_load2';
      },
    },
    {
      name: 'simple_parse2',
      trigger: ['parse'],
      async apply(context: HookContext) {
        context.test_load = 'simple_parse2';
      },
    },
    {
      name: 'simple:hook:parse',
      priority: 20,
      apply: (context: HookContext) => {
        context.test_load = 'simple_parse1';
      },
    },
    {
      name: 'simple:hook:generated',
      apply(context: HookContext) {
        context.test_generated1 = 'test_generated1';
      },
    },
    {
      name: 'simple',
      trigger: ['generated'],
      async apply(context: HookContext) {
        context.test_generated2 = 'test_generated2';
      },
    },
  ];

  it('并行执行钩子 hookParallel', async () => {
    const hookContext: any = {};
    const hooks = testUtil.deepClone(simpleLoadHooks) as any;
    const hookDriver = new HookDriver(hooks);

    await hookDriver.hookParallel('generated', hookContext);
    expect(hookContext).toMatchObject({
      test_generated1: 'test_generated1',
      test_generated2: 'test_generated2',
    });

    hookDriver.hooks.unshift({
      name: 'simplex:hook:generated',
      apply: () => {
        throw new Error('simple2_parse error');
      },
    });

    await expect(() =>
      hookDriver.hookParallel('generated', hookContext),
    ).rejects.toThrow('simple2_parse error');
  });
});
