import {
  getTangLauncher,
  GenericConfigObject,
  errors,
} from '@devs-tang/devkit';
import { CliAction } from '../../common';
import { printData } from '../../utils';

export class ConfigAction extends CliAction {
  // 主命令
  async main(key: string, value: string, options: GenericConfigObject) {
    if (!value) {
      // key, value未设置，则列出所有配置或特定配置
      return this.get(key, options);
    } else if (key) {
      // key, value都设置，设置指定配置
      return this.set(key, value);
    }
  }

  // 列出所有或特定配置，以json格式展示
  /**
   *
   * @param key
   * @param options
   * @returns
   */
  async get(key: string, options: GenericConfigObject = {}) {
    const result = await this.getConfig(key);
    if (!result) return result;

    printData(result, options);

    return result;
  }

  // 设置特定配置
  async set(key: string, value: string) {
    if (!key) {
      throw new errors.InvalidArguments('请提供配置路径');
    }

    if (!value) {
      throw new errors.InvalidArguments('请提供配置值');
    }

    const { configManager } = await getTangLauncher();
    await configManager.set(key, value);
    await configManager.save();

    return this.get(key);
  }

  // 取消特定配置
  async unset(key: string) {
    if (!key) {
      throw new errors.InvalidArguments('请提供配置路径');
    }

    const { configManager } = await getTangLauncher();

    await configManager.unset(key);
    await configManager.save();

    console.info(`已成功取消设置 ${key}`);
  }

  /** 列出或获取某个配置信息 */
  async getConfig(key: string) {
    key = key || '.';
    const { configManager } = await getTangLauncher();

    const result = await configManager.get(key);

    if (!result) {
      console.info(`暂无配置：${key}`);
    }

    return result;
  }
}
