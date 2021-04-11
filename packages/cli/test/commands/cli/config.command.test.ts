import * as commander from 'commander';
import { CommandLoader } from '../../../src/entry';

describe('tang-cli/commands：config', () => {
  let program: commander.Command;

  beforeEach(async () => {
    program = commander.createCommand();
    CommandLoader.load(program);
  });

  it('config get/set/unset', async () => {
    let cmdResult: any = await program.parseAsync([
      'node',
      'tang',
      'config',
      'test',
      'test_0',
    ]);
    await expect(cmdResult._actionResults[0]).resolves.toBe('test_0');
    cmdResult._actionResults = [];

    cmdResult = await program.parseAsync(['node', 'tang', 'config', 'test']);
    await expect(cmdResult._actionResults[0]).resolves.toBe('test_0');
    cmdResult._actionResults = [];

    cmdResult = await program.parseAsync([
      'node',
      'tang',
      'config',
      'unset',
      'test',
    ]);
    await expect(cmdResult._actionResults[0]).resolves.toBe(undefined);
    cmdResult._actionResults = [];

    cmdResult = await program.parseAsync(['node', 'tang', 'config', 'test']);
    await expect(cmdResult._actionResults[0]).resolves.toBe(undefined);
    cmdResult._actionResults = [];
  });

  it('config list', async () => {
    const cmdResult: any = await program.parseAsync([
      'node',
      'tang',
      'config',
      'list',
    ]);
    const actionResult = await cmdResult._actionResults[0];
    cmdResult._actionResults = [];

    debugger;
  });

  it('config set/unset', async () => {
    const rawInfoArgs1 = ['node', 'tang', 'config', 'user.name', 'rayl'];
    await program.parseAsync(rawInfoArgs1);

    const rawInfoArgs2 = ['node', 'tang', 'config', 'unset', 'user.name'];
    await program.parseAsync(rawInfoArgs2);
  });
});
