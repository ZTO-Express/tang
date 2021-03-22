import * as testUtil from '../util';
import { TangLauncher } from '../../src';

describe('tang/plugin/install：安装插件', () => {
  const tmpOutputDir = testUtil.resolveTmpDir();

  let launcher: TangLauncher;
  beforeAll(async () => {
    launcher = await TangLauncher.getInstance();
  });

  it('生成代码', async () => {
    const docUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.v1.json',
    );

    const result = await launcher.generate(docUrl, null, {
      outputOptions: {
        outputDir: tmpOutputDir,
      },
    });
  });
});
