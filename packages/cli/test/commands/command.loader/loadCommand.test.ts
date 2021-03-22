import * as commander from 'commander';
import { CommandLoader } from '../../../src/commands';

describe('tang-cli/commands：command.loader命令加载器 loadCommand', () => {
  let program: commander.Command;

  const commandLoader = CommandLoader as any;

  const loadCommand = commandLoader.loadCommand;

  beforeEach(() => {
    program = commander.createCommand();
  });

  it('加载action方法', () => {
    let actionResult: any;

    const configCmdConfig = {
      name: 'config',
      args: '<key> <value>',
      aliases: ['cfg'],
      description: '操作Tang配置',
      options: [
        {
          flags: '-f --force',
          description: '操作Tang配置',
          defaultValue: false,
        },
        {
          flags: '--test <test>',
          hidden: true,
          choices: ['a', 'test', 'c'],
        },
      ],
      action(key: string, value: string, ...args: any[]) {
        actionResult = {
          key,
          value,
          opts: args[0],
          command: args[1],
        };
      },
    };

    expect(program.commands.length).toBe(0);

    loadCommand(program, {
      load(program: commander.Command) {
        return program
          .command(configCmdConfig.name)
          .aliases(configCmdConfig.aliases)
          .description(configCmdConfig.description)
          .arguments(configCmdConfig.args)
          .option(
            configCmdConfig.options[0].flags,
            configCmdConfig.options[0].description,
            configCmdConfig.options[0].defaultValue,
          )
          .requiredOption(
            configCmdConfig.options[1].flags,
            configCmdConfig.options[1].description,
            configCmdConfig.options[1].defaultValue,
          )
          .action(configCmdConfig.action);
      },
    });

    expect(program.commands.length).toBe(1);

    const cmd = program.commands[0];
    const cmdAny = cmd as any;

    expect(cmdAny.parent).toBe(program);
    expect((program as any).parent).toBeNull();

    expect(cmd.name()).toBe('config');
    expect((cmd as any)._actionHandler).toBeInstanceOf(Function);
    expect(cmdAny._aliases).toEqual(configCmdConfig.aliases);

    expect(cmdAny._description).toBe(configCmdConfig.description);

    const cmdOptions = cmdAny.options as commander.Option[];
    expect(cmdOptions.length).toBe(2);

    expect(cmdOptions[0].flags).toBe(configCmdConfig.options[0].flags);
    expect(cmdOptions[0].description).toBe(
      configCmdConfig.options[0].description,
    );
    expect(cmdOptions[0].defaultValue).toBe(
      configCmdConfig.options[0].defaultValue,
    );
    expect(cmdOptions[0].mandatory).toBe(false);
    expect(cmdOptions[0].required).toBe(false);
    expect(cmdOptions[0].hidden).toBe(false);

    expect(cmdOptions[1].required).toBe(true);
    expect(cmdOptions[1].mandatory).toBe(true);

    const rawArgs = [
      'tang',
      'config',
      'plugin.repository',
      'http://www.example.com',
      '-f',
      '--test',
      'test',
    ];

    cmd.parse(rawArgs);

    const opts = cmd.opts();
    expect(opts.force).toBe(true);
    expect(opts.test).toBe('test');

    expect(cmd.args).toEqual([rawArgs[2], rawArgs[3]]);
    expect(cmdAny.rawArgs).toEqual(rawArgs);

    const _actionResult = actionResult;

    expect(_actionResult.key).toBe(cmd.args[0]);
    expect(_actionResult.value).toBe(cmd.args[1]);

    expect(_actionResult.opts).toBe(opts);
    expect(_actionResult.command).toBe(cmd);
  });
});
