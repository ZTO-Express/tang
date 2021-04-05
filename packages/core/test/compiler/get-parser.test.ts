import * as testUtil from '../util';
import { Compiler } from '../../src';

import * as processors from '../../src/processors';

describe('compiler/parser：获取解析器 getParser', () => {
  const mockCompilation = { entry: 'mock' };

  const jsonParser = processors.jsonParser();
  const yamlParser = testUtil.yamlParser();

  let compiler1: Compiler;
  let compiler2: Compiler;

  beforeAll(() => {
    compiler1 = testUtil.createDefaultCompiler({
      parsers: [jsonParser, yamlParser],
    });

    compiler2 = testUtil.createDefaultCompiler({
      defaultParser: 'yaml',
      parsers: [jsonParser, yamlParser],
    });
  });

  it('验证 getParser by name', async () => {
    const parser = compiler1.getParser(mockCompilation, { parser: 'yaml' });
    expect(parser).not.toBe(yamlParser);
    expect(parser.name).toBe(yamlParser.name);
    expect(parser.parse).toBe(yamlParser.parse);

    expect(
      compiler1.getParser(mockCompilation, { parser: 'xxx' }),
    ).toBeUndefined();
  });

  it('验证 getParser by instance', async () => {
    const parser = compiler1.getParser(mockCompilation, { parser: jsonParser });

    expect(parser).not.toBe(jsonParser);
    expect(parser.name).toBe(jsonParser.name);
    expect(parser.parse).toBe(jsonParser.parse);
  });

  it('验证 getParser by default', async () => {
    expect(compiler1.getParser(mockCompilation).name).toBe(jsonParser.name);
    expect(compiler2.getParser(mockCompilation).name).toBe(yamlParser.name);
  });

  it('验证 getParser Options', async () => {
    const parseOptions = {
      a1: 'a.1',
      aa: {
        a11: 'a.1.1',
        a12: 'a.1.2',
        aaa: { a111: 'a.1.1', a11x: 'a.1.x1' },
      },
    };

    const parseOptions2 = {
      a2: 'a.2',
      aa: {
        a11: 'a.1.1',
        a13: 'a.1.3',
        aaa: { a111: 'a.1.1', a112: 'a.1.2', a11x: 'a.1.x2' },
      },
    };

    const parser = compiler1.getParser(mockCompilation, {
      parseOptions,
    });

    expect(parser.parseOptions).not.toBe(parseOptions);
    expect(parser.parseOptions).toStrictEqual(parseOptions);

    const parser2 = compiler1.getParser(mockCompilation, {
      parser: parser,
      parseOptions: parseOptions2,
    });

    expect(parser2.parseOptions).toStrictEqual({
      a1: 'a.1',
      a2: 'a.2',
      aa: {
        a11: 'a.1.1',
        a12: 'a.1.2',
        a13: 'a.1.3',
        aaa: {
          a111: 'a.1.1',
          a112: 'a.1.2',
          a11x: 'a.1.x2',
        },
      },
    });
  });
});
