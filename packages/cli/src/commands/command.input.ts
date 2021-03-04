/** 命令选项 */
export interface CommandOptions {
  [key: string]: string | boolean;
}

/** 命令输入 */
export interface CommandInput {
  name: string;
  value: boolean | string;
  options?: any;
}
