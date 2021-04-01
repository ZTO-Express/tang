import { GenericConfigObject, TangPlugin } from '@devs-tang/common';
import { getPresetConfigData } from '@devs-tang/core';
import * as devkit from '@devs-tang/devkit';
import { CliAction } from '../../common';
import { printData } from '../../utils';

export class PresetAction extends CliAction {
  // 主命令 (获取当前)
  async main(name: string, options: GenericConfigObject) {
    return this.info(name, options);
  }

  // 查看插件预设信息
  async info(name: string, options: GenericConfigObject) {
    const launcher = await this.getLauncher();

    const presetWithConfig = await launcher.getPresetWithConfigOptions(name);

    // 没有找到预设
    if (!presetWithConfig || !presetWithConfig.preset) {
      const noExistsMsg = name
        ? `没有找到预设 ${name}`
        : '当前没有使用任何预设';

      console.log(noExistsMsg);

      return;
    }

    const preset = presetWithConfig.preset;

    const presetConfigData = getPresetConfigData(preset);

    const presetInfo = {
      name: presetWithConfig.name,
      use: presetWithConfig.use,
      preset: presetConfigData,
      options: presetWithConfig.options,
    };

    // 输出预设名称
    console.log(`预设名称：${preset.name}`);

    printData(presetInfo, options);
  }

  /**
   * 设置指定预设为当前预设，并使用指定的预设选项
   * 如果options.default为true，则使用默认系统预设
   */
  async use(name: string, options: GenericConfigObject) {
    let presetOptions = options.options;

    if (presetOptions && presetOptions.outputDir) {
      presetOptions = devkit.utils.deepMerge(options.options, {
        outputOptions: {
          outputDir: presetOptions.outputDir,
        },
      });
    }

    const launcher = await this.getLauncher();
    const usedConfig = await launcher.presetManager.use(name, options);

    if (!usedConfig) {
      const noExistsMsg = name
        ? `没有找到预设 ${name}`
        : '当前没有使用任何预设';

      console.log(noExistsMsg);

      return;
    }

    printData(usedConfig, options);
  }

  /** 列出当前插件有所预设 */
  async list(name: string) {
    const launcher = await this.getLauncher();

    // 输出当前插件名称
    const plugin: TangPlugin = await launcher.getPlugin(name);

    // 没有找到预设
    if (!plugin) {
      const noExistsMsg = name
        ? `没有找到插件 ${name}`
        : '当前没有正在使用的插件，请执行tang use <pluginName>使用插件';

      console.log(noExistsMsg);

      return;
    }

    if (!plugin.preset && !plugin.presets?.length) {
      console.log(`当前插件 ${plugin.name} 不包含任何预设`);
      return;
    }

    if (plugin.preset) {
      console.log(`默认预设：${plugin.preset.name}`);
    }

    // 输出当前插件所有预设
    if (plugin.presets) {
      console.log(`所有预设预设：`);
      const presetNames = plugin.presets.map(it => it.name);

      console.log(presetNames.join());
    }
  }

  /**
   * 设置当前预设配置
   * @param path 预设配置路径
   */
  async options(key: string, value: any, options: GenericConfigObject) {
    const launcher = await this.getLauncher();

    let usedConfig = await launcher.presetManager.getUsedConfig();

    if (!usedConfig || !usedConfig.name) {
      console.log('当暂未使用任何预设');
      return;
    }

    const pathName = key ? `options.${key}` : 'options';

    if (options.unset) {
      launcher.presetManager.unsetConfig(usedConfig.name, pathName);
      await launcher.presetManager.saveConfig();
    } else if (key && value) {
      launcher.presetManager.setConfig(usedConfig.name, pathName, value);
      await launcher.presetManager.saveConfig();
      console.log('设置成功');
    }

    usedConfig = launcher.presetManager.getUsedConfig();

    console.log(`当前预设 ${usedConfig.name}`);

    if (!usedConfig.options) {
      console.log('暂无任何配置');
    } else {
      printData(usedConfig.options);
    }
  }
}
