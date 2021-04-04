import * as testUtil from '../util';
import { TangLauncher } from '../../src';
import { TANG_CONFIG_KEY_PRESETS } from '../../src/consts';

describe('tang/launch/load：文档加载', () => {
  let launcher: TangLauncher;

  beforeEach(async () => {
    launcher = await TangLauncher.getInstance();
    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);
  });

  it('加载文档', async () => {
    const docPath = testUtil.resolveFixturePath('documents/openapi.yaml');

    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);

    await expect(launcher.load(docPath, 'nonExists')).resolves.toBeUndefined();

    let result = await launcher.load(docPath, undefined, {
      parser: 'yaml',
    });

    expect(result.document.entry).toBe(docPath);
    expect(result.document.model.openapi).toBe('3.0.0');

    const jsonDocPath = testUtil.resolveFixturePath('documents/preset.json');
    result = await launcher.load(jsonDocPath, {});
    expect(result.document.entry).toBe(jsonDocPath);
    expect(result.document.model.title).toMatch('文档生成');
  });
});
