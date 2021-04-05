import * as testUtil from '../util';
import { normalizeProcessor } from '@devs-tang/core';
import * as processors from '../../src/processors';

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
          moduleType: 'devkit',
        },
      ),
    ).toEqual(moduleLoader);
  });

  it('moduleLoader test方法', async () => {
    const loaderTest: any = moduleLoader.test;

    // 路径必须为绝对路径，并且存在
    expect(loaderTest({ entry: '../fixture/presets/' })).toBe(false);
    expect(loaderTest({ entry: 'http://www.example.org' })).toBe(false);
    expect(loaderTest({ entry: '/fixture/presets/' })).toBe(false);
    expect(loaderTest({ entry: '/fixture/presets/test.js' })).toBe(true);
    expect(loaderTest({ entry: '/fixture/presets/test.json' })).toBe(true);

    const yfMeshUrl = testUtil.resolveFixturePath('preset.js');
    expect(loaderTest({ entry: yfMeshUrl })).toBe(true);
  });

  it('moduleLoader load方法', async () => {
    const yfMeshUrl = testUtil.resolveFixturePath('documents/mesh.js');

    const document = await moduleLoader.load({ entry: yfMeshUrl });
    expect(document.content.name).toBe('tang-test-mesh');
  });

  it('moduleLoader load方法 文件不存在', async () => {
    await expect(() =>
      moduleLoader.load({ entry: 'https://www.baidu.com/xxx' }),
    ).rejects.toThrowError('Cannot find module');

    const yfMeshUrl = testUtil.resolveFixtureUrl('preset.json1');

    await expect(moduleLoader.load({ entry: yfMeshUrl })).rejects.toThrowError(
      'Cannot find module',
    );
  });
});
