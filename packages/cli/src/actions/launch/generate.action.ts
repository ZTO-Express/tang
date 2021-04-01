import { GenericConfigObject } from '@devs-tang/common';
import * as devkit from '@devs-tang/devkit';
import { CliAction } from '../../common';
import { printData } from '../../utils';

export class GenerateAction extends CliAction {
  async main(entry: string, options: GenericConfigObject) {
    const launcher = await this.getLauncher();

    const opts: any = options || {};

    if (opts.outputDir) {
      devkit.utils.set(opts, 'outputOptions.outputDir', options.outputDir);
    }

    if (opts.inspect) {
      const presetWithConfig = await launcher.getPresetWithConfigOptions(
        opts.preset,
      );

      const preset = presetWithConfig && presetWithConfig.preset;

      if (!preset) {
        console.log('当前没有任何预设！');
        return;
      }

      const inspectData = await launcher.inspect(preset.name, {
        entry,
        ...opts,
      });

      console.log('当前文件编译选项！');
      printData(inspectData);

      return inspectData;
    }

    return launcher.generate(entry, options.perset as string, opts);
  }
}
