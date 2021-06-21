import { metadata } from '../src';

describe('index：默认测试方法', () => {
  it('metadata', async () => {
    const meta = metadata();

    expect(meta.description).toMatch('yapi插件');
  });
});
