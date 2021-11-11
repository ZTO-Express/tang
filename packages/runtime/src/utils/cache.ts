import type { watch, WatchCallback, WatchOptions, WatchStopHandle } from 'vue'

export class Watcher {
  __once_watchers: GenericObject<WatchStopHandle> = {}
}

export const watcher = new Watcher()
