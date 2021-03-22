import * as commander from 'commander';
import { CommandLoader } from '../../src/commands';

describe('tang-cli/commands：config', () => {
  const program = commander.createCommand();

  beforeAll(async () => {
    CommandLoader.load(program);
  });

  it('config list', async () => {
    const rawInfoArgs = ['node', 'tang', 'config', 'list'];

    await program.parseAsync(rawInfoArgs);
  });
});
