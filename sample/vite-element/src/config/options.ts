interface OptionItem extends GenericObject {
  value: number | string | undefined
  label: string
}

export const commonOptions: GenericObject<OptionItem[]> = {
  // 是否
  yesOrNo: [
    { label: '是', value: 1 },
    { label: '否', value: 0 }
  ],

  // 共配中心启用禁用
  enableStatus: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 }
  ]
}
