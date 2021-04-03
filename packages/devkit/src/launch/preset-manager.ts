import {
  InvalidArguments,
  InvalidPluginError,
  TangModuleTypeNames,
  TangModuleTypes,
  TangPreset,
  TangModuleTypeKeys,
  utils,
} from '@devs-tang/common';
import { CompilerProcessOptions } from '@devs-tang/core';
import { TANG_PRESET_DEFAULT, TANG_CONFIG_KEY_PRESETS } from '../consts';

import { TangLauncher } from './launcher';
import { mergePresetAndOptions } from './options';

/** 预设名称信息 */
export interface PresetNameInfo {
  name: string;
  fullName: string;
  moduleType: TangModuleTypeNames;
  pluginName?: string;
}

/** 预设配置数据 */
export interface PresetConfigData {
  use?: boolean;
  options?: CompilerProcessOptions;
  [prop: string]: any;
}

/** 预设配置数据 */
export interface PresetConfigDataWithName extends PresetConfigData {
  name: string;
}

/** 预设及配置数据 */
export interface PresetWithConfigData extends PresetConfigDataWithName {
  preset: TangPreset;
}

/** 加载器预设 */
export class PresetManager {
  constructor(private readonly launcher: TangLauncher) {}

  /**
   * 加载或获取指定的预设
   * @param name name为空则返回当前的预设配置
   * @param options options为undefined时获取指定的预设
   * @returns
   */
  async use(
    name?: string,
    options?: CompilerProcessOptions,
  ): Promise<PresetWithConfigData> {
    // 若未提供名称，则返回正在使用的配置
    if (!name) {
      return this.getUsedPresetWithConfig();
    }

    const nameInfo = this.parsePresetName(name);
    if (!nameInfo) throw new InvalidArguments(`无效名称 ${name}`);

    const normalizedName = nameInfo.fullName;

    // 检查插件是否存在，不存在则执行安装操作
    if (nameInfo.pluginName) {
      const existsPlugin = await this.launcher.pluginManager.exists(
        nameInfo.pluginName,
      );

      if (!existsPlugin) {
        throw new InvalidArguments(`未找到插件 ${nameInfo.pluginName}`);
      }
    }

    let presetWithConfig = await this.getPresetWithConfigByName(normalizedName);

    if (!presetWithConfig && nameInfo.pluginName) {
      if (nameInfo.pluginName) {
        throw new InvalidArguments(
          `插件 ${nameInfo.pluginName} 不包含任何预设`,
        );
      } else {
        throw new InvalidArguments(`无效预设名称 ${name}`);
      }
    }

    // 设置目标配置
    if (options !== undefined)
      this.setConfig(normalizedName, undefined, options);

    // 设置当前正在使用的配置
    this.setUsedConfig(normalizedName);

    await this.saveConfig();

    presetWithConfig = await this.getUsedPresetWithConfig();

    return presetWithConfig;
  }

  /**
   * 获取正在使用的预设
   * @returns
   */
  async getUsedPresetWithConfig(): Promise<PresetWithConfigData> {
    const config = await this.getUsedConfig();
    if (!config) return undefined;

    if (this.isDefault(config.name)) {
      const preset = this.getDefaultPreset();
      return { ...config, preset };
    }

    const presetWithConfig = await this.getPresetWithConfigByName(config.name);
    return presetWithConfig;
  }

  /** 获取正在使用的插件及预设配置 */
  async getPresetWithConfigByName(name: string): Promise<PresetWithConfigData> {
    const config = await this.getConfigByName(name);
    if (!config) return undefined;

    if (this.isDefault(config.name)) {
      const preset = this.getDefaultPreset();
      return { ...config, preset };
    }

    const nameInfo = this.parsePresetName(config.name);
    if (!nameInfo || !nameInfo.pluginName) return undefined;

    const rawPreset = await this.launcher.pluginManager.getPreset(
      nameInfo.pluginName,
      nameInfo.name,
    );

    if (!rawPreset) return undefined;

    const rawPresetOptions = rawPreset.presetOptions || {};
    const rawPresetData = utils.omit(rawPreset, ['presetOptions']);

    const presetWithConfig: PresetWithConfigData = {
      ...config,
      preset: undefined,
    };

    if (rawPresetOptions.mergeDefaultPreset === false) {
      presetWithConfig.preset = rawPresetData;
    } else {
      presetWithConfig.preset = mergePresetAndOptions(
        rawPresetData,
      ) as TangPreset;
    }

    return presetWithConfig;
  }

  /**
   * 获取默认预设选项
   * @param config
   * @returns
   */
  getDefaultPreset(): TangPreset {
    const preset = mergePresetAndOptions({
      name: TANG_PRESET_DEFAULT,
    }) as TangPreset;

    return preset;
  }

  /** 设置当前正在使用的配置 */
  setUsedConfig(name: string) {
    const nameInfo = this.parsePresetName(name);
    if (!nameInfo) return;

    this.unsetUsedConfig();
    this.setConfig(nameInfo.fullName, 'use', true);
  }

  /** 取消当前默认配置 */
  unsetUsedConfig() {
    const config = this.getUsedConfig();
    this.unsetConfig(config.name, 'use');
  }

  /** 获取正在使用的插件名 */
  getUsedPluginName() {
    const config = this.getUsedConfig();
    if (!config || !config.name) return undefined;

    const nameInfo = this.parsePresetName(config.name);
    return nameInfo && nameInfo.pluginName;
  }

