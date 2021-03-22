import { utils } from '@tang/common';
import { json5 } from '../../src/utils';
import * as testUtil from '../util';

describe('utils/index：通用实用方法', () => {
  it('json5', async () => {
    expect(json5.parse("{ a: 1, b: '2' }")).toEqual({ a: 1, b: '2' });
    expect(json5.parse(`{ a: 1, b: "2" }`)).toEqual({ a: 1, b: '2' });
    expect(json5.parse(`{ a: 1 /** commit */, b: "2" }`)).toEqual({
      a: 1,
      b: '2',
    });

    expect(json5.parse(`{hello:"ab\\r\\ncd"}`)).toEqual({ hello: 'ab\r\ncd' });
  });
});
