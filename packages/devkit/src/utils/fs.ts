/**
 * 文件系统相关实用方法
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import * as json5 from 'json5';

import { utils, InvalidArguments } from '@tang/common';
import { http } from '@tang/core';

export * from 'fs-extra';

/**
 * 根据name格式获取文件内容
 * @param file 文件url, 相对/绝对路径, type根据类型不同获取文件路径或url
 * @param encoding
 */
export async function resolveFile(file: string, encoding = 'utf-8') {
  // 绝对路径
  let _file = file;
  let _data: any;
  let _encoding = encoding;
  if (!encoding || encoding === 'json') _encoding = 'utf-8';

  if (utils.isRelativePath(file)) {
    _file = path.join(process.cwd(), file);
  }

  if (utils.isAbsolutePath(_file)) {
    _data = await fs.readFile(_file, _encoding);
  } else if (utils.isUrl(file)) {
    if (encoding === 'json') {
      _data = await http.request<any>(file, { type: 'text' });
    } else {
      _data = await http.request<any>(file, { type: encoding });
    }
  } else {
    throw new InvalidArguments('无效文件路径');
  }

  if (!_data) return _data;

  if (encoding === 'json') _data = json5.parse(_data);

  return _data;
}
