import { SpecialObject } from './type';

import { Plugin } from './plugin';
import { TangHook } from './tang.hook';
import { TangPreset } from './tang.preset';

export interface TangPlugin extends Plugin {
  preset?: TangPreset;
  presets?: TangPreset[];
  actions?: SpecialObject<TangHook>;
}
