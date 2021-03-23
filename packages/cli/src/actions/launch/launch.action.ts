import { GenericConfigObject, utils } from '@devs-tang/common';
import { CliAction } from '../../common';
import { PluginAction } from '../plugin';

/** 加载器相关方法 */
export class LaunchAction extends CliAction {
  /** 实用指定插件 */
  async use(name: string, options?: GenericConfigObject) {
    if (!name) {
      // 输出当前插件名称
      console.info('当前未使用任何插件');
      return undefined;
    }

    options = options || {};

    const presetOptions = utils.deepMerge(options.options, {
      outputOptions: {
        outputDir: options.outputDir,
      },
    });

    const launcher = await this.getLauncher();

    return launcher.use(name, presetOptions);
  }

  /** 列出当前信息 */
  async list(type: string) {
    const pluginAction = new PluginAction();

    if (!type || type === 'plugin' || type === 'plugins') {
      await pluginAction.list();
    }
  }

  /** 安装插件 */
  async install(name: string, options?: GenericConfigObject) {
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
