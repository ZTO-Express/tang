import { _, watch, computed, useAttrs, onBeforeMount } from '@zto/zpage'

export interface UseFormItemOptions {
  itemType?: string
  clearModelEmptyPropOnChange?: boolean
  beforeChange?: (value: any, ...args: any[]) => any
}

/** FormItem组件通用方法 */
export function useFormItem(props: any, options?: UseFormItemOptions) {
  const attrs = useAttrs()

  function handleChange(...args: any[]) {
    if (options?.beforeChange) {
      options?.beforeChange(props.model, ...args)
    }

    // by rayl: 2022-06-06
    // 当前属性为空字符串时清理入参（处理空字符串传入后端因为类型不对报错的情况）
    // 在处理数据导出情况下发现问题
    if (options?.clearModelEmptyPropOnChange) {
      if (props.model[props.prop] === '') {
        props.model[props.prop] = undefined
      }
    }

    const onChange = attrs.onChange || props.onChange
    if (!onChange) return

    onChange(props.model, ...args)
  }

  watch(
    () => props.model[props.prop],
    () => {
      handleChange(props.model[props.prop])
    }
  )

  onBeforeMount(() => {
    if (!_.isNil(attrs.default)) {
      props.model[props.prop] = attrs.default
    }
  })

  const innerAttrs = computed(() => {
    return _.omit(attrs, ['onChange', 'model'])
  })

  const allAttrs = computed(() => {
    return { ...attrs, ...props }
  })

  return { handleChange, innerAttrs, allAttrs }
}
