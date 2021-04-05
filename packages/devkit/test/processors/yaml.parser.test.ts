import * as testUtil from '../util';
import { normalizeProcessor } from '@devs-tang/core';
import * as processors from '../../src';

describe('parser/yaml：yaml解析器', () => {
  const docPath = testUtil.resolveFixturePath('documents/openapi.yaml');

  const docLoader = processors.docLoader();
  const yamlParser = processors.yamlParser();

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
    const testDocument = await docLoader.load({ entry: docPath });
    const document = await yamlParser.parse(testDocument);
    expect(document.model.openapi).toBe('3.0.0');
  });

  it('yamlParser parse方法', async () => {
    const simpleDocument = { entry: 'simple', content: 'simple text' };

    const document = await yamlParser.parse(simpleDocument);
    expect(document.model).toEqual(simpleDocument.content);
  });
});
