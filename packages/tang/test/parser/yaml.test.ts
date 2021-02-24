import * as testUtil from '../util';
import { localLoader } from '../../src/loader';
import { yamlParser } from '../../src/parser';

describe('parser/json：json解析器', () => {
  const simpleText = 'simple text';
  let docText = '';

  beforeAll(async () => {
    const docPath = testUtil.resolveFixturePath(
      'documents/task-flow/openapi.yaml',
    );

    docText = await localLoader.load(docPath);
  });

  it('yamlParser parse方法', async () => {
    const presetData = await yamlParser.parse(docText);
    expect(presetData.openapi).toBe('3.0.0');
  });

  it('yamlParser parse方法', async () => {
    const result = await yamlParser.parse(simpleText);
    expect(result).toBe(simpleText);
  });
});
