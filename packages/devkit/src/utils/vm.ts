import * as _Module from 'module';
import * as vm from 'vm';
import { dirname } from 'path';

const isBuffer = Buffer.isBuffer;

const Module = _Module as any;

/**
 * 创建新的require方法，以路径目录为上下文
 * 目前在node 10以下版本测试没有问题
 * @param path
 * @param uncached
 * @returns
 */
export function requireFn(path: string, uncached = false) {
  const parentModule = new Module(path);
  parentModule.filename = path;
  parentModule.paths = Module._nodeModulePaths(dirname(path));

  function requireLike(file: string) {
    const cache = Module._cache;
    if (uncached) {
      Module._cache = {};
    }

    const exports = Module._load(file, parentModule);
    Module._cache = cache;

    return exports;
  }

  requireLike.resolve = function (request: any) {
    const resolved = Module._resolveFilename(request, parentModule);
    // Module._resolveFilename returns a string since node v0.6.10,
    // it used to return an array prior to that
    return resolved instanceof Array ? resolved[1] : resolved;
  };

  requireLike.main = require.main;
  requireLike.cache = require.cache;

  return requireLike;
}

// Return the exports/module.exports variable set in the content
// content (String|VmScript): required
export function runScript(
  content: string | vm.Script,
  filename?: string,
  scope?: any,
  includeGlobals?: boolean,
) {
  if (typeof filename !== 'string') {
    if (typeof filename === 'object') {
      includeGlobals = scope;
      scope = filename;
      filename = '';
    } else if (typeof filename === 'boolean') {
      includeGlobals = filename;
      scope = {};
      filename = '';
    }
  }

  // Expose standard Node globals
  const sandbox: any = {};
  const exports = {};
  const _filename = filename || module.parent.filename;

  if (includeGlobals) {
    merge(sandbox, global);
    // console is non-enumerable in node v10 and above
    sandbox.console = global.console;
    // process is non-enumerable in node v12 and above
    sandbox.process = global.process;
    sandbox.URL = global.URL;
    sandbox.require = requireFn(_filename);
  }

  if (typeof scope === 'object') {
    merge(sandbox, scope);
  }

  sandbox.exports = exports;
  sandbox.module = {
    exports: exports,
    filename: _filename,
    id: _filename,
    parent: module.parent,
    require: sandbox.require || requireFn(_filename),
  };
  sandbox.global = sandbox;

  const options = {
    filename: filename,
    displayErrors: false,
  };

  if (isBuffer(content)) {
    content = content.toString();
  }

  // Evalutate the content with the given scope
  if (typeof content === 'string') {
    const stringScript = content.replace(/^\#\!.*/, '');
    const script = new vm.Script(stringScript, options);
    script.runInNewContext(sandbox, options);
  } else {
    content.runInNewContext(sandbox, options);
  }

  return sandbox.module.exports;
}

// 简单合并
function merge(a: any, b: any) {
  if (!a || !b) return a;
  const keys = Object.keys(b);
  for (let k, i = 0, n = keys.length; i < n; i++) {
    k = keys[i];
    a[k] = b[k];
  }
  return a;
}
