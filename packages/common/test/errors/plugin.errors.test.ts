import { ErrorCodes, TangError } from '../../src';
import * as errors from '../../src/errors';

describe('common/error：插件错误', () => {
  it('无效插件 Invalid Plugin Error', () => {
    expect(new errors.InvalidPluginError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_PLUGIN,
      message: 'Invalid Plugin',
    });

    expect(
      new errors.InvalidPluginError(
        { isTest: 'test', message: 'test message1' },
        'test message2',
      ),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_PLUGIN,
      message: 'test message1',
      body: {
        isTest: 'test',
        message: 'test message1',
      },
    });

    expect(
      new errors.InvalidPluginError('test message1', 'test message2'),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_PLUGIN,
      message: 'test message1',
      body: { code: ErrorCodes.INVALID_PLUGIN, message: 'test message1' },
    });

    expect(
      new errors.InvalidPluginError(undefined, 'test message2'),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_PLUGIN,
      message: 'test message2',
      body: { code: ErrorCodes.INVALID_PLUGIN, message: 'test message2' },
    });
  });

  it('插件执行错误 PluginError', () => {
    expect(new errors.PluginError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.PLUGIN_ERROR,
      message: 'Plugin Error',
      body: {
        code: ErrorCodes.PLUGIN_ERROR,
        message: 'Plugin Error',
      },
    });
  });

  it('插件钩子错误 PluginHookError', () => {
    expect(new errors.PluginHookError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.PLUGIN_HOOK_ERROR,
      message: 'Plugin Hook Error',
      body: {
        code: ErrorCodes.PLUGIN_HOOK_ERROR,
        message: 'Plugin Hook Error',
      },
    });
  });

  it('插件处理器错误 PluginProcessorError', () => {
    expect(new errors.PluginProcessorError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.PLUGIN_PROCESSOR_ERROR,
      message: 'Plugin Processor Error',
      body: {
        code: ErrorCodes.PLUGIN_PROCESSOR_ERROR,
        message: 'Plugin Processor Error',
      },
    });
  });
});
