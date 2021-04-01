import { utils } from '@devs-tang/common';
import * as chalk from 'chalk';
import * as commander from 'commander';
import {
  CliAction,
  CliActionFn,
  CliCommand,
  CliCommandConfig,
} from '../common';

import { ERROR_PREFIX } from '../ui';

import { getCliCommandActions } from './command.actions';

export class CommandLoader {
  static load(program: commander.Command, existWhenError = true): void {
    const { commandActions, commandsArr } = getCliCommandActions();

    // TODO 添加钩子回调

    commandsArr.forEach(cmd => {
      // TODO 添加钩子回调
      this.loadCommand(program, cmd, commandActions);
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
    actionsMap: Record<string, CliAction> = {},
  ) {
    // 先执行config中的内容
    if (cliCommand.config) {
      const cmdConfig = cliCommand.config();
      this.loadCommandByConfig(program, cmdConfig, actionsMap);
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
    actionsMap: Record<string, CliAction> = {},
  ) {
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

    if (!actionFn && baseAction && actionNames.length) {
      if (actionNames.length === 1) {
        actionFn = baseAction['main'];
      } else {
        actionFn = baseAction[actionNames[1]];
      }
    }

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

    // 如果此命令没有action则直接忽略
    if (actionFn) {
      cmd.action(async (...args: any[]) => {
        const actionFnAny = actionFn as any;

        try {
          const result = await Promise.resolve().then(() => {
            return actionFnAny.call(baseAction || undefined, ...args, cmd);
          });
          return result;
        } catch (err) {
          console.log(chalk.red(err.message));

          throw err;
        }
      });
    }

    // 如果此配置有父命令则直接返回（不支持2级以上命令）
    if (cfg.parent) return;

    cfg.commands?.forEach(it => {
      it.parent = cfg;
      CommandLoader.loadCommandByConfig(cmd, it, actionsMap);
    });
  }
}
