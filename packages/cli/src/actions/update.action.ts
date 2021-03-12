import { TangDependencyManager, PackageManagerFactory } from '../package';
import { CliAction, CliActionOptions } from '../common';

export class UpdateAction extends CliAction {
  async main(options: CliActionOptions) {
    const commandOptions = options.options || {};

    const force = commandOptions.force as boolean;
    const tag = commandOptions.tag as string;

    const manager = new TangDependencyManager(
      await PackageManagerFactory.find(),
    );

    await manager.update(force, tag);
  }
}
