import * as devkit from '@tang/devkit';
import * as commander from 'commander';

/** 命令选项 */
export interface CliCommandOptions {
  [key: string]: string | boolean;
}

/** 命令输入 */
export interface CliCommandInput {
  name: string;
  value: boolean | string;
  options?: any;
}

/** 命令选项配置，对应commander.Option */
export interface CliCommandOptionConfig {
  flags: string; // option标记，eg. -l, --list等
  description?: string; // 描述
  required?: boolean; // 是否必填
  defaultValue?: string | boolean; // 默认值
  defaultValueDescription?: string; // 默认值描述
  choices?: string[]; // choices
  hidden?: boolean; // 是否隐藏帮助
  argParser?: (value: string, previous: unknown) => unknown;
}

/** 命令配置 */
export interface CliCommandConfig {
  name: string; // 命令名称
  args?: string; // 命令args，若已配置命令模版则此配置忽略
  aliases?: string[]; // 命令别名
  options?: CliCommandOptionConfig[]; // 命令选项
  description?: string; // 描述
  argsDescription?: { [key: string]: any }; // 参数描述
  action?: string | ((...args: any[]) => void | Promise<void>); // 默认根据命令名称生成
  parent?: CliCommandConfig; // 父命令，在生成子命令的时候用到
  commands?: CliCommandConfig[]; // 子命令
}

export type CliActionOptions = {
  operation?: string;
  options?: CliCommandOptions;
  inputs?: CliCommandInput[];
  extraFlags?: string[];
};

export type CliActionFn = (...args: any[]) => void | Promise<void>;

export abstract class CliAction {
  /** 返回加载器 */
  protected async getLauncher() {
    const launcher = await devkit.launcher();
    return launcher;
  }
}

/** cli命令，支持采用config方式和load方式进行配置（推荐config，load主要用于现阶段调试配置时用） */
export interface CliCommand {
  config?: () => CliCommandConfig;
  load?: (program: commander.Command) => commander.Command;
}
