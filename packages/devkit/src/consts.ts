import * as os from 'os';

export const TANG_HOME = `${os.homedir}/.tang`;

export const TANG_CONFIG_FILENAME = `tang.json`;

export const TANG_CONFIG_KEY_PLUGIN = `plugin`;
export const TANG_CONFIG_KEY_PRESET = `preset`;

export const TANG_LAUNCH_CONFIG_FILENAME = `launch.json`;
export const TANG_LAUNCH_CONFIG_PRESETS = `presets`;
export const TANG_LAUNCH_CONFIG_PRESET_DEFAULT = `tang`; // 默认预设

export const TANG_PLUGIN_DIR = `${TANG_HOME}/plugins`;
export const TANG_MESH_DIR = `${TANG_HOME}/meshs`;
export const TANG_MESH_FILENAME = `mesh.json`;
