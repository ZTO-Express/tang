import * as commander from 'commander';
import { CommandLoader } from '../../src/entry';

describe('tang-cli/commands：config', () => {
  const program = commander.createCommand();

  beforeAll(async () => {
    CommandLoader.load(program);
  });

  it('config list', async () => {
    const rawInfoArgs = ['node', 'tang', 'config', 'list'];

    await program.parseAsync(rawInfoArgs);
  });

  it('config set/unset', async () => {
    const rawInfoArgs1 = ['node', 'tang', 'config', 'user.name', 'rayl'];
    await program.parseAsync(rawInfoArgs1);

    const rawInfoArgs2 = ['node', 'tang', 'config', 'unset', 'user.name'];
    await program.parseAsync(rawInfoArgs2);
  });
});
