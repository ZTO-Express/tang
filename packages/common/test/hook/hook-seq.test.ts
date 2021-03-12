import { HookContext, HookDriver } from '../../src';
import * as testUtil from '../util';

describe('common/HookDriver：钩子驱动顺序执行 hookSeq', () => {
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
  ];

  it('顺序执行钩子 hookSeq', async () => {
    const hookContext: any = {};
    const hooks = testUtil.deepClone(simpleLoadHooks) as any;
    const hookDriver = new HookDriver(hooks);

    await hookDriver.hookSeq('load', hookContext);
    expect(hookContext.test_load).toBe('simple_load2');

    await hookDriver.hookSeq('parse', hookContext);
    expect(hookContext.test_load).toBe('simple_parse1');
  });

  it('执行钩子 异常', async () => {
    const hookContext: any = {};
    const hooks = testUtil.deepClone(simpleLoadHooks);
    hooks.push({
      name: 'simple2:hook:parse',
      apply: () => {
        throw new Error('simple2_parse error');
      },
    });

    const hookDriver = new HookDriver(hooks);

    await hookDriver.hookSeq('load', hookContext);
    expect(hookContext.test_load).toBe('simple_load2');

    await expect(async () =>
      hookDriver.hookSeq('parse', hookContext),
    ).rejects.toThrow('simple2_parse error');

    hookDriver.hooks.unshift({
      name: 'simple3:hook:parse',
    });

    await expect(async () =>
      hookDriver.hookSeq('parse', hookContext),
    ).rejects.toThrow('hook parse: 无效钩子函数');
  });
});
