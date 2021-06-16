import * as os from 'os';
import * as path from 'path';

// 默认开发包的插件名称
export const TANG_DEVKIT_PLUGIN_NAME = 'devkit';

export const TANG_PRESET_DEFAULT = `~`;

export const TANG_PLUGIN_PREFIX = `tang-plugin-`; // 插件前缀

export const TANG_HOME = `${os.homedir}/.tang`;

export const TANG_CONFIG_FILENAME = `tang.json`; // 全局配置文件

export const TANG_CONFIG_FILEPATH = path.join(TANG_HOME, TANG_CONFIG_FILENAME); // 全局配置文件

export const TANG_CONFIG_KEY_PLUGIN = `plugin`;
export const TANG_CONFIG_KEY_PRESETS = `presets`;

export const TANG_PLUGIN_DIR = `${TANG_HOME}/plugins`;

export const TANG_MESH_DIR = `${TANG_HOME}/meshs`;
export const TANG_MESH_FILENAME = `mesh.json`;

export const TANG_WORKSPACE_CONFIG_FILENAME = `tang.config.js`; // 项目配置文件

export const CODE_GEN_DEFAULT_DIR = './codegen'; // 代码生成目录

// 代码生成模版目录
export const CODE_GEN_DEFAULT_TEMPLATES_DIR = path.join(
  CODE_GEN_DEFAULT_DIR,
  'templates',
);
