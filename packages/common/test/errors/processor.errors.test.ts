import { ErrorCodes, TangError } from '../../src';
import * as errors from '../../src/errors';

describe('common/error：处理器错误', () => {
  it('无效插件 Processor Error', () => {
    expect(new errors.ProcessorError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.PROCESSOR_ERROR,
      message: 'Processor Error',
    });

    expect(
      new errors.ProcessorError(
        { isTest: 'test', message: 'test message1' },
        'test message2',
      ),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.PROCESSOR_ERROR,
      message: 'test message1',
      body: {
        isTest: 'test',
        message: 'test message1',
      },
    });

    expect(
      new errors.ProcessorError('test message1', 'test message2'),
    ).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.PROCESSOR_ERROR,
      message: 'test message1',
      body: { code: ErrorCodes.PROCESSOR_ERROR, message: 'test message1' },
    });

    expect(new errors.ProcessorError(undefined, 'test message2')).toMatchObject(
      {
        name: 'TangError',
        code: ErrorCodes.PROCESSOR_ERROR,
        message: 'test message2',
        body: { code: ErrorCodes.PROCESSOR_ERROR, message: 'test message2' },
      },
    );
  });

  it('加载器执行错误 LoaderError', () => {
    expect(new errors.LoaderError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.LOADER_ERROR,
      message: 'Loader Error',
      body: {
        code: ErrorCodes.LOADER_ERROR,
        message: 'Loader Error',
      },
    });
  });

  it('解析器执行错误 ParserError', () => {
    expect(new errors.ParserError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.PARSER_ERROR,
      message: 'Parser Error',
      body: {
        code: ErrorCodes.PARSER_ERROR,
        message: 'Parser Error',
      },
    });
  });

  it('生成器执行错误 GeneratorError', () => {
    expect(new errors.GeneratorError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.GENERATOR_ERROR,
      message: 'Generator Error',
      body: {
        code: ErrorCodes.GENERATOR_ERROR,
        message: 'Generator Error',
      },
    });
  });

  it('输出器执行错误 OutputerError', () => {
    expect(new errors.OutputerError()).toMatchObject({
      name: 'TangError',
      code: ErrorCodes.OUTPUTER_ERROR,
      message: 'Outputer Error',
      body: {
        code: ErrorCodes.OUTPUTER_ERROR,
        message: 'Outputer Error',
      },
    });
  });
});
