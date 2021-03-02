import { Volume } from 'memfs/lib/volume';
export * from 'memfs';
/**
 * 文件目录是否存在
 * @param fsPath 文件系统路径
 */
export declare function dirExists(fsPath: string, vol?: Volume): Promise<boolean>;
/**
 * 文件是否存在
 * @param fsPath 文件系统路径
 */
export declare function fileExists(fsPath: string, vol?: Volume): Promise<boolean>;
