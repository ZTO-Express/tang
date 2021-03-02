import { HookDriver } from '../common';
/** 处理器获取选项 */
export interface ProcessorGetOptions {
    processors: TangProcessor[];
    processor?: string | TangProcessor;
    processMethodName: string;
    processOptionsName: string;
    defaultProcessor?: TangProcessor;
    testProcessor?: (processor: TangProcessor, ...args: any[]) => boolean;
    testOptions?: any;
    [prop: string]: any;
}
/**
 * 生成器
 */
export declare class Compiler implements TangCompiler {
    loaders: TangLoader[];
    defaultLoader: TangLoader;
    parsers: TangParser[];
    defaultParser: TangParser;
    generators: TangGenerator[];
    defaultGenerator: TangGenerator;
    outputers: TangOutputer[];
    defaultOutputer: TangOutputer;
    hookDriver: HookDriver;
    constructor(options: TangCompilerOptions);
    private initialize;
    /**
     * 初始化处理器
     * @param type 处理器类型
     * @param options 编译器初始化参数
     */
    private initializeProcessors;
    /**
     * 生成器加载文档后生成Compilation
     * @param doc 文档
     */
    load(entry: string, options?: TangCompilerLoadOptions): Promise<TangCompilation>;
    /**
     * 生成文档
     * @param document
     */
    generate(document: TangDocument, options?: TangCompilerGenerateOptions): Promise<TangOutput>;
    /**
     * 根据加载选项选择loader，默认选择第一个
     * @param options 加载选项
     */
    getLoader(options: TangCompilerLoadOptions): TangLoader | undefined;
    /**
     * 初步判断目标文件是否能被加载器加载
     * @param entry 验证目标
     */
    testLoader(loader: TangLoader, options?: string | TangCompilerLoadOptions): boolean;
    /**
     * 根据加载选项选择parser，默认选择第一个
     * @param options 加载选项
     */
    getParser(options?: TangCompilerLoadOptions): TangParser | undefined;
    /**
     * 根据生成项选择generator
     * @param options 生成选项
     */
    getGenerator(options?: TangCompilerGenerateOptions): TangGenerator | undefined;
    /**
     * 根据生成选项选择输出
     * @param options
     */
    getOutputer(options?: TangCompilerGenerateOptions): TangOutputer | undefined;
    /** 选择处理器 */
    getProcessor<T extends TangProcessor>(options: ProcessorGetOptions): T | undefined;
    /**
     * 根据优先级排序，排序将产生新的数组，默认优先级10
     * @param items 排序对象
     */
    private sortByPriority;
}
