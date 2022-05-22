import { useAttrs } from '@zto/zpage'

/** FormItem组件通用方法 */
export function useFormItem(props: any) {
  const attrs = useAttrs()
  const onChange = attrs.onChange || props.onChange

  function handleChange(...args: any[]) {
    if (!onChange) return
    onChange(props.model, ...args)
  }

  return { handleChange }
}
