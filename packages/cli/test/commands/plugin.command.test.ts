import * as commander from 'commander';
import { CommandLoader } from '../../src/commands';

describe('@tang/cli/commands：plugin', () => {
  const program = commander.createCommand();

  beforeAll(async () => {
    CommandLoader.load(program);
  });

  it('plugin list', async () => {
    const rawInfoArgs = ['node', 'tang', 'plugin', 'list'];
    await program.parseAsync(rawInfoArgs);
  });

  it('plugin install', async () => {
    const rawInfoArgs = ['node', 'tang', 'plugin', 'install', 'cowsay'];
    await program.parseAsync(rawInfoArgs);
  });

  it('plugin run', async () => {
    const rawInfoArgs = [
      'node',
      'tang',
      'plugin',
      'run',
      'cowsay',
      'say',
      '--args={text:"hello"}',
    ];
    await program.parseAsync(rawInfoArgs);
  });

  it('plugin delete', async () => {
    const rawInfoArgs = ['node', 'tang', 'plugin', 'delete', 'cowsay'];
    await program.parseAsync(rawInfoArgs);
  });
});
