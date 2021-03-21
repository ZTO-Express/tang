import * as devkit from '@tang/devkit';
import { CliAction } from '../common';

const configData = Object.freeze({
  user: {
    name: 'rayl',
    email: 'rayl@pisaas.com',
  },
});

export class ConfigAction extends CliAction {
  // 主命令
  async main(key: string, value: string) {
    console.log('config.main', key, value);
  }

  async list(key: string) {
    debugger;
    return this.listOrGet(key);
  }

  async get(key: string) {
    return this.listOrGet(key);
  }

  async set(key: string, value: string) {
    console.log('config.set', key, value);
  }

  async unset(key: string) {
    console.log('config.unset', key);
  }

  async locations() {
    console.log('config.locations');
  }

  /** 列出或获取某个配置信息 */
  listOrGet(key: string) {
    let targetData = configData;

    if (key) targetData = devkit.utils.get(configData, key);

    const targetText = devkit.json5.stringify(targetData, undefined, 2);

    console.log(targetText || '为获取到配置信息');

    return targetText;
  }
}
