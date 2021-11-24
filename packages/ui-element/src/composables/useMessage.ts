import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 获取全局配置
 * @param section
 * @returns
 */
export function useMessage() {
  return { Message: ElMessage, MessageBox: ElMessageBox }
}
