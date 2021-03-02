// 输出标准错误
export const stderr = console.error.bind(console);

// 处理常用错误方法
export function handleError(err: TangError) {
  let description = err.message || err;
  if (err.name) description = `${err.name}: ${description}`;
  const message = err.plugin
    ? `(plugin ${err.plugin}) ${description}`
    : description;

  stderr(`[!] ${message.toString()}`);

  if (err.url) stderr(err.url);

  if (err.stack) stderr(err.stack);

  stderr('');
}
