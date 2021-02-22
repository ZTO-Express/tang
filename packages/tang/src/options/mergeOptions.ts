import { GenericConfigObject, TangOptions } from '../tang/types';

/**
 * 合并选项，用于合并配置，一般用于命令行或其他应用场景合并配置文件
 * @param config 配置信息
 */
export function mergeOptions(config: GenericConfigObject) {
  return config as TangOptions;
}
