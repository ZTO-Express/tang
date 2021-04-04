import * as _Module from 'module';
import * as vm from 'vm';
import { dirname } from 'path';

const isBuffer = Buffer.isBuffer;

const Module = _Module as any;

/**
 * 创建新的require方法，以路径目录为上下文
 * 目前在node 10以下版本测试没有问题
 * 参考：require-like
 * @param path
 * @param uncached
 * @returns
 */
export function requireFn(path: string, uncached = false) {
  const parentModule = new Module(path);
  parentModule.filename = path;
  parentModule.paths = Module._nodeModulePaths(dirname(path));

  function _requireLike(file: string) {
    const cache = Module._cache;
    if (uncached) {
      Module._cache = {};
    }

    const exports = Module._load(file, parentModule);
    Module._cache = cache;

    return exports;
  }

  _requireLike.resolve = function (request: any) {
    const resolved = Module._resolveFilename(request, parentModule);
    return resolved;
  };

  _requireLike.main = require.main;
  _requireLike.cache = require.cache;

  return _requireLike;
}

// Return the exports/module.exports variable set in the content
// content (String|VmScript): required
// 参考：node-eval
export function runScript(
  content: string | Buffer | vm.Script,
  filename?: string | object | boolean,
  scope?: object | boolean, // 沙盒域或是否包含includeGlobals
  includeGlobals?: boolean,
) {
  if (typeof filename !== 'string') {
    if (typeof filename === 'object') {
      includeGlobals = scope as boolean;
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
    children: module.children,
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
