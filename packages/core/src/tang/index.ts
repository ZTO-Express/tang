import { NormalizedTangOptions } from '../options';
import { DefaultTangCompiler } from '../compiler';

/**
 * 根据给定的配置，创建生成器
 * @param rawOptions 原选项
 */
export function createDefaultCompiler(
  options: NormalizedTangOptions,
): DefaultTangCompiler {
  const compiler = new DefaultTangCompiler(options);
  return compiler;
}
