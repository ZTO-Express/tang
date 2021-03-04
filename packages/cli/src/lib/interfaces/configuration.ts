interface PluginOptions {
  [key: string]: any;
}

interface PresetOptions {
  [key: string]: any;
}

export interface Configuration {
  plugin?: PluginOptions;
  preset?: PresetOptions;
  [key: string]: any;
}

export interface ConfigurationLoader {
  load(
    name?: string,
  ): Required<Configuration> | Promise<Required<Configuration>>;
}
