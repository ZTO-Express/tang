import * as testUtil from '../util';
import * as processors from '../../src/processors';

import { ProjectWorkspace } from '@devs-tang/devkit';

describe('YApi Loader', () => {
  const yapiLoader = processors.yapiLoader();

  it('初始化', async () => {
    expect(yapiLoader.name).toBe('yapi');
  });

  it('load', async () => {
    const document: any = { entry: '.' };
    const compilation: any = { entry: document.entry };

    await expect(
      yapiLoader.load(document, undefined, compilation, { isWorkspace: false }),
    ).rejects.toThrow('获取yapi服务地址错误');

    await expect(
      yapiLoader.load(
        document,
        {
          url: testUtil.testYapiUrl,
        },
        compilation,
        { isWorkspace: false },
      ),
    ).rejects.toThrow('获取yapi tokens错误');

    const workspace = await ProjectWorkspace.createInstance(undefined, {
      isWorkspace: true,
      options: {
        yapi: {
          url: testUtil.testYapiUrl,
          tokens: testUtil.testYapiToken,
        },
      },
    });

    await yapiLoader.load(document, {}, compilation, {
      isWorkspace: true,
      workspace,
    });

    expect(Array.isArray(document.content)).toBe(true);
  });

  it('load2', async () => {
    const document: any = { entry: '.' };
    const compilation: any = { entry: document.entry };

    await yapiLoader.load(
      document,
      {
        url: testUtil.testYapiUrl,
        tokens: [testUtil.testYapiToken],
      },
      compilation,
      {
        isWorkspace: false,
      },
    );

    expect(Array.isArray(document.content)).toBe(true);
    expect(Array.isArray(document.model)).toBe(true);
  });
});
