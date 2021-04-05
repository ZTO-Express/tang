import { PluginAction, PresetAction } from '../../src/actions';

describe('tang-cli/actions：preset', () => {
  const pluginAction = new PluginAction();
  const presetAction = new PresetAction();

  beforeAll(async () => {
    await pluginAction.install('cowsay');
  });

  it('preset use / list', async () => {
    const result = await presetAction.use('cowsay', {});

    const listResult = await presetAction.list('');
  });
});
