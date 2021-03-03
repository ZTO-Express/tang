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
exports.localLoader = void 0;
const utils_1 = require("../utils");
/**
 * 本地文件加载器
 */
const localLoader = () => {
    return {
        type: 'loader',
        name: 'local',
        test: (entry) => utils_1.isAbsolutePath(entry),
        load(entry, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const buffer = yield utils_1.fs.readFile(entry, options);
                const text = buffer.toString();
                return text;
            });
        },
    };
};
exports.localLoader = localLoader;
