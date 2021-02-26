import * as testUtil from '../util';

import { Compiler } from '../../src/compiler';

import * as loader from '../../src/loader';
import * as parser from '../../src/parser';

describe('compiler/load：load 加载', () => {
  const urlLoader = loader.urlLoader();
  const localLoader = loader.localLoader();

  const jsonParser = parser.jsonParser();
  const yamlParser = parser.yamlParser();

  let compiler1: Compiler;
  let compiler2: Compiler;

  const tfDocPath = testUtil.resolveFixturePath(
    'documents/task-flow/openapi.yaml',
  );

  beforeAll(() => {
    compiler1 = testUtil.createDefaultCompiler({
      loaders: [urlLoader, localLoader],
      parsers: [jsonParser, yamlParser],
    });

    compiler2 = testUtil.createDefaultCompiler({
      defaultParser: 'yaml',
      loaders: [urlLoader, localLoader],
      parsers: [jsonParser, yamlParser],
    });
  });

  it('验证 load by name', async () => {
    const compilation = await compiler1.load(tfDocPath, { parser: 'yaml' });

    expect(compilation.compiler).toBe(compiler1);
    expect(compilation.loader).not.toBe(localLoader);
    expect(compilation.loader).toStrictEqual(localLoader);
    expect(compilation.parser).not.toBe(yamlParser);
    expect(compilation.parser).toStrictEqual(yamlParser);
    expect(compilation.document.entry).toBe(tfDocPath);
    expect(compilation.document.model.openapi).toBe('3.0.0');
  });

  it('验证 load by default', async () => {
    const compilation = await compiler2.load(tfDocPath);

    expect(compilation.compiler).toBe(compiler2);
    expect(compilation.parser).not.toBe(yamlParser);
    expect(compilation.parser).toStrictEqual(yamlParser);
  });
});
