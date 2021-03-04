import { CommanderStatic } from 'commander';
import { AbstractAction } from '../actions';

export abstract class AbstractCommand {
  constructor(protected action: AbstractAction) {}

  abstract load(program: CommanderStatic): void;
}
