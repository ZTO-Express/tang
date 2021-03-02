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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HookDriver = exports.logging = exports.error = exports.outputer = exports.generator = exports.parser = exports.loader = exports.util = exports.common = void 0;
const common = __importStar(require("./common"));
exports.common = __importStar(require("./common"));
exports.util = __importStar(require("./utils"));
exports.loader = __importStar(require("./loader"));
exports.parser = __importStar(require("./parser"));
exports.generator = __importStar(require("./generator"));
exports.outputer = __importStar(require("./outputer"));
__exportStar(require("./compiler"), exports);
__exportStar(require("./tang"), exports);
exports.error = common.error;
exports.logging = common.logging;
exports.HookDriver = common.HookDriver;
