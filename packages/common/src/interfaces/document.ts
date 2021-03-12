// 文档
export interface Document {
  entry: string;
  content: string;
  model: DocumentModel;
}

// 文档模型
export interface DocumentModel {
  [key: string]: any;
}

// 文件块（用于生成文件）
export interface Chunk {
  name: string;
  content: string | Buffer;
}
