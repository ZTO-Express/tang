import { GenericConfigObject, TangProcessor } from '@devs-tang/common';
import * as devkit from '@devs-tang/devkit';
import { CliAction } from '../../common';

export class PresetAction extends CliAction {
  // 主命令 (获取当前)
  async main(name: string, options: GenericConfigObject) {
    return this.info(name, options);
  }

  // 查看插件预设信息
  async info(name: string, options: GenericConfigObject) {
    const launcher = await this.getLauncher();

    const preset = await launcher.getPreset(name);

    // 没有找到预设
    if (!preset) {
      const noExistsMsg = name
        ? `没有找到预设 ${name}`
        : '当前没有使用任何预设';

      console.log(noExistsMsg);
    }

    // 输出预设名称
    console.log(`预设名称：${preset.name}`);
  }

  /**
   * 设置指定预设为当前预设，并使用指定的预设选项
   * 如果options.default为true，则使用默认系统预设
   */
  async use(name: string, options: GenericConfigObject) {
    let presetOptions = options.options;

    if (options.outputDir) {
      presetOptions = devkit.utils.deepMerge(options.options, {
        outputOptions: {
          outputDir: options.outputDir,
        },
      });
    }

    const launcher = await this.getLauncher();
    const usedConfig = await launcher.presetManager.use(name, options);

    const usedPreset = launcher.getPreset(usedConfig.name);
  }

  /** 列出当前插件有所预设 */
  async list() {
    const launcher = await this.getLauncher();

    // 输出当前插件名称
    const preset = await launcher.presetManager.use();

    // 输出当前插件所有预设
  }

  /**
   * 设置当前预设配置
   * @param path 预设配置路径
   */
  async set(pathName: string, value: any) {}

  /**
   * 取消当前预设配置
   * @param path 预设配置路径
   */
  async unset(pathName: string) {}

  /**
   * 打印处理器信息
   * @param processor
   * @returns
   */
  printProcessorInfo(processor: TangProcessor) {
    if (!processor) return;

    if (processor.code) console.log(processor.code);

    console.log(`${processor.type}:${processor.name}`);
  }
}
