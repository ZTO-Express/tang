import * as errors from '../../src/errors';

describe('common/error：错误处理', () => {
  const errorCode = 'General_Error';
  const errorMessage = 'General Error';

  it('创建异常', () => {
    const generalError = new errors.TangError(errorMessage, errorCode);

    expect(generalError.getCode()).toBe(errorCode);
    expect(generalError.getBody()).toEqual(errorMessage);
    expect(generalError).toBeInstanceOf(Error);

    expect(generalError).toMatchObject({
      name: 'TangError',
      code: errorCode,
      message: errorMessage,
    });

    expect(() => {
      throw generalError;
    }).toThrowError(errorMessage);

    expect(
      new errors.TangError(
        {
          isTest: true,
          message: 'test_error',
        },
        errorCode,
      ),
    ).toMatchObject({
      name: 'TangError',
      code: errorCode,
      message: 'test_error',
      body: {
        isTest: true,
        message: 'test_error',
      },
    });

    expect(new errors.TangError([{ isTest: true }], errorCode)).toMatchObject({
      name: 'TangError',
      code: errorCode,
      body: [{ isTest: true }],
    });

    expect(new errors.TangError('test_message', errorCode)).toMatchObject({
      name: 'TangError',
      code: errorCode,
      message: 'test_message',
    });

    expect(new errors.TangError(undefined as any, errorCode)).toMatchObject({
      name: 'TangError',
      code: errorCode,
      message: 'Tang Error',
    });
  });

  it('initMessage', () => {
    const err = new errors.TangError(undefined, errorCode);
    err.message = 'test';
    err.initMessage();
    expect(err.message).toBe('Tang Error');

    const obj: any = {};
    obj.constructor = undefined;
    obj.message = 'test';
    err.initMessage.call(obj);
    expect(obj.message).toBe('test');

    const arr: any = [];
    arr.message = 'test';
    err.initMessage.call(arr);
    expect(arr.message).toBe('Array');

    const date: any = new Date();
    date.message = 'test';
    err.initMessage.call(date);
    expect(date.message).toBe('Date');
  });

  it('创建异常Body', () => {
    expect(
      errors.TangError.createBody(
        { isTest: true },
        'test_message',
        'General_Error',
      ),
    ).toEqual({
      isTest: true,
    });

    expect(
      errors.TangError.createBody(undefined, 'test_message', 'General_Error'),
    ).toEqual({
      code: 'General_Error',
      message: 'test_message',
    });

    expect(
      errors.TangError.createBody(
        'error_message',
        'test_message',
        'General_Error',
      ),
    ).toEqual({
      code: 'General_Error',
      message: 'error_message',
      error: 'test_message',
    });

    expect(errors.TangError.createBody([{ isTest: true }])).toEqual({
      code: undefined,
      error: undefined,
      message: [{ isTest: true }],
    });

    expect(errors.TangError.createBody('test_message')).toEqual({
      code: undefined,
      error: undefined,
      message: 'test_message',
    });
  });
});
