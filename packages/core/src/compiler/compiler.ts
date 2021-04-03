import {
  GenericConfigObject,
  TangCompilation,
  TangCompiler,
  TangCompilerGenerateOptions,
  TangCompilerLoadOptions,
  Document,
  HookDriver,
  TangGenerator,
  TangCompileContext,
  TangLoader,
  TangOutput,
  TangOutputer,
  TangParser,
  TangProcessor,
  TangProcessorTypeNames,
  GeneratorError,
  OutputerError,
  LoaderError,
  utils,
  TangProcessorTypes,
  ParserError,
} from '@devs-tang/common';

import {
  CompilerInspectOptions,
  CompilerOptions,
  ProcessorGetOptions,
} from './compiler.interfaces';
import { Compilation } from './compilation';

/**
 * 生成器
 */
export class Compiler implements TangCompiler {
  hookDriver: HookDriver<TangCompileContext>;

  loaders: TangLoader[]; // 加载器
  defaultLoader: TangLoader; // 默认加载器

  parsers: TangParser[]; // 解析器
  defaultParser: TangParser; // 默认解析器

  generators: TangGenerator[]; // 生成器
  defaultGenerator: TangGenerator; // 默认生成器

  outputers: TangOutputer[]; // 输出器
  defaultOutputer: TangOutputer; /// 默认输出器

  constructor(options: CompilerOptions) {
    this.initialize(options);
    this.hookDriver = new HookDriver<TangCompileContext>(options.hooks);
  }

  private initialize(options: CompilerOptions) {
    for (const type in TangProcessorTypes) {
      this.initializeProcessors(type as TangProcessorTypeNames, options);
    }
  }

  /**
   * 初始化处理器
   * @param type 处理器类型
   * @param options 编译器初始化参数
   */
  private initializeProcessors(
    type: TangProcessorTypeNames,
    options: CompilerOptions,
  ) {
    const processorsName = `${type}s`;
    const defaultProcessorName = `default${utils.strings.capitalize(type)}`;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thiz: any = this;
    const opts: any = options;

    const processors: any[] = this.sortByPriority(opts[processorsName]);

    // 设置processors
    thiz[processorsName] = processors;

    // 设置默认processor，如defaultLoader,defaultParser,defaultGenerator,def
    if (typeof opts[defaultProcessorName] === 'string') {
      thiz[defaultProcessorName] = processors.find(
        item => item.name === opts[defaultProcessorName],
      );
    } else {
      thiz[defaultProcessorName] = opts[defaultProcessorName] || processors[0];
    }
  }

  /**
   * 生成器加载文档后生成Compilation
   * @param doc 文档
   */
  async load(
    entry: string,
    options?: TangCompilerLoadOptions,
  ): Promise<TangCompilation> {
    options = options || {};
    options.entry = entry;

    const loader = this.getLoader(options);
    if (!loader) throw new LoaderError('未找到加载器');

    const parser = this.getParser(options);
    if (!parser) throw new ParserError('未找到解析器');

    const document: any = {
      entry: options.entry,
      content: undefined,
      model: null,
    };

    const compileContext: TangCompileContext = {
      compiler: this,
      loader,
      parser,
      document,
      compilation: undefined,
    };

    // 调用加载开始钩子
    await this.hookDriver.hookSeq('load', compileContext);

    // 加载器加载文档
    document.content = await loader.load(
      entry,
      loader.loadOptions,
      compileContext,
    );

    // 调用加载结束钩子
    await this.hookDriver.hookSeq('parse', compileContext);

    // 解析器解析文档内容
    const docModel = await parser.parse(
      document.content,
      parser.parseOptions,
      compileContext,
    );
    document.model = docModel;

    const compilation = new Compilation(this, {
      loader,
      parser,
      document,
    });

    // 调用加载结束钩子
    compileContext.compilation = compilation;
    await this.hookDriver.hookSeq('loaded', compileContext);

    return compilation;
  }

  /**
   * 生成文档
   * @param document
   */
  async generate(
    document: Document,
    options?: TangCompilerGenerateOptions,
  ): Promise<TangOutput> {
    const generator = this.getGenerator(options);
    if (!generator) throw new GeneratorError('未找到生成器');

    const outputer = this.getOutputer(options);
    if (!outputer) throw new OutputerError('未找到输出器');

    const compileContext: TangCompileContext = {
      compiler: this,
      generator,
      outputer,
      document,
      generation: undefined,
      output: undefined,
    };

    // 调用生成钩子
    await this.hookDriver.hookSeq('generate', compileContext);

    const generateResult = await generator.generate(
      document,
      generator.generateOptions,
      compileContext,
    );

    const generation = { document: document, ...generateResult };

    // 调用输出钩子
    compileContext.generation = generation;
    await this.hookDriver.hookSeq('output', compileContext);

    // 输出器生成
    const output = await outputer.output(
      generation,
      outputer.outputOptions,
      compileContext,
    );

    // 调用生成完成钩子
    compileContext.output = output;
    await this.hookDriver.hookParallel('generated', compileContext);

    return output;
  }

