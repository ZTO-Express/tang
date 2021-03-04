import * as chalk from 'chalk';
import { CommanderStatic } from 'commander';

import { InfoAction, UpdateAction, ConfigAction } from '../actions';

import { InfoCommand } from './info.command';
import { UpdateCommand } from './update.command';
import { ConfigCommand } from './config.command';

import { ERROR_PREFIX } from '../lib/ui';

export class CommandLoader {
  static load(program: CommanderStatic): void {
    new InfoCommand(new InfoAction()).load(program);
    new UpdateCommand(new UpdateAction()).load(program);
    new ConfigCommand(new ConfigAction()).load(program);

    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: CommanderStatic) {
    program.on('command:*', () => {
      console.error(
        `\n${ERROR_PREFIX} 无效命令: ${chalk.red('%s')}`,
        program.args.join(' '),
      );
      console.log(`使用 ${chalk.red('--help')} 查看有效命令\n`);
      process.exit(1);
    });
  }
}
