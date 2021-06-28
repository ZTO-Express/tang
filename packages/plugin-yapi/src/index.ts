import * as processors from './processors';

export * from './processors';
export * from './service';

export function metadata() {
  return {
    description: 'Tang yapi插件用于提供yapi sdk以及yapi的tang处理器',
    contact: {
      name: 'rayl',
      url: 'https://github.com/ZTO-Express/tang',
      email: 'rayl@pisaas.com',
    },
    preset: {
      loaders: [processors.yapiLoader()],
      generators: [processors.tsGenerator()],
    },
  };
}
