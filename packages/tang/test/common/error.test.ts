import { error } from '../../src/common';

describe('common/error：错误处理', () => {
  it('抛出异常 throwError', () => {
    expect(() => error.throwError('未知错误')).toThrowError('未知错误');
    expect(() =>
      error.throwError(error.errDeprecation('过期错误')),
    ).toThrowError('过期错误');

    expect(() => error.throwError(new Error('未知错误'))).toThrowError(
      '未知错误',
    );
  });

  it('未实现异常 errInvalidArguments', () => {
    expect(error.errInvalidArguments('参数错误')).toMatchObject({
      code: error.Errors.INVALID_ARGUMENTS,
      message: '参数错误',
    });

    expect(
      error.errInvalidArguments({
        message: '参数错误2',
        chunkName: 'default.vue',
      }),
    ).toMatchObject({
      code: error.Errors.INVALID_ARGUMENTS,
      message: '参数错误2',
      chunkName: 'default.vue',
    });
  });

  it('未实现异常 errNotImplemented', () => {
    expect(error.errNotImplemented('未实现错误')).toMatchObject({
      code: error.Errors.NOT_IMPLEMENTED,
      message: '未实现错误',
    });

    expect(
      error.errNotImplemented({
        message: '未实现错误2',
        chunkName: 'default.vue',
      }),
    ).toMatchObject({
      code: error.Errors.NOT_IMPLEMENTED,
      message: '未实现错误2',
      chunkName: 'default.vue',
    });
  });

  it('过期异常 errDeprecation', () => {
    expect(error.errDeprecation('废弃功能1')).toMatchObject({
      code: error.Errors.DEPRECATED_FEATURE,
      message: '废弃功能1',
    });

    expect(
      error.errDeprecation({
        message: '废弃功能2',
        chunkName: 'default.vue',
      }),
    ).toMatchObject({
      code: error.Errors.DEPRECATED_FEATURE,
      message: '废弃功能2',
      chunkName: 'default.vue',
    });
  });
});
