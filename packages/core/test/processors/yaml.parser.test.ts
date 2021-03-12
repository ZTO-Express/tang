import * as testUtil from '../util';
import * as processors from '../../src';

describe('parser/yaml：yaml解析器', () => {
  const localLoader = testUtil.localLoader();
  const yamlParser = processors.yamlParser();

  const simpleText = 'simple text';
  let docText = '';

  beforeAll(async () => {
    const docPath = testUtil.resolveFixturePath('openapi.yaml');

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
