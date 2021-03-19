import * as testUtil from '../util';
import { TangLauncher } from '../../src';

describe('tang/plugin/install：安装插件', () => {
  const launcher = TangLauncher.getInstance();

  beforeAll(async () => {
    await testUtil.cleanTangLauncherTestEnv();
  });

  it('加载预设', async () => {
    // await launcher.preset();
  });
});
