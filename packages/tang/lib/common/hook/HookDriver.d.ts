export declare class HookDriver {
    hooks: TangHook[];
    constructor(hooks: TangHook[]);
    hookParallel<H extends TangParallelHookNames>(hookName: H, context: TangHookContext, args?: Parameters<TangHooks[H]>): Promise<unknown | void>;
    hookSeq<H extends TangSequentialHookNames>(hookName: H, context: TangHookContext, args?: Parameters<TangHooks[H]>): Promise<void>;
    /**
     * 运行异步钩子并返回结果
     * @param hookName 钩子名称，必须存在于TangHooks中
     * @param args 钩子运行参数
     * @param hookIndex `this.hooks[]`中钩子的索引位置.
     * @param permitValues 如果为true，运行传入值作为钩子
     */
    private runHook;
    /** 判断钩子是否满足执行条件 */
    private testHook;
}
