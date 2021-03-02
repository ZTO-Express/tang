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
exports.localOutputer = void 0;
const path = __importStar(require("path"));
const common_1 = require("../common");
const utils_1 = require("../utils");
/**
 * 本地文件输出器
 */
const localOutputer = () => {
    return {
        type: 'outputer',
        name: 'local',
        output(generation, options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!options || !options.outputDir) {
                    common_1.error.throwError(common_1.error.errInvalidArguments('请提供输出目录'));
                }
                const outputDir = options.outputDir;
                const clearDir = options.clearDir === true; // 是否晴空目录(默认false)
                const overwrite = options.overwrite !== false; // 是否覆盖已存在目录(默认true)
                if (clearDir) {
                    yield utils_1.fs.emptyDir(outputDir);
                }
                yield utils_1.fs.ensureDir(outputDir); // 确认目录存在
                const files = [];
                const ops = generation.chunks.map((chunk) => __awaiter(this, void 0, void 0, function* () {
                    if (!chunk.content)
                        return;
                    const filePath = path.join(outputDir, chunk.name);
                    if (!overwrite) {
                        const existsFile = yield utils_1.fs.pathExists(filePath);
                        if (existsFile)
                            return;
                    }
                    yield utils_1.fs.writeFile(filePath, chunk.content);
                    files.push({
                        path: filePath,
                        chunk,
                    });
                }));
                yield Promise.all(ops);
                return {
                    result: true,
                    files,
                };
            });
        },
    };
};
exports.localOutputer = localOutputer;
