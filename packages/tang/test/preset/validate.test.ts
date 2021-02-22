import { PresetManager } from '../../src/preset';

describe('preset/PresetManager：Preset管理器', () => {
  let presetManager: PresetManager;

  beforeAll(() => {
    presetManager = new PresetManager({});
  });

  it('验证 preset格式', async () => {
    const result = await presetManager.validate({
      name: 'tang-test',
    });

    expect(result).toBe(true);
  });
});
