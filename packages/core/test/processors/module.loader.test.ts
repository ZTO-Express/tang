import * as testUtil from '../util';
import * as processors from '../../src/processors';
import { normalizeProcessor } from '../../src';

describe('loader/module：module加载器', () => {
  const moduleLoader = processors.moduleLoader();

  it('moduleLoader normalize方法', async () => {
    expect(
      normalizeProcessor(
        {
          name: 'module',
          test: moduleLoader.test,
          load: moduleLoader.load,
        },
        {
          type: 'loader',
          moduleType: 'core',
        },
      ),
    ).toEqual(moduleLoader);
  });

  it('moduleLoader test方法', async () => {
    const loaderTest: any = moduleLoader.test;

    // 路径必须为绝对路径，并且存在
    expect(loaderTest('../fixture/presets/')).toBe(true);
    expect(loaderTest('http://www.example.org')).toBe(false);

    const yfMeshUrl = testUtil.resolveFixturePath('preset.js');
    expect(loaderTest(yfMeshUrl)).toBe(true);
  });

  it('urlLoader load方法', async () => {
    const yfMeshUrl = testUtil.resolveFixturePath('mesh.js');

    const data: any = await moduleLoader.load(yfMeshUrl);
    expect(data.name).toBe('tang-test-mesh');
  });

  it('urlLoader load方法 文件不存在', async () => {
    await expect(() =>
      moduleLoader.load('https://www.baidu.com/xxx'),
    ).rejects.toThrowError('Cannot find module');

    const yfMeshUrl = testUtil.resolveFixtureUrl('preset.json1');

    await expect(moduleLoader.load(yfMeshUrl)).rejects.toThrowError(
      'Cannot find module',
    );
  });
});
