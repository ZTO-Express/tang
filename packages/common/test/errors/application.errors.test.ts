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

  it('目标已存在错误 Already Exists Error', () => {
    expect(new errors.AlreadyExistsError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.ALREADY_EXISTS,
      message: 'Already Exists',
      body: {
        code: ErrorCodes.ALREADY_EXISTS,
        message: 'Already Exists',
      },
    });
  });

  it('目标未找到错误 Not Found Error', () => {
    expect(new errors.NotFoundError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.NOT_FOUND,
      message: 'Not Found',
      body: {
        code: ErrorCodes.NOT_FOUND,
        message: 'Not Found',
      },
    });
  });

  it('方法或命令执行错误 Execute Failed Error', () => {
    expect(new errors.ExecuteFailedError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.EXECUTE_FAILED,
      message: 'Execute Failed',
      body: {
        code: ErrorCodes.EXECUTE_FAILED,
        message: 'Execute Failed',
      },
    });
  });
});
