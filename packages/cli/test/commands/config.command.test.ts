import * as commander from 'commander';
import { CommandLoader } from '../../src/commands';

describe('@tang/cli/commands：command.loader命令加载器 loadCommandByConfig', () => {
  it('加载配置', async () => {
    const cmd: commander.Command = (CommandLoader as any).loadCommandByConfig(
      commander,
      {
        name: 'config',
      },
    );
  });
});
