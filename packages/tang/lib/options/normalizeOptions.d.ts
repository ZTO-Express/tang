/**
 * 对传入的选项进行规范化
 * @param config
 */
export declare function getNormalizedOptions(config: GenericConfigObject): NormalizedTangOptions;
/**
 * 合并处理器，规则：
 *  - 要求源处理器与目标处理器类型一致
 *  - 名称相同的处理器则使用当前处理器替换掉目标处理器
 *  - 名称不同的处理器则将源处理器优先排在前列
 *  - 返回结果为全新数组
 * @param processors 目标处理器
 * @param config 配置文件
 */
export declare function mergeProcessors(type: TangProcessorTypes, targetOptions: NormalizedTangOptions, sourceOptions: GenericConfigObject): NormalizedTangOptions;
