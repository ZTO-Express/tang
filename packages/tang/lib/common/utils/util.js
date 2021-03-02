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
exports.deepMerge2 = exports.deepMerge = exports.deepClone = exports.sortBy = exports.findBy = exports.ensureArray = exports.capitalizeFirst = void 0;
const deepmerge = __importStar(require("deepmerge"));
const check_1 = require("./check");
/**
 * 首字母大写
 * @param str 目标字符串
 */
function capitalizeFirst(str) {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.capitalizeFirst = capitalizeFirst;
/**
 * 返回数组
 * @param items 为数组返回原值，为空则空数组，否则返回目标为唯一项的数组
 */
function ensureArray(items) {
    if (Array.isArray(items)) {
        return items.filter(Boolean);
    }
    if (items || (typeof items === 'number' && items === 0)) {
        return [items];
    }
    return [];
}
exports.ensureArray = ensureArray;
/**
 * 查找目标key
 */
function findBy(items, key, val) {
    if (!items || !items.length)
        return undefined;
    const result = items.find(item => {
        if (!item)
            return false;
        return item[key] === val;
    });
    return result;
}
exports.findBy = findBy;
/**
 * 根据目标key进行排序，排序将产生新的数组
 */
function sortBy(items, sortKey, options) {
    if (!items || !items.length)
        return [];
    let opts = { sortOrder: 1, defaultValue: undefined };
    if (typeof options === 'number') {
        opts = { sortOrder: options };
    }
    else {
        opts = Object.assign(opts, options);
    }
    const sortOrder = opts.sortOrder || 1;
    const defaultValue = opts.defaultValue;
    const _items = [...items];
    _items.sort((a, b) => {
        const a_v = !a || a[sortKey] === undefined ? defaultValue : a[sortKey];
        const b_v = !b || b[sortKey] === undefined ? defaultValue : b[sortKey];
        if (!a_v)
            return -1 * sortOrder; // 升序时，不存在则默认往后拍，降序相反
        if (!b_v)
            return 1 * sortOrder; // 同上
        if (a_v === b_v)
            return 0;
        return (a_v > b_v ? 1 : -1) * sortOrder;
    });
    return _items;
}
exports.sortBy = sortBy;
/** 深度克隆，并支持循环应用 */
function deepClone(obj, cache = []) {
    if (null == obj || 'object' != typeof obj)
        return obj;
    // 处理日期
    if (obj instanceof Date) {
        const dt = new Date();
        dt.setTime(obj.getTime());
        return dt;
    }
    // 如果obj命中，则当前为循环引用
    const hit = cache.find(c => c.original === obj);
    if (hit)
        return hit.copy;
    const copy = Array.isArray(obj) ? [] : {};
    // 将copy放入缓存以备后续检查循环引用
    cache.push({ original: obj, copy });
    Object.keys(obj).forEach(key => {
        copy[key] = deepClone(obj[key], cache);
    });
    return copy;
}
exports.deepClone = deepClone;
/**
 * 深度合并，合并后会产生新的对象
 * @param args 被和并的对象
 */
function deepMerge(...args) {
    const items = args.filter(it => !check_1.isNullOrUndefined(it));
    return deepmerge.all(items, {
        isMergeableObject: check_1.isPlainObject,
    });
}
exports.deepMerge = deepMerge;
/**
 * 深度合并，合并后会产生新的对象
 * @param args 被和并的对象
 */
function deepMerge2(args, options) {
    const items = args.filter(it => !check_1.isNullOrUndefined(it));
    const opts = Object.assign({
        isMergeableObject: check_1.isPlainObject,
    }, options);
    return deepmerge.all(items, opts);
}
exports.deepMerge2 = deepMerge2;
