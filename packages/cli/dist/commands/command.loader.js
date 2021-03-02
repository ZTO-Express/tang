"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLoader = void 0;
const chalk = require("chalk");
const ui_1 = require("../lib/ui");
class CommandLoader {
    static load(program) {
        this.handleInvalidCommand(program);
    }
    static handleInvalidCommand(program) {
        program.on('command:*', () => {
            console.error(`\n${ui_1.ERROR_PREFIX} 无效命令: ${chalk.red('%s')}`, program.args.join(' '));
            console.log(`使用 ${chalk.red('--help')} 查看有效命令\n`);
            process.exit(1);
        });
    }
}
exports.CommandLoader = CommandLoader;
