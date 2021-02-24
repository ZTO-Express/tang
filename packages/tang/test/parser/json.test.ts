import * as testUtil from '../util';
import { localLoader } from '../../src/loader';
import { jsonParser } from '../../src/parser';

describe('parser/json：json解析器', () => {
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
