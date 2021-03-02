import { PresetManager } from '../../../src/lib/preset';

describe('preset/PresetManager：preset格式验证 plugins', () => {
  let presetManager: PresetManager;

  beforeAll(() => {
    presetManager = new PresetManager({});
  });

  it('plugins 应当为数组', async () => {
    await expect(
      presetManager.validate({
        name: 'tang-test',
        version: '0.1',
        plugins: [],
      }),
    ).resolves.toBeTruthy();
  });

  it('plugins 不应当为对象', async () => {
    await expect(
      presetManager.validate({
        name: 'tang-test',
        version: '0.1',
        plugins: {},
      }),
    ).rejects.toMatchObject({
      errors: [
        {
          dataPath: '.plugins',
          params: {
            type: 'array',
          },
        },
      ],
    });
  });

  it('plugin 配置必须包含名称和install', async () => {
    await expect(
      presetManager.validate({
        name: 'tang-test',
        version: '0.1',
        plugins: [{}],
      }),
    ).rejects.toMatchObject({
      errors: [
        {
          children: [
            {
              dataPath: '.plugins[0]',
              params: {
                missingProperty: 'name',
              },
            },
            {
              dataPath: '.plugins[0]',
              params: {
                missingProperty: 'install',
              },
            },
          ],
        },
      ],
    });
  });
});
