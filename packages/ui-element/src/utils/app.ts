import { HostApp } from '@zto/zpage'

import { UI_GLOBAL_EVENTS } from '../consts'

/** 打开下载列表对话框 */
export function openDownloadsDialog() {
  if (!HostApp.app) throw new Error('主应用未初始化')

  HostApp.app?.emitter.emit(UI_GLOBAL_EVENTS.OPEN_DOWNLOADS)
}
