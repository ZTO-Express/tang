export interface FormItemConfig extends Record<string, any> {
  type: string
  isShow?: boolean
  prop: string
  label: string
  span: number
  labelWidth?: string
  showSlot?: boolean // 控件无法满足 ,需自定义slot
  showLabelSlot?: boolean // 控件无法满足 ,需自定义label slot
  collapse?: boolean //是否允许被收缩
}
