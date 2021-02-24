import { getNormalizedOptions } from '../options/normalizeOptions';
import { Generator } from '../generator/Generator';
import { DocumentLoader, DocumentParser, GenericConfigObject } from './types';

export default function tang(options: GenericConfigObject): Promise<Generator> {
  const generator = createGenerator(options);
  return generator;
}

/**
 * 根据给定的配置，创建生成器
 * @param rawOptions 原选项
 */
async function createGenerator(
  rawOptions: GenericConfigObject,
): Promise<Generator> {
  const options = getNormalizedOptions(rawOptions);

  // 获取所有loaders
  const loaders: DocumentLoader[] = [];

  // 获取所有parsers
  const parsers: DocumentParser[] = [];

  const generator = new Generator({
    loaders,
    parsers,
  });

  return generator;
}
