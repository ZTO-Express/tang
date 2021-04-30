import { TANG_PLUGIN_DIR, TANG_MESH_DIR } from '../consts';
import { Config } from './declarations';

export const getDefaultConfig = (): Required<Config> => {
  return {
    plugin: {
      homeDir: TANG_PLUGIN_DIR,
    },
    mesh: {
      homeDir: TANG_MESH_DIR,
    },
  };
};
