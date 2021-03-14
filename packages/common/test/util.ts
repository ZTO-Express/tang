export { deepClone } from '../src/utils/util';

export const falsey = [, null, undefined, false, 0, NaN, ''];

export const empties = [[], {}].concat(falsey.slice(1));

export const symbol = Symbol();

export const numberProto: any = Number.prototype;

export const stringProto: any = String.prototype;
