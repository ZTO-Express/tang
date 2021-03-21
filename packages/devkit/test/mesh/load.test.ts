import * as testUtil from '../util';
import { TangLauncher } from '../../src';
import { MeshManager } from '../../src/mesh';

// 预设文件格式：
// plugin:@tang/test@0.0.1:test-cowsay@0.0.1
// @tang/test@0.0.1:test-cowsay@0.0.1
// plugin:@tang/test@0.0.1
// plugin:@tang/test
// test-cowsay@0.0.1
// test-cowsay

describe('tang/mesh/load：加载预设', () => {
  let meshManager: MeshManager;
  let launcher: TangLauncher;

  beforeAll(async () => {
    launcher = await TangLauncher.getInstance();
    meshManager = new MeshManager(launcher);

    await testUtil.cleanTangLauncherTestEnv();

    // 删除所有test-tang预设
    await meshManager.deleteAll('test-tang');
  });

  it('从本地目录加载mesh', async () => {
    const meshFile = testUtil.resolveFixturePath('meshs/cowsay/mesh.json');
    await meshManager.load(meshFile, { force: true });

    const result = await launcher.pluginManager.run('cowsay@1.4.0', 'say', {
      text: 'hello',
    });

    expect(result).toContain('hello');
  });
});
