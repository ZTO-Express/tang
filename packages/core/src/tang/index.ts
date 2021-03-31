import { NormalizedTangOptions } from '../options';
import { Compiler } from '../compiler';

/**
 * 根据给定的配置，创建生成器
 * @param rawOptions 原选项
 */
export function createCompiler(options: NormalizedTangOptions): Compiler {
  const compiler = new Compiler(options);
  return compiler;
}
