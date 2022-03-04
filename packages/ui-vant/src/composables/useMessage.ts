import { Toast, Dialog } from 'vant'

export function useMessage() {
  return { Message: Toast, MessageBox: Dialog }
}
