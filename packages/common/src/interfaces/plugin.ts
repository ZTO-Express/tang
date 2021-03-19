import { Hook } from './hook';

export interface Plugin {
  name: string;
  version: string;
  description?: string;
  hooks?: Hook[];
  methods?: { [name: string]: Function };
  [prop: string]: any;
}
