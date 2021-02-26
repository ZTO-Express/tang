import { GenericConfigObject, NormalizedTangOptions } from '../common/types';

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function getNormalizedOptions(config: GenericConfigObject) {
  return config as NormalizedTangOptions;
}
