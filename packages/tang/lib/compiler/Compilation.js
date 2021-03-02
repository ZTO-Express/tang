"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compilation = void 0;
/**
 * 由Compiler加载文档后产生
 */
class Compilation {
    constructor(compiler, options) {
        this.compiler = compiler;
        this.document = options.document;
        this.loader = options.loader;
        this.parser = options.parser;
    }
}
exports.Compilation = Compilation;
