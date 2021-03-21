import { TangLauncher } from './launcher';

export * from './launcher';

/**
 * 获取加载器
 * @param force
 * @returns
 */
export function launcher(force?: boolean) {
  return TangLauncher.getInstance(force);
}
