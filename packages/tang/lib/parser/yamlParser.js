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
exports.yamlParser = void 0;
const utils_1 = require("../utils");
/**
 * Yaml解析器
 */
const yamlParser = () => {
    return {
        type: 'parser',
        name: 'yaml',
        parse(content, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = utils_1.yaml.load(content, options);
                return result;
            });
        },
    };
};
exports.yamlParser = yamlParser;
