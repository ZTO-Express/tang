import { TangHookContext } from '../../../src/@types';
import { HookDriver } from '../../../src/common';

describe('common/HookDriver：钩子驱动 testHook & runHook', () => {
  it('判断钩子是否满足执行条件 testHook', () => {
    const hookDriver = new HookDriver([]) as any;
    const hookFn = () => {
      /** noop */
    };

    expect(hookDriver.testHook('load', undefined)).toBe(false);
    expect(hookDriver.testHook('load', null)).toBe(false);
    expect(hookDriver.testHook('load', 0 as any)).toBe(false);
    expect(hookDriver.testHook('load', '' as any)).toBe(false);

    expect(
      hookDriver.testHook('load', { trigger: 'parse', apply: hookFn }),
    ).toBe(false);
    expect(
      hookDriver.testHook('load', { trigger: 'load', apply: hookFn }),
    ).toBe(true);
    expect(hookDriver.testHook('load', { trigger: '*', apply: hookFn })).toBe(
      true,
    );
    expect(
      hookDriver.testHook('load', { trigger: ['load'], apply: hookFn }),
    ).toBe(true);
    expect(
      hookDriver.testHook('load', {
        trigger: ['load', 'parse'],
        apply: hookFn,
      }),
    ).toBe(true);
    expect(
      hookDriver.testHook('generate', {
        trigger: ['load', 'parse'],
        apply: hookFn,
      }),
    ).toBe(false);

    expect(
      hookDriver.testHook('load', {
        name: 'plugin-f:hook:load',
        apply: hookFn,
      }),
    ).toBe(true);

    expect(
      hookDriver.testHook('load', {
        name: 'plugin-f:hook:parse',
        apply: hookFn,
      }),
    ).toBe(false);
    expect(
      hookDriver.testHook('load', {
        name: 'plugin-f:hook:generate',
        apply: hookFn,
      }),
    ).toBe(false);

    expect(() => hookDriver.testHook('load', {})).toThrow(
      'hook load: 无效钩子函数',
    );
  });

  it('允许钩子函数 runHook', async () => {
    const hookDriver = new HookDriver([
      {
        name: 'simple_load1',
        trigger: ['load', 'parse'],
        apply: (context: TangHookContext) => {
          context.test_load = 'simple_load1';
          return 'good';
        },
      },
    ]) as any;

    await expect(hookDriver.runHook('generate', {}, undefined, 0)).toBe(
      undefined,
    );

    await expect(hookDriver.runHook('load', {}, null, 0)).resolves.toBe('good');
  });
});
