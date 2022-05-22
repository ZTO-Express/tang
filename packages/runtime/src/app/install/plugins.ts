import type { Installable, InstallableOptions } from '../../typings'

export default async (target: Installable, options: InstallableOptions) => {
  if (!options?.extensions?.plugins?.length) return

  if (target.apply) {
    await target.apply(options.extensions?.plugins, options)
  }
}
