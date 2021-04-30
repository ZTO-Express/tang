import { TangLauncher } from './launcher';

export * from './declarations';

export * from './launcher';

export * from './preset-manager';

export * from './options';

/**
 * 获取加载器
 * @param force
 * @returns
 */
export function getTangLauncher(force?: boolean) {
  return TangLauncher.getInstance(force);
}
