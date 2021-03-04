import * as testUtil from '../util';
import * as loader from '../../src/loader';
import * as parser from '../../src/parser';

describe('parser/json：json解析器', () => {
  const localLoader = loader.localLoader();
  const jsonParser = parser.jsonParser();

  let presetText = '';

  beforeAll(async () => {
    const yfPresetPath = testUtil.resolveFixturePath(
      'presets/yapi-fsharing/preset.json',
    );

    presetText = await localLoader.load(yfPresetPath);
  });

  it('jsonParser parse方法', async () => {
    const presetData = await jsonParser.parse(presetText);
    expect(presetData.name).toBe('@tang/yapi-sharing');
  });

  it('localLoader parse方法', async () => {
    await expect(jsonParser.parse('xxxxx')).rejects.toThrowError(/invalid/i);
  });
});
