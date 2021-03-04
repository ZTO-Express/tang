import { TangDependencyManager, PackageManagerFactory } from '../lib/package';
import { AbstractAction, ActionOptions } from './abstract.action';

export class UpdateAction extends AbstractAction {
  async handle(options: ActionOptions) {
    const commandOptions = options.options || {};

    const force = commandOptions.force as boolean;
    const tag = commandOptions.tag as string;

    const manager = new TangDependencyManager(
      await PackageManagerFactory.find(),
    );

    await manager.update(force, tag);
  }
}
