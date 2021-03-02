"use strict";
/**
 * 文件系统相关实用方法
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFile = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const json5 = __importStar(require("json5"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const common_1 = require("../common");
const util = __importStar(require("./util"));
__exportStar(require("fs-extra"), exports);
/**
 * 根据name格式获取文件内容
 * @param file 文件url, 相对/绝对路径, type根据类型不同获取文件路径或url
 * @param encoding
 */
function resolveFile(file, encoding = 'utf-8') {
    return __awaiter(this, void 0, void 0, function* () {
        // 绝对路径
        let _file = file;
        let _data;
        let _encoding = encoding;
        if (!encoding || encoding === 'json')
            _encoding = 'utf-8';
        if (util.isRelativePath(file)) {
            _file = path.join(process.cwd(), file);
        }
        if (util.isAbsolutePath(_file)) {
            _data = yield fs.readFile(_file, _encoding);
        }
        else if (util.isUrl(file)) {
            const resp = yield node_fetch_1.default(file);
            switch (encoding) {
                case 'buffer':
                    _data = yield resp.buffer();
                    break;
                default:
                    _data = yield resp.text();
                    break;
            }
        }
        else {
            common_1.error.throwError(common_1.error.errInvalidArguments('无效文件路径'));
        }
        if (!_data)
            return _data;
        if (encoding === 'json')
            _data = json5.parse(_data);
        return _data;
    });
}
exports.resolveFile = resolveFile;
