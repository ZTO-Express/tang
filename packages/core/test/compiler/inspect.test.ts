import * as testUtil from '../util';

import { DefaultTangCompiler } from '../../src';
import * as processors from '../../src/processors';

describe('compiler/insepct：测试服务器生成时完整配置', () => {
  const urlLoader = processors.urlLoader();
  const docLoader = testUtil.docLoader();

  const jsonParser = processors.jsonParser();
  const yamlParser = testUtil.yamlParser();

  let compiler1: DefaultTangCompiler;
  let compiler2: DefaultTangCompiler;

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
    const config = await compiler1.inspect({
      entry: tfDocPath,
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

  it('inspect 3', async () => {
    const inspectData = await compiler2.inspect({
      entry: tfDocPath,
      loader: 'nonExists',
      generator: 'core:generator:json',
    });

    expect(inspectData.loader).toBeUndefined();
    expect(inspectData.generator.code).toBe('core:generator:json');
  });
});
