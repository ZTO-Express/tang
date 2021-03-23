import * as commander from 'commander';
import { CliActionFn, CliCommand } from '../../common';

export class InfoCommand implements CliCommand {
  constructor(private readonly actionFn: CliActionFn) {}

  load(program: commander.Command) {
    return program
      .command('info')
      .alias('i')
      .description('Display Tang details.')
      .action(this.actionFn);
  }
}
