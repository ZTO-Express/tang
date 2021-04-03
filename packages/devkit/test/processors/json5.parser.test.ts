import { normalizeProcessor } from '@devs-tang/core';
import * as processors from '../../src/processors';

describe('parser/json5：json5解析器', () => {
  const json5Parser = processors.json5Parser();
  const presetText = JSON.stringify({
    name: 'test-name',
  });

  it('normalize方法', async () => {
    expect(
      normalizeProcessor(
        {
          name: 'json5',
          parse: json5Parser.parse,
        },
        {
          type: 'parser',
          moduleType: 'devkit',
        },
      ),
    ).toEqual(json5Parser);
  });

  it('json5Parser parse方法', async () => {
    const presetData = await json5Parser.parse(presetText);
    expect(presetData.name).toBe('test-name');
  });

  it('docLoader parse方法', async () => {
    await expect(json5Parser.parse('xxxxx')).rejects.toThrowError(
      'JSON5: invalid character',
    );
  });
});
