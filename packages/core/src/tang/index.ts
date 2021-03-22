import { GenericConfigObject, TangPreset } from '@devs-tang/common';

import { getNormalizedOptions } from '../options/normalize-options';
import { Compiler } from '../compiler/compiler';

/** tang选项 */
export interface TangOptions extends GenericConfigObject {
  preset?: TangPreset;
}

export async function tang(options?: TangOptions): Promise<Compiler> {
  const compiler = createCompiler(options);
  return compiler;
}

/**
 * 根据给定的配置，创建生成器
 * @param rawOptions 原选项
 */
function createCompiler(rawOptions: GenericConfigObject): Compiler {
  const options = getNormalizedOptions(rawOptions);

  const compiler = new Compiler(options);

  return compiler;
}
