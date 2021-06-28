import {
  TangProcessor,
  TangProcessorTypeNames,
  TangPresetOptions,
  TangCompilerLoadOptions,
  TangCompilerGenerateOptions,
} from '@devs-tang/common';

// 生成器配置选项
export interface CompilerOptions extends TangPresetOptions {
  [key: string]: any;
}

/** 处理器获取选项 */
export interface ProcessorGetOptions {
  type?: TangProcessorTypeNames; // 处理器类型
  processors: TangProcessor[]; // 待选择处理器
  processor?: string | TangProcessor;
  processMethodName: string;
  defaultProcessor?: TangProcessor;
  testOptions?: any;
  [prop: string]: any;
}
