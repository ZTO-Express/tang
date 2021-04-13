import { GenericConfigObject, GenericObject } from './type';
import { TangModuleTypeNames } from './tang';
import { TangDocument } from './tang.document';
import { TangCompilation } from './tang.compiler';

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

export type TangPluginProcessorTest =
  | string
  | RegExp
  | ((compilation: TangCompilation, options?: any) => boolean);

// 严格文档处理器
export interface StrictTangProcessor {
  type: TangProcessorTypeNames; // 处理器类型
  name: string; // 处理器名称
  moduleType: TangModuleTypeNames; // 所属模块类型
  code: string; // 处理器编号（唯一标识）
  pluginName?: string; // 处理器所属插件/模块名称
  priority?: number; // 处理器优先级
  test?: TangPluginProcessorTest; // 验证是否可以加载指定文档（一般通过目标名称/路径即可判断）
}

// 严格文档加载器
export interface StrictTangLoader extends StrictTangProcessor {
  loadOptions?: GenericConfigObject;
  load(
    document: TangDocument,
    options?: GenericConfigObject,
    compilation?: TangCompilation,
  ): Promise<TangDocument>;
}

// 严格文档解析器
export interface StrictTangParser extends StrictTangProcessor {
  parseOptions?: GenericConfigObject;
  parse: (
    document: TangDocument,
    options?: GenericConfigObject,
    compilation?: TangCompilation,
  ) => Promise<TangDocument>;
}

// 严格文档生成器
export interface StrictTangGenerator extends StrictTangProcessor {
  generateOptions?: GenericConfigObject;
  generate: (
    document: TangDocument,
    options?: GenericConfigObject,
    compilation?: TangCompilation,
  ) => Promise<TangDocument>;
}

// 输出结果
export interface TangOutput {
  result: boolean;
  [prop: string]: any;
}

// 严格文件输出器
export interface StrictTangOutputer extends StrictTangProcessor {
  outputOptions?: GenericConfigObject;
  output: (
    document: TangDocument,
    options?: GenericConfigObject,
    compilation?: TangCompilation,
  ) => Promise<TangOutput>;
}

// 文档处理器
export interface TangProcessor extends StrictTangProcessor, GenericObject {}

// 文档加载器
export interface TangLoader extends StrictTangLoader, GenericObject {}

// 文档解析器
export interface TangParser extends StrictTangParser, GenericObject {}

// 文档生成器
export interface TangGenerator extends StrictTangGenerator, GenericObject {}

// 文件输出器
export interface TangOutputer extends StrictTangOutputer, GenericObject {}