interface PluginOptions {
  [key: string]: any;
}

interface PresetOptions {
  [key: string]: any;
}

export interface Config {
  plugin?: PluginOptions;
  preset?: PresetOptions;
  [key: string]: any;
}

export interface ConfigLoader {
  load(name?: string): Required<Config> | Promise<Required<Config>>;
}
