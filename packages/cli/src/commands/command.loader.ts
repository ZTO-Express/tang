import * as chalk from 'chalk';
import * as commander from 'commander';
import { CliActionFn, CliCommand, CliCommandConfig } from '../common';

import { ERROR_PREFIX } from '../ui';

import * as actions from '../actions';

// import { UpdateCommand } from './update.command';
import { InfoCommand } from './info.command';
import { ConfigCommand } from './config.command';
import { PluginCommand } from './plugin.command';
import { GenerateCommand } from './generate.command';

export class CommandLoader {
  // 所有action字典
  private static actionsMap = {
    // update: new actions.UpdateAction(),
    info: new actions.InfoAction(),
    config: new actions.ConfigAction(),
    plugin: new actions.PluginAction(),
    generate: new actions.GenerateAction(),
  };

  // 所有命令字典
  private static commandsArr = [
    // new UpdateCommand(CommandLoader.actionsMap.update.main),
    new InfoCommand(CommandLoader.actionsMap.info.main),
    new ConfigCommand(),
    new PluginCommand(),
    new GenerateCommand(),
  ];

  static load(program: commander.Command, existWhenError = true): void {
    // TODO 添加钩子回调

    this.commandsArr.forEach(cmd => {
      // TODO 添加钩子回调
      this.loadCommand(program, cmd);
      // TODO 添加钩子回调
    });

    // TODO 添加钩子回调

    this.handleInvalidCommand(program, existWhenError);
  }

  private static handleInvalidCommand(
    program: commander.Command,
    existWhenError = true,
  ) {
    program.on('command:*', () => {
      console.error(
        `\n${ERROR_PREFIX} 无效命令: ${chalk.red('%s')}`,
        program.args.join(' '),
      );
      console.log(`使用 ${chalk.red('--help')} 查看有效命令\n`);

      if (existWhenError) process.exit(1);
    });
  }

  // 加载命令
  private static loadCommand(
    program: commander.Command,
    cliCommand: CliCommand,
  ) {
    // 先执行config中的内容
    if (cliCommand.config) {
      const cmdConfig = cliCommand.config();
      this.loadCommandByConfig(program, cmdConfig);
    }

    // 执行load
    if (cliCommand.load) {
      cliCommand.load(program);
    }
  }

  /**
   * 通过配置加载命令，不支持两级以上子命令
   * @param cfg 命令配置
   * @param program 根命令（commander.CommanderStatic）
   */
  private static loadCommandByConfig(
    program: commander.Command,
    cfg: CliCommandConfig,
  ) {
    const actionsMap = CommandLoader.actionsMap;

    let actionFn: CliActionFn | undefined = undefined;
    let actionNames: string[] = [];

    if (typeof cfg.action === 'function') {
      actionFn = cfg.action;
    } else if (typeof cfg.action === 'string') {
      // action为string，则直接获取路径
      actionNames = cfg.action.split('.');
    } else if (cfg.parent) {
      // 如果没有提供action名称，默认为父名称加载自己的名称作为action路径
      // 只支持两层路径
      actionNames = [cfg.parent.name, cfg.name];
    } else {
      actionNames = [cfg.name];
    }

    const baseAction = (actionsMap as any)[actionNames[0]];

    if (!actionFn && actionNames.length) {
      if (actionNames.length === 1) {
        actionFn = baseAction['main'];
      } else {
        actionFn = baseAction[actionNames[1]];
      }
    }

    // 如果此命令没有action则直接忽略
    if (!actionFn) return;

    const cmd: commander.Command = program.command(cfg.name);

    if (cfg.args) cmd.arguments(cfg.args);
    if (cfg.aliases && cfg.aliases.length) cmd.aliases(cfg.aliases);
    if (cfg.description) cmd.description(cfg.description, cfg.argsDescription);

    cfg.options?.forEach(it => {
      const opt = cmd.createOption(it.flags, it.description);
      opt.default(it.defaultValue, it.defaultValueDescription);

      if (it.required === true) opt.makeOptionMandatory();

      if (it.choices) opt.choices(it.choices);

      if (it.argParser) opt.argParser(it.argParser);

      if (it.hidden === true) opt.hideHelp();

      cmd.addOption(opt);
    });

    if (!baseAction) {
      cmd.action(actionFn);
    } else {
      cmd.action((...args: any[]) => {
        return actionFn?.call(baseAction, ...args, cmd);
      });
    }

    // 如果此配置有父命令则直接返回（不支持2级以上命令）
    if (cfg.parent) return;

    cfg.commands?.forEach(it => {
      it.parent = cfg;
      CommandLoader.loadCommandByConfig(cmd, it);
    });
  }
}