  /**
   * 测试编译器生成时完整配置
   * @param entry
   * @param options
   * @returns
   */
  async inspect(options: CompilerInspectOptions) {
    const loader = this.getLoader(options);
    const parser = this.getParser(options);
    const generator = this.getGenerator(options);
    const outputer = this.getOutputer(options);

    return {
      loader,
      parser,
      generator,
      outputer,
    };
  }

  /**
   * 根据加载选项选择loader，默认选择第一个
   * @param options 加载选项
   */
  getLoader(options: TangCompilerLoadOptions): TangLoader | undefined {
    const loader = this.getProcessor<TangLoader>({
      processors: this.loaders,
      processMethodName: 'load',
      processOptionsName: 'loadOptions',
      defaultProcessor: this.defaultLoader,
      processorOptions: options.loader,
      testProcessor: this.testLoader as any,
      testOptions: options,
      loadOptions: options.loadOptions,
    });

    return loader;
  }

  /**
   * 初步判断目标文件是否能被加载器加载
   * @param entry 验证目标
   */
  testLoader(
    loader: TangLoader,
    options?: string | TangCompilerLoadOptions,
  ): boolean {
    let entry: string;

    if (typeof options === 'string') {
      entry = options;
    } else if (options) {
      entry = options.entry;
    }

    if (!entry || !loader.test) return true;

    if (typeof loader.test === 'string') {
      return new RegExp(loader.test).test(entry);
    } else if (loader.test instanceof RegExp) {
      return loader.test.test(entry);
    } else if (typeof loader.test === 'function') {
      return loader.test(entry);
    }

    return false;
  }

  /**
   * 根据加载选项选择parser，默认选择第一个
   * @param options 加载选项
   */
  getParser(options?: TangCompilerLoadOptions): TangParser | undefined {
    const parser = this.getProcessor<TangParser>({
      processors: this.parsers,
      processMethodName: 'parse',
      processOptionsName: 'parseOptions',
      defaultProcessor: this.defaultParser,
      processorOptions: options.parser,
      parseOptions: options.parseOptions,
    });

    return parser;
  }

  /**
   * 根据生成项选择generator
   * @param options 生成选项
   */
  getGenerator(
    options?: TangCompilerGenerateOptions,
  ): TangGenerator | undefined {
    const generator = this.getProcessor<TangGenerator>({
      processors: this.generators,
      processMethodName: 'generate',
      processOptionsName: 'generateOptions',
      defaultProcessor: this.defaultGenerator,
      processorOptions: options.generator,
      generateOptions: options.generateOptions,
    });

    return generator;
  }

  /**
   * 根据生成选项选择输出
   * @param options
   */
  getOutputer(options?: TangCompilerGenerateOptions): TangOutputer | undefined {
    const outputer = this.getProcessor<TangOutputer>({
      processors: this.outputers,
      processMethodName: 'output',
      processOptionsName: 'outputOptions',
      defaultProcessor: this.defaultOutputer,
      processorOptions: options.outputer,
      outputOptions: options.outputOptions,
    });

    return outputer;
  }

  /**
   * 获取处理器，以及处理器执行时的参数
   * @param options 参数选项
   * @returns 处理器，以及处理器执行时的参数
   */
  getProcessor<T extends TangProcessor>(
    options: ProcessorGetOptions,
  ): T | undefined {
    const processorOptions: any = options.processorOptions || {};
    const processMethodName = options.processMethodName;
    const processOptionsName = options.processOptionsName;
    const defaultProcessor = (options.defaultProcessor as any) as T;
    const testProcessor = options.testProcessor;
    const testOptions = options.testOptions;
    const processors = (options.processors as any) as T[];

    let processor: any;

    if (typeof processorOptions === 'string') {
      // 如果有名字，则直接通过code或名字查找processor，并不进行test验证
      processor = utils.findBy<T>(processors, 'code', processorOptions);

      if (!processor) {
        processor = utils.findBy<T>(processors, 'name', processorOptions);
      }
    } else if (typeof processorOptions[processMethodName] === 'function') {
      // 如果选项中存在process方法，则此选项本身就是处理器
      processor = processorOptions as T;
    } else if (
      defaultProcessor &&
      (!testProcessor || testProcessor(defaultProcessor as any, testOptions))
    ) {
      // 如果未提供processr测尝试使用默认processr
      processor = defaultProcessor;
    } else {
      // 如果未提供parser及默认parser测尝试使用第一个parser
      processor = processors.filter(p =>
        testProcessor(p as any, testOptions),
      )[0];
    }

    if (!processor) return undefined;

    // 合并参数
    processor[processOptionsName] = utils.deepMerge(
      processor[processOptionsName],
      processorOptions[processOptionsName],
      options[processOptionsName],
    ) as GenericConfigObject;

    const result = utils.deepClone(processor) as T;
    return result;
  }

  /**
   * 根据优先级排序，排序将产生新的数组，默认优先级10
   * @param items 排序对象
   */
  private sortByPriority<T>(items: TangProcessor[]) {
    return utils.sortBy<T>(items, 'priority', {
      defaultValue: 10,
    });
  }
}
