import { ElMessage, ElMessageBox } from 'element-plus'

export const Message = ElMessage

export const MessageBox = ElMessageBox

/**
 * 获取全局配置
 * @param section
 * @returns
 */
export function useMessage() {
  return { Message: ElMessage, MessageBox: ElMessageBox }
}

/** 展示消息 */
export function showMessage(options?: any) {
  return ElMessage(options)
}

/** 展示消息方法 */
export function showMessageBox(options?: any) {
  options = { title: '提示', type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消', ...options }

  switch (options.boxType) {
    case 'confirm':
      return ElMessageBox.confirm(options.message, options.title, { ...options })
    case 'alert':
      return ElMessageBox.alert(options.message, options.title, { ...options })
    case 'prompt':
      return ElMessageBox.prompt(options.message, options.title, { ...options })
  }

  return ElMessageBox(options)
}
