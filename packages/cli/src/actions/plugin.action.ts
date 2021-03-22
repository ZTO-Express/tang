import { GenericConfigObject } from '@tang/common';
import * as devkit from '@tang/devkit';
import { CliAction } from '../common';

export class PluginAction extends CliAction {
  // 主命令 (获取当前)
  async main(name: string) {
    await this.info(name);
  }

  // 查看指定插件帮助信息
  async info(name: string) {
    const launcher = await this.getLauncher();

    const plugin = launcher.pluginManager.get(name);

    console.log('插件信息');

    // 输出插件信息
    console.log(JSON.stringify(plugin, undefined, 2));
  }

  /** 列出所有插件 */
  async list(prefix?: string) {
    const launcher = await this.getLauncher();

    const pluginNames = await launcher.pluginManager.list(prefix);

    if (!pluginNames || !pluginNames.length) {
      console.log(
        '目前还没有安装任何' +
          (prefix ? `前缀为"${prefix}"的插件` : '插件') +
          '，请使用 tang install <plugin> 命令安装插件',
      );
    } else {
      console.log('当前已安装插件：');
      console.log(pluginNames.join());
    }
  }

  /** 安装插件 */
  async install(packageName: string, options?: GenericConfigObject) {
    if (!packageName) {
      console.error('请输入需要安装的插件包');
      return;
    }

    const launcher = await this.getLauncher();

    const plugin = await launcher.pluginManager.add(packageName, options);

    if (!plugin) {
      console.error('插件安装失败，请重试。');
      return;
    }

    console.log(`已成功安装插件 ${plugin.name}@${plugin.version}`);
  }

  /** 安装插件 */
  async delete(name: string) {
    if (!name) {
      console.error('请输入要删除的插件名称');
      return;
    }

    const launcher = await this.getLauncher();

    const plugin = await launcher.pluginManager.delete(name);

    if (!plugin) {
      console.warn(`插件 ${name} 不存在`);
      return;
    }

    console.log(`已成功删除插件 ${name}`);
  }

  /** 执行插件方法 */
  async run(name: string, action: string, options: GenericConfigObject) {
    if (!name) {
      console.error('请输入要执行的插件名称');
      return;
    }

    if (!action) {
      console.error('请输入要执行的插件方法');
      return;
    }

    let args: any[] = [];
    if (Array.isArray(options.args)) {
      args = options.args.map(arg => {
        return devkit.json5.parse(arg);
      });
    }

    const launcher = await this.getLauncher();

    const result = await launcher.pluginManager.run(name, action, ...args);

    console.log(`已成功执行插件 ${name}的方法${action}`);
    console.log(JSON.stringify(result, null, 2));
  }
}
