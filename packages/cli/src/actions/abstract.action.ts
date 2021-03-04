import { CommandInput, CommandOptions } from '../commands';

export type ActionOptions = {
  operation?: string;
  options?: CommandOptions;
  inputs?: CommandInput[];
  extraFlags?: string[];
};

export abstract class AbstractAction {
  abstract handle(options?: ActionOptions): Promise<void>;
}
