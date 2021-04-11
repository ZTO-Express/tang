import * as path from 'path';

import {
  TangPlugin,
  NotFoundError,
  InvalidPluginError,
  InvalidArguments,
  TangPreset,
  TangError,
  utils,
} from '@devs-tang/common';
import { normalizePresetOptions } from '@devs-tang/core';

import {
  TANG_PLUGIN_DIR,
  TANG_PLUGIN_PREFIX,
  TANG_PRESET_DEFAULT,
} from '../consts';

import { fs, uuid, vm } from '../utils';
import { Runner, RunnerFactory } from '../runners';

import {
  PluginNameInfo,
  PluginManagerOptions,
  PluginNpmInstallOptions,
  PluginNpmLinkInstallOptions,
  PluginInstallOptions,
  PluginAddOptions,
} from './declarations';

export class PluginManager {
  readonly pluginDir: string;

  private pluginNames: string[] = []; // 已存在插件名称

  constructor(options?: PluginManagerOptions) {
    options = Object.assign({}, options);
    this.pluginDir = options.pluginDir || TANG_PLUGIN_DIR;
  }

  /** 插件默认目录 */
  get pluginTmpDir() {
    return this.getPluginTmpPath();
  }

  /**
   * 判断指定的插件是否存在
   * @param name 预设名称
   * @param version 预设版本
   * @returns true: 存在；false: 不存在
   */
  async exists(name: string, version?: string): Promise<boolean> {
    const existsPluginName = await this.getExistsPluginName(name, version);
    return !!existsPluginName;
  }

  /**
   * 列出所有插件
   * @param name 插件前缀（用于过滤）
   */
  async list(prefix?: string): Promise<string[]> {
    const pluginNames = await this.getPluginNames();
    if (!prefix) return pluginNames;

    const prefixNames = pluginNames.filter(it => it.startsWith(prefix));
    return prefixNames;
  }

  /**
   * 列出所有名称为指定名称的插件
   * @param name
   * @returns
   */
  async listByName(name?: string): Promise<string[]> {
    let prefix = name;

    if (name && name.indexOf('@') < 0) {
      prefix = name + '@';
    }

    const names = await this.list(prefix);
    return names;
  }

  /**
   * 清理安装缓存，以及无效插件
   */
  async prune() {
    const tmpDir = this.pluginTmpDir;
    await fs.emptyDir(tmpDir);
    await fs.rmdir(tmpDir);

    const pluginNames = await this.getPluginNames(true);

    const ops = pluginNames.map(async name => {
      const pluginPath = this.getPluginPath(name);

      const exists = await fs.pathExists(`${pluginPath}/index.js`);
      if (!exists) await this.delete(name);
    });

    await Promise.all(ops);
  }

  /**
   * 获取已存在预设
   * @param name 为空返回当前使用插件
   * @param version 为空模版返回最大版本
   * @returns
   */
  async get(name: string, version?: string): Promise<TangPlugin> {
    if (!name) return undefined;

    const pluginName = await this.getExistsPluginName(name, version);
    if (!pluginName) return undefined;

    const plugin = await this.getByName(pluginName);
    return plugin;
  }

  /**
   * 添加插件到本地环境
   * @param name 插件名称，npm, npm_link, shell
   */
  async add(name: string, options: PluginAddOptions = {}): Promise<TangPlugin> {
    let packageName: string;

    if (utils.isPath(name)) {
      packageName = name;
      const packageInfo = await fs.readPackageInfo(packageName);

      if (!packageInfo) return undefined;

      name = packageInfo.name;
    }

    const nameInfo = this.parsePluginName(name, options.version);

    const opts = Object.assign(
      {
        ...nameInfo,
        package: packageName,
      },
      options,
    ) as PluginInstallOptions;

    const plugins = await this.install([opts]);

    return plugins[0];
  }

  /**
   * 删除指定插件
   * @param name 插件名称
   */
  async delete(name: string, version?: string): Promise<boolean> {
    if (!name) return undefined;

    const pluginName = await this.getExistsPluginName(name, version);
    if (!pluginName) return undefined;

    const pluginPath = this.getPluginPath(pluginName);

    await fs.emptyDir(pluginPath);
    await fs.rmdir(pluginPath);

    await this.getPluginNames(true);

    return true;
  }

  /**
   * 删除所有指定名称前缀的插件
   * @param prefix
   */
  async deleteAll(name: string) {
    if (!name) throw new InvalidArguments('请提供插件名称');

    const names = await this.listByName(name);

    const ops = names.map(it => {
      return this.delete(it);
    });

    await Promise.all(ops);
  }

  /**
   * 调用插件命令
   * @param name
   * @param action
   */
  async run(name: string, action: string, ...args: any[]) {
    const plugin: any = await this.get(name);

    if (!plugin) throw new NotFoundError(`未找到插件${name}`);

    // 优先执行methods下面的方法
    const fn = (plugin.actions && plugin.actions[action]) || plugin[action];

    if (!fn) throw new NotFoundError(`未找到插件方法${name}.${action}`);
    if (typeof fn !== 'function')
      throw new InvalidPluginError(`无效插件方法${name}.${action}`);

    return fn.apply(this, args);
  }

