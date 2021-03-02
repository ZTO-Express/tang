"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.fileExists = exports.dirExists = void 0;
const memfs_1 = require("memfs");
__exportStar(require("memfs"), exports);
/**
 * 文件目录是否存在
 * @param fsPath 文件系统路径
 */
function dirExists(fsPath, vol) {
    return __awaiter(this, void 0, void 0, function* () {
        const _fs = (vol ? vol : memfs_1.fs).promises;
        const flag = yield _fs
            .lstat(fsPath)
            .then(res => res && res.isDirectory())
            .catch(() => false);
        return flag;
    });
}
exports.dirExists = dirExists;
/**
 * 文件是否存在
 * @param fsPath 文件系统路径
 */
function fileExists(fsPath, vol) {
    return __awaiter(this, void 0, void 0, function* () {
        const _fs = (vol ? vol : memfs_1.fs).promises;
        const flag = yield _fs
            .lstat(fsPath)
            .then(res => res && res.isFile())
            .catch(() => false);
        return flag;
    });
}
exports.fileExists = fileExists;
