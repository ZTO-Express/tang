import { emitter } from '@zto/zpage'

import { UI_GLOBAL_EVENTS } from '../consts'

/** 打开下载列表对话框 */
export function openDownloadsDialog() {
  emitter.emit(UI_GLOBAL_EVENTS.OPEN_DOWNLOADS)
}
