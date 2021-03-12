import { ErrorCodes } from '../../src';
import * as errors from '../../src/errors';

describe('common/error：应用错误', () => {
  it('废弃错误 Deprecated Error', () => {
    expect(new errors.DeprecatedError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.DEPRECATED_FEATURE,
      message: 'Deprecated Error',
    });

    expect(
      new errors.DeprecatedError(
        { isTest: 'test', message: 'test message1' },
        'test message2',
      ),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.DEPRECATED_FEATURE,
      message: 'test message1',
      body: {
        isTest: 'test',
        message: 'test message1',
      },
    });

    expect(
      new errors.DeprecatedError('test message1', 'test message2'),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.DEPRECATED_FEATURE,
      message: 'test message1',
      body: { code: ErrorCodes.DEPRECATED_FEATURE, message: 'test message1' },
    });

    expect(
      new errors.DeprecatedError(undefined, 'test message2'),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.DEPRECATED_FEATURE,
      message: 'test message2',
      body: { code: ErrorCodes.DEPRECATED_FEATURE, message: 'test message2' },
    });
  });

  it('无效参数错误 Invalid Arguments Error', () => {
    expect(new errors.InvalidArguments()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.INVALID_ARGUMENTS,
      message: 'Invalid Arguments',
      body: {
        code: ErrorCodes.INVALID_ARGUMENTS,
        message: 'Invalid Arguments',
      },
    });
  });

  it('未实现错误 Not Implemented Error', () => {
    expect(new errors.NotImplementedError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.NOT_IMPLEMENTED,
      message: 'Not Implemented',
      body: {
        code: ErrorCodes.NOT_IMPLEMENTED,
        message: 'Not Implemented',
      },
    });
  });
});
