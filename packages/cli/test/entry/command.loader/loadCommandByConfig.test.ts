import * as commander from 'commander';
import { CommandLoader } from '../../../src/entry';

describe('tang-cli/commands：command.loader命令加载器 loadCommandByConfig', () => {
  let program: commander.Command;

  const commandLoader = CommandLoader as any;

  const loadCommandByConfig = commandLoader.loadCommandByConfig;

  beforeEach(() => {
    program = commander.createCommand();
  });

  it('加载配置', async () => {
    const configCmdConfig = {
      name: 'config',
      args: '<key> <value>',
      aliases: ['cfg'],
      description: '操作Tang配置',
      argsDescription: {
        key: '配置key',
        value: '配置值',
      },
      options: [
        {
          flags: '-f --force',
          description: '强制设置',
          defaultValue: false,
          defaultValueDescription: '默认为false',
        },
        {
          flags: '--test <test>',
          required: true,
          hidden: true,
          choices: ['a', 'test', 'c'],
        },
      ],
      action(key: string, value: string, ...args: any[]) {
        return {
          key,
          value,
          opts: args[0],
          command: args[1],
        };
      },
    };

    expect(program.commands.length).toBe(0);

    loadCommandByConfig(program, configCmdConfig);

    expect(program.commands.length).toBe(1);

    const cmd = program.commands[0];
    const cmdAny = cmd as any;

    expect(cmdAny.parent).toBe(program);
    expect((program as any).parent).toBeNull();

    expect(cmd.name()).toBe('config');
    expect((cmd as any)._actionHandler).toBeInstanceOf(Function);
    expect(cmdAny._aliases).toEqual(configCmdConfig.aliases);

    expect(cmdAny._description).toBe(configCmdConfig.description);
    expect(cmdAny._argsDescription).toBe(configCmdConfig.argsDescription);

    const cmdOptions = cmdAny.options as commander.Option[];
    expect(cmdOptions.length).toBe(2);

    expect(cmdOptions[0].flags).toBe(configCmdConfig.options[0].flags);
    expect(cmdOptions[0].description).toBe(
      configCmdConfig.options[0].description,
    );
    expect(cmdOptions[0].defaultValue).toBe(
      configCmdConfig.options[0].defaultValue,
    );
    expect(cmdOptions[0].defaultValueDescription).toBe(
      configCmdConfig.options[0].defaultValueDescription,
    );
    expect(cmdOptions[0].defaultValueDescription).toBe(
      configCmdConfig.options[0].defaultValueDescription,
    );
    expect(cmdOptions[0].mandatory).toBe(false);
    expect(cmdOptions[0].required).toBe(false);
    expect(cmdOptions[0].hidden).toBe(false);

    expect(cmdOptions[1].required).toBe(true);
    expect(cmdOptions[1].mandatory).toBe(true);
    expect(cmdOptions[1].hidden).toBe(true);
    expect(cmdOptions[1].argChoices).toBe(configCmdConfig.options[1].choices);

    const rawArgs = [
      'tang',
      'config',
      'plugin.repository',
      'http://www.example.com',
      '-f',
      '--test',
      'test',
    ];

    await cmd.parseAsync(rawArgs);

    const opts = cmd.opts();
    expect(opts.force).toBe(true);
    expect(opts.test).toBe('test');

    expect(cmd.args).toEqual([rawArgs[2], rawArgs[3]]);
    expect(cmdAny.rawArgs).toEqual(rawArgs);

    // const _actionResult = (program as any)._actionResults[0];

    // expect(_actionResult.key).toBe(cmd.args[0]);
    // expect(_actionResult.value).toBe(cmd.args[1]);

    // expect(_actionResult.opts).toBe(opts);
    // expect(_actionResult.command).toBe(cmd);
  });

  it('加载配置 - 子命令', () => {
    const configCmdConfig = {
      name: 'config',
      commands: [
        {
          name: 'list',
          aliases: ['l', 'ls'],
          description: '列出所有配置',
        },
        {
          name: 'add', // 默认action为config.set
          args: '<key> <value>',
          aliases: ['a'],
          description: '新增配置，已存在则忽略',
          options: [
            {
              flags: '-f --force',
              defaultValue: false,
              defaultValueDescription: '默认为false',
            },
            {
              flags: '--test <test>',
              required: true,
              hidden: true,
              choices: ['a', 'test', 'c'],
            },
          ],
          action(key: string, value: string, ...args: any[]) {
            return {
              key,
              value,
              opts: args[0],
              command: args[1],
            };
          },
        },
      ],
    };

    expect(program.commands.length).toBe(0);

    loadCommandByConfig(program, configCmdConfig);

    expect(program.commands.length).toBe(1);

    const subCommandsCfg = configCmdConfig.commands;
    const subCommands = program.commands[0].commands;
    expect(subCommands.length).toBe(2);

    const cmd = program.commands[0];
    const cmdAny = cmd as any;

    const subCommand0 = program.commands[0].commands[0];
    const subCommand0Any = subCommand0 as any;

    const subCommand1 = program.commands[0].commands[1];
    const subCommand1Any = subCommand1 as any;

    expect(subCommand0.name()).toBe(subCommandsCfg[0].name);
    expect(subCommand0Any._aliases).toEqual(subCommandsCfg[0].aliases);
    expect(subCommand0Any._description).toBe(subCommandsCfg[0].description);

    expect(subCommand1Any._args).toEqual([
      { name: 'key', required: true, variadic: false },
      { name: 'value', required: true, variadic: false },
    ]);

    const rawArgs = [
      'tang',
      'config',
      'add',
      'user.name',
      'rayl',
      '-f',
      '--test=test',
    ];

    cmd.parse(rawArgs);

    const opts = cmd.opts();
    expect(opts).toEqual({});

    expect(cmd.args).toEqual(rawArgs.slice(2));
    expect(cmdAny.rawArgs).toEqual(rawArgs);

    expect(subCommand1.args).toEqual(rawArgs.slice(3, 5));
    expect(subCommand1Any.rawArgs).toBeNull();

    const subOpts1 = subCommand1.opts();
    expect(subOpts1.force).toBe(true);
    expect(subOpts1.test).toBe('test');

    // const _actionResult = (program as any)._actionResults[0];
    // expect(_actionResult.key).toBe(subCommand1.args[0]);
    // expect(_actionResult.value).toBe(subCommand1.args[1]);

    // expect(_actionResult.opts).toBe(subOpts1);
    // expect(_actionResult.command).toBe(subCommand1);
  });
});
