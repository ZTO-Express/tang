import * as testUtil from '../util';
import { ErrorCodes } from '@devs-tang/common';

import { Compiler } from '../../src';
import * as processors from '../../src/processors';

describe('compiler/insepct：测试服务器生成时完整配置', () => {
  const urlLoader = processors.urlLoader();
  const docLoader = testUtil.docLoader();

  const jsonParser = processors.jsonParser();
  const yamlParser = testUtil.yamlParser();

  let compiler1: Compiler;
  let compiler2: Compiler;

  const tfDocPath = testUtil.resolveFixturePath('openapi.yaml');

  beforeAll(() => {
    compiler1 = testUtil.createDefaultCompiler({
      loaders: [urlLoader, docLoader],
      parsers: [jsonParser, yamlParser],
    });

    compiler2 = testUtil.createDefaultCompiler({
      defaultParser: 'yaml',
      defaultGenerator: 'yaml',
      loaders: [urlLoader, docLoader],
      parsers: [jsonParser, yamlParser],
    });
  });

  it('inspect 1', async () => {
    const config = await compiler1.inspect(tfDocPath, {
      parser: 'yaml',
      outputOptions: {
        outputDir: 'test',
      },
    });

    expect(config.loader.name).toBe(docLoader.name);
    expect(config.parser.name).toBe('yaml');
    expect(config.generator.name).toBe('yaml');
    expect(config.outputer.name).toBe('local');
    expect(config.outputer.outputOptions).toEqual({
      outputDir: 'test',
    });
  });

  it('inspect 2', async () => {
    const config = await compiler2.inspect(tfDocPath);

    expect(config.parser).toStrictEqual(yamlParser);
  });
});
