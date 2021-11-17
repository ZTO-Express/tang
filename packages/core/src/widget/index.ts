export interface Widget {
  name: string
}

// 表单相关配置
export interface FormWidgetConfig {
  input?: InputWidgetConfig
  textarea?: TextareaWidgetConfig
  inputNumber?: InputNumberWidgetConfig
  [prop: string]: any
}

// 表单域配置
export interface FormFieldWidgetConfig {
  prop: string
  [prop: string]: any
}

// 输入框配置
export interface InputWidgetConfig extends FormFieldWidgetConfig {
  maxlength?: number // 输入框最大长度
}

// 多行输入框配置
export interface TextareaWidgetConfig extends InputWidgetConfig {
  rows?: number
}

// 数字输入框配置
export interface InputNumberWidgetConfig extends FormFieldWidgetConfig {
  min?: number // 最小数字
  max?: number // 最大数字
}
