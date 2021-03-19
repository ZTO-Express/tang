import { GenericConfigObject } from './type';

export interface MeshContactSchema {
  name?: string;
  email?: string;
  url?: string;
}

export type MeshExtendsSchema = string | GenericConfigObject;

export interface MeshPluginSchema {
  name: string;
  version?: string;
  install?: boolean | string[];
}

export interface MeshSchema {
  name: string;
  version: string;
  title?: string;
  description?: string;
  contact?: MeshContactSchema;
  extends?: MeshExtendsSchema;
  plugins?: MeshPluginSchema[];
  processors?: string[];
  hooks?: string[];
}
