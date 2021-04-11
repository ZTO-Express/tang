/**
 * 文件系统相关实用方法
 */
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as json5 from 'json5';
import * as execa from 'execa';

import { utils, InvalidArguments, ExecuteFailedError } from '@devs-tang/common';
import { http } from '@devs-tang/core';

export * from 'fs-extra';

/** 合并路径 */
export function joinPath(...paths: string[]) {
  return path.join(...paths);
}

/**
 * 同步读取json5
 * @param file
 * @param encoding
 * @returns
 */
export function readJSON5Sync(file: string) {
  // 绝对路径
  const _file = file;
  let _data: any;

  if (utils.isPath(_file)) {
    const exists = fs.pathExistsSync(_file);
    if (!exists) return undefined;

    _data = fs.readFileSync(_file);
  }

  if (!_data) return undefined;

  _data = json5.parse(_data);

  return _data;
}

/** 读取node package信息 */
export async function readPackageInfo(packagePath: string) {
  if (!packagePath) return undefined;

  const exists = await fs.pathExists(packagePath);
  if (!exists) return undefined;

  let jsonFile = packagePath;

  if (!jsonFile.endsWith('package.json')) {
    jsonFile = path.join(packagePath, 'package.json');
  }

  const existsJson = await fs.pathExists(jsonFile);
  if (!existsJson) return undefined;

  const jsonData = await fs.readJson(jsonFile);
  return jsonData;
}

/**
 * 根据name格式获取文件内容
 * @param file 文件url, 相对/绝对路径, type根据类型不同获取文件路径或url
 * @param encoding
 */
export async function resolveFile(file: string, encoding = 'utf-8') {
  // 绝对路径
  const _file = file;
  let _data: any;
  let _encoding = encoding;
  if (!encoding || encoding === 'json') _encoding = 'utf-8';

  if (utils.isPath(_file)) {
    const exists = await fs.pathExists(_file);
    if (!exists) return undefined;

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

/**
 * 打开指定文件或目录，使用指定的命令
 * @param pathName
 * @param cmd
 */
export async function explore(pathName: string, cmd?: string) {
  if (!cmd) {
    cmd = getFileExplorer();
  }

  if (!cmd) throw new ExecuteFailedError('无法确定执行命令');

  return execa(cmd, [pathName]);
}

/** 获取平台文件浏览器 */
export function getFileExplorer() {
  const platform = os.platform();

  let cmd: string;
  switch (platform) {
    case 'darwin': // mac
      cmd = 'open';
      break;
    case 'win32': // windows
      cmd = 'explorer';
      break;
    case 'linux': // linux
      cmd = 'nautilus';
      break;
  }

  return cmd;
}
