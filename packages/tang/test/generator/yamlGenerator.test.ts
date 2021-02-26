import * as testUtil from '../util';
import { yaml } from '../../src/utils';
import * as generator from '../../src/generator';
import { Compilation, Compiler } from '../../src/compiler';
import { TangDocumentGenerator } from 'src/common/types';

describe('generator/yaml：yaml生成器', () => {
  let compiler: Compiler;
  let yamlGenerator: TangDocumentGenerator;

  let docCompilation: Compilation;

  beforeAll(async () => {
    compiler = testUtil.createDefaultCompiler();
    yamlGenerator = generator.yamlGenerator();

    const tfDocPath = testUtil.resolveFixturePath(
      'documents/task-flow/openapi.yaml',
    );

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
