import { TangLauncher } from '../../../src';
import { MeshManager } from '../../../src/mesh';

describe('preset/PresetManager：preset格式验证 plugins', () => {
  let meshManager: MeshManager;
  let launcher: TangLauncher;

  beforeAll(async () => {
    launcher = await TangLauncher.getInstance();
    meshManager = new MeshManager(launcher);
  });

  it('plugins 应当为数组', async () => {
    await expect(
      meshManager.validate({
        name: 'tang-test',
        version: '0.1',
        plugins: [],
      }),
    ).resolves.toBeTruthy();
  });

  it('plugins 不应当为对象', async () => {
    await expect(
      meshManager.validate({
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
      meshManager.validate({
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
          ],
        },
      ],
    });
  });
});
