import * as path from 'path';
import {
  GenericConfigObject,
  MeshSchema,
  utils,
  InvalidArguments,
  InvalidPresetError,
  NotFoundError,
} from '@devs-tang/common';
import { validateSchema, fs } from '../utils';
import { TANG_MESH_DIR, TANG_MESH_FILENAME } from '../consts';
import { TangLauncher } from '../launch';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const meshSchema = require('../../schemas/mesh.json');

const meshConfigLoadedKey = 'mesh.loaded';

// 配置选项
export interface MeshManagerOptions extends GenericConfigObject {
  meshDir?: string;
  meshFile?: string;
}

export interface MeshSaveOptions {
  force?: boolean; // 强制安装标志（强制删除原安装并重新安装）
}

/**
 * Mesh用于整合不同的插件以重复利用插件的功能，暂不进行开发
 */
export class MeshManager {
  readonly meshDir: string;
  readonly meshFileName: string;

  mesh: MeshSchema | undefined;
  private meshNames: string[] = []; // 已存在Mesh名称

  constructor(
    private readonly launcher: TangLauncher,
    options?: MeshManagerOptions,
  ) {
    options = Object.assign({}, options);

    this.meshDir = options.meshDir || TANG_MESH_DIR;
    this.meshFileName = options.meshFile || TANG_MESH_FILENAME;
  }

  get configManger() {
    return this.launcher.configManager;
  }

  get pluginManager() {
    return this.launcher.pluginManager;
  }

  /**
   * 判断指定的Mesh是否存在
   * @param name Mesh名称
   * @param version Mesh版本
   * @returns true: 存在；false: 不存在
   */
  async exists(name: string, version?: string) {
    const existsMeshName = await this.findExistsMeshName(name, version);
    return !!existsMeshName;
  }

