import { GenericConfigObject } from '@devs-tang/common';
import * as devkit from '@devs-tang/devkit';
import { CliAction } from '../common';

export class GenerateAction extends CliAction {
  async main(entry: string, options: GenericConfigObject) {
    console.log('generate');
    const launcher = await this.getLauncher();

    let opts: any = {};

    if (options.args) {
      opts = devkit.json5.parse(options.args);
    }

    if (options.outputDir) {
      devkit.utils.set(opts, 'outputOptions.outputDir', options.outputDir);
    }

    await launcher.generate(entry, options.perset as string, opts);
  }
}
