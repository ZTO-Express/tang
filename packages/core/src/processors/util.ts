/**
 * 解析处理器名称
 * @param name
 */
export function parseProcessorName(name: string) {
  if (!name || typeof name !== 'string') return undefined;

  const parts = name.split(':');

  if (parts.length >= 3) {
    return {
      pluginName: parts[0],
      type: parts[1],
      name: parts[2],
      code: name,
    };
  } else if (parts.length == 2) {
    return {
      pluginName: parts[0],
      name: parts[1],
    };
  } else {
    return {
      name: parts[0],
    };
  }
}
