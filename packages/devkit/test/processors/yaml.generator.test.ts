import * as testUtil from '../util';
import { TangCompilation } from '@devs-tang/common';
import { Compiler, normalizeProcessor } from '@devs-tang/core';
import { yaml } from '../../src/utils';
import * as processors from '../../src/processors';

describe('generator/yaml：yaml生成器', () => {
  const compiler: Compiler = testUtil.createDefaultCompiler();
  const yamlGenerator = processors.yamlGenerator();

  let docCompilation: TangCompilation;

  beforeAll(async () => {
    const tfDocPath = testUtil.resolveFixturePath('documents/openapi.yaml');

    docCompilation = await compiler.load(tfDocPath, {
      parser: 'yaml',
    });
  });

  it('normalize方法', async () => {
    expect(
      normalizeProcessor(
        {
          name: 'yaml',
          generate: yamlGenerator.generate,
        },
        {
          type: 'generator',
          moduleType: 'devkit',
        },
      ),
    ).toEqual(yamlGenerator);
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
