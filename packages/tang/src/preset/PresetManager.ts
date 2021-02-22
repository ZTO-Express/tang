import { fs, json5, validateSchema } from '../utils';

import { Preset } from './Preset';

export class PresetManager {
  constructor(private readonly options: any) {}

  /** 预设所在文件夹 */
  get homedir() {
    return `${this.options.homedir}/presets`;
  }

  /**
   * 创建预设
   * @param 预设字符串
   */
  async create(content: string | object): Promise<Preset> {
    if (!content) return null;

    return new Preset();
  }

  /**
   * 获取预设文件
   * @param file 预设文件路径，url或名称
   */
  async resolve(file: string) {
    const result = await fs.resolveFile(file);
    return result;
  }

  /**
   * 判断preset是否有效
   * @param content
   */
  async validate(content: string | object) {
    let target: object;
    if (typeof content === 'string') {
      target = json5.parse(content);
    } else {
      target = content;
    }

    validateSchema({}, target);

    return true;
  }

  /**
   * 添加预设到本地环境
   * @param file 预设名称，文件路径或file
   */
  async add(file: string) {
    await fs.ensureDir(this.homedir);

    // 判断name是url、文件地址还是名称
    const data = await this.resolve(file);

    // TODO: 验证presetData是否符合规范

    const preset = await this.create(data);

    // 存储preset到本地
    const result = await this.save(preset);
    return result;
  }

  /**
   * 保存预设信息
   * @param preset 预设信息
   */
  async save(preset: Preset) {
    console.debug(preset);
    throw new Error('待实现');
  }
}
