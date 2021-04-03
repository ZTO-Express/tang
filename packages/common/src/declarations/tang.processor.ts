import { GenericConfigObject, GenericObject } from './type';
import { TangModuleTypeNames } from './tang';
import { Chunk, TangDocument, TangDocumentModel } from './tang.document';
import { TangCompileContext } from './tang.compiler';

export enum TangProcessorTypes {
  loader = 'loader', // 加载器
  parser = 'parser', // 解析器
  generator = 'generator', // 生成器
  outputer = 'outputer', // 输出器;
}

export type TangProcessorTypeNames = keyof typeof TangProcessorTypes;

export const TangProcessorTypeKeys = Object.keys(TangProcessorTypes).map(
  it => it,
);

export const TangProcessorsTypeKeys = Object.keys(TangProcessorTypes).map(
  it => `${it}s`,
);

export type TangPluginProcessorLoaderTest =
  | string
  | RegExp
  | ((entry: string) => boolean);

// 当前文档处理器
export interface TangProcessor extends GenericObject {
  type: TangProcessorTypeNames; // 处理器类型
  name: string; // 处理器名称
  moduleType: TangModuleTypeNames; // 所属模块类型
  code: string; // 处理器编号（唯一标识）
  pluginName?: string; // 处理器所属插件/模块名称
  priority?: number; // 处理器优先级
}

// 文档加载器
export interface TangLoader extends TangProcessor {
  test?: TangPluginProcessorLoaderTest; // 验证是否可以加载指定文档（一般通过目标名称/路径即可判断）
  loadOptions?: GenericConfigObject;
  load(
    entry: string,
    options: GenericConfigObject,
    context: TangCompileContext,
  ): Promise<string | Buffer>;
  load<T>(entry: string, options?: GenericConfigObject): Promise<T>; // 加载方法
}

// 文档解析器
export interface TangParser extends TangProcessor {
  parseOptions?: GenericConfigObject;
  parse: (
    content: string,
    options: GenericConfigObject,
    context: TangCompileContext,
  ) => Promise<TangDocumentModel>;
}

// 文档生成结果
export interface TangGeneration {
  document: TangDocument;
  chunks: Chunk[];
}

// 文档生成结果
export interface TangGenerateResult {
  chunks: Chunk[];
  [prop: string]: any;
}

// 文档生成器
export interface TangGenerator extends TangProcessor {
  generateOptions?: GenericConfigObject;
  generate: (
    document: TangDocument,
    options: GenericConfigObject,
    context: TangCompileContext,
  ) => Promise<TangGenerateResult>;
}

// 输出结果
export interface TangOutput {
  result: boolean;
  [prop: string]: any;
}

// 文件输出器
export interface TangOutputer extends TangProcessor {
  outputOptions?: GenericConfigObject;
  output: (
    generation: TangGeneration,
    options: GenericConfigObject,
    context: TangCompileContext,
  ) => Promise<TangOutput>;
}
