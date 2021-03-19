import { Plugin } from './plugin';
import { TangHook } from './tang.hook';
import { TangPreset } from './tang.preset';

export interface TangPlugin extends Plugin {
  presets?: TangPreset[];
  actions?: TangHook[];
}