  /**
   * 获取插件预设
   * @param pluginName 插件名称
   * @param presetName 预设名称
   * @returns
   */
  async getPreset(
    pluginName: string,
    presetName?: string,
  ): Promise<TangPreset> {
    const plugin = await this.get(pluginName);

    const preset = this.getPresetFromPlugin(plugin, presetName);

    return preset;
  }

  /**
   * 从插件对象中获取指定的预设
   * @param plugin
   * @param presetName
   * @returns
   */
  getPresetFromPlugin(plugin: TangPlugin, presetName?: string): TangPreset {
    if (!plugin) return undefined;

    presetName = presetName || TANG_PRESET_DEFAULT;

    let rawPreset: any;

    rawPreset =
      plugin.presets &&
      plugin.presets.find((it: any) => it.name === presetName);

    if (!rawPreset && presetName == TANG_PRESET_DEFAULT) {
      rawPreset = plugin.preset
        ? plugin.preset
        : plugin.presets && plugin.presets[0];
    }

    if (!rawPreset) return undefined;

    rawPreset.pluginName = plugin.name;

    const preset = normalizePresetOptions(
      {
        name: presetName,
        ...rawPreset,
      },
      {
        pluginName: plugin.name,
      },
    ) as TangPreset;

    return preset;
  }

  /**
   * 安装插件
   * @param plugin 预设信息
   */
  async install(
    optionsItems: PluginInstallOptions[],
  ): Promise<(TangPlugin | undefined)[]> {
    await fs.ensureDir(this.pluginTmpDir);

    const ops = optionsItems.map(it => {
      return this.installSingle(it);
    });

    const plugins = await Promise.all(ops);

    // 安装全部完成后清理临时文件夹
    await this.prune();
    return plugins;
  }

  /**
   * 安装单个插件
   * @param options
   */
  async installSingle(
    options: PluginInstallOptions,
  ): Promise<TangPlugin | undefined> {
    options.type = options.type || 'npm';

    const folderId = uuid.v4();
    const tmpFolder = this.getPluginTmpPath(folderId);

    // 查询当前已存在的插件
    const existsPluginName = await this.getExistsPluginName(
      options.name,
      options.version,
    );

    const pluginPath = this.getPluginPath(options.name);

    // 插件已存在并且不是强制安装，则直接返回
    if (existsPluginName && !options.force) {
      return this.get(existsPluginName);
    }

    // 进入plugin，临时目录
    await fs.ensureDir(tmpFolder);

    options.cwd = tmpFolder;

    switch (options.type) {
      case 'npm':
        await this.npmInstall(options as PluginNpmInstallOptions);
        break;
      case 'npm_link':
        await this.npmLinkInstall(options as PluginNpmLinkInstallOptions);
        break;
      default:
        throw new InvalidArguments(`不支持安装类型${options.type}`);
    }

    // 复制临时文件到plugin目录并修改插件目录为 插件名@版本号，如果是强制安装，则先覆盖源路径
    await fs.move(tmpFolder, pluginPath, { overwrite: options.force === true });

    const pluginData = await this.get(options.name);

    return pluginData;
  }

  /**
   * 通过npm 安装
   * @param options
   */
  async npmInstall(options: PluginNpmInstallOptions) {
    const runner = RunnerFactory.create(Runner.NPM);

    const packageName = options.package ? options.package : options.fullName;

    let moduleName = options.prefixName;

    if (utils.isPath(packageName)) {
      let command = `install`;
      if (options.registry) command += ` --registry=${options.registry}`;

      await runner.run(command, true, packageName);

      const packageData = await fs.readPackageInfo(packageName);
      moduleName = packageData.name;

      const nodeModulePath = path.join(options.cwd, 'node_modules');
      await fs.ensureDir(nodeModulePath);

      const linkPath = path.join(nodeModulePath, moduleName);
      await fs.symlink(packageName, linkPath, 'dir');
    } else {
      let command = `install ${packageName}`;
      if (options.registry) command += ` --registry=${options.registry}`;
      if (options.extArgs) command += ` ${options.extArgs}`;

      await runner.run(command, true, options.cwd);

      moduleName = options.prefixName;
    }

    const pluginModuleFile = `${options.cwd}/index.js`;
    const pluginModuleText = `// generated by tang 
module.exports = require('${moduleName}');
`;

    // 确保文件存在
    await fs.ensureFile(pluginModuleFile);

    // 创建js导出文件
    await fs.writeFile(pluginModuleFile, pluginModuleText);
  }

