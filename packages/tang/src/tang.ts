import { getNormalizedOptions } from './options/normalize-options';
import { Compiler } from './compiler/compiler';

export function tang(options: GenericConfigObject): Promise<Compiler> {
  const compiler = createCompiler(options);
  return compiler;
}

/**
 * 根据给定的配置，创建生成器
 * @param rawOptions 原选项
 */
async function createCompiler(
  rawOptions: GenericConfigObject,
): Promise<Compiler> {
  const options = getNormalizedOptions(rawOptions);

  const compiler = new Compiler(options);

  return compiler;
}
