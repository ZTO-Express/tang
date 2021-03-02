#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const commands_1 = require("../commands");
const local_binaries_1 = require("../lib/utils/local-binaries");
const bootstrap = () => {
    const program = commander;
    program
        .version(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../package.json').version, '-v, --version', '输出当前目录.')
        .usage('<command> [options]')
        .helpOption('-h, --help', '查看帮助信息.');
    if (local_binaries_1.localBinExists()) {
        const localCommandLoader = local_binaries_1.loadLocalBinCommandLoader();
        localCommandLoader.load(program);
    }
    else {
        commands_1.CommandLoader.load(program);
    }
    commander.parse(process.argv);
    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
};
bootstrap();
