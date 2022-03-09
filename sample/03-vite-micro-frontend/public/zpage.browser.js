var ZPage = (function (exports, zpageRuntime) {
  'use strict';

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }

  function _mergeNamespaces(n, m) {
    m.forEach(function (e) {
      e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
        if (k !== 'default' && !(k in n)) {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    });
    return Object.freeze(n);
  }

  var zpageRuntime__namespace = /*#__PURE__*/_interopNamespace(zpageRuntime);

  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  const FFB_INDENTITY = "$";
  let __processors = {};
  function use(__process) {
    __processors = __process || {};
  }
  function isFfbApi(api) {
    return api && api.endsWith(FFB_INDENTITY);
  }
  function parseFfbApi(api) {
    const processor = __processors[api];
    if (!processor)
      return void 0;
    const realApi = api.substring(0, api.indexOf(FFB_INDENTITY));
    return __spreadValues({
      name: api,
      api: realApi
    }, processor);
  }
  function interceptFfbRequest(cfg) {
    const api = cfg == null ? void 0 : cfg.url;
    if (!isFfbApi(api))
      return cfg;
    const ffbConfig = parseFfbApi(api);
    if (!ffbConfig)
      return cfg;
    cfg.url = ffbConfig.api;
    cfg.ffb_config = ffbConfig;
    if (ffbConfig.beforeRequest)
      ffbConfig.beforeRequest(cfg);
    return cfg;
  }
  function interceptFfbResponse(response) {
    const cfg = response.config;
    const ffbConfig = cfg.ffb_config;
    if (!ffbConfig)
      return response;
    if (ffbConfig.afterResponse)
      ffbConfig.afterResponse(response);
    return response;
  }
  var ZFfb = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    FFB_INDENTITY,
    use,
    isFfbApi,
    parseFfbApi,
    interceptFfbRequest,
    interceptFfbResponse
  });

  var ZPage = /*#__PURE__*/_mergeNamespaces({
    __proto__: null,
    FFB_INDENTITY: FFB_INDENTITY,
    ZFfb: ZFfb,
    interceptFfbRequest: interceptFfbRequest,
    interceptFfbResponse: interceptFfbResponse,
    isFfbApi: isFfbApi,
    parseFfbApi: parseFfbApi,
    use: use
  }, [zpageRuntime__namespace]);

  exports.FFB_INDENTITY = FFB_INDENTITY;
  exports.ZFfb = ZFfb;
  exports.ZPage = ZPage;
  exports.interceptFfbRequest = interceptFfbRequest;
  exports.interceptFfbResponse = interceptFfbResponse;
  exports.isFfbApi = isFfbApi;
  exports.parseFfbApi = parseFfbApi;
  exports.use = use;
  Object.keys(zpageRuntime).forEach(function (k) {
    if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
      enumerable: true,
      get: function () { return zpageRuntime[k]; }
    });
  });

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, ZPageRuntime);
