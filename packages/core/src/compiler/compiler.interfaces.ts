import {
  TangGenerator,
  TangLoader,
  TangOutputer,
  TangParser,
  TangProcessor,
  TangHook,
  TangProcessorTypeNames,
} from '@tang/common';

// 生成器配置选项
export interface CompilerOptions {
  defaultLoader?: string | TangLoader;
  loaders: TangLoader[];

  defaultParser?: string | TangParser;
  parsers: TangParser[];

  defaultGenerator?: string | TangGenerator;
  generators: TangGenerator[];

  defaultOutputer?: string | TangOutputer;
  outputers: TangOutputer[];

  hooks?: TangHook[];
}

/** 处理器获取选项 */
export interface ProcessorGetOptions {
  type?: TangProcessorTypeNames; // 处理器类型
  processors: TangProcessor[]; // 待选择处理器
  processor?: string | TangProcessor;
  processMethodName: string;
  processOptionsName: string;
  defaultProcessor?: TangProcessor;
  testProcessor?: (processor: TangProcessor, ...args: any[]) => boolean;
  testOptions?: any;
  [prop: string]: any;
}
