import { ref } from 'vue'

/**
 * 使用防重复点击功能
 * @param section
 * @returns
 */
export function usePreventReclick() {
  /** 这里的disable主要用来从内部控制控件只读状态（不受外界状态影响） */
  const reclickDisabled = ref<boolean>(false)

  /** 设置disabled */
  function setReclickDisabled(flag = true) {
    reclickDisabled.value = flag
  }

  return { reclickDisabled, setReclickDisabled }
}
