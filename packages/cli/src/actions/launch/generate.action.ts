import { GenericConfigObject } from '@devs-tang/common';
import { json5, utils } from '@devs-tang/devkit';
import { CliAction } from '../../common';
import { printData } from '../../utils';

export class GenerateAction extends CliAction {
  async main(entry: string, options: GenericConfigObject) {
    const launcher = await this.getLauncher();

    const opts: any = options || {};

    const {
      loadOptions,
      parseOptions,
      generateOptions,
      outputOptions,
      outputDir,
    } = opts;

    if (loadOptions && utils.isString(loadOptions))
      opts.loadOptions = json5.parse(loadOptions);

    if (parseOptions && utils.isString(parseOptions))
      opts.parseOptions = json5.parse(parseOptions);

    if (generateOptions && utils.isString(generateOptions))
      opts.generateOptions = json5.parse(generateOptions);

    if (outputOptions && utils.isString(outputOptions))
      opts.outputOptions = json5.parse(outputOptions);

    if (outputDir && utils.isString(outputDir)) {
      utils.set(opts, 'outputOptions.outputDir', outputDir);
    }

    if (opts.inspect) {
      const inspectData = await launcher.inspect(opts.preset, {
        entry,
        ...opts,
      });

      if (!inspectData) {
        console.log('当前没有任何预设！');
        return;
      }

      console.log('当前文件编译选项！');
      printData(inspectData);

      return inspectData;
    }

    return launcher.generate(entry, options.preset as string, opts);
  }
}
