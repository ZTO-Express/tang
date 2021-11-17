import type { WatchStopHandle } from 'vue'

export class Watcher {
  __once_watchers: Record<string, WatchStopHandle> = {}
}

export const watcher = new Watcher()
