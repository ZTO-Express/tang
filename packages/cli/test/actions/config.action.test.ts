import { ConfigAction } from '../../src/actions';

describe('tang-cli/commands：config', () => {
  const configAction = new ConfigAction();

  it('config get', async () => {
    const list = await configAction.get('');
  });

  it('config set/unset', async () => {
    await configAction.set('user.name', 'rayl');
    let userName = await configAction.get('user.name');
    expect(userName).toBe('rayl');

    await configAction.unset('user.name');
    userName = await configAction.get('user.name');
    expect(userName).toBeUndefined();
  });
});
