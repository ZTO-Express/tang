import * as testUtil from '../util';
import * as generator from '../../src/generator';
import { Compilation, Compiler } from '../../src/compiler';
import { TangDocumentGenerator } from 'src/common/types';

describe('generator/json：json生成器', () => {
  let compiler: Compiler;
  let jsonGenerator: TangDocumentGenerator;

  let docCompilation: Compilation;

  beforeAll(async () => {
    compiler = testUtil.createDefaultCompiler();
    jsonGenerator = generator.jsonGenerator();

    const tfDocPath = testUtil.resolveFixturePath(
      'documents/task-flow/openapi.yaml',
    );

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
