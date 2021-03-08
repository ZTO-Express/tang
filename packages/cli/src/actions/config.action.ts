import { CliAction, CliActionOptions } from '../common';

export class ConfigAction extends CliAction {
  // 主命令
  async main(options: CliActionOptions) {
    console.log('config.main');
  }

  async list(options: CliActionOptions) {
    console.log('config.list');
  }

  async add(options: CliActionOptions) {
    console.log('config.add');
  }

  async set(options: CliActionOptions) {
    console.log('config.set');
  }

  async unset(options: CliActionOptions) {
    console.log('config.unset');
  }
}
