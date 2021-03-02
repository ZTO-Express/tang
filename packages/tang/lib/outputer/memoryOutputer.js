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
exports.memoryOutputer = void 0;
const path = __importStar(require("path"));
const utils_1 = require("../utils");
const Volume = utils_1.memfs.Volume;
/**
 * 内存文件输出器，一般用于测试或watch的场景
 */
const memoryOutputer = () => {
    return {
        type: 'outputer',
        name: 'memory',
        output(generation) {
            return __awaiter(this, void 0, void 0, function* () {
                const vol = Volume.fromJSON({});
                const fs = vol.promises;
                const files = [];
                const ops = generation.chunks.map((chunk) => __awaiter(this, void 0, void 0, function* () {
                    if (!chunk.content)
                        return;
                    const filePath = chunk.name;
                    const dirPath = path.dirname(filePath);
                    yield fs.mkdir(dirPath, { recursive: true });
                    yield fs.writeFile(filePath, chunk.content);
                    files.push({
                        path: filePath,
                        chunk,
                    });
                }));
                yield Promise.all(ops);
                return {
                    result: true,
                    files,
                    vol,
                };
            });
        },
    };
};
exports.memoryOutputer = memoryOutputer;
