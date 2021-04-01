import { GenericConfigObject, utils } from '@devs-tang/common';
import { CliAction } from '../../common';
import { printData } from '../../utils';
import { PluginAction } from '../plugin';
import { PresetAction } from './preset.action';

/** 加载器相关方法 */
export class LaunchAction extends CliAction {
  /** 使用指定预设 */
  async use(name: string, options: GenericConfigObject) {
    const presetAction = new PresetAction();

    return presetAction.use(name, options);
  }

  /** 列出当前信息 */
  async list(type: string) {
    const pluginAction = new PluginAction();

    if (!type || type === 'plugin' || type === 'plugins') {
      await pluginAction.list();
    }
  }

  /** 安装插件 */
  async install(name: string, options: GenericConfigObject) {
    const pluginAction = new PluginAction();

    return pluginAction.install(name, options);
  }

  /** 清理安装缓存 */
  async prune() {
    const launcher = await this.getLauncher();
    await launcher.prune();
    console.info('缓存清理成功！');
  }

  /** 删除插件 */
  async delete(name: string) {
    const pluginAction = new PluginAction();

    return pluginAction.delete(name);
  }

  /** 运行插件方法 */
  async run(name: string, action: string, options: GenericConfigObject) {
    const pluginAction = new PluginAction();

    return pluginAction.run(name, action, options);
  }
}
