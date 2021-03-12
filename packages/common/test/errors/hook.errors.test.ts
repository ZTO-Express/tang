import { ErrorCodes, TangError } from '../../src';
import * as errors from '../../src/errors';

describe('common/error：钩子错误', () => {
  it('无效钩子 Invalid Hook Error', () => {
    expect(new errors.InvalidHookError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_HOOK,
      message: 'Invalid Hook',
    });

    expect(
      new errors.InvalidHookError(
        { isTest: 'test', message: 'test message1' },
        'test message2',
      ),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_HOOK,
      message: 'test message1',
      body: {
        isTest: 'test',
        message: 'test message1',
      },
    });

    expect(
      new errors.InvalidHookError('test message1', 'test message2'),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_HOOK,
      message: 'test message1',
      body: { code: ErrorCodes.INVALID_HOOK, message: 'test message1' },
    });

    expect(
      new errors.InvalidHookError(undefined, 'test message2'),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_HOOK,
      message: 'test message2',
      body: { code: ErrorCodes.INVALID_HOOK, message: 'test message2' },
    });
  });

  it('钩子执行错误 HookError', () => {
    expect(new errors.HookError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.HOOK_ERROR,
      message: 'Hook Error',
      body: {
        code: ErrorCodes.HOOK_ERROR,
        message: 'Hook Error',
      },
    });
  });
});
