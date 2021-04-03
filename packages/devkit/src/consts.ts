import * as os from 'os';

// 默认开发包的插件名称
export const TANG_DEVKIT_PLUGIN_NAME = 'devkit';

export const TANG_PRESET_DEFAULT = `~`;

export const TANG_PLUGIN_PREFIX = `tang-plugin-`; // 插件前缀

export const TANG_HOME = `${os.homedir}/.tang`;

export const TANG_CONFIG_FILENAME = `tang.json`;

export const TANG_CONFIG_KEY_PLUGIN = `plugin`;
export const TANG_CONFIG_KEY_PRESETS = `presets`;

export const TANG_PLUGIN_DIR = `${TANG_HOME}/plugins`;

export const TANG_MESH_DIR = `${TANG_HOME}/meshs`;
export const TANG_MESH_FILENAME = `mesh.json`;
