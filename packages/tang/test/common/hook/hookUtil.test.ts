import { error } from '../../../src/common';
import * as hookUtil from '../../../src/common/hook/hookUtil';

describe('common/hookUtil：钩子实用函数', () => {
  it('无效钩子错误 throwInvalidHookError', async () => {
    expect(() => hookUtil.throwInvalidHookError('load')).toThrow(
      'hook load: 无效钩子函数',
    );

    expect(() => hookUtil.throwInvalidHookError('parse')).toThrowError({
      code: error.Errors.INVALID_HOOK,
      message: 'hook parse: 无效钩子函数',
    } as any);

    expect(() =>
      hookUtil.throwInvalidHookError('generate', {
        name: 'plugin-fs:hook:parse',
        pluginName: 'plugin-fs',
      }),
    ).toThrowError({
      code: error.Errors.INVALID_HOOK,
      message: 'hook generate: 无效钩子函数',
      hook: 'plugin-fs:hook:parse',
      plugin: 'plugin-fs',
    } as any);
  });

  it('钩子执行错误 throwHookError', async () => {
    expect(() => hookUtil.throwHookError('参数错误')).toThrow(
      '钩子执行错误：参数错误',
    );

    expect(() => hookUtil.throwHookError('参数错误', 'load')).toThrow({
      hook: 'load',
      code: error.Errors.HOOK_ERROR,
      message: '钩子执行错误：参数错误',
    } as any);

    expect(() =>
      hookUtil.throwHookError(
        {
          message: '参数错误',
          plugin: 'fsharing',
        },
        'load',
      ),
    ).toThrow({
      hook: 'load',
      code: error.Errors.HOOK_ERROR,
      message: '钩子执行错误：参数错误',
      plugin: 'fsharing',
    } as any);
  });
});
