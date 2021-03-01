import { error, logging } from '../../src/common';

describe('common/logging：错误日志', () => {
  const originalConsoleError = console.error;
  let consoleText = '';

  const clearConsole = () => {
    consoleText = '';
  };

  beforeEach(() => {
    const _logging: any = logging;
    _logging.stderr = jest.fn((str: string) => {
      consoleText += str + '\r\n';
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('plugin错误', () => {
    logging.stderr('错误消息');
    expect(consoleText).toBe('错误消息\r\n');
    clearConsole();

    logging.handleError({
      name: 'unknown_error',
    } as any);

    expect(consoleText).toBe('[!] unknown_error: [object Object]\r\n\r\n');
    clearConsole();

    logging.handleError(error.errNotImplemented('功能未实现'));
    expect(consoleText).toMatch('功能未实现');
    clearConsole();

    logging.handleError(
      error.errInvalidArguments({
        name: 'invalid_arguments',
        plugin: 'fsharing',
        message: '无效参数',
      }),
    );

    expect(consoleText).toBe(
      '[!] (plugin fsharing) invalid_arguments: 无效参数\r\n\r\n',
    );
    clearConsole();

    logging.handleError({
      message: 'unknown_error',
      url: 'http://www.example.com',
      stack: 'stack text',
    });

    expect(consoleText).toBe(
      '[!] unknown_error\r\nhttp://www.example.com\r\nstack text\r\n\r\n',
    );
    clearConsole();
  });
});
