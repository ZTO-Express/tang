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
exports.urlLoader = void 0;
const utils_1 = require("../utils");
/**
 * 通过url加载文件
 */
const urlLoader = () => {
    return {
        type: 'loader',
        name: 'url',
        test: (entry) => utils_1.isUrl(entry),
        load(entry, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield utils_1.fetch.request(entry, options);
                const text = yield res.text();
                if (!res.ok) {
                    let errorMsg = res.statusText;
                    if (text.length <= 100) {
                        errorMsg = text;
                    }
                    throw new Error(errorMsg);
                }
                return text;
            });
        },
    };
};
exports.urlLoader = urlLoader;
