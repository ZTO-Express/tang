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

// 编译器处理器执行选项
export interface CompilerProcessOptions
  extends TangCompilerLoadOptions,
    TangCompilerGenerateOptions {}

// 编译器检查选项
export interface CompilerInspectOptions extends CompilerProcessOptions {
  entry: string;
}

/** 处理器获取选项 */
export interface ProcessorGetOptions {
  type?: TangProcessorTypeNames; // 处理器类型
  processors: TangProcessor[]; // 待选择处理器
  processor?: string | TangProcessor;
  processMethodName: string;
  processOptionsName: string;
  defaultProcessor?: TangProcessor;
  testOptions?: any;
  [prop: string]: any;
}
