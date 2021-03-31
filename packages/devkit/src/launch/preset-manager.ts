import { GenericConfigObject, TangPreset } from '@devs-tang/common';
import {
  TANG_CONFIG_KEY_PRESETS,
  TANG_CONFIG_KEY_PRESET_DEFAULT,
} from '../consts';

import { TangLauncher } from './launcher';

export interface PresetNameInfo {
  name: string;
  plugin?: string;
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
  async use(name?: string, options?: GenericConfigObject): Promise<any> {
    const usedConfig = this.getUsedConfig();

    // 若未提供名称，则返回正在使用的配置
    if (name === undefined) return usedConfig;

    const normalizedName = this.getNormalizedName(name);
    if (!normalizedName) return undefined;

    // 解析当前的名称
    const nameInfo = this.parseName(name);

    // 名称不合法，则直接返回
    if (!nameInfo) return undefined;

    // 检查插件是否存在，不存在则执行安装操作
    if (nameInfo.plugin && !this.isDefault(nameInfo.plugin)) {
      const existsPlugin = await this.launcher.pluginManager.exists(
        nameInfo.plugin,
      );

      if (!existsPlugin) {
        const plugin = await this.launcher.pluginManager.add(nameInfo.plugin);

        if (!plugin) {
          throw new Error('插件安装失败。');
        }
      }
    }

    // 设置目标配置
    if (options !== undefined)
      this.setConfig(normalizedName, undefined, options);

    // 设置当前正在使用的配置
    this.setUsedConfig(normalizedName);

    await this.saveConfig();

    return this.getUsedConfig();
  }

  /**
   * 获取指定的预设配置
   * @param presetName
   * @param pathName
   * @returns
   */
  getConfig(presetName: string, pathName?: string) {
    const launchPath = this.getLaunchPath(presetName, pathName);
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
    const launchPath = this.getLaunchPath(presetName, pathName);
    if (!launchPath) return undefined;

    return this.launcher.configManager.set(launchPath, options);
  }

  /** 取消指定预设 */
  unsetConfig(presetName: string, pathName?: string) {
    const launchPath = this.getLaunchPath(presetName, pathName);
    if (!launchPath) return undefined;

    return this.launcher.configManager.unset(launchPath);
  }

  /** 保存当前预设 */
  saveConfig() {
    return this.launcher.configManager.save();
  }

  /** 获取当前正在使用的预设，如果没有正在使用的预设，则返回默认预设 */
  getUsedConfig() {
    const allConfigs = this.getAllConfigs();

    let usedPresetName = Object.keys(allConfigs).find(
      name => allConfigs[name] && allConfigs[name].use,
    );

    usedPresetName = usedPresetName || TANG_CONFIG_KEY_PRESET_DEFAULT;

    return { name: usedPresetName, ...allConfigs[usedPresetName] };
  }

  /** 获取正在使用的插件 */
  async getUsedPlugin() {
    const config = this.getUsedConfig();
    const pluginName = config && config.name;

    if (!pluginName) return undefined;

    return this.getPluginByName(pluginName);
  }

  /**
   * 获取插件
   * @param pluginName 插件名称
   * @returns 插件名称则返回当前
   */
  async getPluginByName(pluginName: string) {
    if (!pluginName) return undefined;

    const plugin = await this.launcher.pluginManager.get(pluginName);
    return plugin;
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

  /** 根据名称获取预设 */
  getConfigByName(name: string) {
    const normalizedName = this.getNormalizedName(name);
    if (!normalizedName) return undefined;

    const allConfigs = this.getAllConfigs();
    const config = allConfigs[normalizedName];
    if (!config) return undefined;

    return { name: normalizedName, ...config };
  }

  /** 获取所有预设 */
  getAllConfigs() {
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

  /** 获取预设的设置路径 */
  getLaunchPath(name: string, pathName?: string) {
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
        name: 'default',
      };
    }

    return undefined;
  }
}
