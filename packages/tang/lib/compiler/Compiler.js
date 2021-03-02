"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const common_1 = require("../common");
const utils_1 = require("../utils");
const common_2 = require("../common");
const Compilation_1 = require("./Compilation");
/**
 * 生成器
 */
class Compiler {
    constructor(options) {
        this.initialize(options);
        this.hookDriver = new common_2.HookDriver(options.hooks);
    }
    initialize(options) {
        this.initializeProcessors('loader', options); // 初始化加载器
        this.initializeProcessors('parser', options); // 初始化解析器
        this.initializeProcessors('generator', options); // 初始化生成器
        this.initializeProcessors('outputer', options); // 初始化输出器
    }
    /**
     * 初始化处理器
     * @param type 处理器类型
     * @param options 编译器初始化参数
     */
    initializeProcessors(type, options) {
        const processorsName = `${type}s`;
        const defaultProcessorName = `default${utils_1.capitalizeFirst(type)}`;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const thiz = this;
        const opts = options;
        const processors = this.sortByPriority(opts[processorsName]);
        // 设置processors
        thiz[processorsName] = processors;
        // 设置默认processor，如defaultLoader,defaultParser,defaultGenerator,def
        if (typeof opts[defaultProcessorName] === 'string') {
            thiz[defaultProcessorName] = processors.find(item => item.name === opts[defaultProcessorName]);
        }
        else {
            thiz[defaultProcessorName] = opts[defaultProcessorName] || processors[0];
        }
    }
    /**
     * 生成器加载文档后生成Compilation
     * @param doc 文档
     */
    load(entry, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            options.entry = entry;
            const loader = this.getLoader(options);
            if (!loader)
                common_1.error.throwError({
                    code: common_1.error.Errors.BAD_LOADER,
                    message: '未找到加载器',
                });
            const parser = this.getParser(options);
            if (!parser)
                common_1.error.throwError({
                    code: common_1.error.Errors.BAD_PARSER,
                    message: '未找到解析器',
                });
            const document = {
                entry: options.entry,
                content: undefined,
                model: null,
            };
            const hookContext = {
                compiler: this,
                loader,
                parser,
                document,
                compilation: undefined,
            };
            // 调用加载开始钩子
            yield this.hookDriver.hookSeq('load', hookContext);
            // 加载器加载文档
            document.content = yield loader.load(entry, loader.loadOptions);
            // 调用加载结束钩子
            yield this.hookDriver.hookSeq('parse', hookContext);
            // 解析器解析文档内容
            const docModel = yield parser.parse(document.content, parser.parseOptions);
            document.model = docModel;
            const compilation = new Compilation_1.Compilation(this, {
                loader,
                parser,
                document,
            });
            // 调用加载结束钩子
            hookContext.compilation = compilation;
            yield this.hookDriver.hookSeq('loaded', hookContext);
            return compilation;
        });
    }
    /**
     * 生成文档
     * @param document
     */
    generate(document, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const generator = this.getGenerator(options);
            if (!generator)
                common_1.error.throwError({
                    code: common_1.error.Errors.BAD_GENERATOR,
                    message: '未找到生成器',
                });
            const outputer = this.getOutputer(options);
            if (!outputer)
                common_1.error.throwError({
                    code: common_1.error.Errors.BAD_OUTPUTER,
                    message: '未找到输出器',
                });
            const hookContext = {
                compiler: this,
                generator,
                outputer,
                document,
                generation: undefined,
                output: undefined,
            };
            // 调用生成钩子
            yield this.hookDriver.hookSeq('generate', hookContext);
            const generateResult = yield generator.generate(document, generator.generateOptions);
            const generation = Object.assign({ document: document }, generateResult);
            // 调用输出钩子
            hookContext.generation = generation;
            yield this.hookDriver.hookSeq('output', hookContext);
            // 输出器生成
            const output = yield outputer.output(generation, outputer.outputOptions);
            // 调用生成完成钩子
            hookContext.output = output;
            yield this.hookDriver.hookParallel('generated', hookContext);
            return output;
        });
    }
    /**
     * 根据加载选项选择loader，默认选择第一个
     * @param options 加载选项
     */
    getLoader(options) {
        const loader = this.getProcessor({
            processors: this.loaders,
            processMethodName: 'load',
            processOptionsName: 'loadOptions',
            defaultProcessor: this.defaultLoader,
            processor: options.loader,
            testProcessor: this.testLoader,
            testOptions: options,
            loadOptions: options.loadOptions,
        });
        return loader;
    }
    /**
     * 初步判断目标文件是否能被加载器加载
     * @param entry 验证目标
     */
    testLoader(loader, options) {
        let entry;
        if (typeof options === 'string') {
            entry = options;
        }
        else if (options) {
            entry = options.entry;
        }
        if (!entry || !loader.test)
            return true;
        if (typeof loader.test === 'string') {
            return new RegExp(loader.test).test(entry);
        }
        else if (loader.test instanceof RegExp) {
            return loader.test.test(entry);
        }
        else if (typeof loader.test === 'function') {
            return loader.test(entry);
        }
        return false;
    }
    /**
     * 根据加载选项选择parser，默认选择第一个
     * @param options 加载选项
     */
    getParser(options) {
        const parser = this.getProcessor({
            processors: this.parsers,
            processMethodName: 'parse',
            processOptionsName: 'parseOptions',
            defaultProcessor: this.defaultParser,
            processor: options.parser,
            parseOptions: options.parseOptions,
        });
        return parser;
    }
    /**
     * 根据生成项选择generator
     * @param options 生成选项
     */
    getGenerator(options) {
        const generator = this.getProcessor({
            processors: this.generators,
            processMethodName: 'generate',
            processOptionsName: 'generateOptions',
            defaultProcessor: this.defaultGenerator,
            processor: options.generator,
            generateOptions: options.generateOptions,
        });
        return generator;
    }
    /**
     * 根据生成选项选择输出
     * @param options
     */
    getOutputer(options) {
        const outputer = this.getProcessor({
            processors: this.outputers,
            processMethodName: 'output',
            processOptionsName: 'outputOptions',
            defaultProcessor: this.defaultOutputer,
            processor: options.outputer,
            outputOptions: options.outputOptions,
        });
        return outputer;
    }
    /** 选择处理器 */
    getProcessor(options) {
        const processorOptions = options.processor || {};
        const processMethodName = options.processMethodName;
        const processOptionsName = options.processOptionsName;
        const defaultProcessor = options.defaultProcessor;
        const processors = options.processors;
        const testProcessor = options.testProcessor;
        const testOptions = options.testOptions;
        let processor;
        if (typeof processorOptions === 'string') {
            // 如果有名字，则直接通过名字查找processor，并不进行test验证
            processor = utils_1.findBy(processors, 'name', processorOptions);
        }
        else if (typeof processorOptions[processMethodName] === 'function') {
            // 如果选项中存在process方法，则此选项本身就是处理器
            processor = processorOptions;
        }
        else if (defaultProcessor &&
            (!testProcessor || testProcessor(defaultProcessor, testOptions))) {
            // 如果未提供processr测尝试使用默认processr
            processor = defaultProcessor;
        }
        else {
            // 如果未提供parser及默认parser测尝试使用第一个parser
            processor = processors.filter(p => testProcessor(p, testOptions))[0];
        }
        if (!processor)
            return undefined;
        // 合并参数
        processor[processOptionsName] = utils_1.deepMerge(processor[processOptionsName], processorOptions[processOptionsName], options[processOptionsName]);
        const result = utils_1.deepClone(processor);
        return result;
    }
    /**
     * 根据优先级排序，排序将产生新的数组，默认优先级10
     * @param items 排序对象
     */
    sortByPriority(items) {
        return utils_1.sortBy(items, 'priority', {
            defaultValue: 10,
        });
    }
}
exports.Compiler = Compiler;
