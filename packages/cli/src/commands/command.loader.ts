import * as chalk from 'chalk';
import { CommanderStatic } from 'commander';

import { ERROR_PREFIX } from '../lib/ui';

export class CommandLoader {
  public static load(program: CommanderStatic): void {
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
