import { error } from '../common';
import { findBy, sortBy, deepClone, deepMerge } from '../utils';
import {
  TangDocumentLoader,
  TangDocumentParser,
  CompilerOptions,
  GenericConfigObject,
} from '../tang/types';
import { Compilation } from './Compilation';

/** 加载选项 */
export interface CompilerLoadOptions {
  entry?: string;
  loader?: string | TangDocumentLoader;
  loadOptions?: GenericConfigObject;
  parser?: string | TangDocumentParser;
  parseOptions?: GenericConfigObject;
}

/**
 * 生成器
 */
export class Compiler {
  loaders: TangDocumentLoader[];
  parsers: TangDocumentParser[];
  defaultLoader: TangDocumentLoader;
  defaultParser: TangDocumentParser;

  constructor(options: CompilerOptions) {
    this.loaders = this.sortByPriority(options.loaders);
    this.parsers = this.sortByPriority(options.parsers);

    if (typeof options.defaultLoader === 'string') {
      this.defaultLoader = this.loaders.find(
        item => item.name === options.defaultLoader,
      );
    } else {
      this.defaultLoader = options.defaultLoader || this.loaders[0];
    }

    if (typeof options.defaultParser === 'string') {
      this.defaultParser = this.parsers.find(
        item => item.name === options.defaultParser,
      );
    } else {
      this.defaultParser = options.defaultParser || this.parsers[0];
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
    const docContent = await loader.load(entry, loader.loadOptions);
    // TODO: 新增加载结束事件

    // 解析器解析文档内容
    // TODO: 新增解析开始事件
    const docModel = await parser.parse(docContent, parser.parseOptions);
    // TODO: 新增解析完成事件

    // TODO 获取生成器实例

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
   * 根据加载选项选择loader，默认选择第一个
   * @param options 加载选项
   */
  getLoader(options: CompilerLoadOptions): TangDocumentLoader | undefined {
    const entry = options.entry;
    const loaderOptions: any = options.loader || {};

    let loader: TangDocumentLoader;

    // 根据加载的文件的不同，创建加载器实例
    if (typeof loaderOptions === 'string') {
      // 如果有名字，则直接通过名字查找loader，并不进行test验证
      loader = findBy<TangDocumentLoader>(this.loaders, 'name', loaderOptions);
    } else if (typeof loaderOptions.load === 'function') {
      // 如果选项中存在load方法，则此选项本身就是加载器
      loader = loaderOptions as TangDocumentLoader;
    } else if (this.testLoader(this.defaultLoader, entry)) {
      // 如果未提供loader测尝试使用默认loader
      loader = this.defaultLoader;
    } else {
      // 如果未提供loader及默认loader测尝试使用符合test条件的第一个loader
      loader = this.loaders.filter(l => this.testLoader(l, entry))[0];
    }

    if (!loader) return undefined;

    loader.loadOptions = deepMerge(
      loader.loadOptions,
      loaderOptions.loadOptions,
      options.loadOptions,
    ) as GenericConfigObject;

    const result = deepClone(loader);
    return result;
  }

  /**
   * 初步判断目标文件是否能被加载器加载
   * @param entry 验证目标
   */
  testLoader(loader: TangDocumentLoader, entry: string): boolean {
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
    const parserOptions: any = options.parser || {};

    let parser: TangDocumentParser;

    if (typeof parserOptions === 'string') {
      // 如果有名字，则直接通过名字查找loader，并不进行test验证
      parser = findBy<TangDocumentParser>(this.parsers, 'name', parserOptions);
    } else if (typeof parserOptions.parse === 'function') {
      // 如果选项中存在parse方法，则此选项本身就是解析器
      parser = parserOptions as TangDocumentParser;
    } else if (this.defaultParser) {
      // 如果未提供parser测尝试使用默认parser
      parser = this.defaultParser;
    } else {
      // 如果未提供parser及默认parser测尝试使用第一个parser
      parser = this.parsers[0];
    }

    if (!parser) return undefined;

    parser.parseOptions = deepMerge(
      parser.parseOptions,
      parserOptions.parseOptions,
      options.parseOptions,
    ) as GenericConfigObject;

    const result = deepClone(parser);
    return result;
  }

  /**
   * 根据优先级排序，排序将产生新的数组，默认优先级10
   * @param items 排序对象
   */
  private sortByPriority<T>(items: any[]) {
    return sortBy<T>(items, 'priority', {
      defaultValue: 10,
    });
  }
}
