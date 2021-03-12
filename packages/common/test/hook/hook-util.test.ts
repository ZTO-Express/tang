import { ErrorCodes } from '../../src';
import * as hookUtil from '../../src/hook/hook-util';

describe('common/hookUtil：钩子实用函数', () => {
  it('无效钩子错误 throwInvalidHookError', async () => {
    expect(() => hookUtil.throwInvalidHookError('load')).toThrow(
      'hook load: 无效钩子函数',
    );

    await expect(async () =>
      hookUtil.throwInvalidHookError('parse'),
    ).rejects.toMatchObject({
      code: ErrorCodes.INVALID_HOOK,
      message: 'hook parse: 无效钩子函数',
    });

    await expect(async () =>
      hookUtil.throwInvalidHookError('parse', 'hook:parse'),
    ).rejects.toMatchObject({
      code: ErrorCodes.INVALID_HOOK,
      message: 'hook parse: 无效钩子函数',
      body: {
        message: 'hook parse: 无效钩子函数',
        hook: 'hook:parse',
      },
    } as any);

    await expect(async () =>
      hookUtil.throwInvalidHookError('generate', {
        name: 'plugin-fs:hook:parse',
      }),
    ).rejects.toMatchObject({
      code: ErrorCodes.INVALID_HOOK,
      message: 'hook generate: 无效钩子函数',
      body: {
        hook: 'plugin-fs:hook:parse',
      },
    } as any);
  });

  it('钩子执行错误 throwHookError', async () => {
    expect(() => hookUtil.throwHookError('参数错误')).toThrow(
      '钩子执行错误：参数错误',
    );

    await expect(async () =>
      hookUtil.throwHookError('参数错误', 'load'),
    ).rejects.toMatchObject({
      code: ErrorCodes.HOOK_ERROR,
      message: '钩子执行错误：参数错误',
      body: {
        hook: 'load',
      },
    });

    await expect(async () =>
      hookUtil.throwHookError(
        {
          message: '参数错误',
        } as any,
        'load',
      ),
    ).rejects.toMatchObject({
      code: ErrorCodes.HOOK_ERROR,
      message: '钩子执行错误：参数错误',
      body: {
        hook: 'load',
        message: '钩子执行错误：参数错误',
      },
    });

    await expect(async () =>
      hookUtil.throwHookError(
        {
          message: '参数错误',
        } as any,
        { name: 'load' },
      ),
    ).rejects.toMatchObject({
      code: ErrorCodes.HOOK_ERROR,
      message: '钩子执行错误：参数错误',
      body: {
        hook: 'load',
        message: '钩子执行错误：参数错误',
      },
    });
  });
});
