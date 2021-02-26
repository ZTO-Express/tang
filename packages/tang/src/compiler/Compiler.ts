import { error } from '../common';
import {
  findBy,
  sortBy,
  deepClone,
  deepMerge,
  capitalizeFirst,
} from '../utils';

import {
  TangDocumentLoader,
  TangDocumentParser,
  CompilerOptions,
  GenericConfigObject,
  TangDocument,
  TangDocumentGenerator,
  TangDocumentOutputer,
  TangDocumentProcesser,
  TangDocumentProcesserTypes,
} from '../common/types';
import { Compilation } from './Compilation';

/** 加载选项 */
export interface CompilerLoadOptions {
  entry?: string;
  loader?: string | TangDocumentLoader;
  loadOptions?: GenericConfigObject;
  parser?: string | TangDocumentParser;
  parseOptions?: GenericConfigObject;
}

/** 生成选项 */
export interface CompilerGenerateOptions {
  generator?: string | TangDocumentGenerator;
  generateOptions?: GenericConfigObject;
  outputer?: string | TangDocumentOutputer;
  outputOptions?: GenericConfigObject;
}

/** 处理器获取选项 */
export interface ProcesserGetOptions {
  processers: TangDocumentProcesser[]; // 带选择处理器
  processer?: string | TangDocumentProcesser;
  processMethodName: string;
  processOptionsName: string;
  defaultProcesser?: TangDocumentProcesser;
  testProcesser?: (processer: TangDocumentProcesser, ...args: any[]) => boolean;
  testOptions?: any;
  [prop: string]: any;
}

/**
 * 生成器
 */
export class Compiler {
  loaders: TangDocumentLoader[]; // 加载器
  defaultLoader: TangDocumentLoader; // 默认加载器

  parsers: TangDocumentParser[]; // 解析器
  defaultParser: TangDocumentParser; // 默认解析器

  generators: TangDocumentGenerator[]; // 生成器
  defaultGenerator: TangDocumentGenerator; // 默认生成器

  outputers: TangDocumentOutputer[]; // 输出器
  defaultOutputer: TangDocumentOutputer; /// 默认输出器

  constructor(options: CompilerOptions) {
    this.initialize(options);
  }

  initialize(options: CompilerOptions) {
    this.initilizeProcesser('loader', options); // 初始化加载器
    this.initilizeProcesser('parser', options); // 初始化解析器
    this.initilizeProcesser('generator', options); // 初始化生成器
    this.initilizeProcesser('outputer', options); // 初始化输出器
  }

  /**
   * 初始化处理器
   * @param type 处理器类型
   * @param options 编译器初始化参数
   */
  initilizeProcesser(
    type: TangDocumentProcesserTypes,
    options: CompilerOptions,
  ) {
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
    options?: CompilerLoadOptions,
  ): Promise<Compilation> {
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

    // 加载器加载文档
    // TODO: 新增加载开始事件
    const docContent = await loader.load(entry, loader.processOptions);
    // TODO: 新增加载结束事件

    // 解析器解析文档内容
    // TODO: 新增解析开始事件
    const docModel = await parser.parse(docContent, parser.processOptions);
    // TODO: 新增解析完成事件

    const document = {
      entry: options.entry,
      content: docContent,
      model: docModel,
    };

    const compilation = new Compilation(this, {
      loader,
      parser,
      document,
    });

    return compilation;
  }

  /**
   * 生成文档
   * @param document
   */
  async generate(document: TangDocument, options?: CompilerGenerateOptions) {
    const generator = this.getGenerator(options);
    if (!generator)
      error.throwError({
        code: error.Errors.BAD_GENERATOR,
        message: '未找到生成器',
      });

    const outputer = this.getOutputer(options);
    if (!generator)
      error.throwError({
        code: error.Errors.BAD_OUTPUTER,
        message: '未找到输出器',
      });

    // 生成器生成
    // TODO: 新增生成开始事件
    const generation = await generator.generate(
      document,
      generator.generateOptions,
    );
    // TODO: 新增生成结束事件

    // 输出器生成
    // TODO: 新增输出开始事件
    const output = await outputer.output(generation, outputer.outputOptions);
    // TODO: 新增输出结束事件

    return output;
  }

  /**
   * 根据加载选项选择loader，默认选择第一个
   * @param options 加载选项
   */
  getLoader(options: CompilerLoadOptions): TangDocumentLoader | undefined {
    const loader = this.getProcesser<TangDocumentLoader>({
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
    loader: TangDocumentLoader,
    options?: string | CompilerLoadOptions,
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
  getParser(options?: CompilerLoadOptions): TangDocumentParser | undefined {
    const parser = this.getProcesser<TangDocumentParser>({
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
    options?: CompilerGenerateOptions,
  ): TangDocumentGenerator | undefined {
    const generator = this.getProcesser<TangDocumentGenerator>({
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
  getOutputer(
    options?: CompilerGenerateOptions,
  ): TangDocumentOutputer | undefined {
    const outputer = this.getProcesser<TangDocumentOutputer>({
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
  getProcesser<T extends TangDocumentProcesser>(
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
        processer = processers[0];
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
  private sortByPriority<T>(items: TangDocumentProcesser[]) {
    return sortBy<T>(items, 'priority', {
      defaultValue: 10,
    });
  }
}
