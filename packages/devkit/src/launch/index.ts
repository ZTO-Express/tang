import { TangLauncher } from './launcher';

export * from './launcher';

export * from './preset-manager';

/**
 * 获取加载器
 * @param force
 * @returns
 */
export function launcher(force?: boolean) {
  return TangLauncher.getInstance(force);
}
