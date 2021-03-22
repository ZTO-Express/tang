import * as processors from '../../src/processors';

describe('parser/json：json解析器', () => {
  const jsonParser = processors.jsonParser();
  const presetText = JSON.stringify({
    name: 'test-name',
  });

  it('jsonParser parse方法', async () => {
    const presetData = await jsonParser.parse(presetText);
    expect(presetData.name).toBe('test-name');

    await expect(jsonParser.parse('xxxxx')).rejects.toThrowError(
      'Unexpected token',
    );
  });
});