  /**
   * 列出所有插件
   * @param prefix 插件前缀（用于过滤）
   */
  async list(prefix?: string) {
    const meshNames = await this.getMeshNames();
    if (!prefix) return meshNames;

    const prefixNames = meshNames.filter(it => it.startsWith(prefix));
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
   * 清理无效Mesh
   */
  async prune() {
    const meshNames = await this.getMeshNames(true);

    for (const name in meshNames) {
      const meshPath = this.getMeshPath(name);

      const exists = await fs.pathExists(`${meshPath}/${this.meshFileName}`);
      if (!exists) await this.delete(name);
    }
  }

  /**
   * 验证mesh数据是否有效
   * @param meshData 待验证数据
   * @returns 验证失败报错，验证成功返回true
   */
  async validate(meshData: object) {
    try {
      validateSchema(meshSchema, meshData);
    } catch (err) {
      throw err;
    }

    return true;
  }

  /**
   * 获取已存在Mesh
   * @param name 为空返回当前已加载Mesh
   * @param version 为空模版返回最大版本
   * @returns
   */
  async get(name?: string, version?: string): Promise<MeshSchema> {
    if (!name) name = this.configManger.get(meshConfigLoadedKey);
    if (!name) return undefined;

    const fullMeshName = await this.findExistsMeshName(name, version);
    if (!fullMeshName) return undefined;

    const meshPath = this.getMeshPath(fullMeshName);
    const mesh = this.getByPath(meshPath);
    return mesh;
  }

  /** 使用Mesh */
  async use(name?: string, version?: string) {
    const mesh = await this.get(name, version);

    if (!mesh) throw new NotFoundError('当前Mesh不存在');

    const fullName = this.getMeshFullName(mesh);

    this.launcher.configManager.set(meshConfigLoadedKey, fullName);

    return mesh;
  }

  /**
   * 加载Mesh
   * @param nameOrFile Mesh的名称或指定文件
   * @returns
   */
  async load(
    nameOrFile: string,
    options?: GenericConfigObject,
  ): Promise<MeshSchema | undefined> {
    let meshData: MeshSchema;

    // 如果name为url或路径
    if (utils.isUrl(nameOrFile) || utils.isPath(nameOrFile)) {
      meshData = await this.add(nameOrFile, options);
    } else {
      const existsMeshName = await this.findExistsMeshName(nameOrFile);

      if (!existsMeshName) return undefined;

      // Mesh已存在则进行加载
      const meshPath = this.getMeshPath(existsMeshName);
      meshData = await this.getByPath(meshPath);

      if (!meshData) {
        throw new InvalidPresetError('无效Mesh数据');
      }
    }

    const meshFullName = this.getMeshFullName(meshData.name, meshData.version);

    // 设置当前加载的Mesh名称
    this.configManger.set(meshConfigLoadedKey, meshFullName);
    await this.configManger.save(); // 保存Mesh

    this.mesh = meshData;
    return this.mesh;
  }

  /**
   * 添加Mesh到本地环境
   * @param file Mesh名称，文件路径或file
   */
  async add(file: string, options?: GenericConfigObject): Promise<MeshSchema> {
    await fs.ensureDir(this.meshDir);

    if (!utils.isUrl(file) && !utils.isPath(file)) {
      throw new InvalidArguments('无效Mesh文件或路径');
    }

    const meshData = await fs.resolveFile(file, 'json');

    return this.save(meshData, options);
  }

  /**
   * 保存Mesh信息
   * @param mesh Mesh信息
   */
  async save(mesh: MeshSchema, options?: MeshSaveOptions) {
    options = options || {};

    // 验证Mesh配置是否符合规范
    this.validate(mesh);

    // 安装Mesh（主要是Mesh中包含的插件）
    if (mesh.plugins) {
      await this.pluginManager.install(mesh.plugins as any);
    }

    const filePath = this.getMeshPath(mesh.name, mesh.version);

    // 强制重新安装
    const existsPreset = await this.get(mesh.name, mesh.version);

    if (existsPreset) {
      if (options.force === true) {
        await this.delete(existsPreset.name, existsPreset.version);
      } else {
        const _meshFullName = this.getMeshFullName(existsPreset);

        // Mesh已存在并且不强制安装
        console.warn(`Mesh${_meshFullName}已存在`);
        return existsPreset;
      }
    }

    // 写文件
    await fs.ensureFile(filePath);
    await fs.writeJSON(filePath, mesh, { spaces: 2 });

    await this.getMeshNames(true);

    return mesh;
  }

  /**
   * 删除指定的Mesh
   * @param name Mesh名称
   */
  async delete(name: string, version?: string): Promise<boolean> {
    const meshFullName = await this.findExistsMeshName(name, version);
    if (!meshFullName) return false;

    const meshPath = this.getMeshDir(meshFullName);

    // 删除
    await fs.emptyDir(meshPath);
    await fs.rmdir(meshPath);

    const loadedMeshName = this.configManger.get(meshConfigLoadedKey);

    if (loadedMeshName === meshFullName) {
      this.configManger.unset(meshConfigLoadedKey);
      await this.configManger.save();
      this.getMeshNames(true);
    }

    return true;
  }

  /**
   * 删除所有指定名称前缀的Mesh
   * @param prefix
   */
  async deleteAll(name: string) {
    if (!name) throw new InvalidArguments('请提供Mesh名称');

    const names = await this.listByName(name);

    const ops = names.map(it => {
      return this.delete(it);
    });

    await Promise.all(ops);
  }

  /** 通过路径加载Mesh */
  async getByPath(path: string): Promise<MeshSchema | undefined> {
    const meshData = await fs.resolveFile(path, 'json');

    if (!meshData) return undefined;
    await this.validate(meshData);
    return meshData;
  }

  /** 查找已存在的Mesh名称 */
  async findExistsMeshName(name: string, version?: string) {
    const nameVersion = this.parseMeshName(name, version);

    const meshNames = await this.getMeshNames();

    const fullMeshName = meshNames.find(it => {
      return nameVersion.version
        ? it === nameVersion.fullName
        : it.indexOf(`${nameVersion.name}@`) === 0;
    });

    return fullMeshName;
  }

  /** 解析Mesh名称 */
  parseMeshName(
    name: string,
    defaultVersion?: string,
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

    const fullName = this.getMeshFullName(shortName, version);

    return {
      name: shortName,
      fullName,
      version,
    };
  }

  /** 根据Mesh名称及版本获取Mesh全路径 */
  getMeshFullName(name: string | MeshSchema, version?: string) {
    let _name: string;
    let _version = version;

    if (typeof name === 'object') {
      const _mesh = name as any;
      _name = _mesh.name;
      _version = _mesh.version;
    } else {
      _name = name;
    }

    if (_name.lastIndexOf('@') > 0) return _name;
    const fullName = _version ? `${_name}@${_version}` : _name;
    return fullName;
  }

  /** 根据Mesh名称获取Mesh路径 */
  getMeshDir(name: string | MeshSchema, version?: string) {
    const fullName = this.getMeshFullName(name, version);
    return path.join(this.meshDir, fullName);
  }

  /** 根据Mesh名称获取Mesh路径 */
  getMeshPath(name: string | MeshSchema, version?: string) {
    const meshDir = this.getMeshDir(name, version);
    return path.join(meshDir, this.meshFileName);
  }

  /** 获取所有已存在的Mesh名称 */
  async getMeshNames(force = false) {
    let meshNames = this.meshNames;
    if (!meshNames.length || force === true) {
      const exists = await fs.pathExists(this.meshDir);
      if (!exists) return [];

      meshNames = await fs.readdir(this.meshDir);
      // 反序，方便查询最大版本
      meshNames.reverse();
      this.meshNames = meshNames;
    }

    return meshNames;
  }
}
