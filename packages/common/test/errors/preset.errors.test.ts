import { ErrorCodes, TangError } from '../../src';
import * as errors from '../../src/errors';

describe('common/error：插件错误', () => {
  it('无效插件 Invalid Preset Error', () => {
    expect(new errors.InvalidPresetError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_PRESET,
      message: 'Invalid Preset',
    });

    expect(
      new errors.InvalidPresetError(
        { isTest: 'test', message: 'test message1' },
        'test message2',
      ),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_PRESET,
      message: 'test message1',
      body: {
        isTest: 'test',
        message: 'test message1',
      },
    });

    expect(
      new errors.InvalidPresetError('test message1', 'test message2'),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_PRESET,
      message: 'test message1',
      body: { code: ErrorCodes.INVALID_PRESET, message: 'test message1' },
    });

    expect(
      new errors.InvalidPresetError(undefined, 'test message2'),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_PRESET,
      message: 'test message2',
      body: { code: ErrorCodes.INVALID_PRESET, message: 'test message2' },
    });
  });

  it('插件执行错误 PresetError', () => {
    expect(new errors.PresetError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.PRESET_ERROR,
      message: 'Preset Error',
      body: {
        code: ErrorCodes.PRESET_ERROR,
        message: 'Preset Error',
      },
    });
  });
});
