import * as path from 'path';
import {
  GenericConfigObject,
  TangPlugin,
  NotImplementedError,
  NotFoundError,
  InvalidPluginError,
  InvalidArguments,
  TangPreset,
} from '@devs-tang/common';
import { fs, uuid } from '../utils';
import { TANG_PLUGIN_DIR } from '../consts';
import { Runner, RunnerFactory } from '../runners';
import { utils } from '..';

// 配置选项
export interface PluginManagerOptions extends GenericConfigObject {
  pluginDir?: string;
}

// 插件安装类型
export type PluginInstallTypes = 'npm' | 'npm_link' | 'shell';

export interface BasePluginInstallOptions {
  type?: PluginInstallTypes;
  name: string; // 插件名称
  version: string; // 版本
  install?: boolean | string[]; // 是否执行安装或安装脚本
  cwd?: string; // 安装命令执行目录
  force?: boolean; // 强制安装标志（强制删除原安装并重新安装）
}

export interface PluginNpmInstallOptions extends BasePluginInstallOptions {
  package?: string; // 包名
  registry?: string; // npm仓库
  extArgs?: string; // 额外参数
}

export interface PluginNpmLinkInstallOptions extends BasePluginInstallOptions {
  package: string; // npm仓库
  extArgs?: string; // 额外参数
}

export interface PluginShellInstallOptions extends BasePluginInstallOptions {
  install: string[]; // 安装脚本
}

