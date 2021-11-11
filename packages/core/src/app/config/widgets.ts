export interface WidgetConfig {
  form?: FormConfig
  [prop: string]: any
}

// 表单相关配置
export interface FormConfig {
  input?: InputConfig
  textarea?: TextareaConfig
  inputNumber?: InputNumberConfig
  [prop: string]: any
}

// 表单域配置
export interface FormFieldConfig {
  prop: string
  [prop: string]: any
}

// 输入框配置
export interface InputConfig extends FormFieldConfig {
  maxlength?: number // 输入框最大长度
}

// 多行输入框配置
export interface TextareaConfig extends InputConfig {
  rows?: number
}

// 数字输入框配置
export interface InputNumberConfig extends FormFieldConfig {
  min?: number // 最小数字
  max?: number // 最大数字
}
