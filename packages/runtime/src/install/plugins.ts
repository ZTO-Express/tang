import type { AppOptions } from '../typings'
import type { Runtime } from '../runtime'

export default async (instance: Runtime, options?: AppOptions) => {
  if (!options?.extends?.plugins?.length) return

  await instance.apply(options?.extends?.plugins, options)
}
