import { InvalidArguments, TangPreset } from '@devs-tang/common';
import { CompilerProcessOptions } from '@devs-tang/core';
import {
  TANG_CONFIG_KEY_PRESETS,
  TANG_CONFIG_KEY_PRESET_DEFAULT,
  TANG_PLUGIN_PRESET_DEFAULT,
} from '../consts';

import { TangLauncher } from './launcher';
import { mergePresetAndOptions } from './options';

/** 预设名称信息 */
export interface PresetNameInfo {
  name: string;
  plugin?: string;
}

/** 预设配置数据 */
export interface PresetConfigData {
  use?: boolean;
  isDefault?: boolean;
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
    if (name === undefined) {
      return this.getUsedPresetWithConfig();
    }

    const normalizedName = this.getNormalizedName(name);
    if (!normalizedName) throw new InvalidArguments(`无效名称 ${name}`);

    // 解析当前的名称
    const nameInfo = this.parseName(normalizedName);

    // 名称不合法，则直接返回
    if (!nameInfo) throw new InvalidArguments(`无法解析名称 ${name}`);

    // 检查插件是否存在，不存在则执行安装操作
    if (nameInfo.plugin && !this.isDefault(nameInfo.plugin)) {
      const existsPlugin = await this.launcher.pluginManager.exists(
        nameInfo.plugin,
      );

      if (!existsPlugin) {
        throw new InvalidArguments(`未找到插件 ${nameInfo.plugin}`);
      }
    }

    let presetWithConfig = await this.getPresetWithConfigByName(nameInfo.name);

    if (!presetWithConfig && nameInfo.plugin) {
      if (nameInfo.plugin) {
        throw new InvalidArguments(`插件 ${nameInfo.plugin} 不包含任何预设`);
      } else {
        throw new InvalidArguments(`无效预设名称 name`);
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

    const nameInfo = this.parseName(config.name);

    if (!nameInfo) return undefined;

    let preset = await this.launcher.pluginManager.getPreset(
      nameInfo.plugin,
      nameInfo.name,
    );

    if (!preset) return undefined;

    if (preset.mergeDefault !== false) {
      preset = mergePresetAndOptions(preset) as TangPreset;
    }

    const presetWithConfig = {
      ...config,
      preset,
    };

    return presetWithConfig;
  }

  /**
   * 获取默认预设选项
   * @param config
   * @returns
   */
  getDefaultPreset(): TangPreset {
    const preset = mergePresetAndOptions({
      name: TANG_CONFIG_KEY_PRESET_DEFAULT,
    }) as TangPreset;

    return preset;
  }

  /** 设置当前正在使用的配置 */
  setUsedConfig(name: string) {
    const normalizedName = this.getNormalizedName(name);
    if (!normalizedName) return;

    this.unsetUsedConfig();
    this.setConfig(normalizedName, 'use', true);
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

    const nameInfo = this.parseName(config.name);

    return nameInfo && nameInfo.plugin;
  }

  /** 获取当前正在使用的预设，如果没有正在使用的预设，则返回默认预设 */
  getUsedConfig(): PresetConfigDataWithName {
    const allConfigs = this.getAllConfigs();

    let usedPresetName = Object.keys(allConfigs).find(
      name => allConfigs[name] && allConfigs[name].use,
    );

    usedPresetName = usedPresetName || TANG_CONFIG_KEY_PRESET_DEFAULT;

    return {
      name: usedPresetName,
      isDefault: this.isDefault(usedPresetName),
      ...allConfigs[usedPresetName],
    };
  }

  /** 根据名称获取预设 */
  getConfigByName(name: string): PresetConfigDataWithName {
    const normalizedName = this.getNormalizedName(name);
    if (!normalizedName) return undefined;

    const allConfigs = this.getAllConfigs();
    const config = allConfigs[normalizedName];
    if (!config) return undefined;

    return {
      name: normalizedName,
      isDefault: this.isDefault(normalizedName),
      ...config,
    };
  }

  /** 获取所有预设 */
  getAllConfigs(): Record<string, PresetConfigData> {
    const presetsData =
      this.launcher.configManager.get(TANG_CONFIG_KEY_PRESETS) || {};

    if (!presetsData[TANG_CONFIG_KEY_PRESET_DEFAULT]) {
      presetsData[TANG_CONFIG_KEY_PRESET_DEFAULT] = {};
    }

    return presetsData;
  }

  /**
   * 获取所有或指定插件所有预设
   * @param pluginName
   * @returns
   */
  getAllConfigNames(pluginName?: string) {
    const presetsData =
      this.launcher.configManager.get(TANG_CONFIG_KEY_PRESETS) || {};

    const prefix = pluginName ? `plugin:${pluginName}:` : '';

    const names = Object.keys(presetsData);

    if (!prefix) return names;

    return names.filter(it => it.startsWith(prefix));
  }

  /**
   * 获取指定的预设配置
   * @param presetName
   * @param pathName
   * @returns
   */
  getConfig(presetName: string, pathName?: string) {
    const launchPath = this.getPresetsConfigPath(presetName, pathName);
    if (!launchPath) return undefined;

    return this.launcher.configManager.get(launchPath);
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
    const normalizedName = this.getNormalizedName(name);
    if (!normalizedName) return undefined;

    let launchPath = `${TANG_CONFIG_KEY_PRESETS}.${normalizedName}`;
    if (pathName) launchPath += `.${pathName}`;

    return launchPath;
  }

  /** 规范化预设名称 */
  getNormalizedName(name: string) {
    if (this.isDefault(name)) return name;

    const nameInfo = this.parseName(name);
    if (!nameInfo) return undefined;

    const fullName = this.getFullName(nameInfo);
    return fullName;
  }

  /**
   * 获取预设全名
   * @param pluginName
   * @param presetName
   * @returns
   */
  getFullName(nameInfo: PresetNameInfo) {
    if (!nameInfo || !nameInfo.name) return undefined;

    const { name, plugin } = nameInfo;

    if (!plugin) {
      if (this.isDefault(name)) return name;
      else return undefined;
    }

    return `plugin:${plugin}:${name || 'default'}`;
  }

  /** 是否默认预设 */
  isDefault(name: string) {
    return name === TANG_CONFIG_KEY_PRESET_DEFAULT;
  }

  /**
   * 解析预设名称
   * @param presetName
   */
  parseName(presetName: string) {
    if (!presetName) return undefined;

    if (this.isDefault(presetName)) {
      return {
        name: 'tang',
      };
    }

    const parts = presetName.split(':');

    if (parts[0] === 'plugin') {
      return {
        plugin: parts[1],
        name: parts[2],
      };
    } else if (parts.length === 2) {
      return {
        plugin: parts[0],
        name: parts[1],
      };
    } else if (parts.length === 1) {
      return {
        plugin: parts[0],
        name: TANG_PLUGIN_PRESET_DEFAULT,
      };
    }

    return undefined;
  }
}
