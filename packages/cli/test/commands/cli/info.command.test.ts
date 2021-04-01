import * as commander from 'commander';
import { CommandLoader } from '../../../src/entry';

describe('tang-cli/commands：info', () => {
  const program = commander.createCommand();

  beforeAll(async () => {
    CommandLoader.load(program);
  });

  it('info', async () => {
    const rawInfoArgs = ['node', 'tang', 'info'];
    await program.parseAsync(rawInfoArgs);
  });
});
