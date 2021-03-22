import * as commander from 'commander';
import { CommandLoader } from '../../../src/commands';

describe('tang-cli/commands：command.loader命令加载器 load', () => {
  const CommandLoaderAny = CommandLoader as any;

  let program: commander.Command;

  beforeEach(() => {
    program = commander.createCommand();
  });

  it('加载action方法', async () => {
    CommandLoader.load(program, false);

    expect(program.commands.length).toBe(CommandLoaderAny.commandsArr.length);

    const rawInfoArgs = ['node', 'tang', 'info'];

    await program.parseAsync(rawInfoArgs);

    expect(program.name()).toBe(rawInfoArgs[1]);
    expect(program.args).toEqual(rawInfoArgs.slice(2));
  });

  it('加载action short方法', async () => {
    CommandLoader.load(program, false);

    const rawInfoArgs = ['node', 'tang', 'i'];

    await program.parseAsync(rawInfoArgs);

    expect(program.name()).toBe(rawInfoArgs[1]);
    expect(program.args).toEqual(rawInfoArgs.slice(2));
  });

  it('加载action config 方法', async () => {
    CommandLoader.load(program, false);

    const rawInfoArgs = ['node', 'tang', 'config', 'user.name', 'rayl'];

    await program.parseAsync(rawInfoArgs);

    expect(program.name()).toBe(rawInfoArgs[1]);
    expect(program.args).toEqual(rawInfoArgs.slice(2));
  });
});
