import * as testUtil from '../util';
import { normalizeProcessor } from '@devs-tang/core';
import * as processors from '../../src';

describe('parser/yaml：yaml解析器', () => {
  const docLoader = processors.docLoader();
  const yamlParser = processors.yamlParser();

  const simpleText = 'simple text';
  let docText = '';

  beforeAll(async () => {
    const docPath = testUtil.resolveFixturePath('documents/openapi.yaml');

    docText = await docLoader.load<string>(docPath);
  });

  it('normalize方法', async () => {
    expect(
      normalizeProcessor(
        {
          name: 'yaml',
          parse: yamlParser.parse,
        },
        {
          type: 'parser',
          moduleType: 'devkit',
        },
      ),
    ).toEqual(yamlParser);
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
