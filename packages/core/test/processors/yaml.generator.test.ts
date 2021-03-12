import * as testUtil from '../util';
import { yaml } from '../../src/utils';
import * as processors from '../../src/processors';
import { Compilation, Compiler } from '../../src/compiler';

describe('generator/yaml：yaml生成器', () => {
  const compiler: Compiler = testUtil.createDefaultCompiler();
  const yamlGenerator = processors.yamlGenerator();

  let docCompilation: Compilation;

  beforeAll(async () => {
    const tfDocPath = testUtil.resolveFixturePath('openapi.yaml');

    docCompilation = await compiler.load(tfDocPath, {
      parser: 'yaml',
    });
  });

  it('yamlGenerator generate方法', async () => {
    const generation = await yamlGenerator.generate(docCompilation.document);

    const chunk = generation.chunks[0];
    expect(chunk.content).toContain('openapi');
    expect(chunk.name).toBe('default.yaml');

    const contentData = yaml.load(chunk.content.toString());

    expect(contentData).toStrictEqual(docCompilation.document.model);
  });
});
