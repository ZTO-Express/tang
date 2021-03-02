/**
 * 文件系统相关实用方法
 */
export * from 'fs-extra';
/**
 * 根据name格式获取文件内容
 * @param file 文件url, 相对/绝对路径, type根据类型不同获取文件路径或url
 * @param encoding
 */
export declare function resolveFile(file: string, encoding?: string): Promise<any>;
