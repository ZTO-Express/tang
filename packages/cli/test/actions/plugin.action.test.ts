import { PluginAction } from '../../src/actions';

describe('tang-cli/actions：plugin', () => {
  const pluginAction = new PluginAction();

  it('plugin info', async () => {
    const plugin = await pluginAction.install('cowsay');

    if (plugin) {
      expect(plugin.name).toBe('cowsay');
    }
  });
});