  /**
   * 通过npm link
   * @param options
   */
  async npmLinkInstall(options: PluginNpmLinkInstallOptions) {
    const runner = RunnerFactory.create(Runner.NPM);

    const command = `link ${options.package}`;
    await runner.run(command, true, options.cwd);

    const packageData = await fs.readPackageInfo(options.package);
    const moduleName = packageData.name;

    const pluginModuleFile = `${options.cwd}/index.js`;
    const pluginModuleText = `// generated by tang 
module.exports = require('${moduleName}');
`;

    // 确保文件存在
    await fs.ensureFile(pluginModuleFile);

    // 创建js导出文件
    await fs.writeFile(pluginModuleFile, pluginModuleText);
  }

  /** 通过名称获取插件 */
  async getByName(name: string): Promise<TangPlugin> {
    const nameInfo = this.parsePluginName(name);

    const pluginPath = this.getPluginPath(nameInfo.name);

    const existsPath = await fs.pathExists(pluginPath);
    if (!existsPath) return undefined;

    let pluginData: any;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // const rawPlugin = require(pluginPath);

      const pluginScriptPath = fs.joinPath(pluginPath, 'index.js');
      const pluginScript = await fs.resolveFile(pluginScriptPath);

      if (!pluginScript) {
        throw new TangError('插件脚本不存在', 'MODULE_NOT_FOUND');
      }

      // 为了防止缓存，这里采用沙盒运行脚本
      const rawPlugin = vm.runScript(
        pluginScript,
        pluginScriptPath,
        undefined,
        true,
      );

      pluginData = await this.retrievePluginMetadata(rawPlugin);
    } catch (ex) {
      if (ex.code === 'MODULE_NOT_FOUND') {
        await this.delete(name);
        return undefined;
      }

      throw ex;
    }

    pluginData.name = nameInfo.name;

    if (nameInfo.version) {
      pluginData.version = nameInfo.version;
    }

    return pluginData;
  }

  /**
   * 获取插件元数据
   * @param rawPlugin 原始加载的插件数据
   * @returns
   */
  async retrievePluginMetadata(rawPlugin: any) {
    if (!rawPlugin) return rawPlugin;

    let pluginData = rawPlugin;

    if (utils.isFunction(rawPlugin)) {
      pluginData = await Promise.resolve().then(() => rawPlugin.call(this));
    } else if (utils.isFunction(rawPlugin.metadata)) {
      pluginData = await Promise.resolve().then(() =>
        rawPlugin.metadata.call(this),
      );
    } else if (utils.isObject(rawPlugin.metadata)) {
      pluginData = rawPlugin.metadata;
    }

    return pluginData;
  }

  /** 获取已存在的预设名称 */
  async getExistsPluginName(name: string, version?: string) {
    const nameInfo = this.parsePluginName(name, version);

    const pluginNames = await this.getPluginNames();

    const pluginName = pluginNames.find(it => {
      return it === nameInfo.name;
    });

    return pluginName;
  }

  /**
   * 获取所有已存在的插件名称
   * @param force 重新获取插件名称并替换
   * @returns
   */
  async getPluginNames(force = false) {
    let pluginNames = this.pluginNames;
    if (!pluginNames.length || force === true) {
      const exists = await fs.pathExists(this.pluginDir);

      if (!exists) return [];

      pluginNames = await fs.readdir(this.pluginDir);

      pluginNames = pluginNames.filter(
        it => it && !['.', '_'].includes(it.charAt(0)),
      );

      // 刷新缓存
      this.pluginNames = pluginNames;
    }

    return pluginNames;
  }

  /**
   * 根据预设名称获取预设路径
   * @param name 插件名称
   * @returns
   */
  getPluginPath(name: string) {
    return path.join(this.pluginDir, name);
  }

  /** 插件临时文件 */
  getPluginTmpPath(...args: string[]) {
    return path.join(this.pluginDir, '_tmp', ...args);
  }

  /**
   * 解析插件名称
   * @param name
   * @param version
   * @returns
   */
  parsePluginName(name: string | TangPlugin, version?: string): PluginNameInfo {
    if (!name) return undefined;

    let _name: string;
    let _version = version;

    if (typeof name === 'object') {
      const _plugin = name as TangPlugin;
      _name = _plugin.name; // 默认插件名称不带前缀，但是待版本
      _version = _plugin.version;
    } else {
      _name = name;
    }

    if (!_name) return undefined;

    if (_name.startsWith(TANG_PLUGIN_PREFIX)) {
      _name = _name.substr(TANG_PLUGIN_PREFIX.length);
    }

    let _shortName = _name;
    const versionIndex = _name.lastIndexOf('@');
    if (versionIndex > 0) {
      _shortName = _name.substr(0, versionIndex);
      _version = _name.substr(versionIndex + 1);
    } else {
      _shortName = _name;
    }

    const _prefixName = `${TANG_PLUGIN_PREFIX}${_shortName}`;

    const _fullName = _version ? `${_prefixName}@${_version}` : _prefixName;

    _name = _version ? `${_shortName}@${_version}` : _shortName;

    return {
      name: _name,
      shortName: _shortName,
      prefixName: _prefixName,
      fullName: _fullName,
      version: _version,
    };
  }
}
