import * as devkit from '@devs-tang/devkit';

export interface PrintDataOptions {
  format?: 'json' | 'yaml';
}

/** 打印数据 */
export function printData(obj: any, options: PrintDataOptions = {}) {
  let text = '';

  const format = options.format;

  if (format === 'json') {
    text = devkit.json5.stringify(obj, undefined, 2);
  } else {
    text = devkit.yaml.dump(obj);
  }

  console.log(text);

  return text;
}
