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
exports.PresetManager = void 0;
const tang = require("@tang/tang");
const Preset_1 = require("./Preset");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const presetSchema = require('../../schemas/preset.json');
class PresetManager {
    constructor(options) {
        this.options = options;
    }
    /** 预设所在文件夹 */
    get homedir() {
        return `${this.options.homedir}`;
    }
    /**
     * 判断preset是否有效
     * @param content
     */
    validate(content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                tang.util.validateSchema(presetSchema, content);
            }
            catch (err) {
                throw err;
            }
            return true;
        });
    }
    /**
     * 创建预设
     * @param 预设字符串
     */
    create(content) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Preset_1.Preset();
        });
    }
    /**
     * 获取预设文件
     * @param file 预设文件路径，url或名称
     */
    resolve(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield tang.util.fs.resolveFile(file);
            return result;
        });
    }
    /**
     * 添加预设到本地环境
     * @param file 预设名称，文件路径或file
     */
    add(file) {
        return __awaiter(this, void 0, void 0, function* () {
            yield tang.util.fs.ensureDir(this.homedir);
            // 判断name是url、文件地址还是名称
            const data = yield this.resolve(file);
            // TODO: 验证presetData是否符合规范
            const preset = yield this.create(data);
            // 存储preset到本地
            const result = yield this.save(preset);
            return result;
        });
    }
    /**
     * 保存预设信息
     * @param preset 预设信息
     */
    save(preset) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(preset);
            tang.error.throwError(tang.error.errNotImplemented('待实现'));
        });
    }
}
exports.PresetManager = PresetManager;
