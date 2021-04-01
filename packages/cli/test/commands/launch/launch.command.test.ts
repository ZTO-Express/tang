import * as testUtil from '../../util';

import * as commander from 'commander';
import { CommandLoader } from '../../../src/entry';

describe('tang-cli/commands：launch', () => {
  const program = commander.createCommand();

  beforeAll(async () => {
    CommandLoader.load(program);
  });

  it('use', async () => {
    const rawInfoArgs = ['node', 'tang', 'use'];

    await program.parseAsync(rawInfoArgs);
  });
});
