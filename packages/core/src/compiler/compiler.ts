import {
  GenericConfigObject,
  TangCompilation,
  TangCompiler,
  TangCompilerContext,
  TangCompileOptions,
  TangCompilerGenerateOptions,
  TangCompilerLoadOptions,
  TangCompilerInspectOptions,
  TangDocument,
  HookDriver,
  TangGenerator,
  TangLoader,
  TangOutputer,
  TangParser,
  TangProcessor,
  TangProcessorTypeNames,
  GeneratorError,
  OutputerError,
  LoaderError,
  TangProcessorTypes,
  ParserError,
  utils,
  TangModuleTypes,
} from '@devs-tang/common';

import { CompilerOptions, ProcessorGetOptions } from './declarations';

/**
 * 生成器
 */
export class DefaultTangCompiler implements TangCompiler {
  context: TangCompilerContext;

  hookDriver: HookDriver<TangCompilation>;

  loaders: TangLoader[]; // 加载器
  defaultLoader: TangLoader; // 默认加载器

  parsers: TangParser[]; // 解析器
  defaultParser: TangParser; // 默认解析器

  generators: TangGenerator[]; // 生成器
  defaultGenerator: TangGenerator; // 默认生成器

  outputers: TangOutputer[]; // 输出器
  defaultOutputer: TangOutputer; /// 默认输出器

  compileOptions: TangCompileOptions;

  constructor(options: CompilerOptions, context: TangCompilerContext) {
    this.context = context;
    this.initialize(options);
    this.hookDriver = new HookDriver<TangCompilation>(options.hooks);
  }

  // 是否工作区编译器
  get isWorkspace() {
    return this.context?.isWorkspace === true;
  }

  private initialize(options: CompilerOptions) {
    this.compileOptions = options.compileOptions || {};

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

    const compilation: TangCompilation = {
      entry,
      compiler: (this as any) as TangCompiler,
      document: {
        entry: options.entry,
        content: undefined,
        model: undefined,
      },
      loadProcessOptions: options,
    };

    if (this.compileOptions.skipLoad !== true) {
      const loader = this.getLoader(compilation, options);
      if (!loader) throw new LoaderError('未找到加载器');

      compilation.loader = loader;

      // 调用加载开始钩子
      await this.hookDriver.hookSeq('load', compilation);

      // 加载器加载文档
      const loadDocument = await loader.load(
        compilation.document,
        loader.loadOptions,
        compilation,
        this.context,
      );

      if (loadDocument) {
        // 如果加载的内容为对象，则直接赋给model
        if (utils.isObject(loadDocument.content)) {
          loadDocument.model = loadDocument.content;
        }

        compilation.document = loadDocument;
      }
    }

    if (this.compileOptions.skipParse !== true) {
      const parser = this.getParser(compilation, options);
      if (!parser) throw new ParserError('未找到解析器');

      compilation.parser = parser;

      // 调用加载结束钩子
      await this.hookDriver.hookSeq('parse', compilation);

      // 解析器解析文档内容
      const parseDocument = await parser.parse(
        compilation.document,
        parser.parseOptions,
        compilation,
        this.context,
      );

      if (parseDocument) compilation.document = parseDocument;
    }

    // 调用加载结束钩子
    await this.hookDriver.hookSeq('loaded', compilation);

    return compilation;
  }

  /**
   * 生成文档
   * @param document
   */
  async generate(
    document: TangDocument,
    options?: TangCompilerGenerateOptions,
    compilation?: TangCompilation,
  ): Promise<TangCompilation> {
    compilation = Object.assign(
      {
        entry: document.entry,
        document,
        compiler: this,
      },
      compilation,
      { generateProcessOptions: options },
    );

    if (this.compileOptions.skipGenerate !== true) {
      const generator = this.getGenerator(compilation, options);
      if (!generator) throw new GeneratorError('未找到生成器');

      compilation.generator = generator;

      // 调用生成钩子
      await this.hookDriver.hookSeq('generate', compilation);

      const generateDocument = await generator.generate(
        compilation.document,
        generator.generateOptions,
        compilation,
        this.context,
      );

      if (generateDocument) compilation.document = generateDocument;
    }

    if (this.compileOptions.skipOutput !== true) {
      const outputer = this.getOutputer(compilation, options);
      if (!outputer) throw new OutputerError('未找到输出器');

      // 调用输出钩子
      await this.hookDriver.hookSeq('output', compilation);

      // 输出器生成
      compilation.output = await outputer.output(
        compilation.document,
        outputer.outputOptions,
        compilation,
        this.context,
      );

      await this.hookDriver.hookParallel('generated', compilation);
    }

    return compilation;
  }

