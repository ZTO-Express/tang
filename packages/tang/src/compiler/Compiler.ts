import { findBy, sortBy, clone } from '../utils';
import { DocumentLoader, DocumentParser, CompilerOptions } from '../tang/types';
import { Compilation } from './Compilation';

/** 加载选项 */
export interface CompilerLoadOptions {
  entry?: string;
  loader?: string | DocumentLoader;
  parser?: string | DocumentParser;
}

/**
 * 生成器
 */
export class Compiler {
  private _loaders: DocumentLoader[];
  private _parsers: DocumentParser[];

  constructor(options: CompilerOptions) {
    this._loaders = this.sortByPriority(options.loaders);
    this._parsers = this.sortByPriority(options.parsers);
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

    const { loader, loadOptions } = this.getLoader(options);
    const { parser, parseOptions } = this.getParser(options);

    // 加载器加载文档
    // TODO: 新增加载开始事件
    const docContent = await loader.load(entry, loadOptions);
    // TODO: 新增加载结束事件

    // 解析器解析文档内容
    // TODO: 新增解析开始事件
    const document = await parser.parse(docContent, parseOptions);
    // TODO: 新增解析完成事件

    // TODO 获取生成器实例

    // 创建生成实例
    const compilation = new Compilation(this, document);

    return compilation;
  }

  /**
   * 根据加载选项选择loader，默认选择第一个
   * @param options 加载选项
   */
  getLoader(options: CompilerLoadOptions) {
    const entry = options.entry;

    let loaderOptions: any = options.loader || {};
    let loadOptions: any = {}; // loader执行时配置

    // 根据加载的文件的不同，创建加载器实例
    if (typeof loaderOptions === 'string') {
      loaderOptions = { name: loaderOptions };
    }

    let loader: DocumentLoader;

    if (typeof loaderOptions.load === 'function') {
      // 如果选项中存在load方法，则此选项本身就是加载器
      loader = loaderOptions as DocumentLoader;
    } else if (loaderOptions.name) {
      // 如果有名字，则直接通过名字查找loader，并不进行test验证
      loader = findBy<DocumentLoader>(
        this._loaders,
        'name',
        loaderOptions.name,
      );
    } else {
      loader = this._loaders.filter(l => {
        return this.testLoader(l, entry);
      })[0];
    }

    loadOptions = Object.assign(
      clone(loader && loader.loadOptions),
      loaderOptions.loadOptions,
    );

    return { loader, loadOptions };
  }

  /**
   * 初步判断目标文件是否能被加载器加载
   * @param entry 验证目标
   */
  async testLoader(loader: DocumentLoader, entry: string) {
    if (!loader.test) return true;

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
  getParser(options?: CompilerLoadOptions) {
    if (!options || !options.parser) {
      return {
        parser: this._parsers[0],
      };
    }

    let parserOptions: any = options.parser;
    let parseOptions: any = {}; // parser执行时配置

    // 根据加载的文件的不同，创建加载器实例
    if (typeof options.parser === 'string') {
      parserOptions = { name: options.parser };
    }

    let parser: DocumentParser;

    if (typeof parserOptions.parse === 'function') {
      // 如果选项中存在parse方法，则此选项本身就是解析器
      parser = parserOptions as DocumentParser;
    } else if (parserOptions.name) {
      // 如果选项中存在名称，则通过名称查找加载器
      parser = findBy<DocumentParser>(
        this._parsers,
        'name',
        parserOptions.name,
      );
    }

    if (parserOptions.parseOptions) {
      parseOptions = parserOptions.parseOptions;
    }

    return { parser, parseOptions };
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
