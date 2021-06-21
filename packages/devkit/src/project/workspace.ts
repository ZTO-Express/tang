import { GenericConfigObject } from '@devs-tang/common';
import * as path from 'path';

import { fs, utils, vm } from '../utils';

import {
  CODE_GEN_DEFAULT_DIR,
  CODE_GEN_DEFAULT_TEMPLATES_DIR,
  TANG_WORKSPACE_CONFIG_FILENAME,
} from '../consts';

import { WorkspaceConfig, CodegenTemplate } from './declarations';

/**
 * 当前项目工作区
 */
export class ProjectWorkspace {
  // 配置文件路径
  private _configPath: string;

  // 项目工作区配置信息
  private _config: WorkspaceConfig = {};

  private constructor(configPath?: string) {
    this._configPath = configPath;
  }

  // 工作区根目录
  get rootDir() {
    return this._config.rootDir;
  }

  // 代码生成配置选项
  get codegenConfig() {
    return this.getOption('codegen');
  }

  // 代码生成目录
  get codegenDir() {
    // 获取代码生成目录
    let codegenDir = utils.get(
      this.codegenConfig,
      'baseDir',
      CODE_GEN_DEFAULT_DIR,
    );

    if (!path.isAbsolute(codegenDir)) {
      codegenDir = path.join(this.rootDir, codegenDir);
    }

    return codegenDir;
  }

  // 工作区是否存在
  exists() {
    return !!this.rootDir && fs.existsSync(this.rootDir);
  }

  /**
   * 获取加载器实例
   * @param force 强制重新实例化加载器
   * @returns
   */
  static async createInstance(
    configPath?: string,
    options?: GenericConfigObject,
  ) {
    const workspace = new ProjectWorkspace(configPath as string);
    await workspace._initialize(options as GenericConfigObject);

    return workspace;
  }

  // 初始化加载器
  private async _initialize(options?: GenericConfigObject) {
    const config = await this.readWorkspaceConfig();

    if (options) {
      this._config = utils.deepMerge({}, config, options);
    } else if (config) {
      this._config = config;
    }
  }

  // 读取工作区配置
  private async readWorkspaceConfig() {
    let configPath = this._configPath;

    if (!configPath) {
      // 从当前目录向上查找配置文件
      configPath = await fs.lookupFile(TANG_WORKSPACE_CONFIG_FILENAME);
    }

    // 如果未找到工作区配置文件，则返回空
    if (!configPath) {
      return undefined;
    }

    const configObject = await vm.requireOrImportModule<any>(configPath);
    configObject.isWorkspace = true;

    if (configObject.rootDir) {
      configObject.rootDir = fs.absolutePath(
        configObject.rootDir,
        path.dirname(configPath),
      );
    } else {
      // 如果根目录未设置，则采用配置文件路径所在的目录为根目录
      configObject.rootDir = path.dirname(configPath);
    }

    return configObject;
  }

  // 获取配置信息 (返回配置对象的克隆)
  get<T = any>(pathStr: string, defaultValue?: T): T {
    if (pathStr === '.') {
      return this._config as T;
    }

    const result = utils.get(this._config, pathStr, defaultValue);
    return result;
  }

  // 获取配置下options节点下选项
  getOption<T = any>(pathStr: string, defaultValue?: T): T {
    if (pathStr === '.') {
      pathStr = 'options';
    } else {
      pathStr = `options.${pathStr}`;
    }
    return this.get<T>(pathStr, defaultValue);
  }

  /**
   * 获取代码生成目录下所有模版
   * @param templatesDir 模版路径
   * @returns
   */
  retrieveCodegenTemplates(templatesDir?: string): CodegenTemplate[] {
    if (!templatesDir) {
      templatesDir = utils.get(
        this.codegenConfig,
        'templatesDir',
        CODE_GEN_DEFAULT_TEMPLATES_DIR,
      );
    }

    if (!path.isAbsolute(templatesDir)) {
      templatesDir = path.join(this.codegenDir, templatesDir);
    }

    if (!fs.existsSync(templatesDir)) {
      throw new Error(`目录${templatesDir}不存在。`);
    }

    const templates: any[] = [];
    fs.walkSync(templatesDir, (filePath: string) => {
      const content = fs.readFileSync(filePath, {
        encoding: 'utf8',
      });

      templates.push({
        fullPath: filePath,
        relativePath: path.relative(templatesDir, filePath),
        content,
      });
    });

    return templates;
  }
}
