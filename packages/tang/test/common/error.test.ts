import { error } from '../../src/common';

describe('common/error：错误处理', () => {
  it('未实现异常 errNotImplemented', () => {
    const errorData = error.errNotImplemented('未实现错误');

    expect(errorData.code).toBe(error.Errors.NOT_IMPLEMENTED);
    expect(errorData.message).toBe('未实现错误');
  });

  it('过期异常 errDeprecation', () => {
    const errorData = error.errDeprecation('过期错误');

    expect(errorData.code).toBe(error.Errors.DEPRECATED_FEATURE);
    expect(errorData.message).toBe('过期错误');
  });

  it('抛出异常 throwError', () => {
    expect(() => error.throwError('未知错误')).toThrowError('未知错误');
    expect(() =>
      error.throwError(error.errDeprecation('过期错误')),
    ).toThrowError('过期错误');
  });
});
