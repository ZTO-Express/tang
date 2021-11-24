import type { Installable, InstallableOptions } from '../../typings'

export default async (target: Installable, options: InstallableOptions) => {
  if (!options?.extends?.plugins?.length) return

  if (target.apply) {
    await target.apply(options.extends?.plugins, options)
  }
}
