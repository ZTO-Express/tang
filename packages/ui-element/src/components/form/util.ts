import { _, watch, computed, useAttrs } from '@zto/zpage'

/** FormItem组件通用方法 */
export function useFormItem(props: any) {
  const attrs = useAttrs()

  function handleChange(...args: any[]) {
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

  const innerAttrs = computed(() => {
    return _.omit(attrs, ['onChange', 'model'])
  })

  const allAttrs = computed(() => {
    return { ...attrs, ...props }
  })

  return { handleChange, innerAttrs, allAttrs }
}
