import * as path from 'path';
import { fs, utils } from '../utils';

import {
  CODE_GEN_DEFAULT_DIR,
  CODE_GEN_DEFAULT_TEMPLATES_DIR,
  CODE_GEN_DEFAULT_CONFIG_FILE,
} from '../consts';

import { WorkspaceConfig, CodegenTemplate } from './declarations';

/**
 * 当前项目工作区
 */
export class ProjectWorkspace {
  // 项目目录
  readonly rootDir: string;

  // 项目工作区配置信息
  config: WorkspaceConfig = {};

  // 当前项目工作区实例
  private static instance: ProjectWorkspace;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  // 代码生成目录 (相对项目目录)
  get codegenDir() {
    const dir = this.get('codegenDir', CODE_GEN_DEFAULT_DIR);
    if (utils.isAbsolutePath(dir)) return dir;
    return path.join(this.rootDir, dir);
  }

  // 代码生成配置文件路径
  get codegenConfigPath() {
    return path.join(this.codegenDir, CODE_GEN_DEFAULT_CONFIG_FILE);
  }

  // 模版目录 (相对代码生成目录)
  get templatesDir() {
    const dir = this.get('templatesDir', CODE_GEN_DEFAULT_TEMPLATES_DIR);
    if (utils.isAbsolutePath(dir)) return dir;
    return path.join(this.rootDir, dir);
  }

  // 初始化加载器
  async initialize() {
    // TODO: 获取项目配置信息
    // const existsConfig = await fs.pathExists(this.configPath);

    // if (existsConfig) {
    //   this.config = await fs.resolveFile(this.configPath, CODE_GEN_SOURCE_DIR);
    // }

    if (!this.config) {
      this.config = {};
    }
  }

  // 获取指定路径配置
  get(pathStr: string, defaultValue?: any) {
    return utils.get(this.config, pathStr, defaultValue);
  }

  // 获取当前工作区模版
  retrieveTemplates(): CodegenTemplate[] {
    const templatesDir = this.templatesDir;

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

  /**
   * 获取加载器实例
   * @param force 强制重新实例化加载器
   * @returns
   */
  static async getInstance(rootDir?: string) {
    if (!rootDir) {
      rootDir = ProjectWorkspace.retrieveProjectDir();
    }

    // 未找到项目路径，则设置当前路径为项目路径
    rootDir = rootDir || process.cwd();

    if (!ProjectWorkspace.instance) {
      const workspace = new ProjectWorkspace(rootDir as string);
      ProjectWorkspace.instance = workspace;
      await workspace.initialize();
    }

    return ProjectWorkspace.instance;
  }

  /**
   * 获取项目目录，项目目录下应当包含codegen文件夹
   */
  static retrieveProjectDir(cwd?: string): string | undefined {
    cwd = cwd || process.cwd();

    // 存在codegen目录和package.json文件，则为项目目录
    const isProjectDir =
      fs.pathExistsSync(path.join(cwd, CODE_GEN_DEFAULT_DIR)) &&
      fs.pathExistsSync(path.join(cwd, 'package.json'));

    if (isProjectDir) return cwd;

    const parentPath = fs.parentPath(cwd);

    if (!parentPath) return undefined;

    return ProjectWorkspace.retrieveProjectDir(parentPath);
  }
}
