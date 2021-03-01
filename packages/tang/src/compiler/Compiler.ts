import { error } from '../common';
import {
  findBy,
  sortBy,
  deepClone,
  deepMerge,
  capitalizeFirst,
} from '../utils';

import {
  TangLoader,
  TangParser,
  CompilerOptions,
  GenericConfigObject,
  TangDocument,
  TangGenerator,
  TangOutputer,
  TangProcesser,
  TangProcesserTypes,
  TangCompilation,
  TangCompiler,
  TangCompilerLoadOptions,
  TangCompilerGenerateOptions,
  TangOutput,
  TangHookContext,
} from '../common/types';
import { HookDriver } from '../common';
import { Compilation } from './Compilation';

/** 处理器获取选项 */
export interface ProcesserGetOptions {
  processers: TangProcesser[]; // 带选择处理器
  processer?: string | TangProcesser;
  processMethodName: string;
  processOptionsName: string;
  defaultProcesser?: TangProcesser;
  testProcesser?: (processer: TangProcesser, ...args: any[]) => boolean;
  testOptions?: any;
  [prop: string]: any;
}

/**
 * 生成器
 */
export class Compiler implements TangCompiler {
  loaders: TangLoader[]; // 加载器
  defaultLoader: TangLoader; // 默认加载器

  parsers: TangParser[]; // 解析器
  defaultParser: TangParser; // 默认解析器

  generators: TangGenerator[]; // 生成器
  defaultGenerator: TangGenerator; // 默认生成器

  outputers: TangOutputer[]; // 输出器
  defaultOutputer: TangOutputer; /// 默认输出器

  hookDriver: HookDriver;

  constructor(options: CompilerOptions) {
    this.initialize(options);

    this.hookDriver = new HookDriver(options.hooks);
  }

  initialize(options: CompilerOptions) {
    this.initializeProcessers('loader', options); // 初始化加载器
    this.initializeProcessers('parser', options); // 初始化解析器
    this.initializeProcessers('generator', options); // 初始化生成器
    this.initializeProcessers('outputer', options); // 初始化输出器
  }

