import { ElMessage, ElMessageBox } from 'element-plus'

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
  return ElMessageBox(options)
}