// 插件安装选项
export type PluginInstallOptions =
  | PluginNpmInstallOptions
  | PluginNpmLinkInstallOptions
  | PluginShellInstallOptions;

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
   * 判断指定的预设是否存在
   * @param name 预设名称
   * @param version 预设版本
   * @returns true: 存在；false: 不存在
   */
  async exists(name: string, version?: string): Promise<boolean> {
    const existsPluginName = await this.findExistsPluginName(name, version);
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
    const prefix = name ? `${name}@` : name;
    const names = this.list(prefix);
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

    for (const name in pluginNames) {
      const pluginPath = this.getPluginPath(name);

      const exists = await fs.pathExists(`${pluginPath}/index.js`);
      if (!exists) await this.delete(name);
    }
  }

  /**
   * 获取已存在预设
   * @param name 为空返回当前已加载预设
   * @param version 为空模版返回最大版本
   * @returns
   */
  async get(name?: string, version?: string): Promise<TangPlugin> {
    if (!name) return undefined;

    const fullPluginName = await this.findExistsPluginName(name, version);
    if (!fullPluginName) return undefined;

    const plugin = this.getByFullName(fullPluginName);
    return plugin;
  }

  /**
   * 添加插件到本地环境
   * @param name 插件名称，npm, npm_link, shell
   */
  async add(name: string, options?: GenericConfigObject): Promise<TangPlugin> {
    let nameVersion: any;

    let packageName: string;

    if (utils.isPath(name)) {
      packageName = name;
      const packageInfo = await fs.readPackageInfo(packageName);

      if (!packageInfo) return undefined;

      nameVersion = {
        name: packageInfo.name,
      };
    } else {
      nameVersion = this.parsePluginName(name);
    }

    const opts = Object.assign(
      {
        name: nameVersion.name,
        version: nameVersion.version,
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
  async delete(
    name: string,
    version?: string,
  ): Promise<TangPlugin | undefined> {
    const plugin = await this.get(name, version);

    if (!plugin) return undefined;

    const pluginPath = this.getPluginPath(plugin);

    await fs.emptyDir(pluginPath);
    await fs.rmdir(pluginPath);

    await this.getPluginNames(true);

    return plugin;
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
    const existsPluginName = await this.findExistsPluginName(
      options.name,
      options.version,
    );

    const pluginPath = this.getPluginPath(options.name, options.version);

    // 插件已存在并且不是强制安装，则直接返回
    if (existsPluginName && !options.force) {
      return this.get(existsPluginName);
    }

    // 不执行安装
    if (options.install === false) return undefined;

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
      case 'shell':
        await this.shellInstall(options as PluginShellInstallOptions);
        break;
      default:
        throw new InvalidArguments(`不支持安装类型${options.type}`);
    }

    // 复制临时文件到plugin目录并修改插件目录为 插件名@版本号，如果是强制安装，则先覆盖源路径
    await fs.move(tmpFolder, pluginPath, { overwrite: options.force === true });

    const pluginData = await this.get(options.name, options.version);

    return pluginData;
  }

  /**
   * 通过npm 安装
   * @param options
   */
  async npmInstall(options: PluginNpmInstallOptions) {
    const runner = RunnerFactory.create(Runner.NPM);

    const pluginFullName = this.getPluginFullName(
      options.name,
      options.version,
    );

    const packageName = options.package ? options.package : pluginFullName;

    let command = `install ${packageName}`;
    if (options.registry) command += ` --registry=${options.registry}`;
    if (options.extArgs) command += ` ${options.extArgs}`;

    await runner.run(command, true, options.cwd);

    const moduleNameVersion = this.parsePluginName(packageName);

    const pluginModuleFile = `${options.cwd}/index.js`;
    const pluginModuleText = `// generated by tang 
module.exports = require('${moduleNameVersion.name}');
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

    let command = `link ${options.package}`;
    if (options.extArgs) command += ` ${options.extArgs}`;
    await runner.run(command, true, options.cwd);

    const packageData = await fs.readJson(`${options.package}/package.json`);
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

  /**
   * 通过执行shell脚本安装
   * @param options
   */
  async shellInstall(options: PluginShellInstallOptions) {
    throw new NotImplementedError();
  }

  /** 通过路径加载预设 */
  async getByFullName(name: string): Promise<TangPlugin> {
    const pluginPath = this.getPluginPath(name);

    let pluginData: any;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const plugin = require(pluginPath);

      pluginData = plugin;
      if (typeof plugin === 'function') {
        pluginData = await Promise.resolve().then(() => plugin.call(this));
      }
    } catch (ex) {
      if (ex.code === 'MODULE_NOT_FOUND') {
        await this.delete(name);
        return undefined;
      }

      throw ex;
    }

    const nameVersion = this.parsePluginName(name);

    pluginData.name = nameVersion.name;
    pluginData.version = nameVersion.version;

    return pluginData;
  }

  /** 查找已存在的预设名称 */
  async findExistsPluginName(name: string, version = 'latest') {
    const nameVersion = this.parsePluginName(name, version);

    const pluginNames = await this.getPluginNames();

    const fullPluginName = pluginNames.find(it => {
      return nameVersion.version
        ? it === nameVersion.fullName
        : it.indexOf(`${nameVersion.name}@`) === 0;
    });

    return fullPluginName;
  }

  /** 解析插件名称 */
  parsePluginName(
    name: string,
    defaultVersion = 'latest',
  ): { name: string; fullName: string; version?: string } {
    let shortName = name;
    let version = defaultVersion;

    const versionIndex = name.lastIndexOf('@');
    if (versionIndex > 0) {
      shortName = name.substr(0, versionIndex);
      version = name.substr(versionIndex + 1);
    } else {
      shortName = name;
    }

    const fullName = this.getPluginFullName(shortName, version);

    return {
      name: shortName,
      fullName,
      version,
    };
  }

  /** 根据预设名称及版本获取预设全路径 */
  getPluginFullName(name: string | TangPlugin, version = 'latest') {
    let _name: string;
    let _version = version;

    if (typeof name === 'object') {
      const _plugin = name as TangPlugin;
      _name = _plugin.name;
      _version = _plugin.version;
    } else {
      _name = name;
    }

    if (_name.lastIndexOf('@') > 0) return _name;
    const fullName = _version ? `${_name}@${_version}` : _name;
    return fullName;
  }

  /** 根据预设名称获取预设路径 */
  getPluginPath(name: string | TangPlugin, version = 'latest') {
    const fullName = this.getPluginFullName(name, version);
    return path.join(this.pluginDir, fullName);
  }

  /** 插件临时文件 */
  getPluginTmpPath(...args: string[]) {
    return path.join(this.pluginDir, '.tmp', ...args);
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

      pluginNames = pluginNames.filter(it => it.lastIndexOf('@') > 0);

      // 反序，方便查询最大版本
      pluginNames.reverse();
      this.pluginNames = pluginNames;
    }

    return pluginNames;
  }
}
