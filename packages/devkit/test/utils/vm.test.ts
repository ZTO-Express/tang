import * as testUtil from '../util';
import * as nativeVM from 'vm';
import { vm, fs } from '../../src';

describe('utils/vm：vm实用方法', () => {
  it('获取模块功能 requireFn', async () => {
    const jsDocPath = testUtil.resolveFixturePath('documents/mesh.js');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const foo = require(jsDocPath);

    // cached
    const myRequire = vm.requireFn(jsDocPath);
    let myFoo1 = myRequire('./mesh');
    expect(myFoo1).toEqual(foo);

    let myFoo2 = myRequire('./mesh');
    expect(myFoo1 === myFoo2).toBe(true);

    // uncached
    const myRequire2 = vm.requireFn(jsDocPath, true);
    myFoo1 = myRequire2('./mesh');
    myFoo2 = myRequire2('./mesh');
    expect(myFoo2 === foo).toBe(false);

    expect(myRequire2.resolve('./mesh')).toBe(jsDocPath);
  });

  it('运行脚本 runScript', async () => {
    expect(vm.runScript(`module.exports = 'test';`)).toBe('test');

    expect(vm.runScript('var x = 123; exports.x = x')).toEqual({ x: 123 });

    expect(vm.runScript('module.exports = function () { return 123 }')()).toBe(
      123,
    );

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const event = require('events');
    expect(vm.runScript('module.exports = require("events")', true)).toBe(
      event,
    );
    expect(vm.runScript('exports.x = process', true).x).toBe(process);

    expect(vm.runScript('module.exports = { a, b }', { a: 1, b: 2 })).toEqual({
      a: 1,
      b: 2,
    });

    expect(vm.runScript('module.exports = 123', null)).toBe(123);

    (global as any).add = function (a: any, b: any) {
      return a + b;
    };

    expect(() =>
      vm
        .runScript('exports.add = function (x, y) { return add(x, y) }')
        .add(5, 6),
    ).toThrow();

    expect(() => vm.runScript('require("fs")')).toThrow();

    const script = new nativeVM.Script(`module.exports = 'test';`);
    expect(vm.runScript(script)).toBe('test');

    expect(vm.runScript(script, {})).toBe('test');

    const jsDocPath = testUtil.resolveFixturePath('documents/mesh.js');
    const fileData = fs.readFileSync(jsDocPath);
    expect(vm.runScript(fileData).name).toBe('tang-test-mesh');
  });

  it('引用模块 requireOrImportModule', async () => {
    await expect(() => vm.requireOrImportModule('./abc')).rejects.toThrow(
      'Tang:',
    );

    const configPath = testUtil.resolveFixturePath('workspace/tang.config.js');
    const configObject: any = await vm.requireOrImportModule(configPath);
    expect(configObject.rootDir).toBe('./');

    const configObject1: any = await vm.requireOrImportModule(
      configPath,
      false,
    );
    expect(configObject.rootDir).toBe('./');
  });
});
