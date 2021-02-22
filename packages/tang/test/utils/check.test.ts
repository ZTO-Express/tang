import { check } from '../../src/utils';

describe('utils/check：check实用方法', () => {
  it('验证 isUrl', async () => {
    expect(check.isUrl('http://www.github.com')).toBeTruthy();
    expect(check.isUrl('https://www.github.com')).toBeTruthy();
    expect(check.isUrl('https://www.github.com/xxx')).toBeTruthy();
    expect(check.isUrl('https://www.github.com/xxx/y.json')).toBeTruthy();
    expect(check.isUrl('ftp://www.github.com')).toBeFalsy();
    expect(check.isUrl('/xxx/y.json')).toBeFalsy();
    expect(check.isUrl('xxx/y.json')).toBeFalsy();
    expect(check.isUrl('y.json')).toBeFalsy();
  });

  it('验证 isAbsolutePath', async () => {
    expect(check.isAbsolutePath('/xxx/y.json')).toBeTruthy();
    expect(check.isAbsolutePath('c://xxxx/y.json')).toBeTruthy();
    expect(check.isAbsolutePath('c:/xxxx/y.json')).toBeTruthy();
    expect(check.isAbsolutePath('http://www.github.com')).toBeFalsy();
    expect(check.isAbsolutePath('xxx/y.json')).toBeFalsy();
    expect(check.isAbsolutePath('./xxx/y.json')).toBeFalsy();
    expect(check.isAbsolutePath('../xxx/y.json')).toBeFalsy();
  });

  it('验证 isRelativePath', async () => {
    expect(check.isRelativePath('/xxx/y.json')).toBeFalsy();
    expect(check.isRelativePath('c://xxxx/y.json')).toBeFalsy();
    expect(check.isRelativePath('c:/xxxx/y.json')).toBeFalsy();
    expect(check.isRelativePath('http://www.github.com')).toBeFalsy();
    expect(check.isRelativePath('xxx/y.json')).toBeFalsy();
    expect(check.isRelativePath('./xxx/y.json')).toBeTruthy();
    expect(check.isRelativePath('../xxx/y.json')).toBeTruthy();
  });
});
