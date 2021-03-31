/**
 * command 到 action的映射关系
 */

import { CliCommand } from '../common';
import * as actions from '../actions';
import * as commands from '../commands';

/** 命令活动 */
export function getCliCommandActions() {
  // 所有action字典
  const commandActions = {
    info: new actions.InfoAction(),
    config: new actions.ConfigAction(),

    plugin: new actions.PluginAction(),

    launch: new actions.LaunchAction(),
    preset: new actions.PresetAction(),
    generate: new actions.GenerateAction(),
  };

  // 所有命令列表
  const commandsArr: CliCommand[] = [
    new commands.InfoCommand((commandActions.info as any).main),
    new commands.ConfigCommand(),

    new commands.PluginCommand(),
    new commands.InstallCommand(),
    new commands.RunCommand(),
    new commands.UseCommand(),
    new commands.DeleteCommand(),
    new commands.ListCommand(),
    new commands.PruneCommand(),

    new commands.PresetCommand(),
    new commands.GenerateCommand(),
  ];

  return {
    commandActions,
    commandsArr,
  };
}
