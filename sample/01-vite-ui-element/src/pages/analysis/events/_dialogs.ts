import { commonOptions } from '@/config/options'

/** 编辑表单 */
export const addEditDialog = (isEdit = false) => {
  return {
    innerAttrs: {
      dialog: { width: 400 },
      form: { labelWidth: 80 },
      formItems: { span: 24 }
    },

    formItems: [
      {
        type: 'input',
        prop: 'remark',
        label: '事件名',
        required: true,
        maxlength: 50
      }
    ]
  }
}
