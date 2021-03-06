import * as path from 'path';
import { GenericConfigObject } from '@tang/common';
import { fs, json5 } from '../utils';
import { IO } from './io.interfaces';

export interface LocalWriteOptions extends GenericConfigObject {
  file?: string;
}

export class LocalIO implements IO {
  private file: string | undefined;

  constructor(private readonly directory: string) {}

  get loadFile() {
    return this.file;
  }

  get loadDirectory() {
    return this.directory;
  }

  // 列出目录所有文件
  async list(): Promise<string[]> {
    const filenames = await fs.readdir(this.directory);
    return filenames;
  }

  // 读取指定文件
  async read(name?: string): Promise<string | undefined> {
    if (!name) name = this.file;
    const dataBuffer = await fs.readFile(`${this.directory}/${name}`);
    const dataText = dataBuffer.toString();

    this.file = name;
    return dataText;
  }

  // 尝试读取列表列出的文件
  async readAnyOf(names: string[]): Promise<string | undefined> {
    try {
      for (const file of names) {
        const result = await this.read(file);
        return result;
      }
    } catch (err) {
      return this.readAnyOf(names.slice(1, names.length));
    }

    return undefined;
  }

  async write(data: any, options?: string | LocalWriteOptions) {
    let file = this.file;

    if (typeof options === 'string') {
      file = options;
    } else if (options && options.file) {
      file = options.file;
    }

    // 在写入前需要先加载
    if (!file) {
      throw new Error('no specified file to write');
    }

    this.file = file;

    let text = '';

    if (typeof data === 'string') {
      text = data;
    } else {
      text = json5.stringify(data, { space: 2 });
    }

    const filePath = path.join(this.loadDirectory, file);
    await fs.ensureDir(this.loadDirectory);

    await fs.writeFile(filePath, text);

    return true;
  }
}
