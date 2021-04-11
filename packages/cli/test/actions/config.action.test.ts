import { ConfigAction } from '../../src/actions';

describe('tang-cli/actions：config', () => {
  const configAction = new ConfigAction();

  beforeAll(async () => {
    await configAction.set('test', 'test_0');
  });

  it('config main', async () => {
    let result = await configAction.main('test', '', {});
    expect(result).toBe('test_0');

    result = await configAction.main('test1', 'test_1', {});
    expect(result).toBe('test_1');

    result = await configAction.get('test1');
    expect(result).toBe('test_1');

    result = await configAction.main('', 'test_1', {});
    expect(result).toBeUndefined();
  });

  it('config set/unset', async () => {
    await expect(configAction.set('', 'badKey')).rejects.toThrow(
      '请提供配置路径',
    );
    await expect(configAction.set('badValue', '')).rejects.toThrow(
      '请提供配置值',
    );
    await expect(configAction.unset('')).rejects.toThrow('请提供配置路径');

    await configAction.set('user.name', 'rayl');
    let userName = await configAction.get('user.name');
    expect(userName).toBe('rayl');

    await configAction.unset('user.name');
    userName = await configAction.get('user.name');
    expect(userName).toBeUndefined();
  });
});
