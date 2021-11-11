import NProgress from 'nprogress'

NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  trickleSpeed: 50
})

export function useProgress() {
  return NProgress
}
