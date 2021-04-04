import * as testUtil from '../util';
import { TangCompilation, TangGenerator } from '@devs-tang/common';
import { Compiler, normalizeProcessor } from '../../src';
import * as processors from '../../src/processors';

describe('generator/json：json生成器', () => {
  let compiler: Compiler;
  let jsonGenerator: TangGenerator;

  let docCompilation: TangCompilation;

  beforeAll(async () => {
    compiler = testUtil.createDefaultCompiler();
    jsonGenerator = processors.jsonGenerator();

    const tfDocPath = testUtil.resolveFixturePath('openapi.yaml');

    docCompilation = await compiler.load(tfDocPath, {
      parser: 'yaml',
    });
  });

  it('jsonGenerator normalize方法', async () => {
    expect(
      normalizeProcessor(
        {
          name: 'json',
          generate: jsonGenerator.generate,
        },
        {
          type: 'generator',
          moduleType: 'core',
        },
      ),
    ).toEqual(jsonGenerator);
  });

  it('jsonGenerator generate方法', async () => {
    const generation = await jsonGenerator.generate(docCompilation.document);

    const chunk = generation.chunks[0];
    expect(chunk.content).toContain('openapi');
    expect(chunk.name).toBe('default.json');

    const contentData = JSON.parse(chunk.content.toString());

    expect(contentData).toStrictEqual(docCompilation.document.model);
  });
});
