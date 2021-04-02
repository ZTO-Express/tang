import * as testUtil from '../../util';

import * as commander from 'commander';
import { CommandLoader } from '../../../src/entry';

describe('tang-cli/commands：launch', () => {
  const program = commander.createCommand();

  beforeAll(async () => {
    CommandLoader.load(program);
  });

  it('install', async () => {
    const rawInfoArgs = ['node', 'tang', 'install', 'cowsay'];
    await program.parseAsync(rawInfoArgs);
  });

  it('use', async () => {
    const rawInfoArgs = ['node', 'tang', 'use', 'cowsay'];
    await program.parseAsync(rawInfoArgs);
  });
});