  /** 获取当前正在使用的预设，如果没有正在使用的预设，则返回默认预设 */
  getUsedConfig(): PresetConfigDataWithName {
    const allConfigs = this.getAllConfigs();

    let usedPresetName = Object.keys(allConfigs).find(
      name => allConfigs[name] && allConfigs[name].use,
    );

    usedPresetName = usedPresetName || TANG_PRESET_DEFAULT;

    const config = this.getConfigByName(usedPresetName);
    return config;
  }

  /** 根据名称获取预设 */
  getConfigByName(name: string): PresetConfigDataWithName {
    const nameInfo = this.parsePresetName(name);
    if (!nameInfo) return undefined;

    const fullName = nameInfo.fullName;

    const allConfigs = this.getAllConfigs();
    let options = allConfigs[fullName];

    if (!options) return { name: fullName };

    const use = options.use;
    options = utils.omit(options, 'use');

    return {
      name: fullName,
      use,
      moduleType: nameInfo.moduleType,
      processOptions: options as CompilerProcessOptions,
    };
  }

  /**
   * 获取指定的预设配置
   * @param presetName
   * @param pathName
   * @returns
   */
  getConfig(presetName: string, pathName?: string) {
    const config = this.getConfigByName(presetName);
    if (!config || !config.processOptions) return undefined;

    if (!pathName) return config.processOptions;

    const pathConfig = utils.get(config.processOptions, pathName);
    return pathConfig;
  }

  /** 获取所有预设 */
  getAllConfigs(): Record<string, PresetConfigData> {
    const configData =
      this.launcher.configManager.get(TANG_CONFIG_KEY_PRESETS) || {};

    if (!configData[TANG_PRESET_DEFAULT]) {
      configData[TANG_PRESET_DEFAULT] = {};
    }

    return configData;
  }

  /**
   * 获取所有或指定插件所有预设
   * @param pluginName
   * @returns
   */
  getAllConfigNames(prefix?: string) {
    const presetsData =
      this.launcher.configManager.get(TANG_CONFIG_KEY_PRESETS) || {};

    const names = Object.keys(presetsData);

    if (!prefix) return names;

    return names.filter(it => it.startsWith(prefix));
  }

  /**
   * 设置指定的预设配置
   * @param presetName
   * @param pathName
   * @param options
   * @returns
   */
  setConfig(presetName: string, pathName: string, options?: any) {
    const launchPath = this.getPresetsConfigPath(presetName, pathName);
    if (!launchPath) return undefined;

    return this.launcher.configManager.set(launchPath, options);
  }

  /** 取消指定预设 */
  unsetConfig(presetName: string, pathName?: string) {
    const launchPath = this.getPresetsConfigPath(presetName, pathName);
    if (!launchPath) return undefined;

    return this.launcher.configManager.unset(launchPath);
  }

  /** 保存当前预设 */
  saveConfig() {
    return this.launcher.configManager.save();
  }

  /** 获取预设的设置路径 */
  getPresetsConfigPath(name: string, pathName?: string) {
    const nameInfo = this.parsePresetName(name);
    if (!nameInfo) return undefined;

    let launchPath = `${TANG_CONFIG_KEY_PRESETS}.${nameInfo.fullName}`;
    if (pathName) launchPath += `.${pathName}`;

    return launchPath;
  }

  /**
   * 解析预设名称
   * @param presetName
   */
  parsePresetName(presetName: string): PresetNameInfo {
    if (!presetName) return undefined;

    if (this.isDefault(presetName)) {
      return {
        name: TANG_PRESET_DEFAULT,
        fullName: TANG_PRESET_DEFAULT,
        moduleType: TangModuleTypes.devkit,
      };
    }

    let nameInfo: any = undefined;

    const parts = presetName.split(':');

    if (parts[0] === TangModuleTypes.plugin) {
      const name = parts[2] || TANG_PRESET_DEFAULT;
      const pluginName = parts[1];

      nameInfo = {
        moduleType: TangModuleTypes.plugin,
        pluginName,
        name,
        fullName: `${TangModuleTypes.plugin}:${pluginName}:${name}`,
      };
    } else if (parts.length === 2) {
      if (TangModuleTypeKeys.includes(parts[0])) {
        nameInfo = {
          moduleType: parts[0],
          name: parts[1],
          fullName: presetName,
        };
      } else {
        const name = parts[1] || TANG_PRESET_DEFAULT;
        const pluginName = parts[0];
        nameInfo = {
          moduleType: TangModuleTypes.plugin,
          pluginName,
          name,
          fullName: `${TangModuleTypes.plugin}:${pluginName}:${name}`,
        };
      }
    } else if (parts.length === 1) {
      const name = TANG_PRESET_DEFAULT;
      const pluginName = parts[0];

      nameInfo = {
        moduleType: TangModuleTypes.plugin,
        pluginName,
        name,
        fullName: `${TangModuleTypes.plugin}:${pluginName}:${name}`,
      };
    }

    if (!nameInfo || !nameInfo.name)
      throw new InvalidPluginError(`无效预设名称${presetName}`);

    if (nameInfo.moduleType === TangModuleTypes.plugin && !nameInfo.pluginName)
      throw new InvalidPluginError(`插件名称不能为空`);

    return nameInfo;
  }

  /** 是否默认预设 */
  isDefault(name: string) {
    return (
      name === TANG_PRESET_DEFAULT ||
      name === `${TangModuleTypes.devkit}:${TANG_PRESET_DEFAULT}`
    );
  }
}