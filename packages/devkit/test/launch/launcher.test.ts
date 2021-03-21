import * as testUtil from '../util';
import { TangLauncher } from '../../src';

describe('tang/plugin/install：安装插件', () => {
  beforeAll(async () => {
    await testUtil.cleanTangLauncherTestEnv();
  });

  it('初始化', async () => {
    const launcher = await TangLauncher.getInstance();
  });
});
