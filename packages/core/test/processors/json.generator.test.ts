import * as testUtil from '../util';
import { TangGenerator } from '@devs-tang/common';
import { Compilation, Compiler } from '../../src';
import * as processors from '../../src/processors';

describe('generator/json：json生成器', () => {
  let compiler: Compiler;
  let jsonGenerator: TangGenerator;

  let docCompilation: Compilation;

  beforeAll(async () => {
    compiler = testUtil.createDefaultCompiler();
    jsonGenerator = processors.jsonGenerator();

    const tfDocPath = testUtil.resolveFixturePath('openapi.yaml');

    docCompilation = await compiler.load(tfDocPath, {
      parser: 'yaml',
    });
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
