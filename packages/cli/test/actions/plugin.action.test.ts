import { PluginAction } from '../../src/actions';

describe('tang-cli/actions：plugin', () => {
  const pluginAction = new PluginAction();

  it('plugin info', async () => {
    await pluginAction.delete('cowsay');

    const plugin = await pluginAction.install('cowsay');
    expect(plugin && plugin.name).toBe('cowsay');
  });
});
