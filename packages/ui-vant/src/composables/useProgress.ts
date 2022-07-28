import { nProgress } from '../utils/nprogress/nprogress'

nProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  trickleSpeed: 50
})

export function useProgress() {
  return nProgress
}
