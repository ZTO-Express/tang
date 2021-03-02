"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HookDriver = void 0;
const utils_1 = require("../utils");
const hookUtil_1 = require("./hookUtil");
class HookDriver {
    constructor(hooks) {
        this.hooks = utils_1.sortBy(hooks || [], 'priority', {
            defaultValue: 10,
        });
    }
    // 异步并行执行钩子，忽略返回值
    hookParallel(hookName, context, args) {
        const promises = [];
        for (let i = 0; i < this.hooks.length; i++) {
            const hookPromise = this.runHook(hookName, context, args, i);
            if (!hookPromise)
                continue;
            promises.push(hookPromise);
        }
        return Promise.all(promises).then(() => {
            /** noop */
        });
    }
    // 异步顺序执行钩子，忽略返回值
    hookSeq(hookName, context, args) {
        let promise = Promise.resolve();
        for (let i = 0; i < this.hooks.length; i++) {
            promise = promise.then(() => this.runHook(hookName, context, args, i));
        }
        return promise;
    }
    /**
     * 运行异步钩子并返回结果
     * @param hookName 钩子名称，必须存在于TangHooks中
     * @param args 钩子运行参数
     * @param hookIndex `this.hooks[]`中钩子的索引位置.
     * @param permitValues 如果为true，运行传入值作为钩子
     */
    runHook(hookName, context, args, hookIndex) {
        const hook = this.hooks[hookIndex];
        if (!this.testHook(hookName, hook))
            return undefined;
        const hookFn = hook.apply;
        return Promise.resolve()
            .then(() => {
            return hookFn.call(this, context, ...(args || []).slice(1));
        })
            .catch(err => hookUtil_1.throwHookError(err, hookName));
    }
    /** 判断钩子是否满足执行条件 */
    testHook(hookName, hook) {
        if (!hookName || !hook)
            return false;
        if (typeof hook.apply !== 'function')
            hookUtil_1.throwInvalidHookError(hookName, hook);
        if (hook.name && hook.name.endsWith(`:hook:${hookName}`))
            return true;
        if (hook.trigger === '*')
            return true;
        const hookTrigger = utils_1.ensureArray(hook.trigger);
        if (hookTrigger.includes(hookName))
            return true;
        return false;
    }
}
exports.HookDriver = HookDriver;