  /**
   * 初始化处理器
   * @param type 处理器类型
   * @param options 编译器初始化参数
   */
  initializeProcessers(type: TangProcesserTypes, options: CompilerOptions) {
    const processersName = `${type}s`;
    const defaultProcesserName = `default${capitalizeFirst(type)}`;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thiz: any = this;
    const opts: any = options;

    const processers: any[] = this.sortByPriority(opts[processersName]);

    // 设置processers
    thiz[processersName] = processers;

    // 设置默认processer，如defaultLoader,defaultParser,defaultGenerator,def
    if (typeof opts[defaultProcesserName] === 'string') {
      thiz[defaultProcesserName] = processers.find(
        item => item.name === opts[defaultProcesserName],
      );
    } else {
      thiz[defaultProcesserName] = opts[defaultProcesserName] || processers[0];
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
    if (!loader)
      error.throwError({
        code: error.Errors.BAD_LOADER,
        message: '未找到加载器',
      });

    const parser = this.getParser(options);
    if (!parser)
      error.throwError({
        code: error.Errors.BAD_PARSER,
        message: '未找到解析器',
      });

    const document: any = {
      entry: options.entry,
      content: undefined,
      model: null,
    };

    const hookContext: TangHookContext = {
      compiler: this,
      loader,
      parser,
      document,
      compilation: undefined,
    };

    // 调用加载开始钩子
    await this.hookDriver.hookSeq('load', hookContext);

    // 加载器加载文档
    document.content = await loader.load(entry, loader.loadOptions);

    // 调用加载结束钩子
    await this.hookDriver.hookSeq('parse', hookContext);

    // 解析器解析文档内容
    const docModel = await parser.parse(document.content, parser.parseOptions);
    document.model = docModel;

    const compilation = new Compilation(this, {
      loader,
      parser,
      document,
    });

    // 调用加载结束钩子
    hookContext.compilation = compilation;
    await this.hookDriver.hookSeq('loaded', hookContext);

    return compilation;
  }

  /**
   * 生成文档
   * @param document
   */
  async generate(
    document: TangDocument,
    options?: TangCompilerGenerateOptions,
  ): Promise<TangOutput> {
    const generator = this.getGenerator(options);
    if (!generator)
      error.throwError({
        code: error.Errors.BAD_GENERATOR,
        message: '未找到生成器',
      });

    const outputer = this.getOutputer(options);
    if (!outputer)
      error.throwError({
        code: error.Errors.BAD_OUTPUTER,
        message: '未找到输出器',
      });

    const hookContext: TangHookContext = {
      compiler: this,
      generator,
      outputer,
      document,
      generation: undefined,
      output: undefined,
    };

    // 调用生成钩子
    await this.hookDriver.hookSeq('generate', hookContext);

    const generation = await generator.generate(
      document,
      generator.generateOptions,
    );
    generation.document = document;

    // 调用输出钩子
    hookContext.generation = generation;
    await this.hookDriver.hookSeq('output', hookContext);

    // 输出器生成
    const output = await outputer.output(generation, outputer.outputOptions);

    // 调用生成完成钩子
    hookContext.output = output;
    await this.hookDriver.hookParallel('generated', hookContext);

    return output;
  }

  /**
   * 根据加载选项选择loader，默认选择第一个
   * @param options 加载选项
   */
  getLoader(options: TangCompilerLoadOptions): TangLoader | undefined {
    const loader = this.getProcesser<TangLoader>({
      processers: this.loaders,
      processMethodName: 'load',
      processOptionsName: 'loadOptions',
      defaultProcesser: this.defaultLoader,
      processer: options.loader,
      testProcesser: this.testLoader as any,
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
    const parser = this.getProcesser<TangParser>({
      processers: this.parsers,
      processMethodName: 'parse',
      processOptionsName: 'parseOptions',
      defaultProcesser: this.defaultParser,
      processer: options.parser,
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
    const generator = this.getProcesser<TangGenerator>({
      processers: this.generators,
      processMethodName: 'generate',
      processOptionsName: 'generateOptions',
      defaultProcesser: this.defaultGenerator,
      processer: options.generator,
      generateOptions: options.generateOptions,
    });

    return generator;
  }

  /**
   * 根据生成选项选择输出
   * @param options
   */
  getOutputer(options?: TangCompilerGenerateOptions): TangOutputer | undefined {
    const outputer = this.getProcesser<TangOutputer>({
      processers: this.outputers,
      processMethodName: 'output',
      processOptionsName: 'outputOptions',
      defaultProcesser: this.defaultOutputer,
      processer: options.outputer,
      outputOptions: options.outputOptions,
    });

    return outputer;
  }

  /** 选择处理器 */
  getProcesser<T extends TangProcesser>(
    options: ProcesserGetOptions,
  ): T | undefined {
    const processerOptions: any = options.processer || {};
    const processMethodName = options.processMethodName;
    const processOptionsName = options.processOptionsName;
    const defaultProcesser = options.defaultProcesser as T;
    const processers = options.processers as T[];
    const testProcesser = options.testProcesser;
    const testOptions = options.testOptions;

    let processer: any;

    if (typeof processerOptions === 'string') {
      // 如果有名字，则直接通过名字查找loader，并不进行test验证
      processer = findBy<T>(processers, 'name', processerOptions);
    } else if (typeof processerOptions[processMethodName] === 'function') {
      // 如果选项中存在process方法，则此选项本身就是处理器
      processer = processerOptions as T;
    } else if (
      defaultProcesser &&
      (!testProcesser || testProcesser(defaultProcesser, testOptions))
    ) {
      // 如果未提供processr测尝试使用默认processr
      processer = defaultProcesser;
    } else {
      // 如果未提供parser及默认parser测尝试使用第一个parser
      if (!testProcesser) {
        processer = processers[0]; // 一般情况，代码不会走到这里
      } else {
        processer = processers.filter(p => testProcesser(p, testOptions))[0];
      }
    }

    if (!processer) return undefined;

    // 合并参数
    processer[processOptionsName] = deepMerge(
      processer[processOptionsName],
      processerOptions[processOptionsName],
      options[processOptionsName],
    ) as GenericConfigObject;

    const result = deepClone(processer) as T;
    return result;
  }

  /**
   * 根据优先级排序，排序将产生新的数组，默认优先级10
   * @param items 排序对象
   */
  private sortByPriority<T>(items: TangProcesser[]) {
    return sortBy<T>(items, 'priority', {
      defaultValue: 10,
    });
  }
}
