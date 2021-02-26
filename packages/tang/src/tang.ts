import { getNormalizedOptions } from './options/normalizeOptions';
import { Compiler } from './compiler/Compiler';
import {
  TangDocumentLoader,
  TangDocumentParser,
  GenericConfigObject,
  TangDocumentGenerator,
  TangDocumentOutputer,
} from './common/types';

export default function tang(options: GenericConfigObject): Promise<Compiler> {
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

  // 获取所有loaders
  const loaders: TangDocumentLoader[] = [];

  // 获取所有parsers
  const parsers: TangDocumentParser[] = [];

  // 获取所有generators
  const generators: TangDocumentGenerator[] = [];

  // 获取所有outputers
  const outputers: TangDocumentOutputer[] = [];

  const compiler = new Compiler({
    loaders,
    parsers,
    generators,
    outputers,
  });

  return compiler;
}