  /**
   * 测试编译器生成时完整配置
   * @param entry
   * @param options
   * @returns
   */
  async inspect(options: TangCompilerInspectOptions): Promise<TangCompilation> {
    const compilation: TangCompilation = {
      entry: options.entry,
    };

    compilation.loader = this.getLoader(compilation, options);
    compilation.parser = this.getParser(compilation, options);
    compilation.generator = this.getGenerator(compilation, options);
    compilation.outputer = this.getOutputer(compilation, options);

    return compilation;
  }

  /**
   * 根据加载选项选择loader，默认选择第一个
   * @param options 加载选项
   */
  getLoader(
    compilation: TangCompilation,
    options: TangCompilerLoadOptions = {},
  ): TangLoader | undefined {
    const loader = this.getProcessor<TangLoader>(compilation, {
      type: TangProcessorTypes.loader,
      processors: this.loaders,
      processMethodName: 'load',
      processOptionsName: 'loadOptions',
      defaultProcessor: this.defaultLoader,
      processorOptions: options.loader,
      testOptions: options,
      loadOptions: options.loadOptions,
    });

    return loader;
  }

  /**
   * 根据加载选项选择parser，默认选择第一个
   * @param options 加载选项
   */
  getParser(
    compilation: TangCompilation,
    options: TangCompilerLoadOptions = {},
  ): TangParser | undefined {
    const parser = this.getProcessor<TangParser>(compilation, {
      type: TangProcessorTypes.parser,
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
    compilation: TangCompilation,
    options: TangCompilerGenerateOptions = {},
  ): TangGenerator | undefined {
    const generator = this.getProcessor<TangGenerator>(compilation, {
      type: TangProcessorTypes.generator,
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
  getOutputer(
    compilation: TangCompilation,
    options: TangCompilerGenerateOptions = {},
  ): TangOutputer | undefined {
    const outputer = this.getProcessor<TangOutputer>(compilation, {
      type: TangProcessorTypes.outputer,
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
    compilation: TangCompilation,
    options: ProcessorGetOptions,
  ): T | undefined {
    const processorType: any = options.type;

    if (this.context.isWorkspace) {
    }

    const processorOptions: any = options.processorOptions || {};
    const processMethodName = options.processMethodName;
    const processOptionsName = options.processOptionsName;
    const defaultProcessor = (options.defaultProcessor as any) as T;
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
      this.testProcessor(defaultProcessor as any, compilation, testOptions)
    ) {
      // 如果未提供processr测尝试使用默认processr
      processor = defaultProcessor;
    } else {
      // 如果未提供parser及默认parser测尝试使用第一个parser
      processor = processors.filter(p =>
        this.testProcessor(p as any, compilation, testOptions),
      )[0];
    }

    if (!processor) return undefined;

    // 合并参数
    processor[processOptionsName] = utils.deepMerge(
      processor[processOptionsName],
      processorOptions[processOptionsName],
      options[processOptionsName],
    ) as GenericConfigObject;

    // 附加默认type
    if (!processor.type && processorType) {
      processor.type = processorType;
    }

    // 附加默认处理器名称
    if (!processor.name && this.isWorkspace) {
      processor.name = 'unknown';
    }

    // 附加默认moduleType
    if (!processor.moduleType && this.isWorkspace) {
      processor.moduleType = TangModuleTypes.workspace;
    }

    const result = utils.deepClone(processor) as T;
    return result;
  }

  /**
   * 初步判断目标文件是否能被加载器加载
   * @param entry 验证目标
   */
  testProcessor(
    processor: TangProcessor,
    compilation: TangCompilation,
    testOptions?: any,
  ): boolean {
    if (!compilation) return false;

    const entry: string = compilation.entry;

    // 没有test，有entry返回true, 没有entry返回false
    if (!processor.test) return !!entry;

    if (typeof processor.test === 'string') {
      return new RegExp(processor.test).test(entry);
    } else if (processor.test instanceof RegExp) {
      return processor.test.test(entry);
    } else if (typeof processor.test === 'function') {
      return processor.test(compilation, testOptions);
    }

    return false;
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
