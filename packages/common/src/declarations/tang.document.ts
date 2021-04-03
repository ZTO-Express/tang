// 文档
export interface TangDocument {
  entry: string;
  content: string;
  model: TangDocumentModel;
}

// 文档模型
export interface TangDocumentModel {
  [key: string]: any;
}

// 文件块（用于生成文件）
export interface Chunk {
  name: string;
  content: string | Buffer;
}
