"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeProcessors = exports.getNormalizedOptions = void 0;
const utils_1 = require("../utils");
const loader = __importStar(require("../loader"));
const parser = __importStar(require("../parser"));
const generator = __importStar(require("../generator"));
const outputer = __importStar(require("../outputer"));
/**
 * 对传入的选项进行规范化
 * @param config
 */
function getNormalizedOptions(config) {
    const defaultOptions = {
        loaders: [loader.localLoader(), loader.urlLoader()],
        parsers: [parser.jsonParser(), parser.yamlParser()],
        generators: [generator.jsonGenerator(), generator.yamlGenerator()],
        outputers: [outputer.localOutputer(), outputer.memoryOutputer()],
    };
    const options = utils_1.deepMerge(defaultOptions, config);
    mergeProcessors('loader', options, config);
    mergeProcessors('parser', options, config);
    mergeProcessors('generator', options, config);
    mergeProcessors('outputer', options, config);
    return options;
}
exports.getNormalizedOptions = getNormalizedOptions;
/**
 * 合并处理器，规则：
 *  - 要求源处理器与目标处理器类型一致
 *  - 名称相同的处理器则使用当前处理器替换掉目标处理器
 *  - 名称不同的处理器则将源处理器优先排在前列
 *  - 返回结果为全新数组
 * @param processors 目标处理器
 * @param config 配置文件
 */
function mergeProcessors(type, targetOptions, sourceOptions) {
    const typeKey = `${type}s`;
    let target = (targetOptions[typeKey] || []);
    let source = (sourceOptions[typeKey] || []);
    source = source.filter(it => it && it.type === type);
    target = target
        .filter(it => it && it.type === type)
        .filter(t => !source.find(s => t.name === s.name));
    targetOptions[typeKey] = [...source, ...target];
    return targetOptions;
}
exports.mergeProcessors = mergeProcessors;
