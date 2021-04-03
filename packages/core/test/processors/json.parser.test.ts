import { normalizeProcessor } from '../../src';
import * as processors from '../../src/processors';

describe('parser/json：json解析器', () => {
  const jsonParser = processors.jsonParser();
  const presetText = JSON.stringify({
    name: 'test-name',
  });

  it('jsonParser normalize方法', async () => {
    expect(
      normalizeProcessor(
        {
          name: 'json',
          parse: jsonParser.parse,
        },
        {
          type: 'parser',
          moduleType: 'core',
        },
      ),
    ).toEqual(jsonParser);
  });

  it('jsonParser parse方法', async () => {
    const presetData = await jsonParser.parse(presetText);
    expect(presetData.name).toBe('test-name');

    await expect(jsonParser.parse('xxxxx')).rejects.toThrowError(
      'Unexpected token',
    );
  });
});
