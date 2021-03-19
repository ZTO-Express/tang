import { TANG_PLUGIN_DIR, TANG_MESH_DIR } from '../consts';
import { Config } from './interfaces';

export const defaultConfig: Required<Config> = {
  plugin: {
    homeDir: TANG_PLUGIN_DIR,
  },
  mesh: {
    homeDir: TANG_MESH_DIR,
  },
};
