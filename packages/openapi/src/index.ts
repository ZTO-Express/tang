import { presets } from './presets';
import * as actions from './actions';

export function metadata() {
  return {
    description: '测试插件描述',
    contact: {
      name: 'rayl',
      url: 'https://github.com/ZTO-Express/tang',
      email: 'rayl@pisaas.com',
    },
    preset: presets[0], // 可以不设置
    presets, // 包含多个预设
    actions,
  };
}
