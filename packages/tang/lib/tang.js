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
exports.tang = void 0;
const normalizeOptions_1 = require("./options/normalizeOptions");
const Compiler_1 = require("./compiler/Compiler");
function tang(options) {
    const compiler = createCompiler(options);
    return compiler;
}
exports.tang = tang;
/**
 * 根据给定的配置，创建生成器
 * @param rawOptions 原选项
 */
function createCompiler(rawOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = normalizeOptions_1.getNormalizedOptions(rawOptions);
        const compiler = new Compiler_1.Compiler(options);
        return compiler;
    });
}
