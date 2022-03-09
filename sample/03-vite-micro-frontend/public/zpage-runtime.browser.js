var ZPageRuntime = (function (exports, vue, axios) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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

    var vue__namespace = /*#__PURE__*/_interopNamespace(vue);
    var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);

    function getDevtoolsGlobalHook() {
        return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
    }
    function getTarget() {
        // @ts-ignore
        return (typeof navigator !== 'undefined' && typeof window !== 'undefined')
            ? window
            : typeof global !== 'undefined'
                ? global
                : {};
    }
    const isProxyAvailable = typeof Proxy === 'function';

    const HOOK_SETUP = 'devtools-plugin:setup';
    const HOOK_PLUGIN_SETTINGS_SET = 'plugin:settings:set';

    class ApiProxy {
        constructor(plugin, hook) {
            this.target = null;
            this.targetQueue = [];
            this.onQueue = [];
            this.plugin = plugin;
            this.hook = hook;
            const defaultSettings = {};
            if (plugin.settings) {
                for (const id in plugin.settings) {
                    const item = plugin.settings[id];
                    defaultSettings[id] = item.defaultValue;
                }
            }
            const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
            let currentSettings = Object.assign({}, defaultSettings);
            try {
                const raw = localStorage.getItem(localSettingsSaveId);
                const data = JSON.parse(raw);
                Object.assign(currentSettings, data);
            }
            catch (e) {
                // noop
            }
            this.fallbacks = {
                getSettings() {
                    return currentSettings;
                },
                setSettings(value) {
                    try {
                        localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
                    }
                    catch (e) {
                        // noop
                    }
                    currentSettings = value;
                },
            };
            if (hook) {
                hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
                    if (pluginId === this.plugin.id) {
                        this.fallbacks.setSettings(value);
                    }
                });
            }
            this.proxiedOn = new Proxy({}, {
                get: (_target, prop) => {
                    if (this.target) {
                        return this.target.on[prop];
                    }
                    else {
                        return (...args) => {
                            this.onQueue.push({
                                method: prop,
                                args,
                            });
                        };
                    }
                },
            });
            this.proxiedTarget = new Proxy({}, {
                get: (_target, prop) => {
                    if (this.target) {
                        return this.target[prop];
                    }
                    else if (prop === 'on') {
                        return this.proxiedOn;
                    }
                    else if (Object.keys(this.fallbacks).includes(prop)) {
                        return (...args) => {
                            this.targetQueue.push({
                                method: prop,
                                args,
                                resolve: () => { },
                            });
                            return this.fallbacks[prop](...args);
                        };
                    }
                    else {
                        return (...args) => {
                            return new Promise(resolve => {
                                this.targetQueue.push({
                                    method: prop,
                                    args,
                                    resolve,
                                });
                            });
                        };
                    }
                },
            });
        }
        async setRealTarget(target) {
            this.target = target;
            for (const item of this.onQueue) {
                this.target.on[item.method](...item.args);
            }
            for (const item of this.targetQueue) {
                item.resolve(await this.target[item.method](...item.args));
            }
        }
    }

    function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
        const descriptor = pluginDescriptor;
        const target = getTarget();
        const hook = getDevtoolsGlobalHook();
        const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
        if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
            hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
        }
        else {
            const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
            const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
            list.push({
                pluginDescriptor: descriptor,
                setupFn,
                proxy,
            });
            if (proxy)
                setupFn(proxy.proxiedTarget);
        }
    }

    /*!
     * vuex v4.0.2
     * (c) 2021 Evan You
     * @license MIT
     */

    var storeKey = 'store';

    function useStore (key) {
      if ( key === void 0 ) key = null;

      return vue.inject(key !== null ? key : storeKey)
    }

    /**
     * Get the first item that pass the test
     * by second argument function
     *
     * @param {Array} list
     * @param {Function} f
     * @return {*}
     */
    function find (list, f) {
      return list.filter(f)[0]
    }

    /**
     * Deep copy the given object considering circular structure.
     * This function caches all nested objects and its copies.
     * If it detects circular structure, use cached copy to avoid infinite loop.
     *
     * @param {*} obj
     * @param {Array<Object>} cache
     * @return {*}
     */
    function deepCopy (obj, cache) {
      if ( cache === void 0 ) cache = [];

      // just return if obj is immutable value
      if (obj === null || typeof obj !== 'object') {
        return obj
      }

      // if obj is hit, it is in circular structure
      var hit = find(cache, function (c) { return c.original === obj; });
      if (hit) {
        return hit.copy
      }

      var copy = Array.isArray(obj) ? [] : {};
      // put the copy into cache at first
      // because we want to refer it in recursive deepCopy
      cache.push({
        original: obj,
        copy: copy
      });

      Object.keys(obj).forEach(function (key) {
        copy[key] = deepCopy(obj[key], cache);
      });

      return copy
    }

    /**
     * forEach for object
     */
    function forEachValue (obj, fn) {
      Object.keys(obj).forEach(function (key) { return fn(obj[key], key); });
    }

    function isObject$3 (obj) {
      return obj !== null && typeof obj === 'object'
    }

    function isPromise$1 (val) {
      return val && typeof val.then === 'function'
    }

    function assert (condition, msg) {
      if (!condition) { throw new Error(("[vuex] " + msg)) }
    }

    function partial (fn, arg) {
      return function () {
        return fn(arg)
      }
    }

    function genericSubscribe (fn, subs, options) {
      if (subs.indexOf(fn) < 0) {
        options && options.prepend
          ? subs.unshift(fn)
          : subs.push(fn);
      }
      return function () {
        var i = subs.indexOf(fn);
        if (i > -1) {
          subs.splice(i, 1);
        }
      }
    }

    function resetStore (store, hot) {
      store._actions = Object.create(null);
      store._mutations = Object.create(null);
      store._wrappedGetters = Object.create(null);
      store._modulesNamespaceMap = Object.create(null);
      var state = store.state;
      // init all modules
      installModule(store, state, [], store._modules.root, true);
      // reset state
      resetStoreState(store, state, hot);
    }

    function resetStoreState (store, state, hot) {
      var oldState = store._state;

      // bind store public getters
      store.getters = {};
      // reset local getters cache
      store._makeLocalGettersCache = Object.create(null);
      var wrappedGetters = store._wrappedGetters;
      var computedObj = {};
      forEachValue(wrappedGetters, function (fn, key) {
        // use computed to leverage its lazy-caching mechanism
        // direct inline function use will lead to closure preserving oldState.
        // using partial to return function with only arguments preserved in closure environment.
        computedObj[key] = partial(fn, store);
        Object.defineProperty(store.getters, key, {
          // TODO: use `computed` when it's possible. at the moment we can't due to
          // https://github.com/vuejs/vuex/pull/1883
          get: function () { return computedObj[key](); },
          enumerable: true // for local getters
        });
      });

      store._state = vue.reactive({
        data: state
      });

      // enable strict mode for new state
      if (store.strict) {
        enableStrictMode(store);
      }

      if (oldState) {
        if (hot) {
          // dispatch changes in all subscribed watchers
          // to force getter re-evaluation for hot reloading.
          store._withCommit(function () {
            oldState.data = null;
          });
        }
      }
    }

    function installModule (store, rootState, path, module, hot) {
      var isRoot = !path.length;
      var namespace = store._modules.getNamespace(path);

      // register in namespace map
      if (module.namespaced) {
        if (store._modulesNamespaceMap[namespace] && ("production" !== 'production')) {
          console.error(("[vuex] duplicate namespace " + namespace + " for the namespaced module " + (path.join('/'))));
        }
        store._modulesNamespaceMap[namespace] = module;
      }

      // set state
      if (!isRoot && !hot) {
        var parentState = getNestedState(rootState, path.slice(0, -1));
        var moduleName = path[path.length - 1];
        store._withCommit(function () {
          if (("production" !== 'production')) {
            if (moduleName in parentState) {
              console.warn(
                ("[vuex] state field \"" + moduleName + "\" was overridden by a module with the same name at \"" + (path.join('.')) + "\"")
              );
            }
          }
          parentState[moduleName] = module.state;
        });
      }

      var local = module.context = makeLocalContext(store, namespace, path);

      module.forEachMutation(function (mutation, key) {
        var namespacedType = namespace + key;
        registerMutation(store, namespacedType, mutation, local);
      });

      module.forEachAction(function (action, key) {
        var type = action.root ? key : namespace + key;
        var handler = action.handler || action;
        registerAction(store, type, handler, local);
      });

      module.forEachGetter(function (getter, key) {
        var namespacedType = namespace + key;
        registerGetter(store, namespacedType, getter, local);
      });

      module.forEachChild(function (child, key) {
        installModule(store, rootState, path.concat(key), child, hot);
      });
    }

    /**
     * make localized dispatch, commit, getters and state
     * if there is no namespace, just use root ones
     */
    function makeLocalContext (store, namespace, path) {
      var noNamespace = namespace === '';

      var local = {
        dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
          var args = unifyObjectStyle(_type, _payload, _options);
          var payload = args.payload;
          var options = args.options;
          var type = args.type;

          if (!options || !options.root) {
            type = namespace + type;
            if (("production" !== 'production') && !store._actions[type]) {
              console.error(("[vuex] unknown local action type: " + (args.type) + ", global type: " + type));
              return
            }
          }

          return store.dispatch(type, payload)
        },

        commit: noNamespace ? store.commit : function (_type, _payload, _options) {
          var args = unifyObjectStyle(_type, _payload, _options);
          var payload = args.payload;
          var options = args.options;
          var type = args.type;

          if (!options || !options.root) {
            type = namespace + type;
            if (("production" !== 'production') && !store._mutations[type]) {
              console.error(("[vuex] unknown local mutation type: " + (args.type) + ", global type: " + type));
              return
            }
          }

          store.commit(type, payload, options);
        }
      };

      // getters and state object must be gotten lazily
      // because they will be changed by state update
      Object.defineProperties(local, {
        getters: {
          get: noNamespace
            ? function () { return store.getters; }
            : function () { return makeLocalGetters(store, namespace); }
        },
        state: {
          get: function () { return getNestedState(store.state, path); }
        }
      });

      return local
    }

    function makeLocalGetters (store, namespace) {
      if (!store._makeLocalGettersCache[namespace]) {
        var gettersProxy = {};
        var splitPos = namespace.length;
        Object.keys(store.getters).forEach(function (type) {
          // skip if the target getter is not match this namespace
          if (type.slice(0, splitPos) !== namespace) { return }

          // extract local getter type
          var localType = type.slice(splitPos);

          // Add a port to the getters proxy.
          // Define as getter property because
          // we do not want to evaluate the getters in this time.
          Object.defineProperty(gettersProxy, localType, {
            get: function () { return store.getters[type]; },
            enumerable: true
          });
        });
        store._makeLocalGettersCache[namespace] = gettersProxy;
      }

      return store._makeLocalGettersCache[namespace]
    }

    function registerMutation (store, type, handler, local) {
      var entry = store._mutations[type] || (store._mutations[type] = []);
      entry.push(function wrappedMutationHandler (payload) {
        handler.call(store, local.state, payload);
      });
    }

    function registerAction (store, type, handler, local) {
      var entry = store._actions[type] || (store._actions[type] = []);
      entry.push(function wrappedActionHandler (payload) {
        var res = handler.call(store, {
          dispatch: local.dispatch,
          commit: local.commit,
          getters: local.getters,
          state: local.state,
          rootGetters: store.getters,
          rootState: store.state
        }, payload);
        if (!isPromise$1(res)) {
          res = Promise.resolve(res);
        }
        if (store._devtoolHook) {
          return res.catch(function (err) {
            store._devtoolHook.emit('vuex:error', err);
            throw err
          })
        } else {
          return res
        }
      });
    }

    function registerGetter (store, type, rawGetter, local) {
      if (store._wrappedGetters[type]) {
        if (("production" !== 'production')) {
          console.error(("[vuex] duplicate getter key: " + type));
        }
        return
      }
      store._wrappedGetters[type] = function wrappedGetter (store) {
        return rawGetter(
          local.state, // local state
          local.getters, // local getters
          store.state, // root state
          store.getters // root getters
        )
      };
    }

    function enableStrictMode (store) {
      vue.watch(function () { return store._state.data; }, function () {
        if (("production" !== 'production')) {
          assert(store._committing, "do not mutate vuex store state outside mutation handlers.");
        }
      }, { deep: true, flush: 'sync' });
    }

    function getNestedState (state, path) {
      return path.reduce(function (state, key) { return state[key]; }, state)
    }

    function unifyObjectStyle (type, payload, options) {
      if (isObject$3(type) && type.type) {
        options = payload;
        payload = type;
        type = type.type;
      }

      if (("production" !== 'production')) {
        assert(typeof type === 'string', ("expects string as the type, but found " + (typeof type) + "."));
      }

      return { type: type, payload: payload, options: options }
    }

    var LABEL_VUEX_BINDINGS = 'vuex bindings';
    var MUTATIONS_LAYER_ID = 'vuex:mutations';
    var ACTIONS_LAYER_ID = 'vuex:actions';
    var INSPECTOR_ID = 'vuex';

    var actionId = 0;

    function addDevtools$1 (app, store) {
      setupDevtoolsPlugin(
        {
          id: 'org.vuejs.vuex',
          app: app,
          label: 'Vuex',
          homepage: 'https://next.vuex.vuejs.org/',
          logo: 'https://vuejs.org/images/icons/favicon-96x96.png',
          packageName: 'vuex',
          componentStateTypes: [LABEL_VUEX_BINDINGS]
        },
        function (api) {
          api.addTimelineLayer({
            id: MUTATIONS_LAYER_ID,
            label: 'Vuex Mutations',
            color: COLOR_LIME_500
          });

          api.addTimelineLayer({
            id: ACTIONS_LAYER_ID,
            label: 'Vuex Actions',
            color: COLOR_LIME_500
          });

          api.addInspector({
            id: INSPECTOR_ID,
            label: 'Vuex',
            icon: 'storage',
            treeFilterPlaceholder: 'Filter stores...'
          });

          api.on.getInspectorTree(function (payload) {
            if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
              if (payload.filter) {
                var nodes = [];
                flattenStoreForInspectorTree(nodes, store._modules.root, payload.filter, '');
                payload.rootNodes = nodes;
              } else {
                payload.rootNodes = [
                  formatStoreForInspectorTree(store._modules.root, '')
                ];
              }
            }
          });

          api.on.getInspectorState(function (payload) {
            if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
              var modulePath = payload.nodeId;
              makeLocalGetters(store, modulePath);
              payload.state = formatStoreForInspectorState(
                getStoreModule(store._modules, modulePath),
                modulePath === 'root' ? store.getters : store._makeLocalGettersCache,
                modulePath
              );
            }
          });

          api.on.editInspectorState(function (payload) {
            if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
              var modulePath = payload.nodeId;
              var path = payload.path;
              if (modulePath !== 'root') {
                path = modulePath.split('/').filter(Boolean).concat( path);
              }
              store._withCommit(function () {
                payload.set(store._state.data, path, payload.state.value);
              });
            }
          });

          store.subscribe(function (mutation, state) {
            var data = {};

            if (mutation.payload) {
              data.payload = mutation.payload;
            }

            data.state = state;

            api.notifyComponentUpdate();
            api.sendInspectorTree(INSPECTOR_ID);
            api.sendInspectorState(INSPECTOR_ID);

            api.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: Date.now(),
                title: mutation.type,
                data: data
              }
            });
          });

          store.subscribeAction({
            before: function (action, state) {
              var data = {};
              if (action.payload) {
                data.payload = action.payload;
              }
              action._id = actionId++;
              action._time = Date.now();
              data.state = state;

              api.addTimelineEvent({
                layerId: ACTIONS_LAYER_ID,
                event: {
                  time: action._time,
                  title: action.type,
                  groupId: action._id,
                  subtitle: 'start',
                  data: data
                }
              });
            },
            after: function (action, state) {
              var data = {};
              var duration = Date.now() - action._time;
              data.duration = {
                _custom: {
                  type: 'duration',
                  display: (duration + "ms"),
                  tooltip: 'Action duration',
                  value: duration
                }
              };
              if (action.payload) {
                data.payload = action.payload;
              }
              data.state = state;

              api.addTimelineEvent({
                layerId: ACTIONS_LAYER_ID,
                event: {
                  time: Date.now(),
                  title: action.type,
                  groupId: action._id,
                  subtitle: 'end',
                  data: data
                }
              });
            }
          });
        }
      );
    }

    // extracted from tailwind palette
    var COLOR_LIME_500 = 0x84cc16;
    var COLOR_DARK = 0x666666;
    var COLOR_WHITE = 0xffffff;

    var TAG_NAMESPACED = {
      label: 'namespaced',
      textColor: COLOR_WHITE,
      backgroundColor: COLOR_DARK
    };

    /**
     * @param {string} path
     */
    function extractNameFromPath (path) {
      return path && path !== 'root' ? path.split('/').slice(-2, -1)[0] : 'Root'
    }

    /**
     * @param {*} module
     * @return {import('@vue/devtools-api').CustomInspectorNode}
     */
    function formatStoreForInspectorTree (module, path) {
      return {
        id: path || 'root',
        // all modules end with a `/`, we want the last segment only
        // cart/ -> cart
        // nested/cart/ -> cart
        label: extractNameFromPath(path),
        tags: module.namespaced ? [TAG_NAMESPACED] : [],
        children: Object.keys(module._children).map(function (moduleName) { return formatStoreForInspectorTree(
            module._children[moduleName],
            path + moduleName + '/'
          ); }
        )
      }
    }

    /**
     * @param {import('@vue/devtools-api').CustomInspectorNode[]} result
     * @param {*} module
     * @param {string} filter
     * @param {string} path
     */
    function flattenStoreForInspectorTree (result, module, filter, path) {
      if (path.includes(filter)) {
        result.push({
          id: path || 'root',
          label: path.endsWith('/') ? path.slice(0, path.length - 1) : path || 'Root',
          tags: module.namespaced ? [TAG_NAMESPACED] : []
        });
      }
      Object.keys(module._children).forEach(function (moduleName) {
        flattenStoreForInspectorTree(result, module._children[moduleName], filter, path + moduleName + '/');
      });
    }

    /**
     * @param {*} module
     * @return {import('@vue/devtools-api').CustomInspectorState}
     */
    function formatStoreForInspectorState (module, getters, path) {
      getters = path === 'root' ? getters : getters[path];
      var gettersKeys = Object.keys(getters);
      var storeState = {
        state: Object.keys(module.state).map(function (key) { return ({
          key: key,
          editable: true,
          value: module.state[key]
        }); })
      };

      if (gettersKeys.length) {
        var tree = transformPathsToObjectTree(getters);
        storeState.getters = Object.keys(tree).map(function (key) { return ({
          key: key.endsWith('/') ? extractNameFromPath(key) : key,
          editable: false,
          value: canThrow(function () { return tree[key]; })
        }); });
      }

      return storeState
    }

    function transformPathsToObjectTree (getters) {
      var result = {};
      Object.keys(getters).forEach(function (key) {
        var path = key.split('/');
        if (path.length > 1) {
          var target = result;
          var leafKey = path.pop();
          path.forEach(function (p) {
            if (!target[p]) {
              target[p] = {
                _custom: {
                  value: {},
                  display: p,
                  tooltip: 'Module',
                  abstract: true
                }
              };
            }
            target = target[p]._custom.value;
          });
          target[leafKey] = canThrow(function () { return getters[key]; });
        } else {
          result[key] = canThrow(function () { return getters[key]; });
        }
      });
      return result
    }

    function getStoreModule (moduleMap, path) {
      var names = path.split('/').filter(function (n) { return n; });
      return names.reduce(
        function (module, moduleName, i) {
          var child = module[moduleName];
          if (!child) {
            throw new Error(("Missing module \"" + moduleName + "\" for path \"" + path + "\"."))
          }
          return i === names.length - 1 ? child : child._children
        },
        path === 'root' ? moduleMap : moduleMap.root._children
      )
    }

    function canThrow (cb) {
      try {
        return cb()
      } catch (e) {
        return e
      }
    }

    // Base data struct for store's module, package with some attribute and method
    var Module = function Module (rawModule, runtime) {
      this.runtime = runtime;
      // Store some children item
      this._children = Object.create(null);
      // Store the origin module object which passed by programmer
      this._rawModule = rawModule;
      var rawState = rawModule.state;

      // Store the origin module's state
      this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};
    };

    var prototypeAccessors$1 = { namespaced: { configurable: true } };

    prototypeAccessors$1.namespaced.get = function () {
      return !!this._rawModule.namespaced
    };

    Module.prototype.addChild = function addChild (key, module) {
      this._children[key] = module;
    };

    Module.prototype.removeChild = function removeChild (key) {
      delete this._children[key];
    };

    Module.prototype.getChild = function getChild (key) {
      return this._children[key]
    };

    Module.prototype.hasChild = function hasChild (key) {
      return key in this._children
    };

    Module.prototype.update = function update (rawModule) {
      this._rawModule.namespaced = rawModule.namespaced;
      if (rawModule.actions) {
        this._rawModule.actions = rawModule.actions;
      }
      if (rawModule.mutations) {
        this._rawModule.mutations = rawModule.mutations;
      }
      if (rawModule.getters) {
        this._rawModule.getters = rawModule.getters;
      }
    };

    Module.prototype.forEachChild = function forEachChild (fn) {
      forEachValue(this._children, fn);
    };

    Module.prototype.forEachGetter = function forEachGetter (fn) {
      if (this._rawModule.getters) {
        forEachValue(this._rawModule.getters, fn);
      }
    };

    Module.prototype.forEachAction = function forEachAction (fn) {
      if (this._rawModule.actions) {
        forEachValue(this._rawModule.actions, fn);
      }
    };

    Module.prototype.forEachMutation = function forEachMutation (fn) {
      if (this._rawModule.mutations) {
        forEachValue(this._rawModule.mutations, fn);
      }
    };

    Object.defineProperties( Module.prototype, prototypeAccessors$1 );

    var ModuleCollection = function ModuleCollection (rawRootModule) {
      // register root module (Vuex.Store options)
      this.register([], rawRootModule, false);
    };

    ModuleCollection.prototype.get = function get (path) {
      return path.reduce(function (module, key) {
        return module.getChild(key)
      }, this.root)
    };

    ModuleCollection.prototype.getNamespace = function getNamespace (path) {
      var module = this.root;
      return path.reduce(function (namespace, key) {
        module = module.getChild(key);
        return namespace + (module.namespaced ? key + '/' : '')
      }, '')
    };

    ModuleCollection.prototype.update = function update$1 (rawRootModule) {
      update([], this.root, rawRootModule);
    };

    ModuleCollection.prototype.register = function register (path, rawModule, runtime) {
        var this$1$1 = this;
        if ( runtime === void 0 ) runtime = true;

      if (("production" !== 'production')) {
        assertRawModule(path, rawModule);
      }

      var newModule = new Module(rawModule, runtime);
      if (path.length === 0) {
        this.root = newModule;
      } else {
        var parent = this.get(path.slice(0, -1));
        parent.addChild(path[path.length - 1], newModule);
      }

      // register nested modules
      if (rawModule.modules) {
        forEachValue(rawModule.modules, function (rawChildModule, key) {
          this$1$1.register(path.concat(key), rawChildModule, runtime);
        });
      }
    };

    ModuleCollection.prototype.unregister = function unregister (path) {
      var parent = this.get(path.slice(0, -1));
      var key = path[path.length - 1];
      var child = parent.getChild(key);

      if (!child) {
        if (("production" !== 'production')) {
          console.warn(
            "[vuex] trying to unregister module '" + key + "', which is " +
            "not registered"
          );
        }
        return
      }

      if (!child.runtime) {
        return
      }

      parent.removeChild(key);
    };

    ModuleCollection.prototype.isRegistered = function isRegistered (path) {
      var parent = this.get(path.slice(0, -1));
      var key = path[path.length - 1];

      if (parent) {
        return parent.hasChild(key)
      }

      return false
    };

    function update (path, targetModule, newModule) {
      if (("production" !== 'production')) {
        assertRawModule(path, newModule);
      }

      // update target module
      targetModule.update(newModule);

      // update nested modules
      if (newModule.modules) {
        for (var key in newModule.modules) {
          if (!targetModule.getChild(key)) {
            if (("production" !== 'production')) {
              console.warn(
                "[vuex] trying to add a new module '" + key + "' on hot reloading, " +
                'manual reload is needed'
              );
            }
            return
          }
          update(
            path.concat(key),
            targetModule.getChild(key),
            newModule.modules[key]
          );
        }
      }
    }

    var functionAssert = {
      assert: function (value) { return typeof value === 'function'; },
      expected: 'function'
    };

    var objectAssert = {
      assert: function (value) { return typeof value === 'function' ||
        (typeof value === 'object' && typeof value.handler === 'function'); },
      expected: 'function or object with "handler" function'
    };

    var assertTypes = {
      getters: functionAssert,
      mutations: functionAssert,
      actions: objectAssert
    };

    function assertRawModule (path, rawModule) {
      Object.keys(assertTypes).forEach(function (key) {
        if (!rawModule[key]) { return }

        var assertOptions = assertTypes[key];

        forEachValue(rawModule[key], function (value, type) {
          assert(
            assertOptions.assert(value),
            makeAssertionMessage(path, key, type, value, assertOptions.expected)
          );
        });
      });
    }

    function makeAssertionMessage (path, key, type, value, expected) {
      var buf = key + " should be " + expected + " but \"" + key + "." + type + "\"";
      if (path.length > 0) {
        buf += " in module \"" + (path.join('.')) + "\"";
      }
      buf += " is " + (JSON.stringify(value)) + ".";
      return buf
    }

    function createStore (options) {
      return new Store(options)
    }

    var Store = function Store (options) {
      var this$1$1 = this;
      if ( options === void 0 ) options = {};

      if (("production" !== 'production')) {
        assert(typeof Promise !== 'undefined', "vuex requires a Promise polyfill in this browser.");
        assert(this instanceof Store, "store must be called with the new operator.");
      }

      var plugins = options.plugins; if ( plugins === void 0 ) plugins = [];
      var strict = options.strict; if ( strict === void 0 ) strict = false;
      var devtools = options.devtools;

      // store internal state
      this._committing = false;
      this._actions = Object.create(null);
      this._actionSubscribers = [];
      this._mutations = Object.create(null);
      this._wrappedGetters = Object.create(null);
      this._modules = new ModuleCollection(options);
      this._modulesNamespaceMap = Object.create(null);
      this._subscribers = [];
      this._makeLocalGettersCache = Object.create(null);
      this._devtools = devtools;

      // bind commit and dispatch to self
      var store = this;
      var ref = this;
      var dispatch = ref.dispatch;
      var commit = ref.commit;
      this.dispatch = function boundDispatch (type, payload) {
        return dispatch.call(store, type, payload)
      };
      this.commit = function boundCommit (type, payload, options) {
        return commit.call(store, type, payload, options)
      };

      // strict mode
      this.strict = strict;

      var state = this._modules.root.state;

      // init root module.
      // this also recursively registers all sub-modules
      // and collects all module getters inside this._wrappedGetters
      installModule(this, state, [], this._modules.root);

      // initialize the store state, which is responsible for the reactivity
      // (also registers _wrappedGetters as computed properties)
      resetStoreState(this, state);

      // apply plugins
      plugins.forEach(function (plugin) { return plugin(this$1$1); });
    };

    var prototypeAccessors = { state: { configurable: true } };

    Store.prototype.install = function install (app, injectKey) {
      app.provide(injectKey || storeKey, this);
      app.config.globalProperties.$store = this;

      var useDevtools = this._devtools !== undefined
        ? this._devtools
        : ("production" !== 'production') || false;

      if (useDevtools) {
        addDevtools$1(app, this);
      }
    };

    prototypeAccessors.state.get = function () {
      return this._state.data
    };

    prototypeAccessors.state.set = function (v) {
      if (("production" !== 'production')) {
        assert(false, "use store.replaceState() to explicit replace store state.");
      }
    };

    Store.prototype.commit = function commit (_type, _payload, _options) {
        var this$1$1 = this;

      // check object-style commit
      var ref = unifyObjectStyle(_type, _payload, _options);
        var type = ref.type;
        var payload = ref.payload;
        var options = ref.options;

      var mutation = { type: type, payload: payload };
      var entry = this._mutations[type];
      if (!entry) {
        if (("production" !== 'production')) {
          console.error(("[vuex] unknown mutation type: " + type));
        }
        return
      }
      this._withCommit(function () {
        entry.forEach(function commitIterator (handler) {
          handler(payload);
        });
      });

      this._subscribers
        .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
        .forEach(function (sub) { return sub(mutation, this$1$1.state); });

      if (
        ("production" !== 'production') &&
        options && options.silent
      ) {
        console.warn(
          "[vuex] mutation type: " + type + ". Silent option has been removed. " +
          'Use the filter functionality in the vue-devtools'
        );
      }
    };

    Store.prototype.dispatch = function dispatch (_type, _payload) {
        var this$1$1 = this;

      // check object-style dispatch
      var ref = unifyObjectStyle(_type, _payload);
        var type = ref.type;
        var payload = ref.payload;

      var action = { type: type, payload: payload };
      var entry = this._actions[type];
      if (!entry) {
        if (("production" !== 'production')) {
          console.error(("[vuex] unknown action type: " + type));
        }
        return
      }

      try {
        this._actionSubscribers
          .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
          .filter(function (sub) { return sub.before; })
          .forEach(function (sub) { return sub.before(action, this$1$1.state); });
      } catch (e) {
        if (("production" !== 'production')) {
          console.warn("[vuex] error in before action subscribers: ");
          console.error(e);
        }
      }

      var result = entry.length > 1
        ? Promise.all(entry.map(function (handler) { return handler(payload); }))
        : entry[0](payload);

      return new Promise(function (resolve, reject) {
        result.then(function (res) {
          try {
            this$1$1._actionSubscribers
              .filter(function (sub) { return sub.after; })
              .forEach(function (sub) { return sub.after(action, this$1$1.state); });
          } catch (e) {
            if (("production" !== 'production')) {
              console.warn("[vuex] error in after action subscribers: ");
              console.error(e);
            }
          }
          resolve(res);
        }, function (error) {
          try {
            this$1$1._actionSubscribers
              .filter(function (sub) { return sub.error; })
              .forEach(function (sub) { return sub.error(action, this$1$1.state, error); });
          } catch (e) {
            if (("production" !== 'production')) {
              console.warn("[vuex] error in error action subscribers: ");
              console.error(e);
            }
          }
          reject(error);
        });
      })
    };

    Store.prototype.subscribe = function subscribe (fn, options) {
      return genericSubscribe(fn, this._subscribers, options)
    };

    Store.prototype.subscribeAction = function subscribeAction (fn, options) {
      var subs = typeof fn === 'function' ? { before: fn } : fn;
      return genericSubscribe(subs, this._actionSubscribers, options)
    };

    Store.prototype.watch = function watch$1 (getter, cb, options) {
        var this$1$1 = this;

      if (("production" !== 'production')) {
        assert(typeof getter === 'function', "store.watch only accepts a function.");
      }
      return vue.watch(function () { return getter(this$1$1.state, this$1$1.getters); }, cb, Object.assign({}, options))
    };

    Store.prototype.replaceState = function replaceState (state) {
        var this$1$1 = this;

      this._withCommit(function () {
        this$1$1._state.data = state;
      });
    };

    Store.prototype.registerModule = function registerModule (path, rawModule, options) {
        if ( options === void 0 ) options = {};

      if (typeof path === 'string') { path = [path]; }

      if (("production" !== 'production')) {
        assert(Array.isArray(path), "module path must be a string or an Array.");
        assert(path.length > 0, 'cannot register the root module by using registerModule.');
      }

      this._modules.register(path, rawModule);
      installModule(this, this.state, path, this._modules.get(path), options.preserveState);
      // reset store to update getters...
      resetStoreState(this, this.state);
    };

    Store.prototype.unregisterModule = function unregisterModule (path) {
        var this$1$1 = this;

      if (typeof path === 'string') { path = [path]; }

      if (("production" !== 'production')) {
        assert(Array.isArray(path), "module path must be a string or an Array.");
      }

      this._modules.unregister(path);
      this._withCommit(function () {
        var parentState = getNestedState(this$1$1.state, path.slice(0, -1));
        delete parentState[path[path.length - 1]];
      });
      resetStore(this);
    };

    Store.prototype.hasModule = function hasModule (path) {
      if (typeof path === 'string') { path = [path]; }

      if (("production" !== 'production')) {
        assert(Array.isArray(path), "module path must be a string or an Array.");
      }

      return this._modules.isRegistered(path)
    };

    Store.prototype.hotUpdate = function hotUpdate (newOptions) {
      this._modules.update(newOptions);
      resetStore(this, true);
    };

    Store.prototype._withCommit = function _withCommit (fn) {
      var committing = this._committing;
      this._committing = true;
      fn();
      this._committing = committing;
    };

    Object.defineProperties( Store.prototype, prototypeAccessors );

    /**
     * Reduce the code which written in Vue.js for getting the state.
     * @param {String} [namespace] - Module's namespace
     * @param {Object|Array} states # Object's item can be a function which accept state and getters for param, you can do something for state and getters in it.
     * @param {Object}
     */
    var mapState = normalizeNamespace(function (namespace, states) {
      var res = {};
      if (("production" !== 'production') && !isValidMap(states)) {
        console.error('[vuex] mapState: mapper parameter must be either an Array or an Object');
      }
      normalizeMap(states).forEach(function (ref) {
        var key = ref.key;
        var val = ref.val;

        res[key] = function mappedState () {
          var state = this.$store.state;
          var getters = this.$store.getters;
          if (namespace) {
            var module = getModuleByNamespace(this.$store, 'mapState', namespace);
            if (!module) {
              return
            }
            state = module.context.state;
            getters = module.context.getters;
          }
          return typeof val === 'function'
            ? val.call(this, state, getters)
            : state[val]
        };
        // mark vuex getter for devtools
        res[key].vuex = true;
      });
      return res
    });

    /**
     * Reduce the code which written in Vue.js for committing the mutation
     * @param {String} [namespace] - Module's namespace
     * @param {Object|Array} mutations # Object's item can be a function which accept `commit` function as the first param, it can accept another params. You can commit mutation and do any other things in this function. specially, You need to pass anthor params from the mapped function.
     * @return {Object}
     */
    var mapMutations = normalizeNamespace(function (namespace, mutations) {
      var res = {};
      if (("production" !== 'production') && !isValidMap(mutations)) {
        console.error('[vuex] mapMutations: mapper parameter must be either an Array or an Object');
      }
      normalizeMap(mutations).forEach(function (ref) {
        var key = ref.key;
        var val = ref.val;

        res[key] = function mappedMutation () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          // Get the commit method from store
          var commit = this.$store.commit;
          if (namespace) {
            var module = getModuleByNamespace(this.$store, 'mapMutations', namespace);
            if (!module) {
              return
            }
            commit = module.context.commit;
          }
          return typeof val === 'function'
            ? val.apply(this, [commit].concat(args))
            : commit.apply(this.$store, [val].concat(args))
        };
      });
      return res
    });

    /**
     * Reduce the code which written in Vue.js for getting the getters
     * @param {String} [namespace] - Module's namespace
     * @param {Object|Array} getters
     * @return {Object}
     */
    var mapGetters = normalizeNamespace(function (namespace, getters) {
      var res = {};
      if (("production" !== 'production') && !isValidMap(getters)) {
        console.error('[vuex] mapGetters: mapper parameter must be either an Array or an Object');
      }
      normalizeMap(getters).forEach(function (ref) {
        var key = ref.key;
        var val = ref.val;

        // The namespace has been mutated by normalizeNamespace
        val = namespace + val;
        res[key] = function mappedGetter () {
          if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
            return
          }
          if (("production" !== 'production') && !(val in this.$store.getters)) {
            console.error(("[vuex] unknown getter: " + val));
            return
          }
          return this.$store.getters[val]
        };
        // mark vuex getter for devtools
        res[key].vuex = true;
      });
      return res
    });

    /**
     * Reduce the code which written in Vue.js for dispatch the action
     * @param {String} [namespace] - Module's namespace
     * @param {Object|Array} actions # Object's item can be a function which accept `dispatch` function as the first param, it can accept anthor params. You can dispatch action and do any other things in this function. specially, You need to pass anthor params from the mapped function.
     * @return {Object}
     */
    var mapActions = normalizeNamespace(function (namespace, actions) {
      var res = {};
      if (("production" !== 'production') && !isValidMap(actions)) {
        console.error('[vuex] mapActions: mapper parameter must be either an Array or an Object');
      }
      normalizeMap(actions).forEach(function (ref) {
        var key = ref.key;
        var val = ref.val;

        res[key] = function mappedAction () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          // get dispatch function from store
          var dispatch = this.$store.dispatch;
          if (namespace) {
            var module = getModuleByNamespace(this.$store, 'mapActions', namespace);
            if (!module) {
              return
            }
            dispatch = module.context.dispatch;
          }
          return typeof val === 'function'
            ? val.apply(this, [dispatch].concat(args))
            : dispatch.apply(this.$store, [val].concat(args))
        };
      });
      return res
    });

    /**
     * Rebinding namespace param for mapXXX function in special scoped, and return them by simple object
     * @param {String} namespace
     * @return {Object}
     */
    var createNamespacedHelpers = function (namespace) { return ({
      mapState: mapState.bind(null, namespace),
      mapGetters: mapGetters.bind(null, namespace),
      mapMutations: mapMutations.bind(null, namespace),
      mapActions: mapActions.bind(null, namespace)
    }); };

    /**
     * Normalize the map
     * normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
     * normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
     * @param {Array|Object} map
     * @return {Object}
     */
    function normalizeMap (map) {
      if (!isValidMap(map)) {
        return []
      }
      return Array.isArray(map)
        ? map.map(function (key) { return ({ key: key, val: key }); })
        : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); })
    }

    /**
     * Validate whether given map is valid or not
     * @param {*} map
     * @return {Boolean}
     */
    function isValidMap (map) {
      return Array.isArray(map) || isObject$3(map)
    }

    /**
     * Return a function expect two param contains namespace and map. it will normalize the namespace and then the param's function will handle the new namespace and the map.
     * @param {Function} fn
     * @return {Function}
     */
    function normalizeNamespace (fn) {
      return function (namespace, map) {
        if (typeof namespace !== 'string') {
          map = namespace;
          namespace = '';
        } else if (namespace.charAt(namespace.length - 1) !== '/') {
          namespace += '/';
        }
        return fn(namespace, map)
      }
    }

    /**
     * Search a special module from store by namespace. if module not exist, print error message.
     * @param {Object} store
     * @param {String} helper
     * @param {String} namespace
     * @return {Object}
     */
    function getModuleByNamespace (store, helper, namespace) {
      var module = store._modulesNamespaceMap[namespace];
      if (("production" !== 'production') && !module) {
        console.error(("[vuex] module namespace not found in " + helper + "(): " + namespace));
      }
      return module
    }

    // Credits: borrowed code from fcomb/redux-logger

    function createLogger (ref) {
      if ( ref === void 0 ) ref = {};
      var collapsed = ref.collapsed; if ( collapsed === void 0 ) collapsed = true;
      var filter = ref.filter; if ( filter === void 0 ) filter = function (mutation, stateBefore, stateAfter) { return true; };
      var transformer = ref.transformer; if ( transformer === void 0 ) transformer = function (state) { return state; };
      var mutationTransformer = ref.mutationTransformer; if ( mutationTransformer === void 0 ) mutationTransformer = function (mut) { return mut; };
      var actionFilter = ref.actionFilter; if ( actionFilter === void 0 ) actionFilter = function (action, state) { return true; };
      var actionTransformer = ref.actionTransformer; if ( actionTransformer === void 0 ) actionTransformer = function (act) { return act; };
      var logMutations = ref.logMutations; if ( logMutations === void 0 ) logMutations = true;
      var logActions = ref.logActions; if ( logActions === void 0 ) logActions = true;
      var logger = ref.logger; if ( logger === void 0 ) logger = console;

      return function (store) {
        var prevState = deepCopy(store.state);

        if (typeof logger === 'undefined') {
          return
        }

        if (logMutations) {
          store.subscribe(function (mutation, state) {
            var nextState = deepCopy(state);

            if (filter(mutation, prevState, nextState)) {
              var formattedTime = getFormattedTime();
              var formattedMutation = mutationTransformer(mutation);
              var message = "mutation " + (mutation.type) + formattedTime;

              startMessage(logger, message, collapsed);
              logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', transformer(prevState));
              logger.log('%c mutation', 'color: #03A9F4; font-weight: bold', formattedMutation);
              logger.log('%c next state', 'color: #4CAF50; font-weight: bold', transformer(nextState));
              endMessage(logger);
            }

            prevState = nextState;
          });
        }

        if (logActions) {
          store.subscribeAction(function (action, state) {
            if (actionFilter(action, state)) {
              var formattedTime = getFormattedTime();
              var formattedAction = actionTransformer(action);
              var message = "action " + (action.type) + formattedTime;

              startMessage(logger, message, collapsed);
              logger.log('%c action', 'color: #03A9F4; font-weight: bold', formattedAction);
              endMessage(logger);
            }
          });
        }
      }
    }

    function startMessage (logger, message, collapsed) {
      var startMessage = collapsed
        ? logger.groupCollapsed
        : logger.group;

      // render
      try {
        startMessage.call(logger, message);
      } catch (e) {
        logger.log(message);
      }
    }

    function endMessage (logger) {
      try {
        logger.groupEnd();
      } catch (e) {
        logger.log('—— log end ——');
      }
    }

    function getFormattedTime () {
      var time = new Date();
      return (" @ " + (pad$1(time.getHours(), 2)) + ":" + (pad$1(time.getMinutes(), 2)) + ":" + (pad$1(time.getSeconds(), 2)) + "." + (pad$1(time.getMilliseconds(), 3)))
    }

    function repeat (str, times) {
      return (new Array(times + 1)).join(str)
    }

    function pad$1 (num, maxLength) {
      return repeat('0', maxLength - num.toString().length) + num
    }

    var index$2 = {
      version: '4.0.2',
      Store: Store,
      storeKey: storeKey,
      createStore: createStore,
      useStore: useStore,
      mapState: mapState,
      mapMutations: mapMutations,
      mapGetters: mapGetters,
      mapActions: mapActions,
      createNamespacedHelpers: createNamespacedHelpers,
      createLogger: createLogger
    };

    var vuex_esmBundler = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': index$2,
        Store: Store,
        createLogger: createLogger,
        createNamespacedHelpers: createNamespacedHelpers,
        createStore: createStore,
        mapActions: mapActions,
        mapGetters: mapGetters,
        mapMutations: mapMutations,
        mapState: mapState,
        storeKey: storeKey,
        useStore: useStore
    });

    /*!
      * vue-router v4.0.13
      * (c) 2022 Eduardo San Martin Morote
      * @license MIT
      */

    const hasSymbol = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
    const PolySymbol = (name) => 
    // vr = vue router
    hasSymbol
        ? Symbol(("production" !== 'production') ? '[vue-router]: ' + name : name)
        : (("production" !== 'production') ? '[vue-router]: ' : '_vr_') + name;
    // rvlm = Router View Location Matched
    /**
     * RouteRecord being rendered by the closest ancestor Router View. Used for
     * `onBeforeRouteUpdate` and `onBeforeRouteLeave`. rvlm stands for Router View
     * Location Matched
     *
     * @internal
     */
    const matchedRouteKey = /*#__PURE__*/ PolySymbol(("production" !== 'production') ? 'router view location matched' : 'rvlm');
    /**
     * Allows overriding the router view depth to control which component in
     * `matched` is rendered. rvd stands for Router View Depth
     *
     * @internal
     */
    const viewDepthKey = /*#__PURE__*/ PolySymbol(("production" !== 'production') ? 'router view depth' : 'rvd');
    /**
     * Allows overriding the router instance returned by `useRouter` in tests. r
     * stands for router
     *
     * @internal
     */
    const routerKey = /*#__PURE__*/ PolySymbol(("production" !== 'production') ? 'router' : 'r');
    /**
     * Allows overriding the current route returned by `useRoute` in tests. rl
     * stands for route location
     *
     * @internal
     */
    const routeLocationKey = /*#__PURE__*/ PolySymbol(("production" !== 'production') ? 'route location' : 'rl');
    /**
     * Allows overriding the current route used by router-view. Internally this is
     * used when the `route` prop is passed.
     *
     * @internal
     */
    const routerViewLocationKey = /*#__PURE__*/ PolySymbol(("production" !== 'production') ? 'router view location' : 'rvl');

    const isBrowser = typeof window !== 'undefined';

    function isESModule(obj) {
        return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module');
    }
    const assign = Object.assign;
    function applyToParams(fn, params) {
        const newParams = {};
        for (const key in params) {
            const value = params[key];
            newParams[key] = Array.isArray(value) ? value.map(fn) : fn(value);
        }
        return newParams;
    }
    const noop$3 = () => { };

    function warn(msg) {
        // avoid using ...args as it breaks in older Edge builds
        const args = Array.from(arguments).slice(1);
        console.warn.apply(console, ['[Vue Router warn]: ' + msg].concat(args));
    }

    const TRAILING_SLASH_RE = /\/$/;
    const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, '');
    /**
     * Transforms an URI into a normalized history location
     *
     * @param parseQuery
     * @param location - URI to normalize
     * @param currentLocation - current absolute location. Allows resolving relative
     * paths. Must start with `/`. Defaults to `/`
     * @returns a normalized history location
     */
    function parseURL(parseQuery, location, currentLocation = '/') {
        let path, query = {}, searchString = '', hash = '';
        // Could use URL and URLSearchParams but IE 11 doesn't support it
        const searchPos = location.indexOf('?');
        const hashPos = location.indexOf('#', searchPos > -1 ? searchPos : 0);
        if (searchPos > -1) {
            path = location.slice(0, searchPos);
            searchString = location.slice(searchPos + 1, hashPos > -1 ? hashPos : location.length);
            query = parseQuery(searchString);
        }
        if (hashPos > -1) {
            path = path || location.slice(0, hashPos);
            // keep the # character
            hash = location.slice(hashPos, location.length);
        }
        // no search and no query
        path = resolveRelativePath(path != null ? path : location, currentLocation);
        // empty path means a relative query or hash `?foo=f`, `#thing`
        return {
            fullPath: path + (searchString && '?') + searchString + hash,
            path,
            query,
            hash,
        };
    }
    /**
     * Stringifies a URL object
     *
     * @param stringifyQuery
     * @param location
     */
    function stringifyURL(stringifyQuery, location) {
        const query = location.query ? stringifyQuery(location.query) : '';
        return location.path + (query && '?') + query + (location.hash || '');
    }
    /**
     * Strips off the base from the beginning of a location.pathname in a non
     * case-sensitive way.
     *
     * @param pathname - location.pathname
     * @param base - base to strip off
     */
    function stripBase(pathname, base) {
        // no base or base is not found at the beginning
        if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase()))
            return pathname;
        return pathname.slice(base.length) || '/';
    }
    /**
     * Checks if two RouteLocation are equal. This means that both locations are
     * pointing towards the same {@link RouteRecord} and that all `params`, `query`
     * parameters and `hash` are the same
     *
     * @param a - first {@link RouteLocation}
     * @param b - second {@link RouteLocation}
     */
    function isSameRouteLocation(stringifyQuery, a, b) {
        const aLastIndex = a.matched.length - 1;
        const bLastIndex = b.matched.length - 1;
        return (aLastIndex > -1 &&
            aLastIndex === bLastIndex &&
            isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) &&
            isSameRouteLocationParams(a.params, b.params) &&
            stringifyQuery(a.query) === stringifyQuery(b.query) &&
            a.hash === b.hash);
    }
    /**
     * Check if two `RouteRecords` are equal. Takes into account aliases: they are
     * considered equal to the `RouteRecord` they are aliasing.
     *
     * @param a - first {@link RouteRecord}
     * @param b - second {@link RouteRecord}
     */
    function isSameRouteRecord(a, b) {
        // since the original record has an undefined value for aliasOf
        // but all aliases point to the original record, this will always compare
        // the original record
        return (a.aliasOf || a) === (b.aliasOf || b);
    }
    function isSameRouteLocationParams(a, b) {
        if (Object.keys(a).length !== Object.keys(b).length)
            return false;
        for (const key in a) {
            if (!isSameRouteLocationParamsValue(a[key], b[key]))
                return false;
        }
        return true;
    }
    function isSameRouteLocationParamsValue(a, b) {
        return Array.isArray(a)
            ? isEquivalentArray(a, b)
            : Array.isArray(b)
                ? isEquivalentArray(b, a)
                : a === b;
    }
    /**
     * Check if two arrays are the same or if an array with one single entry is the
     * same as another primitive value. Used to check query and parameters
     *
     * @param a - array of values
     * @param b - array of values or a single value
     */
    function isEquivalentArray(a, b) {
        return Array.isArray(b)
            ? a.length === b.length && a.every((value, i) => value === b[i])
            : a.length === 1 && a[0] === b;
    }
    /**
     * Resolves a relative path that starts with `.`.
     *
     * @param to - path location we are resolving
     * @param from - currentLocation.path, should start with `/`
     */
    function resolveRelativePath(to, from) {
        if (to.startsWith('/'))
            return to;
        if (("production" !== 'production') && !from.startsWith('/')) {
            warn(`Cannot resolve a relative location without an absolute path. Trying to resolve "${to}" from "${from}". It should look like "/${from}".`);
            return to;
        }
        if (!to)
            return from;
        const fromSegments = from.split('/');
        const toSegments = to.split('/');
        let position = fromSegments.length - 1;
        let toPosition;
        let segment;
        for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
            segment = toSegments[toPosition];
            // can't go below zero
            if (position === 1 || segment === '.')
                continue;
            if (segment === '..')
                position--;
            // found something that is not relative path
            else
                break;
        }
        return (fromSegments.slice(0, position).join('/') +
            '/' +
            toSegments
                .slice(toPosition - (toPosition === toSegments.length ? 1 : 0))
                .join('/'));
    }

    var NavigationType;
    (function (NavigationType) {
        NavigationType["pop"] = "pop";
        NavigationType["push"] = "push";
    })(NavigationType || (NavigationType = {}));
    var NavigationDirection;
    (function (NavigationDirection) {
        NavigationDirection["back"] = "back";
        NavigationDirection["forward"] = "forward";
        NavigationDirection["unknown"] = "";
    })(NavigationDirection || (NavigationDirection = {}));
    /**
     * Starting location for Histories
     */
    const START = '';
    // Generic utils
    /**
     * Normalizes a base by removing any trailing slash and reading the base tag if
     * present.
     *
     * @param base - base to normalize
     */
    function normalizeBase(base) {
        if (!base) {
            if (isBrowser) {
                // respect <base> tag
                const baseEl = document.querySelector('base');
                base = (baseEl && baseEl.getAttribute('href')) || '/';
                // strip full URL origin
                base = base.replace(/^\w+:\/\/[^\/]+/, '');
            }
            else {
                base = '/';
            }
        }
        // ensure leading slash when it was removed by the regex above avoid leading
        // slash with hash because the file could be read from the disk like file://
        // and the leading slash would cause problems
        if (base[0] !== '/' && base[0] !== '#')
            base = '/' + base;
        // remove the trailing slash so all other method can just do `base + fullPath`
        // to build an href
        return removeTrailingSlash(base);
    }
    // remove any character before the hash
    const BEFORE_HASH_RE = /^[^#]+#/;
    function createHref(base, location) {
        return base.replace(BEFORE_HASH_RE, '#') + location;
    }

    function getElementPosition(el, offset) {
        const docRect = document.documentElement.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        return {
            behavior: offset.behavior,
            left: elRect.left - docRect.left - (offset.left || 0),
            top: elRect.top - docRect.top - (offset.top || 0),
        };
    }
    const computeScrollPosition = () => ({
        left: window.pageXOffset,
        top: window.pageYOffset,
    });
    function scrollToPosition(position) {
        let scrollToOptions;
        if ('el' in position) {
            const positionEl = position.el;
            const isIdSelector = typeof positionEl === 'string' && positionEl.startsWith('#');
            /**
             * `id`s can accept pretty much any characters, including CSS combinators
             * like `>` or `~`. It's still possible to retrieve elements using
             * `document.getElementById('~')` but it needs to be escaped when using
             * `document.querySelector('#\\~')` for it to be valid. The only
             * requirements for `id`s are them to be unique on the page and to not be
             * empty (`id=""`). Because of that, when passing an id selector, it should
             * be properly escaped for it to work with `querySelector`. We could check
             * for the id selector to be simple (no CSS combinators `+ >~`) but that
             * would make things inconsistent since they are valid characters for an
             * `id` but would need to be escaped when using `querySelector`, breaking
             * their usage and ending up in no selector returned. Selectors need to be
             * escaped:
             *
             * - `#1-thing` becomes `#\31 -thing`
             * - `#with~symbols` becomes `#with\\~symbols`
             *
             * - More information about  the topic can be found at
             *   https://mathiasbynens.be/notes/html5-id-class.
             * - Practical example: https://mathiasbynens.be/demo/html5-id
             */
            if (("production" !== 'production') && typeof position.el === 'string') {
                if (!isIdSelector || !document.getElementById(position.el.slice(1))) {
                    try {
                        const foundEl = document.querySelector(position.el);
                        if (isIdSelector && foundEl) {
                            warn(`The selector "${position.el}" should be passed as "el: document.querySelector('${position.el}')" because it starts with "#".`);
                            // return to avoid other warnings
                            return;
                        }
                    }
                    catch (err) {
                        warn(`The selector "${position.el}" is invalid. If you are using an id selector, make sure to escape it. You can find more information about escaping characters in selectors at https://mathiasbynens.be/notes/css-escapes or use CSS.escape (https://developer.mozilla.org/en-US/docs/Web/API/CSS/escape).`);
                        // return to avoid other warnings
                        return;
                    }
                }
            }
            const el = typeof positionEl === 'string'
                ? isIdSelector
                    ? document.getElementById(positionEl.slice(1))
                    : document.querySelector(positionEl)
                : positionEl;
            if (!el) {
                ("production" !== 'production') &&
                    warn(`Couldn't find element using selector "${position.el}" returned by scrollBehavior.`);
                return;
            }
            scrollToOptions = getElementPosition(el, position);
        }
        else {
            scrollToOptions = position;
        }
        if ('scrollBehavior' in document.documentElement.style)
            window.scrollTo(scrollToOptions);
        else {
            window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.pageXOffset, scrollToOptions.top != null ? scrollToOptions.top : window.pageYOffset);
        }
    }
    function getScrollKey(path, delta) {
        const position = history.state ? history.state.position - delta : -1;
        return position + path;
    }
    const scrollPositions = new Map();
    function saveScrollPosition(key, scrollPosition) {
        scrollPositions.set(key, scrollPosition);
    }
    function getSavedScrollPosition(key) {
        const scroll = scrollPositions.get(key);
        // consume it so it's not used again
        scrollPositions.delete(key);
        return scroll;
    }
    // TODO: RFC about how to save scroll position
    /**
     * ScrollBehavior instance used by the router to compute and restore the scroll
     * position when navigating.
     */
    // export interface ScrollHandler<ScrollPositionEntry extends HistoryStateValue, ScrollPosition extends ScrollPositionEntry> {
    //   // returns a scroll position that can be saved in history
    //   compute(): ScrollPositionEntry
    //   // can take an extended ScrollPositionEntry
    //   scroll(position: ScrollPosition): void
    // }
    // export const scrollHandler: ScrollHandler<ScrollPosition> = {
    //   compute: computeScroll,
    //   scroll: scrollToPosition,
    // }

    let createBaseLocation = () => location.protocol + '//' + location.host;
    /**
     * Creates a normalized history location from a window.location object
     * @param location -
     */
    function createCurrentLocation(base, location) {
        const { pathname, search, hash } = location;
        // allows hash bases like #, /#, #/, #!, #!/, /#!/, or even /folder#end
        const hashPos = base.indexOf('#');
        if (hashPos > -1) {
            let slicePos = hash.includes(base.slice(hashPos))
                ? base.slice(hashPos).length
                : 1;
            let pathFromHash = hash.slice(slicePos);
            // prepend the starting slash to hash so the url starts with /#
            if (pathFromHash[0] !== '/')
                pathFromHash = '/' + pathFromHash;
            return stripBase(pathFromHash, '');
        }
        const path = stripBase(pathname, base);
        return path + search + hash;
    }
    function useHistoryListeners(base, historyState, currentLocation, replace) {
        let listeners = [];
        let teardowns = [];
        // TODO: should it be a stack? a Dict. Check if the popstate listener
        // can trigger twice
        let pauseState = null;
        const popStateHandler = ({ state, }) => {
            const to = createCurrentLocation(base, location);
            const from = currentLocation.value;
            const fromState = historyState.value;
            let delta = 0;
            if (state) {
                currentLocation.value = to;
                historyState.value = state;
                // ignore the popstate and reset the pauseState
                if (pauseState && pauseState === from) {
                    pauseState = null;
                    return;
                }
                delta = fromState ? state.position - fromState.position : 0;
            }
            else {
                replace(to);
            }
            // console.log({ deltaFromCurrent })
            // Here we could also revert the navigation by calling history.go(-delta)
            // this listener will have to be adapted to not trigger again and to wait for the url
            // to be updated before triggering the listeners. Some kind of validation function would also
            // need to be passed to the listeners so the navigation can be accepted
            // call all listeners
            listeners.forEach(listener => {
                listener(currentLocation.value, from, {
                    delta,
                    type: NavigationType.pop,
                    direction: delta
                        ? delta > 0
                            ? NavigationDirection.forward
                            : NavigationDirection.back
                        : NavigationDirection.unknown,
                });
            });
        };
        function pauseListeners() {
            pauseState = currentLocation.value;
        }
        function listen(callback) {
            // setup the listener and prepare teardown callbacks
            listeners.push(callback);
            const teardown = () => {
                const index = listeners.indexOf(callback);
                if (index > -1)
                    listeners.splice(index, 1);
            };
            teardowns.push(teardown);
            return teardown;
        }
        function beforeUnloadListener() {
            const { history } = window;
            if (!history.state)
                return;
            history.replaceState(assign({}, history.state, { scroll: computeScrollPosition() }), '');
        }
        function destroy() {
            for (const teardown of teardowns)
                teardown();
            teardowns = [];
            window.removeEventListener('popstate', popStateHandler);
            window.removeEventListener('beforeunload', beforeUnloadListener);
        }
        // setup the listeners and prepare teardown callbacks
        window.addEventListener('popstate', popStateHandler);
        window.addEventListener('beforeunload', beforeUnloadListener);
        return {
            pauseListeners,
            listen,
            destroy,
        };
    }
    /**
     * Creates a state object
     */
    function buildState(back, current, forward, replaced = false, computeScroll = false) {
        return {
            back,
            current,
            forward,
            replaced,
            position: window.history.length,
            scroll: computeScroll ? computeScrollPosition() : null,
        };
    }
    function useHistoryStateNavigation(base) {
        const { history, location } = window;
        // private variables
        const currentLocation = {
            value: createCurrentLocation(base, location),
        };
        const historyState = { value: history.state };
        // build current history entry as this is a fresh navigation
        if (!historyState.value) {
            changeLocation(currentLocation.value, {
                back: null,
                current: currentLocation.value,
                forward: null,
                // the length is off by one, we need to decrease it
                position: history.length - 1,
                replaced: true,
                // don't add a scroll as the user may have an anchor and we want
                // scrollBehavior to be triggered without a saved position
                scroll: null,
            }, true);
        }
        function changeLocation(to, state, replace) {
            /**
             * if a base tag is provided and we are on a normal domain, we have to
             * respect the provided `base` attribute because pushState() will use it and
             * potentially erase anything before the `#` like at
             * https://github.com/vuejs/router/issues/685 where a base of
             * `/folder/#` but a base of `/` would erase the `/folder/` section. If
             * there is no host, the `<base>` tag makes no sense and if there isn't a
             * base tag we can just use everything after the `#`.
             */
            const hashIndex = base.indexOf('#');
            const url = hashIndex > -1
                ? (location.host && document.querySelector('base')
                    ? base
                    : base.slice(hashIndex)) + to
                : createBaseLocation() + base + to;
            try {
                // BROWSER QUIRK
                // NOTE: Safari throws a SecurityError when calling this function 100 times in 30 seconds
                history[replace ? 'replaceState' : 'pushState'](state, '', url);
                historyState.value = state;
            }
            catch (err) {
                if (("production" !== 'production')) {
                    warn('Error with push/replace State', err);
                }
                else {
                    console.error(err);
                }
                // Force the navigation, this also resets the call count
                location[replace ? 'replace' : 'assign'](url);
            }
        }
        function replace(to, data) {
            const state = assign({}, history.state, buildState(historyState.value.back, 
            // keep back and forward entries but override current position
            to, historyState.value.forward, true), data, { position: historyState.value.position });
            changeLocation(to, state, true);
            currentLocation.value = to;
        }
        function push(to, data) {
            // Add to current entry the information of where we are going
            // as well as saving the current position
            const currentState = assign({}, 
            // use current history state to gracefully handle a wrong call to
            // history.replaceState
            // https://github.com/vuejs/router/issues/366
            historyState.value, history.state, {
                forward: to,
                scroll: computeScrollPosition(),
            });
            if (("production" !== 'production') && !history.state) {
                warn(`history.state seems to have been manually replaced without preserving the necessary values. Make sure to preserve existing history state if you are manually calling history.replaceState:\n\n` +
                    `history.replaceState(history.state, '', url)\n\n` +
                    `You can find more information at https://next.router.vuejs.org/guide/migration/#usage-of-history-state.`);
            }
            changeLocation(currentState.current, currentState, true);
            const state = assign({}, buildState(currentLocation.value, to, null), { position: currentState.position + 1 }, data);
            changeLocation(to, state, false);
            currentLocation.value = to;
        }
        return {
            location: currentLocation,
            state: historyState,
            push,
            replace,
        };
    }
    /**
     * Creates an HTML5 history. Most common history for single page applications.
     *
     * @param base -
     */
    function createWebHistory(base) {
        base = normalizeBase(base);
        const historyNavigation = useHistoryStateNavigation(base);
        const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
        function go(delta, triggerListeners = true) {
            if (!triggerListeners)
                historyListeners.pauseListeners();
            history.go(delta);
        }
        const routerHistory = assign({
            // it's overridden right after
            location: '',
            base,
            go,
            createHref: createHref.bind(null, base),
        }, historyNavigation, historyListeners);
        Object.defineProperty(routerHistory, 'location', {
            enumerable: true,
            get: () => historyNavigation.location.value,
        });
        Object.defineProperty(routerHistory, 'state', {
            enumerable: true,
            get: () => historyNavigation.state.value,
        });
        return routerHistory;
    }

    /**
     * Creates a in-memory based history. The main purpose of this history is to handle SSR. It starts in a special location that is nowhere.
     * It's up to the user to replace that location with the starter location by either calling `router.push` or `router.replace`.
     *
     * @param base - Base applied to all urls, defaults to '/'
     * @returns a history object that can be passed to the router constructor
     */
    function createMemoryHistory(base = '') {
        let listeners = [];
        let queue = [START];
        let position = 0;
        base = normalizeBase(base);
        function setLocation(location) {
            position++;
            if (position === queue.length) {
                // we are at the end, we can simply append a new entry
                queue.push(location);
            }
            else {
                // we are in the middle, we remove everything from here in the queue
                queue.splice(position);
                queue.push(location);
            }
        }
        function triggerListeners(to, from, { direction, delta }) {
            const info = {
                direction,
                delta,
                type: NavigationType.pop,
            };
            for (const callback of listeners) {
                callback(to, from, info);
            }
        }
        const routerHistory = {
            // rewritten by Object.defineProperty
            location: START,
            // TODO: should be kept in queue
            state: {},
            base,
            createHref: createHref.bind(null, base),
            replace(to) {
                // remove current entry and decrement position
                queue.splice(position--, 1);
                setLocation(to);
            },
            push(to, data) {
                setLocation(to);
            },
            listen(callback) {
                listeners.push(callback);
                return () => {
                    const index = listeners.indexOf(callback);
                    if (index > -1)
                        listeners.splice(index, 1);
                };
            },
            destroy() {
                listeners = [];
                queue = [START];
                position = 0;
            },
            go(delta, shouldTrigger = true) {
                const from = this.location;
                const direction = 
                // we are considering delta === 0 going forward, but in abstract mode
                // using 0 for the delta doesn't make sense like it does in html5 where
                // it reloads the page
                delta < 0 ? NavigationDirection.back : NavigationDirection.forward;
                position = Math.max(0, Math.min(position + delta, queue.length - 1));
                if (shouldTrigger) {
                    triggerListeners(this.location, from, {
                        direction,
                        delta,
                    });
                }
            },
        };
        Object.defineProperty(routerHistory, 'location', {
            enumerable: true,
            get: () => queue[position],
        });
        return routerHistory;
    }

    /**
     * Creates a hash history. Useful for web applications with no host (e.g.
     * `file://`) or when configuring a server to handle any URL is not possible.
     *
     * @param base - optional base to provide. Defaults to `location.pathname +
     * location.search` If there is a `<base>` tag in the `head`, its value will be
     * ignored in favor of this parameter **but note it affects all the
     * history.pushState() calls**, meaning that if you use a `<base>` tag, it's
     * `href` value **has to match this parameter** (ignoring anything after the
     * `#`).
     *
     * @example
     * ```js
     * // at https://example.com/folder
     * createWebHashHistory() // gives a url of `https://example.com/folder#`
     * createWebHashHistory('/folder/') // gives a url of `https://example.com/folder/#`
     * // if the `#` is provided in the base, it won't be added by `createWebHashHistory`
     * createWebHashHistory('/folder/#/app/') // gives a url of `https://example.com/folder/#/app/`
     * // you should avoid doing this because it changes the original url and breaks copying urls
     * createWebHashHistory('/other-folder/') // gives a url of `https://example.com/other-folder/#`
     *
     * // at file:///usr/etc/folder/index.html
     * // for locations with no `host`, the base is ignored
     * createWebHashHistory('/iAmIgnored') // gives a url of `file:///usr/etc/folder/index.html#`
     * ```
     */
    function createWebHashHistory(base) {
        // Make sure this implementation is fine in terms of encoding, specially for IE11
        // for `file://`, directly use the pathname and ignore the base
        // location.pathname contains an initial `/` even at the root: `https://example.com`
        base = location.host ? base || location.pathname + location.search : '';
        // allow the user to provide a `#` in the middle: `/base/#/app`
        if (!base.includes('#'))
            base += '#';
        if (("production" !== 'production') && !base.endsWith('#/') && !base.endsWith('#')) {
            warn(`A hash base must end with a "#":\n"${base}" should be "${base.replace(/#.*$/, '#')}".`);
        }
        return createWebHistory(base);
    }

    function isRouteLocation(route) {
        return typeof route === 'string' || (route && typeof route === 'object');
    }
    function isRouteName(name) {
        return typeof name === 'string' || typeof name === 'symbol';
    }

    /**
     * Initial route location where the router is. Can be used in navigation guards
     * to differentiate the initial navigation.
     *
     * @example
     * ```js
     * import { START_LOCATION } from 'vue-router'
     *
     * router.beforeEach((to, from) => {
     *   if (from === START_LOCATION) {
     *     // initial navigation
     *   }
     * })
     * ```
     */
    const START_LOCATION_NORMALIZED = {
        path: '/',
        name: undefined,
        params: {},
        query: {},
        hash: '',
        fullPath: '/',
        matched: [],
        meta: {},
        redirectedFrom: undefined,
    };

    const NavigationFailureSymbol = /*#__PURE__*/ PolySymbol(("production" !== 'production') ? 'navigation failure' : 'nf');
    /**
     * Enumeration with all possible types for navigation failures. Can be passed to
     * {@link isNavigationFailure} to check for specific failures.
     */
    var NavigationFailureType;
    (function (NavigationFailureType) {
        /**
         * An aborted navigation is a navigation that failed because a navigation
         * guard returned `false` or called `next(false)`
         */
        NavigationFailureType[NavigationFailureType["aborted"] = 4] = "aborted";
        /**
         * A cancelled navigation is a navigation that failed because a more recent
         * navigation finished started (not necessarily finished).
         */
        NavigationFailureType[NavigationFailureType["cancelled"] = 8] = "cancelled";
        /**
         * A duplicated navigation is a navigation that failed because it was
         * initiated while already being at the exact same location.
         */
        NavigationFailureType[NavigationFailureType["duplicated"] = 16] = "duplicated";
    })(NavigationFailureType || (NavigationFailureType = {}));
    // DEV only debug messages
    const ErrorTypeMessages = {
        [1 /* MATCHER_NOT_FOUND */]({ location, currentLocation }) {
            return `No match for\n ${JSON.stringify(location)}${currentLocation
            ? '\nwhile being at\n' + JSON.stringify(currentLocation)
            : ''}`;
        },
        [2 /* NAVIGATION_GUARD_REDIRECT */]({ from, to, }) {
            return `Redirected from "${from.fullPath}" to "${stringifyRoute(to)}" via a navigation guard.`;
        },
        [4 /* NAVIGATION_ABORTED */]({ from, to }) {
            return `Navigation aborted from "${from.fullPath}" to "${to.fullPath}" via a navigation guard.`;
        },
        [8 /* NAVIGATION_CANCELLED */]({ from, to }) {
            return `Navigation cancelled from "${from.fullPath}" to "${to.fullPath}" with a new navigation.`;
        },
        [16 /* NAVIGATION_DUPLICATED */]({ from, to }) {
            return `Avoided redundant navigation to current location: "${from.fullPath}".`;
        },
    };
    function createRouterError(type, params) {
        // keep full error messages in cjs versions
        if (("production" !== 'production') || !true) {
            return assign(new Error(ErrorTypeMessages[type](params)), {
                type,
                [NavigationFailureSymbol]: true,
            }, params);
        }
        else {
            return assign(new Error(), {
                type,
                [NavigationFailureSymbol]: true,
            }, params);
        }
    }
    function isNavigationFailure(error, type) {
        return (error instanceof Error &&
            NavigationFailureSymbol in error &&
            (type == null || !!(error.type & type)));
    }
    const propertiesToLog = ['params', 'query', 'hash'];
    function stringifyRoute(to) {
        if (typeof to === 'string')
            return to;
        if ('path' in to)
            return to.path;
        const location = {};
        for (const key of propertiesToLog) {
            if (key in to)
                location[key] = to[key];
        }
        return JSON.stringify(location, null, 2);
    }

    // default pattern for a param: non greedy everything but /
    const BASE_PARAM_PATTERN = '[^/]+?';
    const BASE_PATH_PARSER_OPTIONS = {
        sensitive: false,
        strict: false,
        start: true,
        end: true,
    };
    // Special Regex characters that must be escaped in static tokens
    const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
    /**
     * Creates a path parser from an array of Segments (a segment is an array of Tokens)
     *
     * @param segments - array of segments returned by tokenizePath
     * @param extraOptions - optional options for the regexp
     * @returns a PathParser
     */
    function tokensToParser(segments, extraOptions) {
        const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
        // the amount of scores is the same as the length of segments except for the root segment "/"
        const score = [];
        // the regexp as a string
        let pattern = options.start ? '^' : '';
        // extracted keys
        const keys = [];
        for (const segment of segments) {
            // the root segment needs special treatment
            const segmentScores = segment.length ? [] : [90 /* Root */];
            // allow trailing slash
            if (options.strict && !segment.length)
                pattern += '/';
            for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
                const token = segment[tokenIndex];
                // resets the score if we are inside a sub segment /:a-other-:b
                let subSegmentScore = 40 /* Segment */ +
                    (options.sensitive ? 0.25 /* BonusCaseSensitive */ : 0);
                if (token.type === 0 /* Static */) {
                    // prepend the slash if we are starting a new segment
                    if (!tokenIndex)
                        pattern += '/';
                    pattern += token.value.replace(REGEX_CHARS_RE, '\\$&');
                    subSegmentScore += 40 /* Static */;
                }
                else if (token.type === 1 /* Param */) {
                    const { value, repeatable, optional, regexp } = token;
                    keys.push({
                        name: value,
                        repeatable,
                        optional,
                    });
                    const re = regexp ? regexp : BASE_PARAM_PATTERN;
                    // the user provided a custom regexp /:id(\\d+)
                    if (re !== BASE_PARAM_PATTERN) {
                        subSegmentScore += 10 /* BonusCustomRegExp */;
                        // make sure the regexp is valid before using it
                        try {
                            new RegExp(`(${re})`);
                        }
                        catch (err) {
                            throw new Error(`Invalid custom RegExp for param "${value}" (${re}): ` +
                                err.message);
                        }
                    }
                    // when we repeat we must take care of the repeating leading slash
                    let subPattern = repeatable ? `((?:${re})(?:/(?:${re}))*)` : `(${re})`;
                    // prepend the slash if we are starting a new segment
                    if (!tokenIndex)
                        subPattern =
                            // avoid an optional / if there are more segments e.g. /:p?-static
                            // or /:p?-:p2
                            optional && segment.length < 2
                                ? `(?:/${subPattern})`
                                : '/' + subPattern;
                    if (optional)
                        subPattern += '?';
                    pattern += subPattern;
                    subSegmentScore += 20 /* Dynamic */;
                    if (optional)
                        subSegmentScore += -8 /* BonusOptional */;
                    if (repeatable)
                        subSegmentScore += -20 /* BonusRepeatable */;
                    if (re === '.*')
                        subSegmentScore += -50 /* BonusWildcard */;
                }
                segmentScores.push(subSegmentScore);
            }
            // an empty array like /home/ -> [[{home}], []]
            // if (!segment.length) pattern += '/'
            score.push(segmentScores);
        }
        // only apply the strict bonus to the last score
        if (options.strict && options.end) {
            const i = score.length - 1;
            score[i][score[i].length - 1] += 0.7000000000000001 /* BonusStrict */;
        }
        // TODO: dev only warn double trailing slash
        if (!options.strict)
            pattern += '/?';
        if (options.end)
            pattern += '$';
        // allow paths like /dynamic to only match dynamic or dynamic/... but not dynamic_something_else
        else if (options.strict)
            pattern += '(?:/|$)';
        const re = new RegExp(pattern, options.sensitive ? '' : 'i');
        function parse(path) {
            const match = path.match(re);
            const params = {};
            if (!match)
                return null;
            for (let i = 1; i < match.length; i++) {
                const value = match[i] || '';
                const key = keys[i - 1];
                params[key.name] = value && key.repeatable ? value.split('/') : value;
            }
            return params;
        }
        function stringify(params) {
            let path = '';
            // for optional parameters to allow to be empty
            let avoidDuplicatedSlash = false;
            for (const segment of segments) {
                if (!avoidDuplicatedSlash || !path.endsWith('/'))
                    path += '/';
                avoidDuplicatedSlash = false;
                for (const token of segment) {
                    if (token.type === 0 /* Static */) {
                        path += token.value;
                    }
                    else if (token.type === 1 /* Param */) {
                        const { value, repeatable, optional } = token;
                        const param = value in params ? params[value] : '';
                        if (Array.isArray(param) && !repeatable)
                            throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
                        const text = Array.isArray(param) ? param.join('/') : param;
                        if (!text) {
                            if (optional) {
                                // if we have more than one optional param like /:a?-static we
                                // don't need to care about the optional param
                                if (segment.length < 2) {
                                    // remove the last slash as we could be at the end
                                    if (path.endsWith('/'))
                                        path = path.slice(0, -1);
                                    // do not append a slash on the next iteration
                                    else
                                        avoidDuplicatedSlash = true;
                                }
                            }
                            else
                                throw new Error(`Missing required param "${value}"`);
                        }
                        path += text;
                    }
                }
            }
            return path;
        }
        return {
            re,
            score,
            keys,
            parse,
            stringify,
        };
    }
    /**
     * Compares an array of numbers as used in PathParser.score and returns a
     * number. This function can be used to `sort` an array
     *
     * @param a - first array of numbers
     * @param b - second array of numbers
     * @returns 0 if both are equal, < 0 if a should be sorted first, > 0 if b
     * should be sorted first
     */
    function compareScoreArray(a, b) {
        let i = 0;
        while (i < a.length && i < b.length) {
            const diff = b[i] - a[i];
            // only keep going if diff === 0
            if (diff)
                return diff;
            i++;
        }
        // if the last subsegment was Static, the shorter segments should be sorted first
        // otherwise sort the longest segment first
        if (a.length < b.length) {
            return a.length === 1 && a[0] === 40 /* Static */ + 40 /* Segment */
                ? -1
                : 1;
        }
        else if (a.length > b.length) {
            return b.length === 1 && b[0] === 40 /* Static */ + 40 /* Segment */
                ? 1
                : -1;
        }
        return 0;
    }
    /**
     * Compare function that can be used with `sort` to sort an array of PathParser
     *
     * @param a - first PathParser
     * @param b - second PathParser
     * @returns 0 if both are equal, < 0 if a should be sorted first, > 0 if b
     */
    function comparePathParserScore(a, b) {
        let i = 0;
        const aScore = a.score;
        const bScore = b.score;
        while (i < aScore.length && i < bScore.length) {
            const comp = compareScoreArray(aScore[i], bScore[i]);
            // do not return if both are equal
            if (comp)
                return comp;
            i++;
        }
        // if a and b share the same score entries but b has more, sort b first
        return bScore.length - aScore.length;
        // this is the ternary version
        // return aScore.length < bScore.length
        //   ? 1
        //   : aScore.length > bScore.length
        //   ? -1
        //   : 0
    }

    const ROOT_TOKEN = {
        type: 0 /* Static */,
        value: '',
    };
    const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
    // After some profiling, the cache seems to be unnecessary because tokenizePath
    // (the slowest part of adding a route) is very fast
    // const tokenCache = new Map<string, Token[][]>()
    function tokenizePath(path) {
        if (!path)
            return [[]];
        if (path === '/')
            return [[ROOT_TOKEN]];
        if (!path.startsWith('/')) {
            throw new Error(("production" !== 'production')
                ? `Route paths should start with a "/": "${path}" should be "/${path}".`
                : `Invalid path "${path}"`);
        }
        // if (tokenCache.has(path)) return tokenCache.get(path)!
        function crash(message) {
            throw new Error(`ERR (${state})/"${buffer}": ${message}`);
        }
        let state = 0 /* Static */;
        let previousState = state;
        const tokens = [];
        // the segment will always be valid because we get into the initial state
        // with the leading /
        let segment;
        function finalizeSegment() {
            if (segment)
                tokens.push(segment);
            segment = [];
        }
        // index on the path
        let i = 0;
        // char at index
        let char;
        // buffer of the value read
        let buffer = '';
        // custom regexp for a param
        let customRe = '';
        function consumeBuffer() {
            if (!buffer)
                return;
            if (state === 0 /* Static */) {
                segment.push({
                    type: 0 /* Static */,
                    value: buffer,
                });
            }
            else if (state === 1 /* Param */ ||
                state === 2 /* ParamRegExp */ ||
                state === 3 /* ParamRegExpEnd */) {
                if (segment.length > 1 && (char === '*' || char === '+'))
                    crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
                segment.push({
                    type: 1 /* Param */,
                    value: buffer,
                    regexp: customRe,
                    repeatable: char === '*' || char === '+',
                    optional: char === '*' || char === '?',
                });
            }
            else {
                crash('Invalid state to consume buffer');
            }
            buffer = '';
        }
        function addCharToBuffer() {
            buffer += char;
        }
        while (i < path.length) {
            char = path[i++];
            if (char === '\\' && state !== 2 /* ParamRegExp */) {
                previousState = state;
                state = 4 /* EscapeNext */;
                continue;
            }
            switch (state) {
                case 0 /* Static */:
                    if (char === '/') {
                        if (buffer) {
                            consumeBuffer();
                        }
                        finalizeSegment();
                    }
                    else if (char === ':') {
                        consumeBuffer();
                        state = 1 /* Param */;
                    }
                    else {
                        addCharToBuffer();
                    }
                    break;
                case 4 /* EscapeNext */:
                    addCharToBuffer();
                    state = previousState;
                    break;
                case 1 /* Param */:
                    if (char === '(') {
                        state = 2 /* ParamRegExp */;
                    }
                    else if (VALID_PARAM_RE.test(char)) {
                        addCharToBuffer();
                    }
                    else {
                        consumeBuffer();
                        state = 0 /* Static */;
                        // go back one character if we were not modifying
                        if (char !== '*' && char !== '?' && char !== '+')
                            i--;
                    }
                    break;
                case 2 /* ParamRegExp */:
                    // TODO: is it worth handling nested regexp? like :p(?:prefix_([^/]+)_suffix)
                    // it already works by escaping the closing )
                    // https://paths.esm.dev/?p=AAMeJbiAwQEcDKbAoAAkP60PG2R6QAvgNaA6AFACM2ABuQBB#
                    // is this really something people need since you can also write
                    // /prefix_:p()_suffix
                    if (char === ')') {
                        // handle the escaped )
                        if (customRe[customRe.length - 1] == '\\')
                            customRe = customRe.slice(0, -1) + char;
                        else
                            state = 3 /* ParamRegExpEnd */;
                    }
                    else {
                        customRe += char;
                    }
                    break;
                case 3 /* ParamRegExpEnd */:
                    // same as finalizing a param
                    consumeBuffer();
                    state = 0 /* Static */;
                    // go back one character if we were not modifying
                    if (char !== '*' && char !== '?' && char !== '+')
                        i--;
                    customRe = '';
                    break;
                default:
                    crash('Unknown state');
                    break;
            }
        }
        if (state === 2 /* ParamRegExp */)
            crash(`Unfinished custom RegExp for param "${buffer}"`);
        consumeBuffer();
        finalizeSegment();
        // tokenCache.set(path, tokens)
        return tokens;
    }

    function createRouteRecordMatcher(record, parent, options) {
        const parser = tokensToParser(tokenizePath(record.path), options);
        // warn against params with the same name
        if (("production" !== 'production')) {
            const existingKeys = new Set();
            for (const key of parser.keys) {
                if (existingKeys.has(key.name))
                    warn(`Found duplicated params with name "${key.name}" for path "${record.path}". Only the last one will be available on "$route.params".`);
                existingKeys.add(key.name);
            }
        }
        const matcher = assign(parser, {
            record,
            parent,
            // these needs to be populated by the parent
            children: [],
            alias: [],
        });
        if (parent) {
            // both are aliases or both are not aliases
            // we don't want to mix them because the order is used when
            // passing originalRecord in Matcher.addRoute
            if (!matcher.record.aliasOf === !parent.record.aliasOf)
                parent.children.push(matcher);
        }
        return matcher;
    }

    /**
     * Creates a Router Matcher.
     *
     * @internal
     * @param routes - array of initial routes
     * @param globalOptions - global route options
     */
    function createRouterMatcher(routes, globalOptions) {
        // normalized ordered array of matchers
        const matchers = [];
        const matcherMap = new Map();
        globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions);
        function getRecordMatcher(name) {
            return matcherMap.get(name);
        }
        function addRoute(record, parent, originalRecord) {
            // used later on to remove by name
            const isRootAdd = !originalRecord;
            const mainNormalizedRecord = normalizeRouteRecord(record);
            // we might be the child of an alias
            mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
            const options = mergeOptions(globalOptions, record);
            // generate an array of records to correctly handle aliases
            const normalizedRecords = [
                mainNormalizedRecord,
            ];
            if ('alias' in record) {
                const aliases = typeof record.alias === 'string' ? [record.alias] : record.alias;
                for (const alias of aliases) {
                    normalizedRecords.push(assign({}, mainNormalizedRecord, {
                        // this allows us to hold a copy of the `components` option
                        // so that async components cache is hold on the original record
                        components: originalRecord
                            ? originalRecord.record.components
                            : mainNormalizedRecord.components,
                        path: alias,
                        // we might be the child of an alias
                        aliasOf: originalRecord
                            ? originalRecord.record
                            : mainNormalizedRecord,
                        // the aliases are always of the same kind as the original since they
                        // are defined on the same record
                    }));
                }
            }
            let matcher;
            let originalMatcher;
            for (const normalizedRecord of normalizedRecords) {
                const { path } = normalizedRecord;
                // Build up the path for nested routes if the child isn't an absolute
                // route. Only add the / delimiter if the child path isn't empty and if the
                // parent path doesn't have a trailing slash
                if (parent && path[0] !== '/') {
                    const parentPath = parent.record.path;
                    const connectingSlash = parentPath[parentPath.length - 1] === '/' ? '' : '/';
                    normalizedRecord.path =
                        parent.record.path + (path && connectingSlash + path);
                }
                if (("production" !== 'production') && normalizedRecord.path === '*') {
                    throw new Error('Catch all routes ("*") must now be defined using a param with a custom regexp.\n' +
                        'See more at https://next.router.vuejs.org/guide/migration/#removed-star-or-catch-all-routes.');
                }
                // create the object before hand so it can be passed to children
                matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
                if (("production" !== 'production') && parent && path[0] === '/')
                    checkMissingParamsInAbsolutePath(matcher, parent);
                // if we are an alias we must tell the original record that we exist
                // so we can be removed
                if (originalRecord) {
                    originalRecord.alias.push(matcher);
                    if (("production" !== 'production')) {
                        checkSameParams(originalRecord, matcher);
                    }
                }
                else {
                    // otherwise, the first record is the original and others are aliases
                    originalMatcher = originalMatcher || matcher;
                    if (originalMatcher !== matcher)
                        originalMatcher.alias.push(matcher);
                    // remove the route if named and only for the top record (avoid in nested calls)
                    // this works because the original record is the first one
                    if (isRootAdd && record.name && !isAliasRecord(matcher))
                        removeRoute(record.name);
                }
                if ('children' in mainNormalizedRecord) {
                    const children = mainNormalizedRecord.children;
                    for (let i = 0; i < children.length; i++) {
                        addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
                    }
                }
                // if there was no original record, then the first one was not an alias and all
                // other alias (if any) need to reference this record when adding children
                originalRecord = originalRecord || matcher;
                // TODO: add normalized records for more flexibility
                // if (parent && isAliasRecord(originalRecord)) {
                //   parent.children.push(originalRecord)
                // }
                insertMatcher(matcher);
            }
            return originalMatcher
                ? () => {
                    // since other matchers are aliases, they should be removed by the original matcher
                    removeRoute(originalMatcher);
                }
                : noop$3;
        }
        function removeRoute(matcherRef) {
            if (isRouteName(matcherRef)) {
                const matcher = matcherMap.get(matcherRef);
                if (matcher) {
                    matcherMap.delete(matcherRef);
                    matchers.splice(matchers.indexOf(matcher), 1);
                    matcher.children.forEach(removeRoute);
                    matcher.alias.forEach(removeRoute);
                }
            }
            else {
                const index = matchers.indexOf(matcherRef);
                if (index > -1) {
                    matchers.splice(index, 1);
                    if (matcherRef.record.name)
                        matcherMap.delete(matcherRef.record.name);
                    matcherRef.children.forEach(removeRoute);
                    matcherRef.alias.forEach(removeRoute);
                }
            }
        }
        function getRoutes() {
            return matchers;
        }
        function insertMatcher(matcher) {
            let i = 0;
            while (i < matchers.length &&
                comparePathParserScore(matcher, matchers[i]) >= 0 &&
                // Adding children with empty path should still appear before the parent
                // https://github.com/vuejs/router/issues/1124
                (matcher.record.path !== matchers[i].record.path ||
                    !isRecordChildOf(matcher, matchers[i])))
                i++;
            matchers.splice(i, 0, matcher);
            // only add the original record to the name map
            if (matcher.record.name && !isAliasRecord(matcher))
                matcherMap.set(matcher.record.name, matcher);
        }
        function resolve(location, currentLocation) {
            let matcher;
            let params = {};
            let path;
            let name;
            if ('name' in location && location.name) {
                matcher = matcherMap.get(location.name);
                if (!matcher)
                    throw createRouterError(1 /* MATCHER_NOT_FOUND */, {
                        location,
                    });
                name = matcher.record.name;
                params = assign(
                // paramsFromLocation is a new object
                paramsFromLocation(currentLocation.params, 
                // only keep params that exist in the resolved location
                // TODO: only keep optional params coming from a parent record
                matcher.keys.filter(k => !k.optional).map(k => k.name)), location.params);
                // throws if cannot be stringified
                path = matcher.stringify(params);
            }
            else if ('path' in location) {
                // no need to resolve the path with the matcher as it was provided
                // this also allows the user to control the encoding
                path = location.path;
                if (("production" !== 'production') && !path.startsWith('/')) {
                    warn(`The Matcher cannot resolve relative paths but received "${path}". Unless you directly called \`matcher.resolve("${path}")\`, this is probably a bug in vue-router. Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/router.`);
                }
                matcher = matchers.find(m => m.re.test(path));
                // matcher should have a value after the loop
                if (matcher) {
                    // TODO: dev warning of unused params if provided
                    // we know the matcher works because we tested the regexp
                    params = matcher.parse(path);
                    name = matcher.record.name;
                }
                // location is a relative path
            }
            else {
                // match by name or path of current route
                matcher = currentLocation.name
                    ? matcherMap.get(currentLocation.name)
                    : matchers.find(m => m.re.test(currentLocation.path));
                if (!matcher)
                    throw createRouterError(1 /* MATCHER_NOT_FOUND */, {
                        location,
                        currentLocation,
                    });
                name = matcher.record.name;
                // since we are navigating to the same location, we don't need to pick the
                // params like when `name` is provided
                params = assign({}, currentLocation.params, location.params);
                path = matcher.stringify(params);
            }
            const matched = [];
            let parentMatcher = matcher;
            while (parentMatcher) {
                // reversed order so parents are at the beginning
                matched.unshift(parentMatcher.record);
                parentMatcher = parentMatcher.parent;
            }
            return {
                name,
                path,
                params,
                matched,
                meta: mergeMetaFields(matched),
            };
        }
        // add initial routes
        routes.forEach(route => addRoute(route));
        return { addRoute, resolve, removeRoute, getRoutes, getRecordMatcher };
    }
    function paramsFromLocation(params, keys) {
        const newParams = {};
        for (const key of keys) {
            if (key in params)
                newParams[key] = params[key];
        }
        return newParams;
    }
    /**
     * Normalizes a RouteRecordRaw. Creates a copy
     *
     * @param record
     * @returns the normalized version
     */
    function normalizeRouteRecord(record) {
        return {
            path: record.path,
            redirect: record.redirect,
            name: record.name,
            meta: record.meta || {},
            aliasOf: undefined,
            beforeEnter: record.beforeEnter,
            props: normalizeRecordProps(record),
            children: record.children || [],
            instances: {},
            leaveGuards: new Set(),
            updateGuards: new Set(),
            enterCallbacks: {},
            components: 'components' in record
                ? record.components || {}
                : { default: record.component },
        };
    }
    /**
     * Normalize the optional `props` in a record to always be an object similar to
     * components. Also accept a boolean for components.
     * @param record
     */
    function normalizeRecordProps(record) {
        const propsObject = {};
        // props does not exist on redirect records but we can set false directly
        const props = record.props || false;
        if ('component' in record) {
            propsObject.default = props;
        }
        else {
            // NOTE: we could also allow a function to be applied to every component.
            // Would need user feedback for use cases
            for (const name in record.components)
                propsObject[name] = typeof props === 'boolean' ? props : props[name];
        }
        return propsObject;
    }
    /**
     * Checks if a record or any of its parent is an alias
     * @param record
     */
    function isAliasRecord(record) {
        while (record) {
            if (record.record.aliasOf)
                return true;
            record = record.parent;
        }
        return false;
    }
    /**
     * Merge meta fields of an array of records
     *
     * @param matched - array of matched records
     */
    function mergeMetaFields(matched) {
        return matched.reduce((meta, record) => assign(meta, record.meta), {});
    }
    function mergeOptions(defaults, partialOptions) {
        const options = {};
        for (const key in defaults) {
            options[key] = key in partialOptions ? partialOptions[key] : defaults[key];
        }
        return options;
    }
    function isSameParam(a, b) {
        return (a.name === b.name &&
            a.optional === b.optional &&
            a.repeatable === b.repeatable);
    }
    /**
     * Check if a path and its alias have the same required params
     *
     * @param a - original record
     * @param b - alias record
     */
    function checkSameParams(a, b) {
        for (const key of a.keys) {
            if (!key.optional && !b.keys.find(isSameParam.bind(null, key)))
                return warn(`Alias "${b.record.path}" and the original record: "${a.record.path}" should have the exact same param named "${key.name}"`);
        }
        for (const key of b.keys) {
            if (!key.optional && !a.keys.find(isSameParam.bind(null, key)))
                return warn(`Alias "${b.record.path}" and the original record: "${a.record.path}" should have the exact same param named "${key.name}"`);
        }
    }
    function checkMissingParamsInAbsolutePath(record, parent) {
        for (const key of parent.keys) {
            if (!record.keys.find(isSameParam.bind(null, key)))
                return warn(`Absolute path "${record.record.path}" should have the exact same param named "${key.name}" as its parent "${parent.record.path}".`);
        }
    }
    function isRecordChildOf(record, parent) {
        return parent.children.some(child => child === record || isRecordChildOf(record, child));
    }

    /**
     * Encoding Rules ␣ = Space Path: ␣ " < > # ? { } Query: ␣ " < > # & = Hash: ␣ "
     * < > `
     *
     * On top of that, the RFC3986 (https://tools.ietf.org/html/rfc3986#section-2.2)
     * defines some extra characters to be encoded. Most browsers do not encode them
     * in encodeURI https://github.com/whatwg/url/issues/369, so it may be safer to
     * also encode `!'()*`. Leaving unencoded only ASCII alphanumeric(`a-zA-Z0-9`)
     * plus `-._~`. This extra safety should be applied to query by patching the
     * string returned by encodeURIComponent encodeURI also encodes `[\]^`. `\`
     * should be encoded to avoid ambiguity. Browsers (IE, FF, C) transform a `\`
     * into a `/` if directly typed in. The _backtick_ (`````) should also be
     * encoded everywhere because some browsers like FF encode it when directly
     * written while others don't. Safari and IE don't encode ``"<>{}``` in hash.
     */
    // const EXTRA_RESERVED_RE = /[!'()*]/g
    // const encodeReservedReplacer = (c: string) => '%' + c.charCodeAt(0).toString(16)
    const HASH_RE = /#/g; // %23
    const AMPERSAND_RE = /&/g; // %26
    const SLASH_RE = /\//g; // %2F
    const EQUAL_RE = /=/g; // %3D
    const IM_RE = /\?/g; // %3F
    const PLUS_RE = /\+/g; // %2B
    /**
     * NOTE: It's not clear to me if we should encode the + symbol in queries, it
     * seems to be less flexible than not doing so and I can't find out the legacy
     * systems requiring this for regular requests like text/html. In the standard,
     * the encoding of the plus character is only mentioned for
     * application/x-www-form-urlencoded
     * (https://url.spec.whatwg.org/#urlencoded-parsing) and most browsers seems lo
     * leave the plus character as is in queries. To be more flexible, we allow the
     * plus character on the query but it can also be manually encoded by the user.
     *
     * Resources:
     * - https://url.spec.whatwg.org/#urlencoded-parsing
     * - https://stackoverflow.com/questions/1634271/url-encoding-the-space-character-or-20
     */
    const ENC_BRACKET_OPEN_RE = /%5B/g; // [
    const ENC_BRACKET_CLOSE_RE = /%5D/g; // ]
    const ENC_CARET_RE = /%5E/g; // ^
    const ENC_BACKTICK_RE = /%60/g; // `
    const ENC_CURLY_OPEN_RE = /%7B/g; // {
    const ENC_PIPE_RE = /%7C/g; // |
    const ENC_CURLY_CLOSE_RE = /%7D/g; // }
    const ENC_SPACE_RE = /%20/g; // }
    /**
     * Encode characters that need to be encoded on the path, search and hash
     * sections of the URL.
     *
     * @internal
     * @param text - string to encode
     * @returns encoded string
     */
    function commonEncode(text) {
        return encodeURI('' + text)
            .replace(ENC_PIPE_RE, '|')
            .replace(ENC_BRACKET_OPEN_RE, '[')
            .replace(ENC_BRACKET_CLOSE_RE, ']');
    }
    /**
     * Encode characters that need to be encoded on the hash section of the URL.
     *
     * @param text - string to encode
     * @returns encoded string
     */
    function encodeHash(text) {
        return commonEncode(text)
            .replace(ENC_CURLY_OPEN_RE, '{')
            .replace(ENC_CURLY_CLOSE_RE, '}')
            .replace(ENC_CARET_RE, '^');
    }
    /**
     * Encode characters that need to be encoded query values on the query
     * section of the URL.
     *
     * @param text - string to encode
     * @returns encoded string
     */
    function encodeQueryValue(text) {
        return (commonEncode(text)
            // Encode the space as +, encode the + to differentiate it from the space
            .replace(PLUS_RE, '%2B')
            .replace(ENC_SPACE_RE, '+')
            .replace(HASH_RE, '%23')
            .replace(AMPERSAND_RE, '%26')
            .replace(ENC_BACKTICK_RE, '`')
            .replace(ENC_CURLY_OPEN_RE, '{')
            .replace(ENC_CURLY_CLOSE_RE, '}')
            .replace(ENC_CARET_RE, '^'));
    }
    /**
     * Like `encodeQueryValue` but also encodes the `=` character.
     *
     * @param text - string to encode
     */
    function encodeQueryKey(text) {
        return encodeQueryValue(text).replace(EQUAL_RE, '%3D');
    }
    /**
     * Encode characters that need to be encoded on the path section of the URL.
     *
     * @param text - string to encode
     * @returns encoded string
     */
    function encodePath(text) {
        return commonEncode(text).replace(HASH_RE, '%23').replace(IM_RE, '%3F');
    }
    /**
     * Encode characters that need to be encoded on the path section of the URL as a
     * param. This function encodes everything {@link encodePath} does plus the
     * slash (`/`) character. If `text` is `null` or `undefined`, returns an empty
     * string instead.
     *
     * @param text - string to encode
     * @returns encoded string
     */
    function encodeParam(text) {
        return text == null ? '' : encodePath(text).replace(SLASH_RE, '%2F');
    }
    /**
     * Decode text using `decodeURIComponent`. Returns the original text if it
     * fails.
     *
     * @param text - string to decode
     * @returns decoded string
     */
    function decode(text) {
        try {
            return decodeURIComponent('' + text);
        }
        catch (err) {
            ("production" !== 'production') && warn(`Error decoding "${text}". Using original value`);
        }
        return '' + text;
    }

    /**
     * Transforms a queryString into a {@link LocationQuery} object. Accept both, a
     * version with the leading `?` and without Should work as URLSearchParams

     * @internal
     *
     * @param search - search string to parse
     * @returns a query object
     */
    function parseQuery(search) {
        const query = {};
        // avoid creating an object with an empty key and empty value
        // because of split('&')
        if (search === '' || search === '?')
            return query;
        const hasLeadingIM = search[0] === '?';
        const searchParams = (hasLeadingIM ? search.slice(1) : search).split('&');
        for (let i = 0; i < searchParams.length; ++i) {
            // pre decode the + into space
            const searchParam = searchParams[i].replace(PLUS_RE, ' ');
            // allow the = character
            const eqPos = searchParam.indexOf('=');
            const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
            const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
            if (key in query) {
                // an extra variable for ts types
                let currentValue = query[key];
                if (!Array.isArray(currentValue)) {
                    currentValue = query[key] = [currentValue];
                }
                currentValue.push(value);
            }
            else {
                query[key] = value;
            }
        }
        return query;
    }
    /**
     * Stringifies a {@link LocationQueryRaw} object. Like `URLSearchParams`, it
     * doesn't prepend a `?`
     *
     * @internal
     *
     * @param query - query object to stringify
     * @returns string version of the query without the leading `?`
     */
    function stringifyQuery(query) {
        let search = '';
        for (let key in query) {
            const value = query[key];
            key = encodeQueryKey(key);
            if (value == null) {
                // only null adds the value
                if (value !== undefined) {
                    search += (search.length ? '&' : '') + key;
                }
                continue;
            }
            // keep null values
            const values = Array.isArray(value)
                ? value.map(v => v && encodeQueryValue(v))
                : [value && encodeQueryValue(value)];
            values.forEach(value => {
                // skip undefined values in arrays as if they were not present
                // smaller code than using filter
                if (value !== undefined) {
                    // only append & with non-empty search
                    search += (search.length ? '&' : '') + key;
                    if (value != null)
                        search += '=' + value;
                }
            });
        }
        return search;
    }
    /**
     * Transforms a {@link LocationQueryRaw} into a {@link LocationQuery} by casting
     * numbers into strings, removing keys with an undefined value and replacing
     * undefined with null in arrays
     *
     * @param query - query object to normalize
     * @returns a normalized query object
     */
    function normalizeQuery(query) {
        const normalizedQuery = {};
        for (const key in query) {
            const value = query[key];
            if (value !== undefined) {
                normalizedQuery[key] = Array.isArray(value)
                    ? value.map(v => (v == null ? null : '' + v))
                    : value == null
                        ? value
                        : '' + value;
            }
        }
        return normalizedQuery;
    }

    /**
     * Create a list of callbacks that can be reset. Used to create before and after navigation guards list
     */
    function useCallbacks() {
        let handlers = [];
        function add(handler) {
            handlers.push(handler);
            return () => {
                const i = handlers.indexOf(handler);
                if (i > -1)
                    handlers.splice(i, 1);
            };
        }
        function reset() {
            handlers = [];
        }
        return {
            add,
            list: () => handlers,
            reset,
        };
    }

    function registerGuard(record, name, guard) {
        const removeFromList = () => {
            record[name].delete(guard);
        };
        vue.onUnmounted(removeFromList);
        vue.onDeactivated(removeFromList);
        vue.onActivated(() => {
            record[name].add(guard);
        });
        record[name].add(guard);
    }
    /**
     * Add a navigation guard that triggers whenever the component for the current
     * location is about to be left. Similar to {@link beforeRouteLeave} but can be
     * used in any component. The guard is removed when the component is unmounted.
     *
     * @param leaveGuard - {@link NavigationGuard}
     */
    function onBeforeRouteLeave(leaveGuard) {
        if (("production" !== 'production') && !vue.getCurrentInstance()) {
            warn('getCurrentInstance() returned null. onBeforeRouteLeave() must be called at the top of a setup function');
            return;
        }
        const activeRecord = vue.inject(matchedRouteKey, 
        // to avoid warning
        {}).value;
        if (!activeRecord) {
            ("production" !== 'production') &&
                warn('No active route record was found when calling `onBeforeRouteLeave()`. Make sure you call this function inside of a component child of <router-view>. Maybe you called it inside of App.vue?');
            return;
        }
        registerGuard(activeRecord, 'leaveGuards', leaveGuard);
    }
    /**
     * Add a navigation guard that triggers whenever the current location is about
     * to be updated. Similar to {@link beforeRouteUpdate} but can be used in any
     * component. The guard is removed when the component is unmounted.
     *
     * @param updateGuard - {@link NavigationGuard}
     */
    function onBeforeRouteUpdate(updateGuard) {
        if (("production" !== 'production') && !vue.getCurrentInstance()) {
            warn('getCurrentInstance() returned null. onBeforeRouteUpdate() must be called at the top of a setup function');
            return;
        }
        const activeRecord = vue.inject(matchedRouteKey, 
        // to avoid warning
        {}).value;
        if (!activeRecord) {
            ("production" !== 'production') &&
                warn('No active route record was found when calling `onBeforeRouteUpdate()`. Make sure you call this function inside of a component child of <router-view>. Maybe you called it inside of App.vue?');
            return;
        }
        registerGuard(activeRecord, 'updateGuards', updateGuard);
    }
    function guardToPromiseFn(guard, to, from, record, name) {
        // keep a reference to the enterCallbackArray to prevent pushing callbacks if a new navigation took place
        const enterCallbackArray = record &&
            // name is defined if record is because of the function overload
            (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
        return () => new Promise((resolve, reject) => {
            const next = (valid) => {
                if (valid === false)
                    reject(createRouterError(4 /* NAVIGATION_ABORTED */, {
                        from,
                        to,
                    }));
                else if (valid instanceof Error) {
                    reject(valid);
                }
                else if (isRouteLocation(valid)) {
                    reject(createRouterError(2 /* NAVIGATION_GUARD_REDIRECT */, {
                        from: to,
                        to: valid,
                    }));
                }
                else {
                    if (enterCallbackArray &&
                        // since enterCallbackArray is truthy, both record and name also are
                        record.enterCallbacks[name] === enterCallbackArray &&
                        typeof valid === 'function')
                        enterCallbackArray.push(valid);
                    resolve();
                }
            };
            // wrapping with Promise.resolve allows it to work with both async and sync guards
            const guardReturn = guard.call(record && record.instances[name], to, from, ("production" !== 'production') ? canOnlyBeCalledOnce(next, to, from) : next);
            let guardCall = Promise.resolve(guardReturn);
            if (guard.length < 3)
                guardCall = guardCall.then(next);
            if (("production" !== 'production') && guard.length > 2) {
                const message = `The "next" callback was never called inside of ${guard.name ? '"' + guard.name + '"' : ''}:\n${guard.toString()}\n. If you are returning a value instead of calling "next", make sure to remove the "next" parameter from your function.`;
                if (typeof guardReturn === 'object' && 'then' in guardReturn) {
                    guardCall = guardCall.then(resolvedValue => {
                        // @ts-expect-error: _called is added at canOnlyBeCalledOnce
                        if (!next._called) {
                            warn(message);
                            return Promise.reject(new Error('Invalid navigation guard'));
                        }
                        return resolvedValue;
                    });
                    // TODO: test me!
                }
                else if (guardReturn !== undefined) {
                    // @ts-expect-error: _called is added at canOnlyBeCalledOnce
                    if (!next._called) {
                        warn(message);
                        reject(new Error('Invalid navigation guard'));
                        return;
                    }
                }
            }
            guardCall.catch(err => reject(err));
        });
    }
    function canOnlyBeCalledOnce(next, to, from) {
        let called = 0;
        return function () {
            if (called++ === 1)
                warn(`The "next" callback was called more than once in one navigation guard when going from "${from.fullPath}" to "${to.fullPath}". It should be called exactly one time in each navigation guard. This will fail in production.`);
            // @ts-expect-error: we put it in the original one because it's easier to check
            next._called = true;
            if (called === 1)
                next.apply(null, arguments);
        };
    }
    function extractComponentsGuards(matched, guardType, to, from) {
        const guards = [];
        for (const record of matched) {
            for (const name in record.components) {
                let rawComponent = record.components[name];
                if (("production" !== 'production')) {
                    if (!rawComponent ||
                        (typeof rawComponent !== 'object' &&
                            typeof rawComponent !== 'function')) {
                        warn(`Component "${name}" in record with path "${record.path}" is not` +
                            ` a valid component. Received "${String(rawComponent)}".`);
                        // throw to ensure we stop here but warn to ensure the message isn't
                        // missed by the user
                        throw new Error('Invalid route component');
                    }
                    else if ('then' in rawComponent) {
                        // warn if user wrote import('/component.vue') instead of () =>
                        // import('./component.vue')
                        warn(`Component "${name}" in record with path "${record.path}" is a ` +
                            `Promise instead of a function that returns a Promise. Did you ` +
                            `write "import('./MyPage.vue')" instead of ` +
                            `"() => import('./MyPage.vue')" ? This will break in ` +
                            `production if not fixed.`);
                        const promise = rawComponent;
                        rawComponent = () => promise;
                    }
                    else if (rawComponent.__asyncLoader &&
                        // warn only once per component
                        !rawComponent.__warnedDefineAsync) {
                        rawComponent.__warnedDefineAsync = true;
                        warn(`Component "${name}" in record with path "${record.path}" is defined ` +
                            `using "defineAsyncComponent()". ` +
                            `Write "() => import('./MyPage.vue')" instead of ` +
                            `"defineAsyncComponent(() => import('./MyPage.vue'))".`);
                    }
                }
                // skip update and leave guards if the route component is not mounted
                if (guardType !== 'beforeRouteEnter' && !record.instances[name])
                    continue;
                if (isRouteComponent(rawComponent)) {
                    // __vccOpts is added by vue-class-component and contain the regular options
                    const options = rawComponent.__vccOpts || rawComponent;
                    const guard = options[guardType];
                    guard && guards.push(guardToPromiseFn(guard, to, from, record, name));
                }
                else {
                    // start requesting the chunk already
                    let componentPromise = rawComponent();
                    if (("production" !== 'production') && !('catch' in componentPromise)) {
                        warn(`Component "${name}" in record with path "${record.path}" is a function that does not return a Promise. If you were passing a functional component, make sure to add a "displayName" to the component. This will break in production if not fixed.`);
                        componentPromise = Promise.resolve(componentPromise);
                    }
                    guards.push(() => componentPromise.then(resolved => {
                        if (!resolved)
                            return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}"`));
                        const resolvedComponent = isESModule(resolved)
                            ? resolved.default
                            : resolved;
                        // replace the function with the resolved component
                        record.components[name] = resolvedComponent;
                        // __vccOpts is added by vue-class-component and contain the regular options
                        const options = resolvedComponent.__vccOpts || resolvedComponent;
                        const guard = options[guardType];
                        return guard && guardToPromiseFn(guard, to, from, record, name)();
                    }));
                }
            }
        }
        return guards;
    }
    /**
     * Allows differentiating lazy components from functional components and vue-class-component
     *
     * @param component
     */
    function isRouteComponent(component) {
        return (typeof component === 'object' ||
            'displayName' in component ||
            'props' in component ||
            '__vccOpts' in component);
    }

    // TODO: we could allow currentRoute as a prop to expose `isActive` and
    // `isExactActive` behavior should go through an RFC
    function useLink(props) {
        const router = vue.inject(routerKey);
        const currentRoute = vue.inject(routeLocationKey);
        const route = vue.computed(() => router.resolve(vue.unref(props.to)));
        const activeRecordIndex = vue.computed(() => {
            const { matched } = route.value;
            const { length } = matched;
            const routeMatched = matched[length - 1];
            const currentMatched = currentRoute.matched;
            if (!routeMatched || !currentMatched.length)
                return -1;
            const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
            if (index > -1)
                return index;
            // possible parent record
            const parentRecordPath = getOriginalPath(matched[length - 2]);
            return (
            // we are dealing with nested routes
            length > 1 &&
                // if the parent and matched route have the same path, this link is
                // referring to the empty child. Or we currently are on a different
                // child of the same parent
                getOriginalPath(routeMatched) === parentRecordPath &&
                // avoid comparing the child with its parent
                currentMatched[currentMatched.length - 1].path !== parentRecordPath
                ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2]))
                : index);
        });
        const isActive = vue.computed(() => activeRecordIndex.value > -1 &&
            includesParams(currentRoute.params, route.value.params));
        const isExactActive = vue.computed(() => activeRecordIndex.value > -1 &&
            activeRecordIndex.value === currentRoute.matched.length - 1 &&
            isSameRouteLocationParams(currentRoute.params, route.value.params));
        function navigate(e = {}) {
            if (guardEvent(e)) {
                return router[vue.unref(props.replace) ? 'replace' : 'push'](vue.unref(props.to)
                // avoid uncaught errors are they are logged anyway
                ).catch(noop$3);
            }
            return Promise.resolve();
        }
        // devtools only
        if ((("production" !== 'production') || false) && isBrowser) {
            const instance = vue.getCurrentInstance();
            if (instance) {
                const linkContextDevtools = {
                    route: route.value,
                    isActive: isActive.value,
                    isExactActive: isExactActive.value,
                };
                // @ts-expect-error: this is internal
                instance.__vrl_devtools = instance.__vrl_devtools || [];
                // @ts-expect-error: this is internal
                instance.__vrl_devtools.push(linkContextDevtools);
                vue.watchEffect(() => {
                    linkContextDevtools.route = route.value;
                    linkContextDevtools.isActive = isActive.value;
                    linkContextDevtools.isExactActive = isExactActive.value;
                }, { flush: 'post' });
            }
        }
        return {
            route,
            href: vue.computed(() => route.value.href),
            isActive,
            isExactActive,
            navigate,
        };
    }
    const RouterLinkImpl = /*#__PURE__*/ vue.defineComponent({
        name: 'RouterLink',
        props: {
            to: {
                type: [String, Object],
                required: true,
            },
            replace: Boolean,
            activeClass: String,
            // inactiveClass: String,
            exactActiveClass: String,
            custom: Boolean,
            ariaCurrentValue: {
                type: String,
                default: 'page',
            },
        },
        useLink,
        setup(props, { slots }) {
            const link = vue.reactive(useLink(props));
            const { options } = vue.inject(routerKey);
            const elClass = vue.computed(() => ({
                [getLinkClass(props.activeClass, options.linkActiveClass, 'router-link-active')]: link.isActive,
                // [getLinkClass(
                //   props.inactiveClass,
                //   options.linkInactiveClass,
                //   'router-link-inactive'
                // )]: !link.isExactActive,
                [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, 'router-link-exact-active')]: link.isExactActive,
            }));
            return () => {
                const children = slots.default && slots.default(link);
                return props.custom
                    ? children
                    : vue.h('a', {
                        'aria-current': link.isExactActive
                            ? props.ariaCurrentValue
                            : null,
                        href: link.href,
                        // this would override user added attrs but Vue will still add
                        // the listener so we end up triggering both
                        onClick: link.navigate,
                        class: elClass.value,
                    }, children);
            };
        },
    });
    // export the public type for h/tsx inference
    // also to avoid inline import() in generated d.ts files
    /**
     * Component to render a link that triggers a navigation on click.
     */
    const RouterLink = RouterLinkImpl;
    function guardEvent(e) {
        // don't redirect with control keys
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
            return;
        // don't redirect when preventDefault called
        if (e.defaultPrevented)
            return;
        // don't redirect on right click
        if (e.button !== undefined && e.button !== 0)
            return;
        // don't redirect if `target="_blank"`
        // @ts-expect-error getAttribute does exist
        if (e.currentTarget && e.currentTarget.getAttribute) {
            // @ts-expect-error getAttribute exists
            const target = e.currentTarget.getAttribute('target');
            if (/\b_blank\b/i.test(target))
                return;
        }
        // this may be a Weex event which doesn't have this method
        if (e.preventDefault)
            e.preventDefault();
        return true;
    }
    function includesParams(outer, inner) {
        for (const key in inner) {
            const innerValue = inner[key];
            const outerValue = outer[key];
            if (typeof innerValue === 'string') {
                if (innerValue !== outerValue)
                    return false;
            }
            else {
                if (!Array.isArray(outerValue) ||
                    outerValue.length !== innerValue.length ||
                    innerValue.some((value, i) => value !== outerValue[i]))
                    return false;
            }
        }
        return true;
    }
    /**
     * Get the original path value of a record by following its aliasOf
     * @param record
     */
    function getOriginalPath(record) {
        return record ? (record.aliasOf ? record.aliasOf.path : record.path) : '';
    }
    /**
     * Utility class to get the active class based on defaults.
     * @param propClass
     * @param globalClass
     * @param defaultClass
     */
    const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null
        ? propClass
        : globalClass != null
            ? globalClass
            : defaultClass;

    const RouterViewImpl = /*#__PURE__*/ vue.defineComponent({
        name: 'RouterView',
        // #674 we manually inherit them
        inheritAttrs: false,
        props: {
            name: {
                type: String,
                default: 'default',
            },
            route: Object,
        },
        setup(props, { attrs, slots }) {
            ("production" !== 'production') && warnDeprecatedUsage();
            const injectedRoute = vue.inject(routerViewLocationKey);
            const routeToDisplay = vue.computed(() => props.route || injectedRoute.value);
            const depth = vue.inject(viewDepthKey, 0);
            const matchedRouteRef = vue.computed(() => routeToDisplay.value.matched[depth]);
            vue.provide(viewDepthKey, depth + 1);
            vue.provide(matchedRouteKey, matchedRouteRef);
            vue.provide(routerViewLocationKey, routeToDisplay);
            const viewRef = vue.ref();
            // watch at the same time the component instance, the route record we are
            // rendering, and the name
            vue.watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {
                // copy reused instances
                if (to) {
                    // this will update the instance for new instances as well as reused
                    // instances when navigating to a new route
                    to.instances[name] = instance;
                    // the component instance is reused for a different route or name so
                    // we copy any saved update or leave guards. With async setup, the
                    // mounting component will mount before the matchedRoute changes,
                    // making instance === oldInstance, so we check if guards have been
                    // added before. This works because we remove guards when
                    // unmounting/deactivating components
                    if (from && from !== to && instance && instance === oldInstance) {
                        if (!to.leaveGuards.size) {
                            to.leaveGuards = from.leaveGuards;
                        }
                        if (!to.updateGuards.size) {
                            to.updateGuards = from.updateGuards;
                        }
                    }
                }
                // trigger beforeRouteEnter next callbacks
                if (instance &&
                    to &&
                    // if there is no instance but to and from are the same this might be
                    // the first visit
                    (!from || !isSameRouteRecord(to, from) || !oldInstance)) {
                    (to.enterCallbacks[name] || []).forEach(callback => callback(instance));
                }
            }, { flush: 'post' });
            return () => {
                const route = routeToDisplay.value;
                const matchedRoute = matchedRouteRef.value;
                const ViewComponent = matchedRoute && matchedRoute.components[props.name];
                // we need the value at the time we render because when we unmount, we
                // navigated to a different location so the value is different
                const currentName = props.name;
                if (!ViewComponent) {
                    return normalizeSlot(slots.default, { Component: ViewComponent, route });
                }
                // props from route configuration
                const routePropsOption = matchedRoute.props[props.name];
                const routeProps = routePropsOption
                    ? routePropsOption === true
                        ? route.params
                        : typeof routePropsOption === 'function'
                            ? routePropsOption(route)
                            : routePropsOption
                    : null;
                const onVnodeUnmounted = vnode => {
                    // remove the instance reference to prevent leak
                    if (vnode.component.isUnmounted) {
                        matchedRoute.instances[currentName] = null;
                    }
                };
                const component = vue.h(ViewComponent, assign({}, routeProps, attrs, {
                    onVnodeUnmounted,
                    ref: viewRef,
                }));
                if ((("production" !== 'production') || false) &&
                    isBrowser &&
                    component.ref) {
                    // TODO: can display if it's an alias, its props
                    const info = {
                        depth,
                        name: matchedRoute.name,
                        path: matchedRoute.path,
                        meta: matchedRoute.meta,
                    };
                    const internalInstances = Array.isArray(component.ref)
                        ? component.ref.map(r => r.i)
                        : [component.ref.i];
                    internalInstances.forEach(instance => {
                        // @ts-expect-error
                        instance.__vrv_devtools = info;
                    });
                }
                return (
                // pass the vnode to the slot as a prop.
                // h and <component :is="..."> both accept vnodes
                normalizeSlot(slots.default, { Component: component, route }) ||
                    component);
            };
        },
    });
    function normalizeSlot(slot, data) {
        if (!slot)
            return null;
        const slotContent = slot(data);
        return slotContent.length === 1 ? slotContent[0] : slotContent;
    }
    // export the public type for h/tsx inference
    // also to avoid inline import() in generated d.ts files
    /**
     * Component to display the current route the user is at.
     */
    const RouterView = RouterViewImpl;
    // warn against deprecated usage with <transition> & <keep-alive>
    // due to functional component being no longer eager in Vue 3
    function warnDeprecatedUsage() {
        const instance = vue.getCurrentInstance();
        const parentName = instance.parent && instance.parent.type.name;
        if (parentName &&
            (parentName === 'KeepAlive' || parentName.includes('Transition'))) {
            const comp = parentName === 'KeepAlive' ? 'keep-alive' : 'transition';
            warn(`<router-view> can no longer be used directly inside <transition> or <keep-alive>.\n` +
                `Use slot props instead:\n\n` +
                `<router-view v-slot="{ Component }">\n` +
                `  <${comp}>\n` +
                `    <component :is="Component" />\n` +
                `  </${comp}>\n` +
                `</router-view>`);
        }
    }

    function formatRouteLocation(routeLocation, tooltip) {
        const copy = assign({}, routeLocation, {
            // remove variables that can contain vue instances
            matched: routeLocation.matched.map(matched => omit$1(matched, ['instances', 'children', 'aliasOf'])),
        });
        return {
            _custom: {
                type: null,
                readOnly: true,
                display: routeLocation.fullPath,
                tooltip,
                value: copy,
            },
        };
    }
    function formatDisplay(display) {
        return {
            _custom: {
                display,
            },
        };
    }
    // to support multiple router instances
    let routerId = 0;
    function addDevtools(app, router, matcher) {
        // Take over router.beforeEach and afterEach
        // make sure we are not registering the devtool twice
        if (router.__hasDevtools)
            return;
        router.__hasDevtools = true;
        // increment to support multiple router instances
        const id = routerId++;
        setupDevtoolsPlugin({
            id: 'org.vuejs.router' + (id ? '.' + id : ''),
            label: 'Vue Router',
            packageName: 'vue-router',
            homepage: 'https://router.vuejs.org',
            logo: 'https://router.vuejs.org/logo.png',
            componentStateTypes: ['Routing'],
            app,
        }, api => {
            // display state added by the router
            api.on.inspectComponent((payload, ctx) => {
                if (payload.instanceData) {
                    payload.instanceData.state.push({
                        type: 'Routing',
                        key: '$route',
                        editable: false,
                        value: formatRouteLocation(router.currentRoute.value, 'Current Route'),
                    });
                }
            });
            // mark router-link as active and display tags on router views
            api.on.visitComponentTree(({ treeNode: node, componentInstance }) => {
                if (componentInstance.__vrv_devtools) {
                    const info = componentInstance.__vrv_devtools;
                    node.tags.push({
                        label: (info.name ? `${info.name.toString()}: ` : '') + info.path,
                        textColor: 0,
                        tooltip: 'This component is rendered by &lt;router-view&gt;',
                        backgroundColor: PINK_500,
                    });
                }
                // if multiple useLink are used
                if (Array.isArray(componentInstance.__vrl_devtools)) {
                    componentInstance.__devtoolsApi = api;
                    componentInstance.__vrl_devtools.forEach(devtoolsData => {
                        let backgroundColor = ORANGE_400;
                        let tooltip = '';
                        if (devtoolsData.isExactActive) {
                            backgroundColor = LIME_500;
                            tooltip = 'This is exactly active';
                        }
                        else if (devtoolsData.isActive) {
                            backgroundColor = BLUE_600;
                            tooltip = 'This link is active';
                        }
                        node.tags.push({
                            label: devtoolsData.route.path,
                            textColor: 0,
                            tooltip,
                            backgroundColor,
                        });
                    });
                }
            });
            vue.watch(router.currentRoute, () => {
                // refresh active state
                refreshRoutesView();
                api.notifyComponentUpdate();
                api.sendInspectorTree(routerInspectorId);
                api.sendInspectorState(routerInspectorId);
            });
            const navigationsLayerId = 'router:navigations:' + id;
            api.addTimelineLayer({
                id: navigationsLayerId,
                label: `Router${id ? ' ' + id : ''} Navigations`,
                color: 0x40a8c4,
            });
            // const errorsLayerId = 'router:errors'
            // api.addTimelineLayer({
            //   id: errorsLayerId,
            //   label: 'Router Errors',
            //   color: 0xea5455,
            // })
            router.onError((error, to) => {
                api.addTimelineEvent({
                    layerId: navigationsLayerId,
                    event: {
                        title: 'Error during Navigation',
                        subtitle: to.fullPath,
                        logType: 'error',
                        time: Date.now(),
                        data: { error },
                        groupId: to.meta.__navigationId,
                    },
                });
            });
            // attached to `meta` and used to group events
            let navigationId = 0;
            router.beforeEach((to, from) => {
                const data = {
                    guard: formatDisplay('beforeEach'),
                    from: formatRouteLocation(from, 'Current Location during this navigation'),
                    to: formatRouteLocation(to, 'Target location'),
                };
                // Used to group navigations together, hide from devtools
                Object.defineProperty(to.meta, '__navigationId', {
                    value: navigationId++,
                });
                api.addTimelineEvent({
                    layerId: navigationsLayerId,
                    event: {
                        time: Date.now(),
                        title: 'Start of navigation',
                        subtitle: to.fullPath,
                        data,
                        groupId: to.meta.__navigationId,
                    },
                });
            });
            router.afterEach((to, from, failure) => {
                const data = {
                    guard: formatDisplay('afterEach'),
                };
                if (failure) {
                    data.failure = {
                        _custom: {
                            type: Error,
                            readOnly: true,
                            display: failure ? failure.message : '',
                            tooltip: 'Navigation Failure',
                            value: failure,
                        },
                    };
                    data.status = formatDisplay('❌');
                }
                else {
                    data.status = formatDisplay('✅');
                }
                // we set here to have the right order
                data.from = formatRouteLocation(from, 'Current Location during this navigation');
                data.to = formatRouteLocation(to, 'Target location');
                api.addTimelineEvent({
                    layerId: navigationsLayerId,
                    event: {
                        title: 'End of navigation',
                        subtitle: to.fullPath,
                        time: Date.now(),
                        data,
                        logType: failure ? 'warning' : 'default',
                        groupId: to.meta.__navigationId,
                    },
                });
            });
            /**
             * Inspector of Existing routes
             */
            const routerInspectorId = 'router-inspector:' + id;
            api.addInspector({
                id: routerInspectorId,
                label: 'Routes' + (id ? ' ' + id : ''),
                icon: 'book',
                treeFilterPlaceholder: 'Search routes',
            });
            function refreshRoutesView() {
                // the routes view isn't active
                if (!activeRoutesPayload)
                    return;
                const payload = activeRoutesPayload;
                // children routes will appear as nested
                let routes = matcher.getRoutes().filter(route => !route.parent);
                // reset match state to false
                routes.forEach(resetMatchStateOnRouteRecord);
                // apply a match state if there is a payload
                if (payload.filter) {
                    routes = routes.filter(route => 
                    // save matches state based on the payload
                    isRouteMatching(route, payload.filter.toLowerCase()));
                }
                // mark active routes
                routes.forEach(route => markRouteRecordActive(route, router.currentRoute.value));
                payload.rootNodes = routes.map(formatRouteRecordForInspector);
            }
            let activeRoutesPayload;
            api.on.getInspectorTree(payload => {
                activeRoutesPayload = payload;
                if (payload.app === app && payload.inspectorId === routerInspectorId) {
                    refreshRoutesView();
                }
            });
            /**
             * Display information about the currently selected route record
             */
            api.on.getInspectorState(payload => {
                if (payload.app === app && payload.inspectorId === routerInspectorId) {
                    const routes = matcher.getRoutes();
                    const route = routes.find(route => route.record.__vd_id === payload.nodeId);
                    if (route) {
                        payload.state = {
                            options: formatRouteRecordMatcherForStateInspector(route),
                        };
                    }
                }
            });
            api.sendInspectorTree(routerInspectorId);
            api.sendInspectorState(routerInspectorId);
        });
    }
    function modifierForKey(key) {
        if (key.optional) {
            return key.repeatable ? '*' : '?';
        }
        else {
            return key.repeatable ? '+' : '';
        }
    }
    function formatRouteRecordMatcherForStateInspector(route) {
        const { record } = route;
        const fields = [
            { editable: false, key: 'path', value: record.path },
        ];
        if (record.name != null) {
            fields.push({
                editable: false,
                key: 'name',
                value: record.name,
            });
        }
        fields.push({ editable: false, key: 'regexp', value: route.re });
        if (route.keys.length) {
            fields.push({
                editable: false,
                key: 'keys',
                value: {
                    _custom: {
                        type: null,
                        readOnly: true,
                        display: route.keys
                            .map(key => `${key.name}${modifierForKey(key)}`)
                            .join(' '),
                        tooltip: 'Param keys',
                        value: route.keys,
                    },
                },
            });
        }
        if (record.redirect != null) {
            fields.push({
                editable: false,
                key: 'redirect',
                value: record.redirect,
            });
        }
        if (route.alias.length) {
            fields.push({
                editable: false,
                key: 'aliases',
                value: route.alias.map(alias => alias.record.path),
            });
        }
        fields.push({
            key: 'score',
            editable: false,
            value: {
                _custom: {
                    type: null,
                    readOnly: true,
                    display: route.score.map(score => score.join(', ')).join(' | '),
                    tooltip: 'Score used to sort routes',
                    value: route.score,
                },
            },
        });
        return fields;
    }
    /**
     * Extracted from tailwind palette
     */
    const PINK_500 = 0xec4899;
    const BLUE_600 = 0x2563eb;
    const LIME_500 = 0x84cc16;
    const CYAN_400 = 0x22d3ee;
    const ORANGE_400 = 0xfb923c;
    // const GRAY_100 = 0xf4f4f5
    const DARK = 0x666666;
    function formatRouteRecordForInspector(route) {
        const tags = [];
        const { record } = route;
        if (record.name != null) {
            tags.push({
                label: String(record.name),
                textColor: 0,
                backgroundColor: CYAN_400,
            });
        }
        if (record.aliasOf) {
            tags.push({
                label: 'alias',
                textColor: 0,
                backgroundColor: ORANGE_400,
            });
        }
        if (route.__vd_match) {
            tags.push({
                label: 'matches',
                textColor: 0,
                backgroundColor: PINK_500,
            });
        }
        if (route.__vd_exactActive) {
            tags.push({
                label: 'exact',
                textColor: 0,
                backgroundColor: LIME_500,
            });
        }
        if (route.__vd_active) {
            tags.push({
                label: 'active',
                textColor: 0,
                backgroundColor: BLUE_600,
            });
        }
        if (record.redirect) {
            tags.push({
                label: 'redirect: ' +
                    (typeof record.redirect === 'string' ? record.redirect : 'Object'),
                textColor: 0xffffff,
                backgroundColor: DARK,
            });
        }
        // add an id to be able to select it. Using the `path` is not possible because
        // empty path children would collide with their parents
        let id = record.__vd_id;
        if (id == null) {
            id = String(routeRecordId++);
            record.__vd_id = id;
        }
        return {
            id,
            label: record.path,
            tags,
            children: route.children.map(formatRouteRecordForInspector),
        };
    }
    //  incremental id for route records and inspector state
    let routeRecordId = 0;
    const EXTRACT_REGEXP_RE = /^\/(.*)\/([a-z]*)$/;
    function markRouteRecordActive(route, currentRoute) {
        // no route will be active if matched is empty
        // reset the matching state
        const isExactActive = currentRoute.matched.length &&
            isSameRouteRecord(currentRoute.matched[currentRoute.matched.length - 1], route.record);
        route.__vd_exactActive = route.__vd_active = isExactActive;
        if (!isExactActive) {
            route.__vd_active = currentRoute.matched.some(match => isSameRouteRecord(match, route.record));
        }
        route.children.forEach(childRoute => markRouteRecordActive(childRoute, currentRoute));
    }
    function resetMatchStateOnRouteRecord(route) {
        route.__vd_match = false;
        route.children.forEach(resetMatchStateOnRouteRecord);
    }
    function isRouteMatching(route, filter) {
        const found = String(route.re).match(EXTRACT_REGEXP_RE);
        route.__vd_match = false;
        if (!found || found.length < 3) {
            return false;
        }
        // use a regexp without $ at the end to match nested routes better
        const nonEndingRE = new RegExp(found[1].replace(/\$$/, ''), found[2]);
        if (nonEndingRE.test(filter)) {
            // mark children as matches
            route.children.forEach(child => isRouteMatching(child, filter));
            // exception case: `/`
            if (route.record.path !== '/' || filter === '/') {
                route.__vd_match = route.re.test(filter);
                return true;
            }
            // hide the / route
            return false;
        }
        const path = route.record.path.toLowerCase();
        const decodedPath = decode(path);
        // also allow partial matching on the path
        if (!filter.startsWith('/') &&
            (decodedPath.includes(filter) || path.includes(filter)))
            return true;
        if (decodedPath.startsWith(filter) || path.startsWith(filter))
            return true;
        if (route.record.name && String(route.record.name).includes(filter))
            return true;
        return route.children.some(child => isRouteMatching(child, filter));
    }
    function omit$1(obj, keys) {
        const ret = {};
        for (const key in obj) {
            if (!keys.includes(key)) {
                // @ts-expect-error
                ret[key] = obj[key];
            }
        }
        return ret;
    }

    /**
     * Creates a Router instance that can be used by a Vue app.
     *
     * @param options - {@link RouterOptions}
     */
    function createRouter(options) {
        const matcher = createRouterMatcher(options.routes, options);
        const parseQuery$1 = options.parseQuery || parseQuery;
        const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
        const routerHistory = options.history;
        if (("production" !== 'production') && !routerHistory)
            throw new Error('Provide the "history" option when calling "createRouter()":' +
                ' https://next.router.vuejs.org/api/#history.');
        const beforeGuards = useCallbacks();
        const beforeResolveGuards = useCallbacks();
        const afterGuards = useCallbacks();
        const currentRoute = vue.shallowRef(START_LOCATION_NORMALIZED);
        let pendingLocation = START_LOCATION_NORMALIZED;
        // leave the scrollRestoration if no scrollBehavior is provided
        if (isBrowser && options.scrollBehavior && 'scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        const normalizeParams = applyToParams.bind(null, paramValue => '' + paramValue);
        const encodeParams = applyToParams.bind(null, encodeParam);
        const decodeParams = 
        // @ts-expect-error: intentionally avoid the type check
        applyToParams.bind(null, decode);
        function addRoute(parentOrRoute, route) {
            let parent;
            let record;
            if (isRouteName(parentOrRoute)) {
                parent = matcher.getRecordMatcher(parentOrRoute);
                record = route;
            }
            else {
                record = parentOrRoute;
            }
            return matcher.addRoute(record, parent);
        }
        function removeRoute(name) {
            const recordMatcher = matcher.getRecordMatcher(name);
            if (recordMatcher) {
                matcher.removeRoute(recordMatcher);
            }
            else if (("production" !== 'production')) {
                warn(`Cannot remove non-existent route "${String(name)}"`);
            }
        }
        function getRoutes() {
            return matcher.getRoutes().map(routeMatcher => routeMatcher.record);
        }
        function hasRoute(name) {
            return !!matcher.getRecordMatcher(name);
        }
        function resolve(rawLocation, currentLocation) {
            // const objectLocation = routerLocationAsObject(rawLocation)
            // we create a copy to modify it later
            currentLocation = assign({}, currentLocation || currentRoute.value);
            if (typeof rawLocation === 'string') {
                const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
                const matchedRoute = matcher.resolve({ path: locationNormalized.path }, currentLocation);
                const href = routerHistory.createHref(locationNormalized.fullPath);
                if (("production" !== 'production')) {
                    if (href.startsWith('//'))
                        warn(`Location "${rawLocation}" resolved to "${href}". A resolved location cannot start with multiple slashes.`);
                    else if (!matchedRoute.matched.length) {
                        warn(`No match found for location with path "${rawLocation}"`);
                    }
                }
                // locationNormalized is always a new object
                return assign(locationNormalized, matchedRoute, {
                    params: decodeParams(matchedRoute.params),
                    hash: decode(locationNormalized.hash),
                    redirectedFrom: undefined,
                    href,
                });
            }
            let matcherLocation;
            // path could be relative in object as well
            if ('path' in rawLocation) {
                if (("production" !== 'production') &&
                    'params' in rawLocation &&
                    !('name' in rawLocation) &&
                    // @ts-expect-error: the type is never
                    Object.keys(rawLocation.params).length) {
                    warn(`Path "${
                // @ts-expect-error: the type is never
                rawLocation.path}" was passed with params but they will be ignored. Use a named route alongside params instead.`);
                }
                matcherLocation = assign({}, rawLocation, {
                    path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path,
                });
            }
            else {
                // remove any nullish param
                const targetParams = assign({}, rawLocation.params);
                for (const key in targetParams) {
                    if (targetParams[key] == null) {
                        delete targetParams[key];
                    }
                }
                // pass encoded values to the matcher so it can produce encoded path and fullPath
                matcherLocation = assign({}, rawLocation, {
                    params: encodeParams(rawLocation.params),
                });
                // current location params are decoded, we need to encode them in case the
                // matcher merges the params
                currentLocation.params = encodeParams(currentLocation.params);
            }
            const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
            const hash = rawLocation.hash || '';
            if (("production" !== 'production') && hash && !hash.startsWith('#')) {
                warn(`A \`hash\` should always start with the character "#". Replace "${hash}" with "#${hash}".`);
            }
            // decoding them) the matcher might have merged current location params so
            // we need to run the decoding again
            matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
            const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
                hash: encodeHash(hash),
                path: matchedRoute.path,
            }));
            const href = routerHistory.createHref(fullPath);
            if (("production" !== 'production')) {
                if (href.startsWith('//')) {
                    warn(`Location "${rawLocation}" resolved to "${href}". A resolved location cannot start with multiple slashes.`);
                }
                else if (!matchedRoute.matched.length) {
                    warn(`No match found for location with path "${'path' in rawLocation ? rawLocation.path : rawLocation}"`);
                }
            }
            return assign({
                fullPath,
                // keep the hash encoded so fullPath is effectively path + encodedQuery +
                // hash
                hash,
                query: 
                // if the user is using a custom query lib like qs, we might have
                // nested objects, so we keep the query as is, meaning it can contain
                // numbers at `$route.query`, but at the point, the user will have to
                // use their own type anyway.
                // https://github.com/vuejs/router/issues/328#issuecomment-649481567
                stringifyQuery$1 === stringifyQuery
                    ? normalizeQuery(rawLocation.query)
                    : (rawLocation.query || {}),
            }, matchedRoute, {
                redirectedFrom: undefined,
                href,
            });
        }
        function locationAsObject(to) {
            return typeof to === 'string'
                ? parseURL(parseQuery$1, to, currentRoute.value.path)
                : assign({}, to);
        }
        function checkCanceledNavigation(to, from) {
            if (pendingLocation !== to) {
                return createRouterError(8 /* NAVIGATION_CANCELLED */, {
                    from,
                    to,
                });
            }
        }
        function push(to) {
            return pushWithRedirect(to);
        }
        function replace(to) {
            return push(assign(locationAsObject(to), { replace: true }));
        }
        function handleRedirectRecord(to) {
            const lastMatched = to.matched[to.matched.length - 1];
            if (lastMatched && lastMatched.redirect) {
                const { redirect } = lastMatched;
                let newTargetLocation = typeof redirect === 'function' ? redirect(to) : redirect;
                if (typeof newTargetLocation === 'string') {
                    newTargetLocation =
                        newTargetLocation.includes('?') || newTargetLocation.includes('#')
                            ? (newTargetLocation = locationAsObject(newTargetLocation))
                            : // force empty params
                                { path: newTargetLocation };
                    // @ts-expect-error: force empty params when a string is passed to let
                    // the router parse them again
                    newTargetLocation.params = {};
                }
                if (("production" !== 'production') &&
                    !('path' in newTargetLocation) &&
                    !('name' in newTargetLocation)) {
                    warn(`Invalid redirect found:\n${JSON.stringify(newTargetLocation, null, 2)}\n when navigating to "${to.fullPath}". A redirect must contain a name or path. This will break in production.`);
                    throw new Error('Invalid redirect');
                }
                return assign({
                    query: to.query,
                    hash: to.hash,
                    params: to.params,
                }, newTargetLocation);
            }
        }
        function pushWithRedirect(to, redirectedFrom) {
            const targetLocation = (pendingLocation = resolve(to));
            const from = currentRoute.value;
            const data = to.state;
            const force = to.force;
            // to could be a string where `replace` is a function
            const replace = to.replace === true;
            const shouldRedirect = handleRedirectRecord(targetLocation);
            if (shouldRedirect)
                return pushWithRedirect(assign(locationAsObject(shouldRedirect), {
                    state: data,
                    force,
                    replace,
                }), 
                // keep original redirectedFrom if it exists
                redirectedFrom || targetLocation);
            // if it was a redirect we already called `pushWithRedirect` above
            const toLocation = targetLocation;
            toLocation.redirectedFrom = redirectedFrom;
            let failure;
            if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
                failure = createRouterError(16 /* NAVIGATION_DUPLICATED */, { to: toLocation, from });
                // trigger scroll to allow scrolling to the same anchor
                handleScroll(from, from, 
                // this is a push, the only way for it to be triggered from a
                // history.listen is with a redirect, which makes it become a push
                true, 
                // This cannot be the first navigation because the initial location
                // cannot be manually navigated to
                false);
            }
            return (failure ? Promise.resolve(failure) : navigate(toLocation, from))
                .catch((error) => isNavigationFailure(error)
                ? // navigation redirects still mark the router as ready
                    isNavigationFailure(error, 2 /* NAVIGATION_GUARD_REDIRECT */)
                        ? error
                        : markAsReady(error) // also returns the error
                : // reject any unknown error
                    triggerError(error, toLocation, from))
                .then((failure) => {
                if (failure) {
                    if (isNavigationFailure(failure, 2 /* NAVIGATION_GUARD_REDIRECT */)) {
                        if (("production" !== 'production') &&
                            // we are redirecting to the same location we were already at
                            isSameRouteLocation(stringifyQuery$1, resolve(failure.to), toLocation) &&
                            // and we have done it a couple of times
                            redirectedFrom &&
                            // @ts-expect-error: added only in dev
                            (redirectedFrom._count = redirectedFrom._count
                                ? // @ts-expect-error
                                    redirectedFrom._count + 1
                                : 1) > 10) {
                            warn(`Detected an infinite redirection in a navigation guard when going from "${from.fullPath}" to "${toLocation.fullPath}". Aborting to avoid a Stack Overflow. This will break in production if not fixed.`);
                            return Promise.reject(new Error('Infinite redirect in navigation guard'));
                        }
                        return pushWithRedirect(
                        // keep options
                        assign(locationAsObject(failure.to), {
                            state: data,
                            force,
                            replace,
                        }), 
                        // preserve the original redirectedFrom if any
                        redirectedFrom || toLocation);
                    }
                }
                else {
                    // if we fail we don't finalize the navigation
                    failure = finalizeNavigation(toLocation, from, true, replace, data);
                }
                triggerAfterEach(toLocation, from, failure);
                return failure;
            });
        }
        /**
         * Helper to reject and skip all navigation guards if a new navigation happened
         * @param to
         * @param from
         */
        function checkCanceledNavigationAndReject(to, from) {
            const error = checkCanceledNavigation(to, from);
            return error ? Promise.reject(error) : Promise.resolve();
        }
        // TODO: refactor the whole before guards by internally using router.beforeEach
        function navigate(to, from) {
            let guards;
            const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
            // all components here have been resolved once because we are leaving
            guards = extractComponentsGuards(leavingRecords.reverse(), 'beforeRouteLeave', to, from);
            // leavingRecords is already reversed
            for (const record of leavingRecords) {
                record.leaveGuards.forEach(guard => {
                    guards.push(guardToPromiseFn(guard, to, from));
                });
            }
            const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
            guards.push(canceledNavigationCheck);
            // run the queue of per route beforeRouteLeave guards
            return (runGuardQueue(guards)
                .then(() => {
                // check global guards beforeEach
                guards = [];
                for (const guard of beforeGuards.list()) {
                    guards.push(guardToPromiseFn(guard, to, from));
                }
                guards.push(canceledNavigationCheck);
                return runGuardQueue(guards);
            })
                .then(() => {
                // check in components beforeRouteUpdate
                guards = extractComponentsGuards(updatingRecords, 'beforeRouteUpdate', to, from);
                for (const record of updatingRecords) {
                    record.updateGuards.forEach(guard => {
                        guards.push(guardToPromiseFn(guard, to, from));
                    });
                }
                guards.push(canceledNavigationCheck);
                // run the queue of per route beforeEnter guards
                return runGuardQueue(guards);
            })
                .then(() => {
                // check the route beforeEnter
                guards = [];
                for (const record of to.matched) {
                    // do not trigger beforeEnter on reused views
                    if (record.beforeEnter && !from.matched.includes(record)) {
                        if (Array.isArray(record.beforeEnter)) {
                            for (const beforeEnter of record.beforeEnter)
                                guards.push(guardToPromiseFn(beforeEnter, to, from));
                        }
                        else {
                            guards.push(guardToPromiseFn(record.beforeEnter, to, from));
                        }
                    }
                }
                guards.push(canceledNavigationCheck);
                // run the queue of per route beforeEnter guards
                return runGuardQueue(guards);
            })
                .then(() => {
                // NOTE: at this point to.matched is normalized and does not contain any () => Promise<Component>
                // clear existing enterCallbacks, these are added by extractComponentsGuards
                to.matched.forEach(record => (record.enterCallbacks = {}));
                // check in-component beforeRouteEnter
                guards = extractComponentsGuards(enteringRecords, 'beforeRouteEnter', to, from);
                guards.push(canceledNavigationCheck);
                // run the queue of per route beforeEnter guards
                return runGuardQueue(guards);
            })
                .then(() => {
                // check global guards beforeResolve
                guards = [];
                for (const guard of beforeResolveGuards.list()) {
                    guards.push(guardToPromiseFn(guard, to, from));
                }
                guards.push(canceledNavigationCheck);
                return runGuardQueue(guards);
            })
                // catch any navigation canceled
                .catch(err => isNavigationFailure(err, 8 /* NAVIGATION_CANCELLED */)
                ? err
                : Promise.reject(err)));
        }
        function triggerAfterEach(to, from, failure) {
            // navigation is confirmed, call afterGuards
            // TODO: wrap with error handlers
            for (const guard of afterGuards.list())
                guard(to, from, failure);
        }
        /**
         * - Cleans up any navigation guards
         * - Changes the url if necessary
         * - Calls the scrollBehavior
         */
        function finalizeNavigation(toLocation, from, isPush, replace, data) {
            // a more recent navigation took place
            const error = checkCanceledNavigation(toLocation, from);
            if (error)
                return error;
            // only consider as push if it's not the first navigation
            const isFirstNavigation = from === START_LOCATION_NORMALIZED;
            const state = !isBrowser ? {} : history.state;
            // change URL only if the user did a push/replace and if it's not the initial navigation because
            // it's just reflecting the url
            if (isPush) {
                // on the initial navigation, we want to reuse the scroll position from
                // history state if it exists
                if (replace || isFirstNavigation)
                    routerHistory.replace(toLocation.fullPath, assign({
                        scroll: isFirstNavigation && state && state.scroll,
                    }, data));
                else
                    routerHistory.push(toLocation.fullPath, data);
            }
            // accept current navigation
            currentRoute.value = toLocation;
            handleScroll(toLocation, from, isPush, isFirstNavigation);
            markAsReady();
        }
        let removeHistoryListener;
        // attach listener to history to trigger navigations
        function setupListeners() {
            removeHistoryListener = routerHistory.listen((to, _from, info) => {
                // cannot be a redirect route because it was in history
                const toLocation = resolve(to);
                // due to dynamic routing, and to hash history with manual navigation
                // (manually changing the url or calling history.hash = '#/somewhere'),
                // there could be a redirect record in history
                const shouldRedirect = handleRedirectRecord(toLocation);
                if (shouldRedirect) {
                    pushWithRedirect(assign(shouldRedirect, { replace: true }), toLocation).catch(noop$3);
                    return;
                }
                pendingLocation = toLocation;
                const from = currentRoute.value;
                // TODO: should be moved to web history?
                if (isBrowser) {
                    saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
                }
                navigate(toLocation, from)
                    .catch((error) => {
                    if (isNavigationFailure(error, 4 /* NAVIGATION_ABORTED */ | 8 /* NAVIGATION_CANCELLED */)) {
                        return error;
                    }
                    if (isNavigationFailure(error, 2 /* NAVIGATION_GUARD_REDIRECT */)) {
                        // Here we could call if (info.delta) routerHistory.go(-info.delta,
                        // false) but this is bug prone as we have no way to wait the
                        // navigation to be finished before calling pushWithRedirect. Using
                        // a setTimeout of 16ms seems to work but there is not guarantee for
                        // it to work on every browser. So Instead we do not restore the
                        // history entry and trigger a new navigation as requested by the
                        // navigation guard.
                        // the error is already handled by router.push we just want to avoid
                        // logging the error
                        pushWithRedirect(error.to, toLocation
                        // avoid an uncaught rejection, let push call triggerError
                        )
                            .then(failure => {
                            // manual change in hash history #916 ending up in the URL not
                            // changing but it was changed by the manual url change, so we
                            // need to manually change it ourselves
                            if (isNavigationFailure(failure, 4 /* NAVIGATION_ABORTED */ |
                                16 /* NAVIGATION_DUPLICATED */) &&
                                !info.delta &&
                                info.type === NavigationType.pop) {
                                routerHistory.go(-1, false);
                            }
                        })
                            .catch(noop$3);
                        // avoid the then branch
                        return Promise.reject();
                    }
                    // do not restore history on unknown direction
                    if (info.delta)
                        routerHistory.go(-info.delta, false);
                    // unrecognized error, transfer to the global handler
                    return triggerError(error, toLocation, from);
                })
                    .then((failure) => {
                    failure =
                        failure ||
                            finalizeNavigation(
                            // after navigation, all matched components are resolved
                            toLocation, from, false);
                    // revert the navigation
                    if (failure) {
                        if (info.delta) {
                            routerHistory.go(-info.delta, false);
                        }
                        else if (info.type === NavigationType.pop &&
                            isNavigationFailure(failure, 4 /* NAVIGATION_ABORTED */ | 16 /* NAVIGATION_DUPLICATED */)) {
                            // manual change in hash history #916
                            // it's like a push but lacks the information of the direction
                            routerHistory.go(-1, false);
                        }
                    }
                    triggerAfterEach(toLocation, from, failure);
                })
                    .catch(noop$3);
            });
        }
        // Initialization and Errors
        let readyHandlers = useCallbacks();
        let errorHandlers = useCallbacks();
        let ready;
        /**
         * Trigger errorHandlers added via onError and throws the error as well
         *
         * @param error - error to throw
         * @param to - location we were navigating to when the error happened
         * @param from - location we were navigating from when the error happened
         * @returns the error as a rejected promise
         */
        function triggerError(error, to, from) {
            markAsReady(error);
            const list = errorHandlers.list();
            if (list.length) {
                list.forEach(handler => handler(error, to, from));
            }
            else {
                if (("production" !== 'production')) {
                    warn('uncaught error during route navigation:');
                }
                console.error(error);
            }
            return Promise.reject(error);
        }
        function isReady() {
            if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
                return Promise.resolve();
            return new Promise((resolve, reject) => {
                readyHandlers.add([resolve, reject]);
            });
        }
        function markAsReady(err) {
            if (!ready) {
                // still not ready if an error happened
                ready = !err;
                setupListeners();
                readyHandlers
                    .list()
                    .forEach(([resolve, reject]) => (err ? reject(err) : resolve()));
                readyHandlers.reset();
            }
            return err;
        }
        // Scroll behavior
        function handleScroll(to, from, isPush, isFirstNavigation) {
            const { scrollBehavior } = options;
            if (!isBrowser || !scrollBehavior)
                return Promise.resolve();
            const scrollPosition = (!isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0))) ||
                ((isFirstNavigation || !isPush) &&
                    history.state &&
                    history.state.scroll) ||
                null;
            return vue.nextTick()
                .then(() => scrollBehavior(to, from, scrollPosition))
                .then(position => position && scrollToPosition(position))
                .catch(err => triggerError(err, to, from));
        }
        const go = (delta) => routerHistory.go(delta);
        let started;
        const installedApps = new Set();
        const router = {
            currentRoute,
            addRoute,
            removeRoute,
            hasRoute,
            getRoutes,
            resolve,
            options,
            push,
            replace,
            go,
            back: () => go(-1),
            forward: () => go(1),
            beforeEach: beforeGuards.add,
            beforeResolve: beforeResolveGuards.add,
            afterEach: afterGuards.add,
            onError: errorHandlers.add,
            isReady,
            install(app) {
                const router = this;
                app.component('RouterLink', RouterLink);
                app.component('RouterView', RouterView);
                app.config.globalProperties.$router = router;
                Object.defineProperty(app.config.globalProperties, '$route', {
                    enumerable: true,
                    get: () => vue.unref(currentRoute),
                });
                // this initial navigation is only necessary on client, on server it doesn't
                // make sense because it will create an extra unnecessary navigation and could
                // lead to problems
                if (isBrowser &&
                    // used for the initial navigation client side to avoid pushing
                    // multiple times when the router is used in multiple apps
                    !started &&
                    currentRoute.value === START_LOCATION_NORMALIZED) {
                    // see above
                    started = true;
                    push(routerHistory.location).catch(err => {
                        if (("production" !== 'production'))
                            warn('Unexpected error when starting the router:', err);
                    });
                }
                const reactiveRoute = {};
                for (const key in START_LOCATION_NORMALIZED) {
                    // @ts-expect-error: the key matches
                    reactiveRoute[key] = vue.computed(() => currentRoute.value[key]);
                }
                app.provide(routerKey, router);
                app.provide(routeLocationKey, vue.reactive(reactiveRoute));
                app.provide(routerViewLocationKey, currentRoute);
                const unmountApp = app.unmount;
                installedApps.add(app);
                app.unmount = function () {
                    installedApps.delete(app);
                    // the router is not attached to an app anymore
                    if (installedApps.size < 1) {
                        // invalidate the current navigation
                        pendingLocation = START_LOCATION_NORMALIZED;
                        removeHistoryListener && removeHistoryListener();
                        currentRoute.value = START_LOCATION_NORMALIZED;
                        started = false;
                        ready = false;
                    }
                    unmountApp();
                };
                if ((("production" !== 'production') || false) && isBrowser) {
                    addDevtools(app, router, matcher);
                }
            },
        };
        return router;
    }
    function runGuardQueue(guards) {
        return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
    }
    function extractChangingRecords(to, from) {
        const leavingRecords = [];
        const updatingRecords = [];
        const enteringRecords = [];
        const len = Math.max(from.matched.length, to.matched.length);
        for (let i = 0; i < len; i++) {
            const recordFrom = from.matched[i];
            if (recordFrom) {
                if (to.matched.find(record => isSameRouteRecord(record, recordFrom)))
                    updatingRecords.push(recordFrom);
                else
                    leavingRecords.push(recordFrom);
            }
            const recordTo = to.matched[i];
            if (recordTo) {
                // the type doesn't matter because we are comparing per reference
                if (!from.matched.find(record => isSameRouteRecord(record, recordTo))) {
                    enteringRecords.push(recordTo);
                }
            }
        }
        return [leavingRecords, updatingRecords, enteringRecords];
    }

    /**
     * Returns the router instance. Equivalent to using `$router` inside
     * templates.
     */
    function useRouter() {
        return vue.inject(routerKey);
    }
    /**
     * Returns the current route location. Equivalent to using `$route` inside
     * templates.
     */
    function useRoute() {
        return vue.inject(routeLocationKey);
    }

    var vueRouter_esmBundler = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get NavigationFailureType () { return NavigationFailureType; },
        RouterLink: RouterLink,
        RouterView: RouterView,
        START_LOCATION: START_LOCATION_NORMALIZED,
        createMemoryHistory: createMemoryHistory,
        createRouter: createRouter,
        createRouterMatcher: createRouterMatcher,
        createWebHashHistory: createWebHashHistory,
        createWebHistory: createWebHistory,
        isNavigationFailure: isNavigationFailure,
        matchedRouteKey: matchedRouteKey,
        onBeforeRouteLeave: onBeforeRouteLeave,
        onBeforeRouteUpdate: onBeforeRouteUpdate,
        parseQuery: parseQuery,
        routeLocationKey: routeLocationKey,
        routerKey: routerKey,
        routerViewLocationKey: routerViewLocationKey,
        stringifyQuery: stringifyQuery,
        useLink: useLink,
        useRoute: useRoute,
        useRouter: useRouter,
        viewDepthKey: viewDepthKey
    });

    const TOKEN_DATA_STORAGE_KEY = "token";
    const TOKEN_REFRESH_DURATION = 120;
    const ROOT_ROUTE_NAME = "root";
    const ROOT_MENU_PREFIX = "root:";
    const DEFAULT_MOUNT_EL = "#app";
    const DEFAULT_MENU_NAME = "default";
    const DEFAULT_PAGE_NAME = "welcome";
    const DEFAULT_PAGE_PATH = `/${DEFAULT_PAGE_NAME}`;
    const RUNTIME_GLOBAL_EVENTS = Object.freeze({
      CLOSE_APP_NAV: "CLOSE_APP_NAV"
    });

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function getDefaultExportFromNamespaceIfPresent (n) {
    	return n && Object.prototype.hasOwnProperty.call(n, 'default') ? n['default'] : n;
    }

    function getDefaultExportFromNamespaceIfNotNamed (n) {
    	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
    }

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    function commonjsRequire (path) {
    	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
    }

    var utils = {};

    (function (exports) {
    // Load modules


    // Declare internals

    var internals = {};


    exports.arrayToObject = function (source) {

        var obj = {};
        for (var i = 0, il = source.length; i < il; ++i) {
            if (typeof source[i] !== 'undefined') {

                obj[i] = source[i];
            }
        }

        return obj;
    };


    exports.merge = function (target, source) {

        if (!source) {
            return target;
        }

        if (typeof source !== 'object') {
            if (Array.isArray(target)) {
                target.push(source);
            }
            else {
                target[source] = true;
            }

            return target;
        }

        if (typeof target !== 'object') {
            target = [target].concat(source);
            return target;
        }

        if (Array.isArray(target) &&
            !Array.isArray(source)) {

            target = exports.arrayToObject(target);
        }

        var keys = Object.keys(source);
        for (var k = 0, kl = keys.length; k < kl; ++k) {
            var key = keys[k];
            var value = source[key];

            if (!target[key]) {
                target[key] = value;
            }
            else {
                target[key] = exports.merge(target[key], value);
            }
        }

        return target;
    };


    exports.decode = function (str) {

        try {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        } catch (e) {
            return str;
        }
    };


    exports.compact = function (obj, refs) {

        if (typeof obj !== 'object' ||
            obj === null) {

            return obj;
        }

        refs = refs || [];
        var lookup = refs.indexOf(obj);
        if (lookup !== -1) {
            return refs[lookup];
        }

        refs.push(obj);

        if (Array.isArray(obj)) {
            var compacted = [];

            for (var i = 0, il = obj.length; i < il; ++i) {
                if (typeof obj[i] !== 'undefined') {
                    compacted.push(obj[i]);
                }
            }

            return compacted;
        }

        var keys = Object.keys(obj);
        for (i = 0, il = keys.length; i < il; ++i) {
            var key = keys[i];
            obj[key] = exports.compact(obj[key], refs);
        }

        return obj;
    };


    exports.isRegExp = function (obj) {
        return Object.prototype.toString.call(obj) === '[object RegExp]';
    };


    exports.isBuffer = function (obj) {

        if (obj === null ||
            typeof obj === 'undefined') {

            return false;
        }

        return !!(obj.constructor &&
            obj.constructor.isBuffer &&
            obj.constructor.isBuffer(obj));
    };
    }(utils));

    // Load modules

    var Utils$1 = utils;


    // Declare internals

    var internals$2 = {
        delimiter: '&',
        arrayPrefixGenerators: {
            brackets: function (prefix, key) {
                return prefix + '[]';
            },
            indices: function (prefix, key) {
                return prefix + '[' + key + ']';
            },
            repeat: function (prefix, key) {
                return prefix;
            }
        }
    };


    internals$2.stringify = function (obj, prefix, generateArrayPrefix) {

        if (Utils$1.isBuffer(obj)) {
            obj = obj.toString();
        }
        else if (obj instanceof Date) {
            obj = obj.toISOString();
        }
        else if (obj === null) {
            obj = '';
        }

        if (typeof obj === 'string' ||
            typeof obj === 'number' ||
            typeof obj === 'boolean') {

            return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
        }

        var values = [];

        if (typeof obj === 'undefined') {
            return values;
        }

        var objKeys = Object.keys(obj);
        for (var i = 0, il = objKeys.length; i < il; ++i) {
            var key = objKeys[i];
            if (Array.isArray(obj)) {
                values = values.concat(internals$2.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix));
            }
            else {
                values = values.concat(internals$2.stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix));
            }
        }

        return values;
    };


    var stringify = function (obj, options) {

        options = options || {};
        var delimiter = typeof options.delimiter === 'undefined' ? internals$2.delimiter : options.delimiter;

        var keys = [];

        if (typeof obj !== 'object' ||
            obj === null) {

            return '';
        }

        var arrayFormat;
        if (options.arrayFormat in internals$2.arrayPrefixGenerators) {
            arrayFormat = options.arrayFormat;
        }
        else if ('indices' in options) {
            arrayFormat = options.indices ? 'indices' : 'repeat';
        }
        else {
            arrayFormat = 'indices';
        }

        var generateArrayPrefix = internals$2.arrayPrefixGenerators[arrayFormat];

        var objKeys = Object.keys(obj);
        for (var i = 0, il = objKeys.length; i < il; ++i) {
            var key = objKeys[i];
            keys = keys.concat(internals$2.stringify(obj[key], key, generateArrayPrefix));
        }

        return keys.join(delimiter);
    };

    // Load modules

    var Utils = utils;


    // Declare internals

    var internals$1 = {
        delimiter: '&',
        depth: 5,
        arrayLimit: 20,
        parameterLimit: 1000
    };


    internals$1.parseValues = function (str, options) {

        var obj = {};
        var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

        for (var i = 0, il = parts.length; i < il; ++i) {
            var part = parts[i];
            var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

            if (pos === -1) {
                obj[Utils.decode(part)] = '';
            }
            else {
                var key = Utils.decode(part.slice(0, pos));
                var val = Utils.decode(part.slice(pos + 1));

                if (!Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj[key] = val;
                }
                else {
                    obj[key] = [].concat(obj[key]).concat(val);
                }
            }
        }

        return obj;
    };


    internals$1.parseObject = function (chain, val, options) {

        if (!chain.length) {
            return val;
        }

        var root = chain.shift();

        var obj = {};
        if (root === '[]') {
            obj = [];
            obj = obj.concat(internals$1.parseObject(chain, val, options));
        }
        else {
            var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
            var index = parseInt(cleanRoot, 10);
            var indexString = '' + index;
            if (!isNaN(index) &&
                root !== cleanRoot &&
                indexString === cleanRoot &&
                index >= 0 &&
                index <= options.arrayLimit) {

                obj = [];
                obj[index] = internals$1.parseObject(chain, val, options);
            }
            else {
                obj[cleanRoot] = internals$1.parseObject(chain, val, options);
            }
        }

        return obj;
    };


    internals$1.parseKeys = function (key, val, options) {

        if (!key) {
            return;
        }

        // The regex chunks

        var parent = /^([^\[\]]*)/;
        var child = /(\[[^\[\]]*\])/g;

        // Get the parent

        var segment = parent.exec(key);

        // Don't allow them to overwrite object prototype properties

        if (Object.prototype.hasOwnProperty(segment[1])) {
            return;
        }

        // Stash the parent if it exists

        var keys = [];
        if (segment[1]) {
            keys.push(segment[1]);
        }

        // Loop through children appending to the array until we hit depth

        var i = 0;
        while ((segment = child.exec(key)) !== null && i < options.depth) {

            ++i;
            if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
                keys.push(segment[1]);
            }
        }

        // If there's a remainder, just add whatever is left

        if (segment) {
            keys.push('[' + key.slice(segment.index) + ']');
        }

        return internals$1.parseObject(keys, val, options);
    };


    var parse$1 = function (str, options) {

        if (str === '' ||
            str === null ||
            typeof str === 'undefined') {

            return {};
        }

        options = options || {};
        options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals$1.delimiter;
        options.depth = typeof options.depth === 'number' ? options.depth : internals$1.depth;
        options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals$1.arrayLimit;
        options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals$1.parameterLimit;

        var tempObj = typeof str === 'string' ? internals$1.parseValues(str, options) : str;
        var obj = {};

        // Iterate over the keys and setup the new object

        var keys = Object.keys(tempObj);
        for (var i = 0, il = keys.length; i < il; ++i) {
            var key = keys[i];
            var newObj = internals$1.parseKeys(key, tempObj[key], options);
            obj = Utils.merge(obj, newObj);
        }

        return Utils.compact(obj);
    };

    // Load modules

    var Stringify = stringify;
    var Parse = parse$1;


    // Declare internals

    var internals = {};


    var lib = {
        stringify: Stringify,
        parse: Parse
    };

    var qs$1 = lib;

    function memoize$1(func, resolver) {
      if (typeof func !== "function" || resolver != null && typeof resolver !== "function") {
        throw new TypeError("Expected a function");
      }
      const memoized = function(...args) {
        const key = resolver ? resolver.apply(this, args) : args[0];
        const cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        const result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize$1.Cache || Map)();
      return memoized;
    }
    memoize$1.Cache = Map;
    const charCodeOfDot = ".".charCodeAt(0);
    const MAX_MEMOIZE_SIZE$1 = 500;
    const MAX_SAFE_INTEGER$2 = 9007199254740991;
    const INFINITY$3 = 1 / 0;
    const regexs = Object.freeze({
      reIsUint: /^(?:0|[1-9]\d*)$/,
      reEscapeChar: /\\(\\)?/g,
      rePropName: RegExp(`[^.[\\]]+|\\[(?:([^"'][^[]*)|(["'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2)\\]|(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))`, "g"),
      reIsDeepProp: /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      reIsPlainProp: /^\w*$/
    });
    function getTag$1$1(value) {
      if (value == null) {
        return value === void 0 ? "[object Undefined]" : "[object Null]";
      }
      return toString.call(value);
    }
    function isSymbol$1(value) {
      const type = typeof value;
      return type == "symbol" || type === "object" && value != null && getTag$1$1(value) == "[object Symbol]";
    }
    function isIndex$1(value, length) {
      const type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER$2 : length;
      return !!length && (type === "number" || type !== "symbol" && regexs.reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
    }
    function isKey$1(value, object) {
      if (Array.isArray(value)) {
        return false;
      }
      const type = typeof value;
      if (type === "number" || type === "boolean" || value == null || isSymbol$1(value)) {
        return true;
      }
      const valueStr = value;
      return regexs.reIsPlainProp.test(valueStr) || !regexs.reIsDeepProp.test(valueStr) || object != null && valueStr in Object(object);
    }
    function toKey$1(value) {
      if (typeof value === "string" || isSymbol$1(value)) {
        return value;
      }
      const result = `${value}`;
      return result == "0" && 1 / value == -INFINITY$3 ? "-0" : result;
    }
    function memoizeCapped$1(func) {
      const result = memoize$1(func, (key) => {
        const { cache } = result;
        if (cache.size >= MAX_MEMOIZE_SIZE$1)
          cache.clear();
        return key;
      });
      return result;
    }
    const stringToPath$1 = memoizeCapped$1((string) => {
      const result = [];
      if (string.charCodeAt(0) === charCodeOfDot) {
        result.push("");
      }
      string.replace(regexs.rePropName, (match, expression, quote, subString) => {
        let key = match;
        if (quote) {
          key = subString.replace(regexs.reEscapeChar, "$1");
        } else if (expression) {
          key = expression.trim();
        }
        result.push(key);
        return "";
      });
      return result;
    });
    function castPath$1(value, object) {
      if (Array.isArray(value)) {
        return value;
      }
      return isKey$1(value, object) ? [value] : stringToPath$1(value);
    }
    const hasOwnProperty$g = Object.prototype.hasOwnProperty;
    function eq$1(value, other) {
      return value === other || value !== value && other !== other;
    }
    function baseAssignValue$1(object, key, value) {
      if (key == "__proto__") {
        Object.defineProperty(object, key, {
          configurable: true,
          enumerable: true,
          value,
          writable: true
        });
      } else {
        object[key] = value;
      }
    }
    function assignValue$1(object, key, value) {
      const objValue = object[key];
      if (!(hasOwnProperty$g.call(object, key) && eq$1(objValue, value))) {
        if (value !== 0 || 1 / value === 1 / objValue) {
          baseAssignValue$1(object, key, value);
        }
      }
    }
    function baseGet$1(object, path) {
      path = castPath$1(path, object);
      let index = 0;
      const length = path.length;
      while (object != null && index < length) {
        object = object[toKey$1(path[index++])];
      }
      return index && index == length ? object : void 0;
    }
    function isObjectOrFunction(value) {
      const type = typeof value;
      return value != null && (type === "object" || type === "function");
    }
    function baseSet(object, path, value, customizer) {
      if (!isObjectOrFunction(object)) {
        return object;
      }
      path = castPath$1(path, object);
      const length = path.length;
      const lastIndex = length - 1;
      let index = -1;
      let nested = object;
      while (nested != null && ++index < length) {
        const key = toKey$1(path[index]);
        let newValue = value;
        if (index != lastIndex) {
          const objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : void 0;
          if (newValue === void 0) {
            newValue = isObjectOrFunction(objValue) ? objValue : isIndex$1(path[index + 1]) ? [] : {};
          }
        }
        assignValue$1(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }
    function parent(object, path) {
      return path.length < 2 ? object : baseGet$1(object, path.slice(0, -1));
    }
    function last(array) {
      const length = array == null ? 0 : array.length;
      return length ? array[length - 1] : void 0;
    }
    function baseUnset(object, path) {
      const paths = castPath$1(path, object);
      object = parent(object, paths);
      return object == null || delete object[toKey$1(last(paths))];
    }
    const defaultIsMergeableObject = (value) => {
      const tag = Object.prototype.toString.call(value);
      return !!value && typeof value === "object" && tag !== "[object RegExp]" && tag !== "[object Date]";
    };
    function emptyTarget(val) {
      return Array.isArray(val) ? [] : {};
    }
    function cloneUnlessOtherwiseSpecified(value, options) {
      return options && options.clone !== false && options.isMergeableObject && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
    }
    function defaultArrayMerge(target, source, options) {
      return target.concat(source).map(function(element) {
        return cloneUnlessOtherwiseSpecified(element, options);
      });
    }
    function getMergeFunction(key, options) {
      if (!options.customMerge) {
        return deepmerge;
      }
      const customMerge = options.customMerge(key);
      return typeof customMerge === "function" ? customMerge : deepmerge;
    }
    function getEnumerableOwnPropertySymbols(target) {
      return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
        return target.propertyIsEnumerable && target.propertyIsEnumerable(symbol);
      }) : [];
    }
    function getKeys(target) {
      return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
    }
    function propertyIsOnObject(object, property) {
      try {
        return property in object;
      } catch (_) {
        return false;
      }
    }
    function propertyIsUnsafe(target, key) {
      return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
    }
    function mergeObject(target, source, options) {
      const destination = {};
      if (options.isMergeableObject(target)) {
        getKeys(target).forEach(function(key) {
          destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
        });
      }
      getKeys(source).forEach(function(key) {
        if (propertyIsUnsafe(target, key)) {
          return;
        }
        if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
          destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
        } else {
          destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
        }
      });
      return destination;
    }
    function deepmerge(target, source, options) {
      options = options || {};
      options.arrayMerge = options.arrayMerge || defaultArrayMerge;
      options.isMergeableObject = options.isMergeableObject || defaultIsMergeableObject;
      options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
      const sourceIsArray = Array.isArray(source);
      const targetIsArray = Array.isArray(target);
      const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
      if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
      } else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
      } else {
        return mergeObject(target, source, options);
      }
    }
    function deepmergeAll(array, options) {
      if (!Array.isArray(array)) {
        throw new Error("first argument should be an array");
      }
      return array.reduce(function(prev, next) {
        return deepmerge(prev, next, options);
      }, {});
    }
    function getTag$2(value) {
      if (value == null) {
        return value === void 0 ? "[object Undefined]" : "[object Null]";
      }
      return toString.call(value);
    }
    const isBoolean = (o) => getTag$2(o) === "[object Boolean]";
    const isNull = (o) => getTag$2(o) === "[object Null]";
    const isUndefined = (o) => getTag$2(o) === "[object Undefined]";
    const isNil = (o) => isNull(o) || isUndefined(o);
    const isObject$2 = (fn) => !isNil(fn) && typeof fn === "object";
    const isEmptyArray = (o) => Array.isArray(o) && !o.length;
    const isEmptyObject = (o) => isObject$2(o) && Object.keys(o).length === 0 && o.constructor === Object;
    const isEmpty$1 = (o, options = {}) => {
      return isNil(o) || options.blank !== false && o === "" || options.zero === true && o === 0 || options.zeroStr === true && o === "0" || options.trimBlank === true && String(o).trim() === "" || options.emptyArray === true && isEmptyArray(o) || options.emptyObject === true && isEmptyObject(o);
    };
    const isFunction$1 = (o) => typeof o === "function";
    const isPromise = (o) => isObject$2(o) && isFunction$1(o.then);
    const isString = (o) => typeof o === "string";
    const isSymbol$2 = (o) => typeof o === "symbol";
    const isPlainObject$1 = (o) => {
      if (!isObject$2(o))
        return false;
      const ctor = o.constructor;
      if (ctor === void 0)
        return true;
      const prot = ctor.prototype;
      if (!isObject$2(prot))
        return false;
      if (prot.hasOwnProperty("isPrototypeOf") === false) {
        return false;
      }
      return true;
    };
    const noop$1 = () => {
    };
    const arryLast = last;
    function ensureArray(items) {
      if (Array.isArray(items)) {
        return items.filter(Boolean);
      }
      if (items || typeof items === "number" && items === 0) {
        return [items];
      }
      return [];
    }
    function findBy(items, key, val) {
      if (!items || !items.length)
        return void 0;
      const result = items.find((item) => {
        if (!item)
          return false;
        return item[key] === val;
      });
      return result;
    }
    function sortBy(items, sortKey, options) {
      if (!items || !items.length)
        return [];
      let opts = { sortOrder: 1, defaultValue: void 0 };
      if (typeof options === "number") {
        opts = { sortOrder: options };
      } else {
        opts = Object.assign(opts, options);
      }
      const sortOrder = opts.sortOrder || 1;
      const defaultValue = opts.defaultValue;
      const _items = [...items];
      _items.sort((a, b) => {
        const av = !a || a[sortKey] === void 0 ? defaultValue : a[sortKey];
        const bv = !b || b[sortKey] === void 0 ? defaultValue : b[sortKey];
        if (av === bv)
          return 0;
        if (!av)
          return -1 * sortOrder;
        if (!bv)
          return 1 * sortOrder;
        return (av > bv ? 1 : -1) * sortOrder;
      });
      return _items;
    }
    function equal(obj1, obj2) {
      if (obj1 === obj2)
        return true;
      if (!obj1 || !obj2)
        return false;
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) {
        return false;
      }
      for (const key of keys1) {
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
      return true;
    }
    function deepEqual(obj1, obj2) {
      if (obj1 === obj2)
        return true;
      if (!obj1 || !obj2)
        return false;
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) {
        return false;
      }
      for (const key of keys1) {
        const val1 = obj1[key];
        const val2 = obj2[key];
        const areObjects = isObject$2(val1) && isObject$2(val2);
        if (areObjects && !deepEqual(val1, val2) || !areObjects && val1 !== val2) {
          return false;
        }
      }
      return true;
    }
    function deepProcess(obj, fn, cache = []) {
      if (!obj || typeof obj !== "object")
        return fn(obj);
      if (obj instanceof Date) {
        const dt = new Date();
        dt.setTime(obj.getTime());
        return fn(dt);
      }
      const hit = cache.find((c) => c.original === obj);
      if (hit)
        return hit.copy;
      const copy = Array.isArray(obj) ? [] : {};
      cache.push({ original: obj, copy });
      Object.keys(obj).forEach((key) => {
        copy[key] = deepProcess(obj[key], fn, cache);
      });
      return copy;
    }
    function deepClone(obj) {
      return deepProcess(obj, (val) => {
        return val;
      });
    }
    function deepTrim(obj) {
      return deepProcess(obj, (val) => {
        if (isString(val))
          return val.trim();
        return val;
      });
    }
    function deepMerge(...args) {
      const items = args.filter((it) => !isNil(it));
      return deepmergeAll(items, {
        isMergeableObject: isPlainObject$1
      });
    }
    function deepMerge2(args, options) {
      const items = args.filter((it) => !isNil(it));
      const opts = Object.assign({
        isMergeableObject: isPlainObject$1
      }, options);
      return deepmergeAll(items, opts);
    }
    function deepFreeze(object) {
      Object.freeze(object);
      for (const value of Object.values(object)) {
        if (typeof value === "object" && !Object.isFrozen(value)) {
          deepFreeze(value);
        }
      }
      return object;
    }
    function get$1(object, path, defaultValue) {
      const result = object == null ? void 0 : baseGet$1(object, path);
      return result === void 0 ? defaultValue : result;
    }
    function set(object, path, value, customizer) {
      customizer = typeof customizer === "function" ? customizer : void 0;
      return object == null ? object : baseSet(object, path, value, customizer);
    }
    function unset(object, path) {
      return object == null ? true : baseUnset(object, path);
    }
    function omit(object, props, filter) {
      if (typeof props === "string") {
        props = [props];
      } else if (typeof props === "function") {
        filter = props;
        props = [];
      }
      if (!isObject$2(object))
        return {};
      const isFunction2 = typeof filter === "function";
      const keys = Object.keys(object);
      const res = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const val = object[key];
        if (!props || !props.includes(key) && (!isFunction2 || (filter == null ? void 0 : filter(val, key, object)))) {
          res[key] = val;
        }
      }
      return res;
    }
    function omitNil(object) {
      return omit(object, (val) => !isNil(val));
    }
    function omitEmpty(object) {
      return omit(object, (val) => !isEmpty$1(val));
    }
    function pick(source, ...keys) {
      return keys.reduce((result, key) => {
        if (source[key] !== void 0) {
          result[key] = source[key];
        }
        return result;
      }, {});
    }
    function entries(obj) {
      return Object.keys(obj).map((key) => [key, obj[key]]);
    }
    async function delay(fn, seconds = 1) {
      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          Promise.resolve().then(() => {
            return fn.call(void 0);
          }).then((result) => {
            resolve(result);
          }).catch((err) => {
            reject(err);
          });
        }, seconds);
      });
    }
    var lodash = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      getTag: getTag$2,
      isBoolean,
      isNull,
      isUndefined,
      isNil,
      isObject: isObject$2,
      isEmptyArray,
      isEmptyObject,
      isEmpty: isEmpty$1,
      isFunction: isFunction$1,
      isPromise,
      isString,
      isSymbol: isSymbol$2,
      isPlainObject: isPlainObject$1,
      noop: noop$1,
      arryLast,
      ensureArray,
      findBy,
      sortBy,
      equal,
      deepEqual,
      deepProcess,
      deepClone,
      deepTrim,
      deepMerge,
      deepMerge2,
      deepFreeze,
      get: get$1,
      set,
      unset,
      omit,
      omitNil,
      omitEmpty,
      pick,
      entries,
      delay
    });
    function pad(v, length = 2, char = "0") {
      const val = String(v);
      return val.length >= length ? val : new Array(length - val.length + 1).join(char) + val;
    }
    function truncate(v, length, postfix = "...") {
      const val = String(v);
      return val.length < length ? val : val.substring(0, length) + postfix;
    }
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    function pluralize(str, amount = 2) {
      if (!amount || amount < 2) {
        return str;
      }
      return `${str}s`;
    }
    function trimStart(str, word = " ") {
      if (!str)
        return str;
      const len = word.length;
      const end = str.length;
      let start = 0;
      while (start < end && str.indexOf(word, start) === start)
        start += len;
      return start > 0 ? str.substring(start, end) : str;
    }
    function trimEnd(str, word = " ") {
      if (!str)
        return str;
      const len = word.length;
      const start = 0;
      let end = str.length;
      while (end > start && str.indexOf(word, end - len) === end - len)
        end -= len;
      return end < str.length ? str.substring(start, end) : str;
    }
    function trim(str, word = " ") {
      if (!str)
        return str;
      return trimStart(trimEnd(str, word), word);
    }
    function startsWith(str, exprStr) {
      if (!str || !exprStr || exprStr.length > str.length) {
        return false;
      }
      return str.substring(0, exprStr.length) === exprStr;
    }
    function endsWith(str, exprStr) {
      if (!str || !exprStr || exprStr.length > str.length) {
        return false;
      }
      return str.substring(str.length - exprStr.length) === exprStr;
    }
    var strings = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      pad,
      truncate,
      capitalize,
      pluralize,
      trimStart,
      trimEnd,
      trim,
      startsWith,
      endsWith
    });
    var ErrorCodes;
    (function(ErrorCodes2) {
      ErrorCodes2["APP_ERROR"] = "APP_ERROR";
      ErrorCodes2["APP_AUTH_ERROR"] = "APP_AUTH_ERROR";
      ErrorCodes2["APP_LOAD_ERROR"] = "APP_LOAD_ERROR";
      ErrorCodes2["APP_START_ERROR"] = "APP_START_ERROR";
      ErrorCodes2["PLUGIN_ERROR"] = "PLUGIN_ERROR";
      ErrorCodes2["INVALID_PLUGIN"] = "INVALID_PLUGIN";
      ErrorCodes2["PLUGIN_LOAD_ERROR"] = "PLUGIN_LOAD_ERROR";
      ErrorCodes2["PLUGIN_HOOK_ERROR"] = "PLUGIN_HOOK_ERROR";
      ErrorCodes2["HOOK_ERROR"] = "HOOK_ERROR";
      ErrorCodes2["INVALID_HOOK"] = "INVALID_HOOK";
      ErrorCodes2["INVALID_LOADER"] = "INVALID_LOADER";
      ErrorCodes2["AUTH_LOADER_ERROR"] = "AUTH_LOADER_ERROR";
      ErrorCodes2["PAGE_LOADER_ERROR"] = "PAGE_LOADER_ERROR";
    })(ErrorCodes || (ErrorCodes = {}));
    class ZPageError extends Error {
      constructor(body, description, code) {
        super();
        this.body = body;
        this.description = description;
        this.code = code;
        this.name = "ZPageError";
        this._initMessage();
      }
      _initMessage() {
        this.message = this.getBodyText();
      }
      getBodyText() {
        const errorBody = this.body;
        const defaultText = "\u672A\u77E5\u9519\u8BEF";
        if (!errorBody)
          return defaultText;
        if (isString(errorBody))
          return errorBody;
        return (errorBody == null ? void 0 : errorBody.message) || (errorBody == null ? void 0 : errorBody.text) || (errorBody == null ? void 0 : errorBody.description) || defaultText;
      }
      static createBody(objectOrError, message, code) {
        if (!objectOrError) {
          return { code, message };
        }
        return isObject$2(objectOrError) && !Array.isArray(objectOrError) ? objectOrError : { code, message, error: objectOrError };
      }
    }
    class AppError extends ZPageError {
      constructor(objectOrError, description = "\u5E94\u7528\u9519\u8BEF") {
        super(objectOrError, description, ErrorCodes.APP_ERROR);
      }
    }
    class AppAuthError extends ZPageError {
      constructor(objectOrError, description = "\u5E94\u7528\u8BA4\u8BC1\u9519\u8BEF") {
        super(objectOrError, description, ErrorCodes.APP_AUTH_ERROR);
      }
    }
    class AppLoadError extends ZPageError {
      constructor(objectOrError, description = "\u5E94\u7528\u52A0\u8F7D\u9519\u8BEF") {
        super(objectOrError, description, ErrorCodes.APP_LOAD_ERROR);
      }
    }
    class AppStartError extends ZPageError {
      constructor(objectOrError, description = "\u5E94\u7528\u542F\u52A8\u9519\u8BEF") {
        super(objectOrError, description, ErrorCodes.APP_START_ERROR);
      }
    }
    class PluginError extends ZPageError {
      constructor(objectOrError, description = "Plugin Error") {
        super(objectOrError, description, ErrorCodes.PLUGIN_ERROR);
      }
    }
    class InvalidPluginError extends ZPageError {
      constructor(objectOrError, description = "Invalid Plugin") {
        super(objectOrError, description, ErrorCodes.INVALID_PLUGIN);
      }
    }
    class PluginHookError extends ZPageError {
      constructor(objectOrError, description = "Plugin Hook Error") {
        super(objectOrError, description, ErrorCodes.PLUGIN_HOOK_ERROR);
      }
    }
    class PluginLoadError extends ZPageError {
      constructor(objectOrError, description = "Plugin Load Error") {
        super(objectOrError, description, ErrorCodes.PLUGIN_LOAD_ERROR);
      }
    }
    class HookError extends ZPageError {
      constructor(objectOrError, description = "Hook Error") {
        super(objectOrError, description, ErrorCodes.HOOK_ERROR);
      }
    }
    class InvalidHookError extends ZPageError {
      constructor(objectOrError, description = "Invalid Hook") {
        super(objectOrError, description, ErrorCodes.HOOK_ERROR);
      }
    }
    function throwInvalidHookError(hookName, hook) {
      throw new InvalidHookError({
        message: `hook ${hookName}: \u65E0\u6548\u94A9\u5B50\u51FD\u6570`,
        hook: hook && (isString(hook) ? hook : hook.name)
      });
    }
    function throwHookError(err, hook) {
      const errBody = isString(err) ? { message: err } : err;
      errBody.message = `\u94A9\u5B50\u6267\u884C\u9519\u8BEF\uFF1A${errBody.message}`;
      errBody.hook = hook && (isString(hook) ? hook : hook.name);
      throw new HookError(errBody);
    }
    class HookDriver {
      constructor(hooks) {
        this.hooks = sortBy(hooks, "priority", {
          defaultValue: 10
        });
      }
      hookParallel(hookName, context, args) {
        const promises = [];
        for (let i = 0; i < this.hooks.length; i++) {
          const hookPromise = this.runHook(hookName, context, args, i);
          if (!hookPromise)
            continue;
          promises.push(hookPromise);
        }
        return Promise.all(promises).then(() => {
        });
      }
      hookSeq(hookName, context, args) {
        let promise = Promise.resolve();
        for (let i = 0; i < this.hooks.length; i++) {
          promise = promise.then(() => this.runHook(hookName, context, args, i));
        }
        return promise;
      }
      runHook(hookName, context, args, hookIndex) {
        const hook = this.hooks[hookIndex];
        if (!this.testHook(hookName, hook))
          return void 0;
        const hookFn = hook.apply;
        return Promise.resolve().then(() => {
          return hookFn.call(this, context, ...(args || []).slice(1));
        }).catch((err) => throwHookError(err, hookName));
      }
      testHook(hookName, hook) {
        if (!hookName || !hook)
          return false;
        if (typeof hook.apply !== "function")
          throwInvalidHookError(hookName, hook);
        if (hook.name && hook.name.endsWith(`:hook:${hookName}`))
          return true;
        if (hook.trigger === "*")
          return true;
        const hookTrigger = ensureArray(hook.trigger);
        if (hookTrigger.includes(hookName))
          return true;
        return false;
      }
    }
    const noop$2 = noop$1;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Built-in value references. */
    var Symbol$1 = root.Symbol;

    /** Used for built-in method references. */
    var objectProto$h = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$f = objectProto$h.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$h.toString;

    /** Built-in value references. */
    var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty$f.call(value, symToStringTag$1),
          tag = value[symToStringTag$1];

      try {
        value[symToStringTag$1] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString$1.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag$1] = tag;
        } else {
          delete value[symToStringTag$1];
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$g = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto$g.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag && symToStringTag in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    /** Built-in value references. */
    var getPrototype = overArg(Object.getPrototypeOf, Object);

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /** `Object#toString` result references. */
    var objectTag$3 = '[object Object]';

    /** Used for built-in method references. */
    var funcProto$2 = Function.prototype,
        objectProto$f = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$2 = funcProto$2.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$e = objectProto$f.hasOwnProperty;

    /** Used to infer the `Object` constructor. */
    var objectCtorString = funcToString$2.call(Object);

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag$3) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty$e.call(proto, 'constructor') && proto.constructor;
      return typeof Ctor == 'function' && Ctor instanceof Ctor &&
        funcToString$2.call(Ctor) == objectCtorString;
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject$1(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag$1 = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject$1(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = baseGetTag(value);
      return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /** Used for built-in method references. */
    var funcProto$1 = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = funcProto$1.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString$1.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var funcProto = Function.prototype,
        objectProto$e = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$d = objectProto$e.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty$d).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject$1(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /* Built-in method references that are verified to be native. */
    var Map$1 = getNative(root, 'Map');

    /* Built-in method references that are verified to be native. */
    var nativeCreate = getNative(Object, 'create');

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$d = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$c = objectProto$d.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED$2 ? undefined : result;
      }
      return hasOwnProperty$c.call(data, key) ? data[key] : undefined;
    }

    /** Used for built-in method references. */
    var objectProto$c = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$b = objectProto$c.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$b.call(data, key);
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map$1 || ListCache),
        'string': new Hash
      };
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE$1 = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map$1 || (pairs.length < LARGE_ARRAY_SIZE$1 - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;

      this.__data__ = new MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function cacheHas(cache, key) {
      return cache.has(key);
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$5 = 1,
        COMPARE_UNORDERED_FLAG$3 = 2;

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Check that cyclic values are equal.
      var arrStacked = stack.get(array);
      var othStacked = stack.get(other);
      if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array;
      }
      var index = -1,
          result = true,
          seen = (bitmask & COMPARE_UNORDERED_FLAG$3) ? new SetCache : undefined;

      stack.set(array, other);
      stack.set(other, array);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!arraySome(other, function(othValue, othIndex) {
                if (!cacheHas(seen, othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                  return seen.push(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, bitmask, customizer, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      stack['delete'](other);
      return result;
    }

    /** Built-in value references. */
    var Uint8Array = root.Uint8Array;

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$4 = 1,
        COMPARE_UNORDERED_FLAG$2 = 2;

    /** `Object#toString` result references. */
    var boolTag$1 = '[object Boolean]',
        dateTag$1 = '[object Date]',
        errorTag$2 = '[object Error]',
        mapTag$2 = '[object Map]',
        numberTag$1 = '[object Number]',
        regexpTag$1 = '[object RegExp]',
        setTag$2 = '[object Set]',
        stringTag$1 = '[object String]',
        symbolTag$1 = '[object Symbol]';

    var arrayBufferTag$1 = '[object ArrayBuffer]',
        dataViewTag$2 = '[object DataView]';

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : undefined,
        symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag$2:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag$1:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag$1:
        case dateTag$1:
        case numberTag$1:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq(+object, +other);

        case errorTag$2:
          return object.name == other.name && object.message == other.message;

        case regexpTag$1:
        case stringTag$1:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == (other + '');

        case mapTag$2:
          var convert = mapToArray;

        case setTag$2:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG$2;

          // Recursively compare objects (susceptible to call stack limits).
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;

        case symbolTag$1:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    /** Used for built-in method references. */
    var objectProto$b = Object.prototype;

    /** Built-in value references. */
    var propertyIsEnumerable$1 = objectProto$b.propertyIsEnumerable;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable$1.call(object, symbol);
      });
    };

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /** `Object#toString` result references. */
    var argsTag$2 = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag$2;
    }

    /** Used for built-in method references. */
    var objectProto$a = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$a = objectProto$a.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$a.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty$a.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    /** Detect free variable `exports`. */
    var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

    /** Built-in value references. */
    var Buffer = moduleExports$1 ? root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER$1 : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]',
        arrayTag$1 = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag$1 = '[object Error]',
        funcTag = '[object Function]',
        mapTag$1 = '[object Map]',
        numberTag = '[object Number]',
        objectTag$2 = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag$1 = '[object Set]',
        stringTag = '[object String]',
        weakMapTag$1 = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag$1 = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag$1] = typedArrayTags[funcTag] =
    typedArrayTags[mapTag$1] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag$2] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag$1] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag$1] = false;

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    /** Detect free variable `exports`. */
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    /* Node.js helper references. */
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

    /** Used for built-in method references. */
    var objectProto$9 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$9 = objectProto$9.hasOwnProperty;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty$9.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

      return value === proto;
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = overArg(Object.keys, Object);

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$8 = objectProto$7.hasOwnProperty;

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$8.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$3 = 1;

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$7 = objectProto$6.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
          objProps = getAllKeys(object),
          objLength = objProps.length,
          othProps = getAllKeys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty$7.call(other, key))) {
          return false;
        }
      }
      // Check that cyclic values are equal.
      var objStacked = stack.get(object);
      var othStacked = stack.get(other);
      if (objStacked && othStacked) {
        return objStacked == other && othStacked == object;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined
              ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      stack['delete'](other);
      return result;
    }

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(root, 'DataView');

    /* Built-in method references that are verified to be native. */
    var Promise$1 = getNative(root, 'Promise');

    /* Built-in method references that are verified to be native. */
    var Set$1 = getNative(root, 'Set');

    /* Built-in method references that are verified to be native. */
    var WeakMap = getNative(root, 'WeakMap');

    /** `Object#toString` result references. */
    var mapTag = '[object Map]',
        objectTag$1 = '[object Object]',
        promiseTag = '[object Promise]',
        setTag = '[object Set]',
        weakMapTag = '[object WeakMap]';

    var dataViewTag = '[object DataView]';

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map$1),
        promiseCtorString = toSource(Promise$1),
        setCtorString = toSource(Set$1),
        weakMapCtorString = toSource(WeakMap);

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
        (Map$1 && getTag(new Map$1) != mapTag) ||
        (Promise$1 && getTag(Promise$1.resolve()) != promiseTag) ||
        (Set$1 && getTag(new Set$1) != setTag) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag)) {
      getTag = function(value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag$1 ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag;
            case mapCtorString: return mapTag;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag;
            case weakMapCtorString: return weakMapTag;
          }
        }
        return result;
      };
    }

    var getTag$1 = getTag;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$2 = 1;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        objectTag = '[object Object]';

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$6 = objectProto$5.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = objIsArr ? arrayTag : getTag$1(object),
          othTag = othIsArr ? arrayTag : getTag$1(other);

      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;

      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;

      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack);
        return (objIsArr || isTypedArray(object))
          ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
          : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
        var objIsWrapped = objIsObj && hasOwnProperty$6.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty$6.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new Stack);
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack);
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Unordered comparison
     *  2 - Partial comparison
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent.
     *
     * **Note:** This method supports comparing arrays, array buffers, booleans,
     * date objects, error objects, maps, numbers, `Object` objects, regexes,
     * sets, strings, symbols, and typed arrays. `Object` objects are compared
     * by their own, not inherited, enumerable properties. Functions and DOM
     * nodes are compared by strict equality, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.isEqual(object, other);
     * // => true
     *
     * object === other;
     * // => false
     */
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }

    /**
     * The base implementation of `_.findIndex` and `_.findLastIndex` without
     * support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} predicate The function invoked per iteration.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while ((fromRight ? index-- : ++index < length)) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.isNaN` without support for number objects.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     */
    function baseIsNaN(value) {
      return value !== value;
    }

    /**
     * A specialized version of `_.indexOf` which performs strict equality
     * comparisons of values, i.e. `===`.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function strictIndexOf(array, value, fromIndex) {
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOf(array, value, fromIndex) {
      return value === value
        ? strictIndexOf(array, value, fromIndex)
        : baseFindIndex(array, baseIsNaN, fromIndex);
    }

    /**
     * A specialized version of `_.includes` for arrays without support for
     * specifying an index to search from.
     *
     * @private
     * @param {Array} [array] The array to inspect.
     * @param {*} target The value to search for.
     * @returns {boolean} Returns `true` if `target` is found, else `false`.
     */
    function arrayIncludes(array, value) {
      var length = array == null ? 0 : array.length;
      return !!length && baseIndexOf(array, value, 0) > -1;
    }

    /**
     * This function is like `arrayIncludes` except that it accepts a comparator.
     *
     * @private
     * @param {Array} [array] The array to inspect.
     * @param {*} target The value to search for.
     * @param {Function} comparator The comparator invoked per element.
     * @returns {boolean} Returns `true` if `target` is found, else `false`.
     */
    function arrayIncludesWith(array, value, comparator) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (comparator(value, array[index])) {
          return true;
        }
      }
      return false;
    }

    /**
     * This method returns `undefined`.
     *
     * @static
     * @memberOf _
     * @since 2.3.0
     * @category Util
     * @example
     *
     * _.times(2, _.noop);
     * // => [undefined, undefined]
     */
    function noop() {
      // No operation performed.
    }

    /** Used as references for various `Number` constants. */
    var INFINITY$2 = 1 / 0;

    /**
     * Creates a set object of `values`.
     *
     * @private
     * @param {Array} values The values to add to the set.
     * @returns {Object} Returns the new set.
     */
    var createSet = !(Set$1 && (1 / setToArray(new Set$1([,-0]))[1]) == INFINITY$2) ? noop : function(values) {
      return new Set$1(values);
    };

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * The base implementation of `_.uniqBy` without support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     */
    function baseUniq(array, iteratee, comparator) {
      var index = -1,
          includes = arrayIncludes,
          length = array.length,
          isCommon = true,
          result = [],
          seen = result;

      if (comparator) {
        isCommon = false;
        includes = arrayIncludesWith;
      }
      else if (length >= LARGE_ARRAY_SIZE) {
        var set = iteratee ? null : createSet(array);
        if (set) {
          return setToArray(set);
        }
        isCommon = false;
        includes = cacheHas;
        seen = new SetCache;
      }
      else {
        seen = iteratee ? [] : result;
      }
      outer:
      while (++index < length) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;

        value = (comparator || value !== 0) ? value : 0;
        if (isCommon && computed === computed) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        }
        else if (!includes(seen, computed, comparator)) {
          if (seen !== result) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates a duplicate-free version of an array, using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons, in which only the first occurrence of each element
     * is kept. The order of result values is determined by the order they occur
     * in the array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * _.uniq([2, 1, 2]);
     * // => [2, 1]
     */
    function uniq(array) {
      return (array && array.length) ? baseUniq(array) : [];
    }

    const defaultAlphabetIndexMap = [];
    function isNumberCode(code) {
      return code >= 48 && code <= 57;
    }
    function naturalCompare(a, b, opts) {
      if (typeof a !== "string") {
        throw new TypeError(`The first argument must be a string. Received type '${typeof a}'`);
      }
      if (typeof b !== "string") {
        throw new TypeError(`The second argument must be a string. Received type '${typeof b}'`);
      }
      const lengthA = a.length;
      const lengthB = b.length;
      let indexA = 0;
      let indexB = 0;
      let alphabetIndexMap = defaultAlphabetIndexMap;
      let firstDifferenceInLeadingZeros = 0;
      if (opts) {
        if (opts.caseInsensitive) {
          a = a.toLowerCase();
          b = b.toLowerCase();
        }
        if (opts.alphabet) {
          alphabetIndexMap = buildAlphabetIndexMap(opts.alphabet);
        }
      }
      while (indexA < lengthA && indexB < lengthB) {
        let charCodeA = a.charCodeAt(indexA);
        let charCodeB = b.charCodeAt(indexB);
        if (isNumberCode(charCodeA)) {
          if (!isNumberCode(charCodeB)) {
            return charCodeA - charCodeB;
          }
          let numStartA = indexA;
          let numStartB = indexB;
          while (charCodeA === 48 && ++numStartA < lengthA) {
            charCodeA = a.charCodeAt(numStartA);
          }
          while (charCodeB === 48 && ++numStartB < lengthB) {
            charCodeB = b.charCodeAt(numStartB);
          }
          if (numStartA !== numStartB && firstDifferenceInLeadingZeros === 0) {
            firstDifferenceInLeadingZeros = numStartA - numStartB;
          }
          let numEndA = numStartA;
          let numEndB = numStartB;
          while (numEndA < lengthA && isNumberCode(a.charCodeAt(numEndA))) {
            ++numEndA;
          }
          while (numEndB < lengthB && isNumberCode(b.charCodeAt(numEndB))) {
            ++numEndB;
          }
          let difference = numEndA - numStartA - numEndB + numStartB;
          if (difference !== 0) {
            return difference;
          }
          while (numStartA < numEndA) {
            difference = a.charCodeAt(numStartA++) - b.charCodeAt(numStartB++);
            if (difference !== 0) {
              return difference;
            }
          }
          indexA = numEndA;
          indexB = numEndB;
          continue;
        }
        if (charCodeA !== charCodeB) {
          if (charCodeA < alphabetIndexMap.length && charCodeB < alphabetIndexMap.length && alphabetIndexMap[charCodeA] !== -1 && alphabetIndexMap[charCodeB] !== -1) {
            return alphabetIndexMap[charCodeA] - alphabetIndexMap[charCodeB];
          }
          return charCodeA - charCodeB;
        }
        ++indexA;
        ++indexB;
      }
      if (indexA < lengthA) {
        return 1;
      }
      if (indexB < lengthB) {
        return -1;
      }
      return firstDifferenceInLeadingZeros;
    }
    const alphabetIndexMapCache = {};
    function buildAlphabetIndexMap(alphabet) {
      const existingMap = alphabetIndexMapCache[alphabet];
      if (existingMap !== void 0) {
        return existingMap;
      }
      const indexMap = [];
      const maxCharCode = alphabet.split("").reduce((maxCode, char) => {
        return Math.max(maxCode, char.charCodeAt(0));
      }, 0);
      for (let i = 0; i <= maxCharCode; i++) {
        indexMap.push(-1);
      }
      for (let i = 0; i < alphabet.length; i++) {
        indexMap[alphabet.charCodeAt(i)] = i;
      }
      alphabetIndexMapCache[alphabet] = indexMap;
      return indexMap;
    }

    function simpleCompare(a1, b1, dir = 1) {
      let ret;
      if (typeof a1 === "number" && typeof b1 === "number") {
        ret = a1 < b1 ? -1 : a1 === b1 ? 0 : 1;
      } else {
        ret = String(a1).localeCompare(String(b1));
      }
      return ret * dir;
    }

    var defineProperty = (function() {
      try {
        var func = getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());

    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && defineProperty) {
        defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    /**
     * A specialized version of `baseAggregator` for arrays.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} setter The function to set `accumulator` values.
     * @param {Function} iteratee The iteratee to transform keys.
     * @param {Object} accumulator The initial aggregated object.
     * @returns {Function} Returns `accumulator`.
     */
    function arrayAggregator(array, setter, iteratee, accumulator) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        var value = array[index];
        setter(accumulator, value, iteratee(value), array);
      }
      return accumulator;
    }

    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = createBaseFor();

    /**
     * The base implementation of `_.forOwn` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }

    /**
     * Creates a `baseEach` or `baseEachRight` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length,
            index = fromRight ? length : -1,
            iterable = Object(collection);

        while ((fromRight ? index-- : ++index < length)) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }

    /**
     * The base implementation of `_.forEach` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */
    var baseEach = createBaseEach(baseForOwn);

    /**
     * Aggregates elements of `collection` on `accumulator` with keys transformed
     * by `iteratee` and values set by `setter`.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} setter The function to set `accumulator` values.
     * @param {Function} iteratee The iteratee to transform keys.
     * @param {Object} accumulator The initial aggregated object.
     * @returns {Function} Returns `accumulator`.
     */
    function baseAggregator(collection, setter, iteratee, accumulator) {
      baseEach(collection, function(value, key, collection) {
        setter(accumulator, value, iteratee(value), collection);
      });
      return accumulator;
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$1 = 1,
        COMPARE_UNORDERED_FLAG$1 = 2;

    /**
     * The base implementation of `_.isMatch` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Array} matchData The property names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
            ) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack;
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === undefined
                ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack)
                : result
              )) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && !isObject$1(value);
    }

    /**
     * Gets the property names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */
    function getMatchData(object) {
      var result = keys(object),
          length = result.length;

      while (length--) {
        var key = result[length],
            value = object[key];

        result[length] = [key, value, isStrictComparable(value)];
      }
      return result;
    }

    /**
     * A specialized version of `matchesProperty` for source values suitable
     * for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue &&
          (srcValue !== undefined || (key in Object(object)));
      };
    }

    /**
     * The base implementation of `_.matches` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && baseGetTag(value) == symbolTag);
    }

    /** Used to match property names within property paths. */
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/;

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
    }

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `clear`, `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache);
      return memoized;
    }

    // Expose `MapCache`.
    memoize.Cache = MapCache;

    /** Used as the maximum memoize cache size. */
    var MAX_MEMOIZE_SIZE = 500;

    /**
     * A specialized version of `_.memoize` which clears the memoized function's
     * cache when it exceeds `MAX_MEMOIZE_SIZE`.
     *
     * @private
     * @param {Function} func The function to have its output memoized.
     * @returns {Function} Returns the new memoized function.
     */
    function memoizeCapped(func) {
      var result = memoize(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });

      var cache = result.cache;
      return result;
    }

    /** Used to match property names within property paths. */
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

    /** Used to match backslashes in property paths. */
    var reEscapeChar = /\\(\\)?/g;

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath = memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46 /* . */) {
        result.push('');
      }
      string.replace(rePropName, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    });

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    /** Used as references for various `Number` constants. */
    var INFINITY$1 = 1 / 0;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
        symbolToString = symbolProto ? symbolProto.toString : undefined;

    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isArray(value)) {
        // Recursively convert values (susceptible to call stack limits).
        return arrayMap(value, baseToString) + '';
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
    }

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString$1(value) {
      return value == null ? '' : baseToString(value);
    }

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @param {Object} [object] The object to query keys on.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value, object) {
      if (isArray(value)) {
        return value;
      }
      return isKey(value, object) ? [value] : stringToPath(toString$1(value));
    }

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0;

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = castPath(path, object);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined;
    }

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is returned in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    /**
     * The base implementation of `_.hasIn` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }

    /**
     * Checks if `path` exists on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @param {Function} hasFunc The function to check properties.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     */
    function hasPath(object, path, hasFunc) {
      path = castPath(path, object);

      var index = -1,
          length = path.length,
          result = false;

      while (++index < length) {
        var key = toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index != length) {
        return result;
      }
      length = object == null ? 0 : object.length;
      return !!length && isLength(length) && isIndex(key, length) &&
        (isArray(object) || isArguments(object));
    }

    /**
     * Checks if `path` is a direct or inherited property of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.hasIn(object, 'a');
     * // => true
     *
     * _.hasIn(object, 'a.b');
     * // => true
     *
     * _.hasIn(object, ['a', 'b']);
     * // => true
     *
     * _.hasIn(object, 'b');
     * // => false
     */
    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;

    /**
     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get(object, path);
        return (objValue === undefined && objValue === srcValue)
          ? hasIn(object, path)
          : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
      };
    }

    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined : object[key];
      };
    }

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyDeep(path) {
      return function(object) {
        return baseGet(object, path);
      };
    }

    /**
     * Creates a function that returns the value at `path` of a given object.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': 2 } },
     *   { 'a': { 'b': 1 } }
     * ];
     *
     * _.map(objects, _.property('a.b'));
     * // => [2, 1]
     *
     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
     * // => [1, 2]
     */
    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }

    /**
     * The base implementation of `_.iteratee`.
     *
     * @private
     * @param {*} [value=_.identity] The value to convert to an iteratee.
     * @returns {Function} Returns the iteratee.
     */
    function baseIteratee(value) {
      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
      if (typeof value == 'function') {
        return value;
      }
      if (value == null) {
        return identity;
      }
      if (typeof value == 'object') {
        return isArray(value)
          ? baseMatchesProperty(value[0], value[1])
          : baseMatches(value);
      }
      return property(value);
    }

    /**
     * Creates a function like `_.groupBy`.
     *
     * @private
     * @param {Function} setter The function to set accumulator values.
     * @param {Function} [initializer] The accumulator object initializer.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter, initializer) {
      return function(collection, iteratee) {
        var func = isArray(collection) ? arrayAggregator : baseAggregator,
            accumulator = initializer ? initializer() : {};

        return func(collection, setter, baseIteratee(iteratee, 2), accumulator);
      };
    }

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$4.hasOwnProperty;

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` thru `iteratee`. The order of grouped values
     * is determined by the order they occur in `collection`. The corresponding
     * value of each key is an array of elements responsible for generating the
     * key. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([6.1, 4.2, 6.3], Math.floor);
     * // => { '4': [4.2], '6': [6.1, 6.3] }
     *
     * // The `_.property` iteratee shorthand.
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      if (hasOwnProperty$5.call(result, key)) {
        result[key].push(value);
      } else {
        baseAssignValue(result, key, [value]);
      }
    });

    /**
     * This method is like `_.uniq` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the criterion by which
     * uniqueness is computed. The order of result values is determined by the
     * order they occur in the array. The iteratee is invoked with one argument:
     * (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * _.uniqBy([2.1, 1.2, 2.3], Math.floor);
     * // => [2.1, 1.2]
     *
     * // The `_.property` iteratee shorthand.
     * _.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniqBy(array, iteratee) {
      return (array && array.length) ? baseUniq(array, baseIteratee(iteratee, 2)) : [];
    }

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    /** Built-in value references. */
    var objectCreate = Object.create;

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} proto The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject$1(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
      };
    }());

    /**
     * An alternative to `_.reduce`; this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable string keyed properties thru `iteratee`, with each invocation
     * potentially mutating the `accumulator` object. If `accumulator` is not
     * provided, a new object with the same `[[Prototype]]` will be used. The
     * iteratee is invoked with four arguments: (accumulator, value, key, object).
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @since 1.3.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * _.transform([2, 3, 4], function(result, n) {
     *   result.push(n *= n);
     *   return n % 2 == 0;
     * }, []);
     * // => [4, 9]
     *
     * _.transform({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
     *   (result[value] || (result[value] = [])).push(key);
     * }, {});
     * // => { '1': ['a', 'c'], '2': ['b'] }
     */
    function transform(object, iteratee, accumulator) {
      var isArr = isArray(object),
          isArrLike = isArr || isBuffer(object) || isTypedArray(object);

      iteratee = baseIteratee(iteratee, 4);
      if (accumulator == null) {
        var Ctor = object && object.constructor;
        if (isArrLike) {
          accumulator = isArr ? new Ctor : [];
        }
        else if (isObject$1(object)) {
          accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
        }
        else {
          accumulator = {};
        }
      }
      (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object) {
        return iteratee(accumulator, value, index, object);
      });
      return accumulator;
    }

    var __defProp$b = Object.defineProperty;
    var __getOwnPropSymbols$b = Object.getOwnPropertySymbols;
    var __hasOwnProp$b = Object.prototype.hasOwnProperty;
    var __propIsEnum$b = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$b = (obj, key, value) => key in obj ? __defProp$b(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$b = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$b.call(b, prop))
          __defNormalProp$b(a, prop, b[prop]);
      if (__getOwnPropSymbols$b)
        for (var prop of __getOwnPropSymbols$b(b)) {
          if (__propIsEnum$b.call(b, prop))
            __defNormalProp$b(a, prop, b[prop]);
        }
      return a;
    };
    const UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const prettyBytes = (num) => {
      if (!Number.isFinite(num)) {
        throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`);
      }
      const neg = num < 0;
      if (neg) {
        num = -num;
      }
      if (num < 1) {
        return `${(neg ? "-" : "") + num} B`;
      }
      const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1e3)), UNITS.length - 1);
      const numStr = Number((num / Math.pow(1e3, exponent)).toPrecision(3));
      const unit = UNITS[exponent];
      return `${(neg ? "-" : "") + numStr} ${unit}`;
    };
    const entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;"
    };
    const escapeHtml = (str) => String(str).replace(/[&<>"'\/]/g, function(s) {
      return entityMap[s];
    });
    function formatDuration(value) {
      const unit = ["\u79D2", "\u5206", "\u65F6", "\u5929", "\u6708", "\u5B63", "\u5E74"];
      const steps = [1, 60, 3600, 86400, 2592e3, 7776e3, 31104e3];
      let len = steps.length;
      const parts = [];
      while (len--) {
        if (steps[len] && value >= steps[len]) {
          parts.push(Math.floor(value / steps[len]) + unit[len]);
          value %= steps[len];
        } else if (len === 0 && value) {
          parts.push((value.toFixed ? value.toFixed(2) : "0") + unit[0]);
        }
      }
      return parts.join("");
    }
    function makeSorter(key, method, order) {
      return function(a, b) {
        if (!a || !b) {
          return 0;
        }
        const va = resolveVariable(key, a);
        const vb = resolveVariable(key, b);
        let result = 0;
        if (method === "numerical") {
          result = (parseFloat(va) || 0) - (parseFloat(vb) || 0);
        } else {
          result = String(va).localeCompare(String(vb));
        }
        return result * (order === "desc" ? -1 : 1);
      };
    }
    const timeUnitMap = {
      year: "Y",
      month: "M",
      week: "w",
      weekday: "W",
      day: "d",
      hour: "h",
      minute: "m",
      min: "m",
      second: "s",
      millisecond: "ms"
    };
    const relativeValueRe = /^(.+)?(\+|-)(\d+)(minute|min|hour|day|week|month|year|weekday|second|millisecond)s?$/i;
    const filters = {
      map: (input, fn, ...arg) => Array.isArray(input) && filters[fn] ? input.map((item) => filters[fn](item, ...arg)) : input,
      html: (input) => escapeHtml(input),
      json: (input, tabSize = 2) => tabSize ? JSON.stringify(input, null, parseInt(tabSize, 10)) : JSON.stringify(input),
      toJson: (input) => {
        let ret;
        try {
          ret = JSON.parse(input);
        } catch (e) {
          ret = null;
        }
        return ret;
      },
      toInt: (input) => typeof input === "string" ? parseInt(input, 10) : input,
      toFloat: (input) => typeof input === "string" ? parseFloat(input) : input,
      raw: (input) => input,
      now: () => new Date(),
      number: (input) => {
        let parts = String(input).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
      },
      trim: (input) => typeof input === "string" ? input.trim() : input,
      percent: (input, decimals = 0) => {
        input = parseFloat(input) || 0;
        decimals = parseInt(decimals, 10) || 0;
        let whole = input * 100;
        let multiplier = Math.pow(10, decimals);
        return (Math.round(whole * multiplier) / multiplier).toFixed(decimals) + "%";
      },
      duration: (input) => input ? formatDuration(input) : input,
      bytes: (input) => input ? prettyBytes(parseFloat(input)) : input,
      round: (input, decimals = 2) => {
        var _a;
        if (isNaN(input)) {
          return 0;
        }
        decimals = (_a = parseInt(decimals, 10)) != null ? _a : 2;
        let multiplier = Math.pow(10, decimals);
        return (Math.round(input * multiplier) / multiplier).toFixed(decimals);
      },
      truncate: (input, length, end) => {
        if (typeof input !== "string") {
          return input;
        }
        end = end || "...";
        if (length == null) {
          return input;
        }
        length = parseInt(length, 10) || 200;
        return input.substring(0, length) + (input.length > length ? end : "");
      },
      url_encode: (input) => encodeURIComponent(input),
      url_decode: (input) => decodeURIComponent(input),
      default: (input, defaultValue, strict = false) => {
        var _a;
        return (_a = strict ? input : input ? input : void 0) != null ? _a : (() => {
          try {
            if (defaultValue === "undefined") {
              return void 0;
            }
            return JSON.parse(defaultValue);
          } catch (e) {
            return defaultValue;
          }
        })();
      },
      join: (input, glue) => input && input.join ? input.join(glue) : input,
      split: (input, delimiter = ",") => typeof input === "string" ? input.split(delimiter) : input,
      sortBy: (input, key, method = "alpha", order) => Array.isArray(input) ? input.sort(makeSorter(key, method, order)) : input,
      objectToArray: (input, label = "label", value = "value") => transform(input, (result, v, k) => {
        ;
        (result || (result = [])).push({
          [label]: v,
          [value]: k
        });
      }, []),
      unique: (input, key) => Array.isArray(input) ? key ? uniqBy(input, key) : uniq(input) : input,
      topAndOther: (input, len = 10, labelField = "name", restLabel = "\u5176\u4ED6") => {
        if (Array.isArray(input) && len) {
          const grouped = groupBy(input, (item) => {
            const index = input.indexOf(item) + 1;
            return index >= len ? len : index;
          });
          return Object.keys(grouped).map((key, index) => {
            const group = grouped[key];
            const obj = group.reduce((obj2, item) => {
              Object.keys(item).forEach((key2) => {
                if (!obj2.hasOwnProperty(key2) || key2 === "labelField") {
                  obj2[key2] = item[key2];
                } else if (typeof item[key2] === "number" && typeof obj2[key2] === "number") {
                  obj2[key2] += item[key2];
                } else if (typeof item[key2] === "string" && /^(?:\-|\.)\d/.test(item[key2]) && typeof obj2[key2] === "number") {
                  obj2[key2] += parseFloat(item[key2]) || 0;
                } else if (typeof item[key2] === "string" && typeof obj2[key2] === "string") {
                  obj2[key2] += `, ${item[key2]}`;
                } else {
                  obj2[key2] = item[key2];
                }
              });
              return obj2;
            }, {});
            if (index === len - 1) {
              obj[labelField] = restLabel || "\u5176\u4ED6";
            }
            return obj;
          });
        }
        return input;
      },
      first: (input) => input && input[0],
      nth: (input, nth = 0) => input && input[nth],
      last: (input) => input && (input.length ? input[input.length - 1] : null),
      minus: (input, step = 1) => (parseInt(input, 10) || 0) - parseInt(step, 10),
      plus: (input, step = 1) => (parseInt(input, 10) || 0) + parseInt(step, 10),
      count: (input) => Array.isArray(input) || typeof input === "string" ? input.length : 0,
      sum: (input, field) => Array.isArray(input) ? input.reduce((sum, item) => sum + (parseFloat(field ? pickValues(field, item) : item) || 0), 0) : input,
      abs: (input) => typeof input === "number" ? Math.abs(input) : input,
      pick: (input, path = "&") => Array.isArray(input) && !/^\d+$/.test(path) ? input.map((item, index) => pickValues(path, createObject({ index }, item))) : pickValues(path, input),
      pick_if_exist: (input, path = "&") => Array.isArray(input) ? input.map((item) => resolveVariable(path, item) || item) : resolveVariable(path, input) || input,
      asArray: (input) => Array.isArray(input) ? input : input ? [input] : input,
      concat(input, ...args) {
        return Array.isArray(input) ? input.concat(...args.map((arg) => getStrOrVariable(arg, this))) : input;
      },
      filter: function(input, keys, expOrDirective, arg1) {
        if (!Array.isArray(input) || !keys || !expOrDirective) {
          return input;
        }
        let directive = expOrDirective;
        let fn = () => true;
        if (directive === "isTrue") {
          fn = (value) => !!value;
        } else if (directive === "isFalse") {
          fn = (value) => !value;
        } else if (directive === "isExists") {
          fn = (value) => typeof value !== "undefined";
        } else if (directive === "equals" || directive === "equal") {
          arg1 = arg1 ? getStrOrVariable(arg1, this) : "";
          fn = (value) => arg1 == value;
        } else if (directive === "isIn") {
          let list = arg1 ? getStrOrVariable(arg1, this) : [];
          list = str2array(list);
          list = Array.isArray(list) ? list : list ? [list] : [];
          fn = (value) => list.length ? !!~list.indexOf(value) : true;
        } else if (directive === "notIn") {
          let list = arg1 ? getStrOrVariable(arg1, this) : [];
          list = str2array(list);
          list = Array.isArray(list) ? list : list ? [list] : [];
          fn = (value) => !~list.indexOf(value);
        } else {
          if (directive !== "match") {
            directive = "match";
            arg1 = expOrDirective;
          }
          arg1 = arg1 ? getStrOrVariable(arg1, this) : "";
          if (!arg1) {
            return input;
          }
          let reg = string2regExp(`${arg1}`, false);
          fn = (value) => reg.test(String(value));
        }
        const isAsterisk = /\s*\*\s*/.test(keys);
        keys = keys.split(/\s*,\s*/);
        return input.filter((item) => (isAsterisk ? Object.keys(item) : keys).some((key) => fn(resolveVariable(key, item), key, item)));
      },
      base64Encode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
          return String.fromCharCode("0x" + p1);
        }));
      },
      base64Decode(str) {
        return decodeURIComponent(atob(str).split("").map(function(c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));
      },
      lowerCase: (input) => input && typeof input === "string" ? input.toLowerCase() : input,
      upperCase: (input) => input && typeof input === "string" ? input.toUpperCase() : input,
      isTrue(input, trueValue, falseValue) {
        return getConditionValue(input, !!input, trueValue, falseValue, this);
      },
      isFalse(input, trueValue, falseValue) {
        return getConditionValue(input, !input, trueValue, falseValue, this);
      },
      isMatch(input, matchArg, trueValue, falseValue) {
        matchArg = getStrOrVariable(matchArg, this);
        return getConditionValue(input, matchArg && string2regExp(`${matchArg}`, false).test(String(input)), trueValue, falseValue, this);
      },
      notMatch(input, matchArg, trueValue, falseValue) {
        matchArg = getStrOrVariable(matchArg, this);
        return getConditionValue(input, matchArg && !string2regExp(`${matchArg}`, false).test(String(input)), trueValue, falseValue, this);
      },
      isEquals(input, equalsValue, trueValue, falseValue) {
        equalsValue = /^\d+$/.test(equalsValue) ? parseInt(equalsValue, 10) : getStrOrVariable(equalsValue, this);
        return getConditionValue(input, input === equalsValue, trueValue, falseValue, this);
      },
      notEquals(input, equalsValue, trueValue, falseValue) {
        equalsValue = /^\d+$/.test(equalsValue) ? parseInt(equalsValue, 10) : getStrOrVariable(equalsValue, this);
        return getConditionValue(input, input !== equalsValue, trueValue, falseValue, this);
      },
      formatText: (input, name) => formatText(input, name)
    };
    function getStrOrVariable(value, data) {
      return /^('|")(.*)\1$/.test(value) ? RegExp.$2 : /^-?\d+$/.test(value) ? parseInt(value, 10) : /^(-?\d+)\.\d+?$/.test(value) ? parseFloat(value) : /^\[.*\]$/.test(value) ? value.substring(1, value.length - 1).split(/\s*,\s*/).filter((item) => item) : /,/.test(value) ? value.split(/\s*,\s*/).filter((item) => item) : resolveVariable(value, data);
    }
    function str2array(list) {
      if (list && typeof list === "string") {
        if (/^\[.*\]$/.test(list)) {
          return list.substring(1, list.length - 1).split(/\s*,\s*/).filter((item) => item);
        } else {
          return list.split(/\s*,\s*/).filter((item) => item);
        }
      }
      return list;
    }
    function getConditionValue(input, isTrue, trueValue, falseValue, data) {
      return isTrue || !isTrue && falseValue ? getStrOrVariable(isTrue ? trueValue : falseValue, data) : input;
    }
    function registerFilter(name, fn) {
      filters[name] = fn;
    }
    function getFilters() {
      return filters;
    }
    function pickValues(names, data) {
      let arr;
      if (!names || (arr = names.split(",")) && arr.length < 2) {
        let idx = names.indexOf("~");
        if (~idx) {
          let key = names.substring(0, idx);
          let target = names.substring(idx + 1);
          return {
            [key]: resolveVariable(target, data)
          };
        }
        return resolveVariable(names, data);
      }
      let ret = {};
      arr.forEach((name) => {
        let idx = name.indexOf("~");
        let target = name;
        if (~idx) {
          target = name.substring(idx + 1);
          name = name.substring(0, idx);
        }
        setVariable(ret, name, resolveVariable(target, data));
      });
      return ret;
    }
    function objectGet(data, path) {
      if (typeof data[path] !== "undefined") {
        return data[path];
      }
      let parts = keyToPath(path.replace(/^{|}$/g, ""));
      return parts.reduce((data2, path2) => {
        if ((isObject(data2) || Array.isArray(data2)) && path2 in data2) {
          return data2[path2];
        }
        return void 0;
      }, data);
    }
    function parseJson(str, defaultValue) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return defaultValue;
      }
    }
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop().split(";").shift();
      }
      return void 0;
    }
    const resolveVariable = (path, data = {}) => {
      if (!path || !data || typeof path !== "string") {
        return void 0;
      }
      let [ns, varname] = path.split(":");
      if (!varname && ns) {
        varname = ns;
        ns = "";
      }
      if (ns === "window") {
        data = window;
      } else if (ns === "ls" || ns === "ss") {
        let parts = keyToPath(varname.replace(/^{|}$/g, ""));
        const key = parts.shift();
        const raw = ns === "ss" ? sessionStorage.getItem(key) : localStorage.getItem(key);
        if (typeof raw === "string") {
          const data2 = parseJson(raw, raw);
          if (isObject(data2) && parts.length) {
            return objectGet(data2, parts.join("."));
          }
          return data2;
        }
        return void 0;
      } else if (ns === "cookie") {
        const key = varname.replace(/^{|}$/g, "").trim();
        return getCookie(key);
      }
      if (varname === "$$") {
        return data;
      } else if (varname[0] === "$") {
        varname = path.substring(1);
      } else if (varname === "&") {
        return data;
      }
      return objectGet(data, varname);
    };
    function isPureVariable(path) {
      return typeof path === "string" ? /^\$(?:((?:\w+\:)?[a-z0-9_.][a-z0-9_.\[\]]*)|{[^}{]+})$/i.test(path) : false;
    }
    const resolveVariableAndFilter = (path, data = {}, defaultFilter = "| html", fallbackValue = (value) => value) => {
      if (!path) {
        return void 0;
      }
      const m = /^(\\)?\$(?:((?:\w+\:)?[a-z0-9_.][a-z0-9_.\[\]]*)|{([\s\S]+)})$/i.exec(path);
      if (!m) {
        return void 0;
      }
      const [_, escape, key, key2] = m;
      if (escape) {
        return _.substring(1);
      }
      let finalKey = key || key2;
      finalKey = finalKey.replace(/(\\|\\\$)?\$(?:([a-zA-Z0-9_.][a-zA-Z0-9_.\[\]]*)|{([^}{]+)})/g, (_2, escape2) => {
        return escape2 ? _2.substring(1) : resolveVariableAndFilter(_2, data, defaultFilter);
      });
      if (!~finalKey.indexOf("|")) {
        finalKey += defaultFilter;
      }
      let paths = finalKey.split(/\s*\|\s*/g);
      let originalKey = finalKey;
      finalKey = paths.shift();
      let ret = resolveVariable(finalKey, data);
      let prevConInputChanged = false;
      return ret == null && !~originalKey.indexOf("default") && !~originalKey.indexOf("now") ? fallbackValue(ret) : paths.reduce((input, filter) => {
        let params = filter.replace(/([^\\])\\([\:\\])/g, (_2, affix, content) => `${affix}__${content === ":" ? "colon" : "slash"}__`).split(":").map((item) => item.replace(/__(slash|colon)__/g, (_2, type) => type === "colon" ? ":" : "\\"));
        let key3 = params.shift();
        if (~["isTrue", "isFalse", "isMatch", "isEquals", "notMatch", "notEquals"].indexOf(key3)) {
          if (prevConInputChanged) {
            return input;
          } else {
            const result = filters[key3].call(data, input, ...params);
            prevConInputChanged = result !== input;
            return result;
          }
        } else {
          prevConInputChanged = false;
        }
        return (filters[key3] || filters.raw).call(data, input, ...params);
      }, ret);
    };
    const tokenize = (str, data, defaultFilter = "| html") => {
      if (!str || typeof str !== "string") {
        return str;
      }
      return str.replace(/(\\)?\$(?:((?:\w+\:)?[a-z0-9_\.][a-z0-9_\.\[\]]*|&|\$)|{([^}{]+?)})/gi, (_, escape, key1, key2, index, source) => {
        var _a;
        if (!escape && key1 === "$") {
          const prefix = source[index - 1];
          return prefix === "=" ? encodeURIComponent(JSON.stringify(data)) : qsstringify(data);
        }
        return escape ? _.substring(1) : (_a = resolveVariableAndFilter(_, data, defaultFilter)) != null ? _a : "";
      });
    };
    function resolveMapping(value, data, defaultFilter = "| raw") {
      return typeof value === "string" && isPureVariable(value) ? resolveVariableAndFilter(value, data, defaultFilter, () => "") : typeof value === "string" && ~value.indexOf("$") ? tokenize(value, data, defaultFilter) : value;
    }
    function dataMapping(to, from = {}, ignoreFunction = false) {
      if (Array.isArray(to)) {
        return to.map((item) => dataMapping(item, from, ignoreFunction));
      } else if (typeof to === "string") {
        return resolveMapping(to, from);
      } else if (!isPlainObject(to)) {
        return to;
      }
      let ret = {};
      Object.keys(to).forEach((key) => {
        const value = to[key];
        let keys;
        if (typeof ignoreFunction === "function" && ignoreFunction(key, value)) {
          setVariable(ret, key, value);
        } else if (key === "&" && value === "$$") {
          ret = __spreadValues$b(__spreadValues$b({}, ret), from);
        } else if (key === "&") {
          const v = isPlainObject(value) && (keys = Object.keys(value)) && keys.length === 1 && from[keys[0].substring(1)] && Array.isArray(from[keys[0].substring(1)]) ? from[keys[0].substring(1)].map((raw) => dataMapping(value[keys[0]], createObject(from, raw), ignoreFunction)) : resolveMapping(value, from);
          if (Array.isArray(v) || typeof v === "string") {
            ret = v;
          } else if (typeof v === "function") {
            ret = __spreadValues$b(__spreadValues$b({}, ret), v(from));
          } else {
            ret = __spreadValues$b(__spreadValues$b({}, ret), v);
          }
        } else if (value === "$$") {
          setVariable(ret, key, from);
        } else if (value && value[0] === "$") {
          const v = resolveMapping(value, from);
          setVariable(ret, key, v);
          if (v === "__undefined") {
            deleteVariable(ret, key);
          }
        } else if (isPlainObject(value) && (keys = Object.keys(value)) && keys.length === 1 && keys[0][0] === "$" && isPlainObject(value[keys[0]])) {
          const arr = Array.isArray(from[keys[0].substring(1)]) ? from[keys[0].substring(1)] : [];
          const mapping = value[keys[0]];
          ret[key] = arr.map((raw) => dataMapping(mapping, createObject(from, raw), ignoreFunction));
        } else if (isPlainObject(value)) {
          setVariable(ret, key, dataMapping(value, from, ignoreFunction));
        } else if (Array.isArray(value)) {
          setVariable(ret, key, value.map((value2) => isPlainObject(value2) ? dataMapping(value2, from, ignoreFunction) : resolveMapping(value2, from)));
        } else if (typeof value == "string" && ~value.indexOf("$")) {
          setVariable(ret, key, resolveMapping(value, from));
        } else if (typeof value === "function" && ignoreFunction !== true) {
          setVariable(ret, key, value(from));
        } else {
          setVariable(ret, key, value);
          if (value === "__undefined") {
            deleteVariable(ret, key);
          }
        }
      });
      return ret;
    }
    function matchSynatax(str) {
      let from = 0;
      while (true) {
        const idx = str.indexOf("$", from);
        if (~idx) {
          const nextToken = str[idx + 1];
          if (!nextToken || ~['"', "'", " "].indexOf(nextToken)) {
            from = idx + 1;
            continue;
          }
          const prevToken = str[idx - 1];
          if (prevToken && prevToken === "\\") {
            from = idx + 1;
            continue;
          }
          return true;
        } else {
          break;
        }
      }
      return false;
    }
    function register$1() {
      return {
        name: "builtin",
        test: (str) => typeof str === "string" && matchSynatax(str),
        removeEscapeToken: (str) => typeof str === "string" ? str.replace(/\\\$/g, "$") : str,
        compile: (str, data, defaultFilter = "| html") => tokenize(str, data, defaultFilter)
      };
    }

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$3.hasOwnProperty;

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty$4.call(object, key) && eq(objValue, value)) ||
          (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }

    /**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max;

    /**
     * A specialized version of `baseRest` which transforms the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @param {Function} transform The rest array transform.
     * @returns {Function} Returns the new function.
     */
    function overRest(func, start, transform) {
      start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new constant function.
     * @example
     *
     * var objects = _.times(2, _.constant({ 'a': 1 }));
     *
     * console.log(objects);
     * // => [{ 'a': 1 }, { 'a': 1 }]
     *
     * console.log(objects[0] === objects[1]);
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * The base implementation of `setToString` without support for hot loop shorting.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, 'toString', {
        'configurable': true,
        'enumerable': false,
        'value': constant(string),
        'writable': true
      });
    };

    /** Used to detect hot functions by number of calls within a span of milliseconds. */
    var HOT_COUNT = 800,
        HOT_SPAN = 16;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeNow = Date.now;

    /**
     * Creates a function that'll short out and invoke `identity` instead
     * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
     * milliseconds.
     *
     * @private
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new shortable function.
     */
    function shortOut(func) {
      var count = 0,
          lastCalled = 0;

      return function() {
        var stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);

        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(undefined, arguments);
      };
    }

    /**
     * Sets the `toString` method of `func` to return `string`.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var setToString = shortOut(baseSetToString);

    /**
     * The base implementation of `_.rest` which doesn't validate or coerce arguments.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     */
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + '');
    }

    /**
     * Checks if the given arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
     *  else `false`.
     */
    function isIterateeCall(value, index, object) {
      if (!isObject$1(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number'
            ? (isArrayLike(object) && isIndex(index, object.length))
            : (type == 'string' && index in object)
          ) {
        return eq(object[index], value);
      }
      return false;
    }

    /**
     * Creates a function like `_.assign`.
     *
     * @private
     * @param {Function} assigner The function to assign values.
     * @returns {Function} Returns the new assigner function.
     */
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1,
            length = sources.length,
            customizer = length > 1 ? sources[length - 1] : undefined,
            guard = length > 2 ? sources[2] : undefined;

        customizer = (assigner.length > 3 && typeof customizer == 'function')
          ? (length--, customizer)
          : undefined;

        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? undefined : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$2 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$2.hasOwnProperty;

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject$1(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty$3.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }

    /**
     * This method is like `_.assignIn` except that it accepts `customizer`
     * which is invoked to produce the assigned values. If `customizer` returns
     * `undefined`, assignment is handled by the method instead. The `customizer`
     * is invoked with five arguments: (objValue, srcValue, key, object, source).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @alias extendWith
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @param {Function} [customizer] The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @see _.assignWith
     * @example
     *
     * function customizer(objValue, srcValue) {
     *   return _.isUndefined(objValue) ? srcValue : objValue;
     * }
     *
     * var defaults = _.partialRight(_.assignInWith, customizer);
     *
     * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
     * // => { 'a': 1, 'b': 2 }
     */
    var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
      copyObject(source, keysIn(source), object, customizer);
    });

    /** `Object#toString` result references. */
    var domExcTag = '[object DOMException]',
        errorTag = '[object Error]';

    /**
     * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
     * `SyntaxError`, `TypeError`, or `URIError` object.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
     * @example
     *
     * _.isError(new Error);
     * // => true
     *
     * _.isError(Error);
     * // => false
     */
    function isError(value) {
      if (!isObjectLike(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == errorTag || tag == domExcTag ||
        (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
    }

    /**
     * Attempts to invoke `func`, returning either the result or the caught error
     * object. Any additional arguments are provided to `func` when it's invoked.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Util
     * @param {Function} func The function to attempt.
     * @param {...*} [args] The arguments to invoke `func` with.
     * @returns {*} Returns the `func` result or error object.
     * @example
     *
     * // Avoid throwing errors for invalid selectors.
     * var elements = _.attempt(function(selector) {
     *   return document.querySelectorAll(selector);
     * }, '>_>');
     *
     * if (_.isError(elements)) {
     *   elements = [];
     * }
     */
    var attempt = baseRest(function(func, args) {
      try {
        return apply(func, undefined, args);
      } catch (e) {
        return isError(e) ? e : new Error(e);
      }
    });

    /**
     * The base implementation of `_.values` and `_.valuesIn` which creates an
     * array of `object` property values corresponding to the property names
     * of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the array of property values.
     */
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$1.hasOwnProperty;

    /**
     * Used by `_.defaults` to customize its `_.assignIn` use to assign properties
     * of source objects to the destination object for all destination properties
     * that resolve to `undefined`.
     *
     * @private
     * @param {*} objValue The destination value.
     * @param {*} srcValue The source value.
     * @param {string} key The key of the property to assign.
     * @param {Object} object The parent object of `objValue`.
     * @returns {*} Returns the value to assign.
     */
    function customDefaultsAssignIn(objValue, srcValue, key, object) {
      if (objValue === undefined ||
          (eq(objValue, objectProto$1[key]) && !hasOwnProperty$2.call(object, key))) {
        return srcValue;
      }
      return objValue;
    }

    /** Used to escape characters for inclusion in compiled string literals. */
    var stringEscapes = {
      '\\': '\\',
      "'": "'",
      '\n': 'n',
      '\r': 'r',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    };

    /**
     * Used by `_.template` to escape characters for inclusion in compiled string literals.
     *
     * @private
     * @param {string} chr The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeStringChar(chr) {
      return '\\' + stringEscapes[chr];
    }

    /** Used to match template delimiters. */
    var reInterpolate = /<%=([\s\S]+?)%>/g;

    /**
     * The base implementation of `_.propertyOf` without support for deep paths.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? undefined : object[key];
      };
    }

    /** Used to map characters to HTML entities. */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /**
     * Used by `_.escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} chr The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    var escapeHtmlChar = basePropertyOf(htmlEscapes);

    /** Used to match HTML entities and HTML characters. */
    var reUnescapedHtml = /[&<>"']/g,
        reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

    /**
     * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
     * corresponding HTML entities.
     *
     * **Note:** No other characters are escaped. To escape additional
     * characters use a third-party library like [_he_](https://mths.be/he).
     *
     * Though the ">" character is escaped for symmetry, characters like
     * ">" and "/" don't need escaping in HTML and have no special meaning
     * unless they're part of a tag or unquoted attribute value. See
     * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
     * (under "semi-related fun fact") for more details.
     *
     * When working with HTML you should always
     * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
     * XSS vectors.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('fred, barney, & pebbles');
     * // => 'fred, barney, &amp; pebbles'
     */
    function escape(string) {
      string = toString$1(string);
      return (string && reHasUnescapedHtml.test(string))
        ? string.replace(reUnescapedHtml, escapeHtmlChar)
        : string;
    }

    /** Used to match template delimiters. */
    var reEscape = /<%-([\s\S]+?)%>/g;

    /** Used to match template delimiters. */
    var reEvaluate = /<%([\s\S]+?)%>/g;

    /**
     * By default, the template delimiters used by lodash are like those in
     * embedded Ruby (ERB) as well as ES2015 template strings. Change the
     * following template settings to use alternative delimiters.
     *
     * @static
     * @memberOf _
     * @type {Object}
     */
    var templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type {RegExp}
       */
      'escape': reEscape,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type {RegExp}
       */
      'evaluate': reEvaluate,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type {RegExp}
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type {string}
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type {Object}
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type {Function}
         */
        '_': { 'escape': escape }
      }
    };

    /** Error message constants. */
    var INVALID_TEMPL_VAR_ERROR_TEXT = 'Invalid `variable` option passed into `_.template`';

    /** Used to match empty string literals in compiled template source. */
    var reEmptyStringLeading = /\b__p \+= '';/g,
        reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
        reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

    /**
     * Used to validate the `validate` option in `_.template` variable.
     *
     * Forbids characters which could potentially change the meaning of the function argument definition:
     * - "()," (modification of function parameters)
     * - "=" (default value)
     * - "[]{}" (destructuring of function parameters)
     * - "/" (beginning of a comment)
     * - whitespace
     */
    var reForbiddenIdentifierChars = /[()=,{}\[\]\/\s]/;

    /**
     * Used to match
     * [ES template delimiters](http://ecma-international.org/ecma-262/7.0/#sec-template-literal-lexical-components).
     */
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

    /** Used to ensure capturing order of template delimiters. */
    var reNoMatch = /($^)/;

    /** Used to match unescaped characters in compiled string literals. */
    var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto.hasOwnProperty;

    /**
     * Creates a compiled template function that can interpolate data properties
     * in "interpolate" delimiters, HTML-escape interpolated data properties in
     * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
     * properties may be accessed as free variables in the template. If a setting
     * object is given, it takes precedence over `_.templateSettings` values.
     *
     * **Note:** In the development build `_.template` utilizes
     * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
     * for easier debugging.
     *
     * For more information on precompiling templates see
     * [lodash's custom builds documentation](https://lodash.com/custom-builds).
     *
     * For more information on Chrome extension sandboxes see
     * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category String
     * @param {string} [string=''] The template string.
     * @param {Object} [options={}] The options object.
     * @param {RegExp} [options.escape=_.templateSettings.escape]
     *  The HTML "escape" delimiter.
     * @param {RegExp} [options.evaluate=_.templateSettings.evaluate]
     *  The "evaluate" delimiter.
     * @param {Object} [options.imports=_.templateSettings.imports]
     *  An object to import into the template as free variables.
     * @param {RegExp} [options.interpolate=_.templateSettings.interpolate]
     *  The "interpolate" delimiter.
     * @param {string} [options.sourceURL='templateSources[n]']
     *  The sourceURL of the compiled template.
     * @param {string} [options.variable='obj']
     *  The data object variable name.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Function} Returns the compiled template function.
     * @example
     *
     * // Use the "interpolate" delimiter to create a compiled template.
     * var compiled = _.template('hello <%= user %>!');
     * compiled({ 'user': 'fred' });
     * // => 'hello fred!'
     *
     * // Use the HTML "escape" delimiter to escape data property values.
     * var compiled = _.template('<b><%- value %></b>');
     * compiled({ 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // Use the internal `print` function in "evaluate" delimiters.
     * var compiled = _.template('<% print("hello " + user); %>!');
     * compiled({ 'user': 'barney' });
     * // => 'hello barney!'
     *
     * // Use the ES template literal delimiter as an "interpolate" delimiter.
     * // Disable support by replacing the "interpolate" delimiter.
     * var compiled = _.template('hello ${ user }!');
     * compiled({ 'user': 'pebbles' });
     * // => 'hello pebbles!'
     *
     * // Use backslashes to treat delimiters as plain text.
     * var compiled = _.template('<%= "\\<%- value %\\>" %>');
     * compiled({ 'value': 'ignored' });
     * // => '<%- value %>'
     *
     * // Use the `imports` option to import `jQuery` as `jq`.
     * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
     * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // Use the `sourceURL` option to specify a custom sourceURL for the template.
     * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => Find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector.
     *
     * // Use the `variable` option to ensure a with-statement isn't used in the compiled template.
     * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     * //   var __t, __p = '';
     * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
     * //   return __p;
     * // }
     *
     * // Use custom template delimiters.
     * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
     * var compiled = _.template('hello {{ user }}!');
     * compiled({ 'user': 'mustache' });
     * // => 'hello mustache!'
     *
     * // Use the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and stack traces.
     * fs.writeFileSync(path.join(process.cwd(), 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(string, options, guard) {
      // Based on John Resig's `tmpl` implementation
      // (http://ejohn.org/blog/javascript-micro-templating/)
      // and Laura Doktorova's doT.js (https://github.com/olado/doT).
      var settings = templateSettings.imports._.templateSettings || templateSettings;

      if (guard && isIterateeCall(string, options, guard)) {
        options = undefined;
      }
      string = toString$1(string);
      options = assignInWith({}, options, settings, customDefaultsAssignIn);

      var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn),
          importsKeys = keys(imports),
          importsValues = baseValues(imports, importsKeys);

      var isEscaping,
          isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // Compile the regexp to match each delimiter.
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      // Use a sourceURL for easier debugging.
      // The sourceURL gets injected into the source that's eval-ed, so be careful
      // to normalize all kinds of whitespace, so e.g. newlines (and unicode versions of it) can't sneak in
      // and escape the comment, thus injecting code that gets evaled.
      var sourceURL = hasOwnProperty$1.call(options, 'sourceURL')
        ? ('//# sourceURL=' +
           (options.sourceURL + '').replace(/\s/g, ' ') +
           '\n')
        : '';

      string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // Escape characters that can't be included in string literals.
        source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // Replace delimiters with snippets.
        if (escapeValue) {
          isEscaping = true;
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // The JS engine embedded in Adobe products needs `match` returned in
        // order to produce the correct `offset` value.
        return match;
      });

      source += "';\n";

      // If `variable` is not specified wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain.
      var variable = hasOwnProperty$1.call(options, 'variable') && options.variable;
      if (!variable) {
        source = 'with (obj) {\n' + source + '\n}\n';
      }
      // Throw an error if a forbidden character was found in `variable`, to prevent
      // potential command injection attacks.
      else if (reForbiddenIdentifierChars.test(variable)) {
        throw new Error(INVALID_TEMPL_VAR_ERROR_TEXT);
      }

      // Cleanup code by stripping empty strings.
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // Frame code as the function body.
      source = 'function(' + (variable || 'obj') + ') {\n' +
        (variable
          ? ''
          : 'obj || (obj = {});\n'
        ) +
        "var __t, __p = ''" +
        (isEscaping
           ? ', __e = _.escape'
           : ''
        ) +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      var result = attempt(function() {
        return Function(importsKeys, sourceURL + 'return ' + source)
          .apply(undefined, importsValues);
      });

      // Provide the compiled function's source by its `toString` method or
      // the `source` property as a convenience for inlining compiled templates.
      result.source = source;
      if (isError(result)) {
        throw result;
      }
      return result;
    }

    var __defProp$a = Object.defineProperty;
    var __defProps$6 = Object.defineProperties;
    var __getOwnPropDescs$6 = Object.getOwnPropertyDescriptors;
    var __getOwnPropSymbols$a = Object.getOwnPropertySymbols;
    var __hasOwnProp$a = Object.prototype.hasOwnProperty;
    var __propIsEnum$a = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$a = (obj, key, value) => key in obj ? __defProp$a(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$a = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$a.call(b, prop))
          __defNormalProp$a(a, prop, b[prop]);
      if (__getOwnPropSymbols$a)
        for (var prop of __getOwnPropSymbols$a(b)) {
          if (__propIsEnum$a.call(b, prop))
            __defNormalProp$a(a, prop, b[prop]);
        }
      return a;
    };
    var __spreadProps$6 = (a, b) => __defProps$6(a, __getOwnPropDescs$6(b));
    const imports = {
      default: void 0,
      countDown: (end) => {
        if (!end) {
          return "--";
        }
        const date = new Date(parseInt(end, 10) * 1e3);
        const now = Date.now();
        if (date.getTime() < now) {
          return "\u5DF2\u7ED3\u675F";
        }
        return `${Math.ceil((date.getTime() - now) / (1e3 * 60 * 60 * 24))}\u5929`;
      }
    };
    const EVAL_CACHE$1 = {};
    function lodashCompile(str, data) {
      try {
        const filters = getFilters();
        const finnalImports = __spreadValues$a(__spreadProps$6(__spreadValues$a({}, filters), {
          formatNumber: filters.number,
          defaultValue: filters.defaut
        }), imports);
        delete finnalImports.default;
        const fn = EVAL_CACHE$1[str] || (EVAL_CACHE$1[str] = template(str, {
          imports: finnalImports,
          variable: "data",
          interpolate: /<%=([\s\S]+?)%>/g
        }));
        return fn.call(data, data);
      } catch (e) {
        return `<span class="text-danger">${e.message}</span>`;
      }
    }
    function register() {
      return {
        name: "lodash",
        test: (str) => !!~str.indexOf("<%"),
        compile: (str, data) => lodashCompile(str, data)
      };
    }

    const enginers = {};
    function registerTplEnginer(name, enginer) {
      enginers[name] = enginer;
    }
    function filter(tpl, data = {}, ...rest) {
      if (!tpl || typeof tpl !== "string") {
        return "";
      }
      const keys = Object.keys(enginers);
      for (let i = 0, len = keys.length; i < len; i++) {
        const enginer = enginers[keys[i]];
        if (enginer.test(tpl)) {
          return enginer.compile(tpl, data, ...rest);
        } else if (enginer.removeEscapeToken) {
          tpl = enginer.removeEscapeToken(tpl);
        }
      }
      return tpl;
    }
    function deepFilter(obj, data = {}, defaultFilter = "| raw", cache = []) {
      if (obj && typeof obj === "string")
        return filter(obj, data, defaultFilter);
      if (!obj || typeof obj !== "object")
        return obj;
      if (obj instanceof Date) {
        const dt = new Date();
        dt.setTime(obj.getTime());
        return dt;
      }
      const hit = cache.find((c) => c.original === obj);
      if (hit)
        return hit.copy;
      const copy = Array.isArray(obj) ? [] : {};
      cache.push({ original: obj, copy });
      Object.keys(obj).forEach((key) => {
        copy[key] = deepFilter(obj[key], data, defaultFilter, cache);
      });
      return copy;
    }
    const EVAL_CACHE = {};
    let customEvalExpressionFn;
    function setCustomEvalExpression(fn) {
      customEvalExpressionFn = fn;
    }
    function evalExpression(expression, data) {
      if (typeof customEvalExpressionFn === "function") {
        return customEvalExpressionFn(expression, data);
      }
      if (!expression || typeof expression !== "string") {
        return false;
      }
      try {
        let debug = false;
        const idx = expression.indexOf("debugger");
        if (~idx) {
          debug = true;
          expression = expression.replace(/debugger;?/, "");
        }
        let fn;
        if (expression in EVAL_CACHE) {
          fn = EVAL_CACHE[expression];
        } else {
          fn = new Function("data", "utils", `with(data) {${debug ? "debugger;" : ""}return !!(${expression});}`);
          EVAL_CACHE[expression] = fn;
        }
        data = data || {};
        return fn.call(data, data, getFilters());
      } catch (e) {
        console.warn(expression, e);
        return false;
      }
    }
    let customEvalJsFn;
    function setCustomEvalJs(fn) {
      customEvalJsFn = fn;
    }
    function evalJS(js, data) {
      if (typeof customEvalJsFn === "function") {
        return customEvalJsFn(js, data);
      }
      try {
        const fn = new Function("data", "utils", `with(data) {${/^\s*return\b/.test(js) ? "" : "return "}${js};}`);
        data = data || {};
        return fn.call(data, data, getFilters());
      } catch (e) {
        console.warn(js, e);
        return null;
      }
    }
    ;
    [register$1, register].forEach((fn) => {
      const info = fn();
      registerTplEnginer(info.name, {
        test: info.test,
        compile: info.compile,
        removeEscapeToken: info.removeEscapeToken
      });
    });

    var tpl = /*#__PURE__*/Object.freeze({
        __proto__: null,
        registerTplEnginer: registerTplEnginer,
        filter: filter,
        deepFilter: deepFilter,
        setCustomEvalExpression: setCustomEvalExpression,
        evalExpression: evalExpression,
        setCustomEvalJs: setCustomEvalJs,
        evalJS: evalJS
    });

    var __defProp$9 = Object.defineProperty;
    var __defProps$5 = Object.defineProperties;
    var __getOwnPropDescs$5 = Object.getOwnPropertyDescriptors;
    var __getOwnPropSymbols$9 = Object.getOwnPropertySymbols;
    var __hasOwnProp$9 = Object.prototype.hasOwnProperty;
    var __propIsEnum$9 = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$9 = (obj, key, value) => key in obj ? __defProp$9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$9 = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$9.call(b, prop))
          __defNormalProp$9(a, prop, b[prop]);
      if (__getOwnPropSymbols$9)
        for (var prop of __getOwnPropSymbols$9(b)) {
          if (__propIsEnum$9.call(b, prop))
            __defNormalProp$9(a, prop, b[prop]);
        }
      return a;
    };
    var __spreadProps$5 = (a, b) => __defProps$5(a, __getOwnPropDescs$5(b));
    function isObject(obj) {
      const typename = typeof obj;
      return obj && typename !== "string" && typename !== "number" && typename !== "boolean" && typename !== "function" && !Array.isArray(obj);
    }
    function isEmpty(thing) {
      if (isObject(thing) && Object.keys(thing).length) {
        return false;
      }
      return true;
    }
    function createObject(superProps, props, properties) {
      if (superProps && Object.isFrozen(superProps)) {
        superProps = cloneObject(superProps);
      }
      const obj = superProps ? Object.create(superProps, __spreadProps$5(__spreadValues$9({}, properties), {
        __super: {
          value: superProps,
          writable: false,
          enumerable: false
        }
      })) : Object.create(Object.prototype, properties);
      props && isObject(props) && Object.keys(props).forEach((key) => obj[key] = props[key]);
      return obj;
    }
    function cloneObject(target, persistOwnProps = true) {
      const obj = target && target.__super ? Object.create(target.__super, {
        __super: {
          value: target.__super,
          writable: false,
          enumerable: false
        }
      }) : Object.create(Object.prototype);
      persistOwnProps && target && Object.keys(target).forEach((key) => obj[key] = target[key]);
      return obj;
    }
    function extendObject(target, src, persistOwnProps = true) {
      const obj = cloneObject(target, persistOwnProps);
      src && Object.keys(src).forEach((key) => obj[key] = src[key]);
      return obj;
    }
    function mapObject(value, fn) {
      if (Array.isArray(value)) {
        return value.map((item) => mapObject(item, fn));
      }
      if (isObject(value)) {
        let tmpValue = __spreadValues$9({}, value);
        Object.keys(tmpValue).forEach((key) => {
          ;
          tmpValue[key] = mapObject(tmpValue[key], fn);
        });
        return tmpValue;
      }
      return fn(value);
    }
    function rmUndefined(obj) {
      const newObj = {};
      if (typeof obj !== "object") {
        return obj;
      }
      const keys = Object.keys(obj);
      keys.forEach((key) => {
        if (obj[key] !== void 0) {
          newObj[key] = obj[key];
        }
      });
      return newObj;
    }
    function sortArray(items, dir = 1, field) {
      return items.sort((a, b) => {
        let a1 = a;
        let b1 = b;
        if (field) {
          a1 = a[field];
          b1 = b[field];
        }
        const ret = simpleCompare(a1, b1, dir);
        return ret;
      });
    }
    function findIndex(arr, detect) {
      for (let i = 0, len = arr.length; i < len; i++) {
        if (detect(arr[i], i)) {
          return i;
        }
      }
      return -1;
    }
    function findRepeats(arr, compare = simpleCompare) {
      const sortedArr = arr.sort(compare);
      const repeats = [];
      sortedArr.forEach((it, index) => {
        if (index === 0)
          return;
        if (compare(it, sortedArr[index - 1]) === 0) {
          repeats.push(it);
        }
      });
      return repeats;
    }
    function promisify(fn) {
      let promisified = function() {
        try {
          const ret = fn.apply(null, arguments);
          if (ret && ret.then) {
            return ret;
          } else if (typeof ret === "function") {
            return new Promise((resolve, reject) => ret((error, value) => error ? reject(error) : resolve(value)));
          }
          return Promise.resolve(ret);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      promisified.raw = fn;
      return promisified;
    }
    function until(fn, when, getCanceler, interval = 5e3) {
      let timer;
      let stoped = false;
      return new Promise((resolve, reject) => {
        const cancel = () => {
          clearTimeout(timer);
          stoped = true;
        };
        const check = async () => {
          try {
            const ret = await fn();
            if (stoped) {
              return;
            } else if (when(ret)) {
              stoped = true;
              resolve(ret);
            } else {
              timer = setTimeout(check, interval);
            }
          } catch (e) {
            reject(e);
          }
        };
        check();
        getCanceler && getCanceler(cancel);
      });
    }
    function difference(object, base, keepProps) {
      function changes(object2, base2) {
        if (isObject(object2) && isObject(base2)) {
          const keys = uniq(Object.keys(object2).concat(Object.keys(base2)));
          let result = {};
          keys.forEach((key) => {
            const a = object2[key];
            const b = base2[key];
            if (keepProps && ~keepProps.indexOf(key)) {
              result[key] = a;
            }
            if (isEqual(a, b)) {
              return;
            }
            if (!object2.hasOwnProperty(key)) {
              result[key] = void 0;
            } else if (Array.isArray(a) && Array.isArray(b)) {
              result[key] = a;
            } else {
              result[key] = changes(a, b);
            }
          });
          return result;
        } else {
          return object2;
        }
      }
      return changes(object, base);
    }
    function anyChanged(attrs, from, to, strictMode = true) {
      return (typeof attrs === "string" ? attrs.split(/\s*,\s*/) : attrs).some((key) => strictMode ? from[key] !== to[key] : from[key] != to[key]);
    }
    function isArrayChildrenModified(prev, next, strictMode = true) {
      if (!Array.isArray(prev) || !Array.isArray(next)) {
        return strictMode ? prev !== next : prev != next;
      }
      if (prev.length !== next.length) {
        return true;
      }
      for (let i = prev.length - 1; i >= 0; i--) {
        if (strictMode ? prev[i] !== next[i] : prev[i] != next[i]) {
          return true;
        }
      }
      return false;
    }
    function injectPropsToObject(target, props) {
      const sup = Object.create(target.__super || null);
      Object.keys(props).forEach((key) => sup[key] = props[key]);
      const result = Object.create(sup);
      Object.keys(target).forEach((key) => result[key] = target[key]);
      return result;
    }
    function immutableExtends(to, from, deep = false) {
      if (!isObject(to) || !isObject(from)) {
        return to;
      }
      let ret = to;
      Object.keys(from).forEach((key) => {
        const origin = to[key];
        const value = from[key];
        if (origin !== value) {
          ret = ret !== to ? ret : __spreadValues$9({}, to);
          ret[key] = value;
        }
      });
      return ret;
    }
    const bulkBindFunctions = function(context, funNames) {
      funNames.forEach((key) => context[key] = context[key].bind(context));
    };
    function findObjectsWithKey(obj, key) {
      if (isCyclic(obj)) {
        return [];
      }
      return internalFindObjectsWithKey(obj, key);
    }
    function isCyclic(obj) {
      const seenObjects = [];
      function detect(obj2) {
        if (obj2 && typeof obj2 === "object") {
          if (seenObjects.indexOf(obj2) !== -1) {
            return true;
          }
          seenObjects.push(obj2);
          for (const key in obj2) {
            if (obj2.hasOwnProperty(key) && detect(obj2[key])) {
              return true;
            }
          }
        }
        return false;
      }
      return detect(obj);
    }
    function internalFindObjectsWithKey(obj, key) {
      let objects = [];
      for (const k in obj) {
        if (!obj.hasOwnProperty(k))
          continue;
        if (k === key) {
          objects.push(obj);
        } else if (typeof obj[k] === "object") {
          objects = objects.concat(internalFindObjectsWithKey(obj[k], key));
        }
      }
      return objects;
    }
    function getVariable(data, key, canAccessSuper = true) {
      if (!data || !key) {
        return void 0;
      } else if (canAccessSuper ? key in data : data.hasOwnProperty(key)) {
        return data[key];
      }
      return keyToPath(key).reduce((obj, key2) => obj && typeof obj === "object" && (canAccessSuper ? key2 in obj : obj.hasOwnProperty(key2)) ? obj[key2] : void 0, data);
    }
    function setVariable(data, key, value) {
      data = data || {};
      if (key in data) {
        data[key] = value;
        return;
      }
      const parts = keyToPath(key);
      const last = parts.pop();
      while (parts.length) {
        let key2 = parts.shift();
        if (isPlainObject(data[key2])) {
          data = data[key2] = __spreadValues$9({}, data[key2]);
        } else if (Array.isArray(data[key2])) {
          data[key2] = data[key2].concat();
          data = data[key2];
        } else if (data[key2]) {
          data[key2] = {};
          data = data[key2];
        } else {
          data[key2] = {};
          data = data[key2];
        }
      }
      data[last] = value;
    }
    function deleteVariable(data, key) {
      if (!data) {
        return;
      } else if (data.hasOwnProperty(key)) {
        delete data[key];
        return;
      }
      const parts = keyToPath(key);
      const last = parts.pop();
      while (parts.length) {
        let key2 = parts.shift();
        if (isPlainObject(data[key2])) {
          data = data[key2] = __spreadValues$9({}, data[key2]);
        } else if (data[key2]) {
          throw new Error(`\u76EE\u6807\u8DEF\u5F84\u4E0D\u662F\u7EAF\u5BF9\u8C61\uFF0C\u4E0D\u80FD\u4FEE\u6539`);
        } else {
          break;
        }
      }
      if (data && data.hasOwnProperty && data.hasOwnProperty(last)) {
        delete data[last];
      }
    }
    function hasOwnProperty(data, key) {
      const parts = keyToPath(key);
      while (parts.length) {
        let key2 = parts.shift();
        if (!isObject(data) || !data.hasOwnProperty(key2)) {
          return false;
        }
        data = data[key2];
      }
      return true;
    }
    const keyToPath = (string) => {
      const result = [];
      if (string.charCodeAt(0) === ".".charCodeAt(0)) {
        result.push("");
      }
      string.replace(new RegExp(`[^.[\\]]+|\\[(?:([^"'][^[]*)|(["'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2)\\]|(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))`, "g"), (match, expression, quote, subString) => {
        let key = match;
        if (quote) {
          key = subString.replace(/\\(\\)?/g, "$1");
        } else if (expression) {
          key = expression.trim();
        }
        result.push(key);
        return "";
      });
      return result;
    };
    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
      }
      return s4() + s4() + s4();
    }
    function uniqId() {
      return (+new Date()).toString(36);
    }
    const str = () => ("00000000000000000" + (Math.random() * 18446744073709552e3).toString(16)).slice(-16);
    const uuidv4 = () => {
      const a = str();
      const b = str();
      return `${a.slice(0, 8)}-${a.slice(8, 12)}-4${a.slice(13)}-a${b.slice(1, 4)}-${b.slice(4)}`;
    };
    const uuid = () => {
      const a = str();
      const b = str();
      return `${uniqId()}-${a.slice(8, 12)}-4${a.slice(13)}-a${b.slice(1, 4)}-${b.slice(4)}`;
    };
    function string2regExp(value, caseSensitive = false) {
      if (typeof value !== "string") {
        throw new TypeError("Expected a string");
      }
      return new RegExp(value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d"), !caseSensitive ? "i" : "");
    }
    function ucFirst(str2) {
      return typeof str2 === "string" ? str2.substring(0, 1).toUpperCase() + str2.substring(1) : str2;
    }
    function lcFirst(str2) {
      return str2 ? str2.substring(0, 1).toLowerCase() + str2.substring(1) : "";
    }
    function camel(str2) {
      return str2 ? str2.split(/[\s_\-]/).map((item, index) => index === 0 ? lcFirst(item) : ucFirst(item)).join("") : "";
    }
    function qsstringify(data, options = {
      arrayFormat: "indices",
      encodeValuesOnly: true
    }, keepEmptyArray) {
      keepEmptyArray && Object.keys(data).forEach((key) => {
        Array.isArray(data[key]) && !data[key].length && (data[key] = "");
      });
      return qs$1.stringify(data, options);
    }
    function qsparse(data, options = {
      arrayFormat: "indices",
      encodeValuesOnly: true,
      depth: 1e3
    }) {
      return qs$1.parse(data, options);
    }
    function parsePagePath(path) {
      if (!path)
        return { path };
      let qryPath = path;
      let qryStr = "";
      let qryData = void 0;
      const pathQueryIndex = path.indexOf("?");
      if (pathQueryIndex >= 0) {
        qryPath = path.substring(0, pathQueryIndex);
        qryStr = path.substring(pathQueryIndex + 1);
        if (qryStr) {
          qryData = qs$1.parse(qryStr);
        }
      }
      return { path: qryPath, query: qryData, queryStr: qryStr };
    }
    function getPageKey(page) {
      if (!(page == null ? void 0 : page.path))
        return null;
      let { path, query } = page;
      let qstr = query || "";
      if (isObject(query)) {
        if (!Object.keys(query).length) {
          qstr = "";
        } else {
          const pathData = parsePagePath(path);
          path = pathData.path;
          if (pathData.queryStr) {
            query = Object.assign({}, pathData.query, query);
          }
          qstr = qs$1.stringify(query, {
            sort: simpleCompare
          });
        }
      }
      return qstr ? `${path}?${qstr}` : path;
    }
    function hasVisibleExpression(schema) {
      return (schema == null ? void 0 : schema.visibleOn) || (schema == null ? void 0 : schema.hiddenOn);
    }
    function isVisible(schema, data) {
      return !(schema.hidden || schema.visible === false || schema.hiddenOn && evalExpression(schema.hiddenOn, data) === true || schema.visibleOn && evalExpression(schema.visibleOn, data) === false);
    }
    function isUnfolded(node, config) {
      let { foldedField, unfoldedField } = config;
      unfoldedField = unfoldedField || "unfolded";
      foldedField = foldedField || "folded";
      let ret = false;
      if (unfoldedField && typeof node[unfoldedField] !== "undefined") {
        ret = !!node[unfoldedField];
      } else if (foldedField && typeof node[foldedField] !== "undefined") {
        ret = !node[foldedField];
      }
      return ret;
    }
    function visibilityFilter(items, data) {
      return items.filter((item) => {
        return isVisible(item, data);
      });
    }
    function isDisabled(schema, data) {
      return schema.disabled || schema.disabledOn && evalExpression(schema.disabledOn, data);
    }
    function hasAbility(schema, ability, data, defaultValue = true) {
      return schema.hasOwnProperty(ability) ? schema[ability] : schema.hasOwnProperty(`${ability}On`) ? evalExpression(schema[`${ability}On`], data || schema) : defaultValue;
    }
    function makeHorizontalDeeper(horizontal, count) {
      if (count > 1 && /\bcol-(xs|sm|md|lg)-(\d+)\b/.test(horizontal.left)) {
        const flex = parseInt(RegExp.$2, 10) * count;
        return {
          leftFixed: horizontal.leftFixed,
          left: flex,
          right: 12 - flex,
          offset: flex
        };
      } else if (count > 1 && typeof horizontal.left === "number") {
        const flex = horizontal.left * count;
        return {
          leftFixed: horizontal.leftFixed,
          left: flex,
          right: 12 - flex,
          offset: flex
        };
      }
      return horizontal;
    }
    function getScrollParent(node) {
      if (node == null) {
        return null;
      }
      const style = getComputedStyle(node);
      if (!style) {
        return null;
      }
      const text = style.getPropertyValue("overflow") + style.getPropertyValue("overflow-x") + style.getPropertyValue("overflow-y");
      if (/auto|scroll/.test(text) || node.nodeName === "BODY") {
        return node;
      }
      return getScrollParent(node.parentNode);
    }
    function chainFunctions(...fns) {
      return (...args) => fns.reduce((ret, fn) => ret === false ? false : typeof fn == "function" ? fn(...args) : void 0, void 0);
    }
    function chainEvents(props, schema) {
      const ret = {};
      Object.keys(props).forEach((key) => {
        if (key.substring(0, 2) === "on" && typeof props[key] === "function" && typeof schema[key] === "function" && schema[key] !== props[key]) {
          if (props.formStore && key === "onChange") {
            ret[key] = props[key];
          } else {
            ret[key] = chainFunctions(schema[key], props[key]);
          }
        } else {
          ret[key] = props[key];
        }
      });
      return ret;
    }
    function isBreakpoint(str2) {
      if (typeof str2 !== "string") {
        return !!str2;
      }
      const breaks = str2.split(/\s*,\s*|\s+/);
      if (window.matchMedia) {
        return breaks.some((item) => item === "*" || item === "xs" && matchMedia(`screen and (max-width: 767px)`).matches || item === "sm" && matchMedia(`screen and (min-width: 768px) and (max-width: 991px)`).matches || item === "md" && matchMedia(`screen and (min-width: 992px) and (max-width: 1199px)`).matches || item === "lg" && matchMedia(`screen and (min-width: 1200px)`).matches);
      } else {
        const width = window.innerWidth;
        return breaks.some((item) => item === "*" || item === "xs" && width < 768 || item === "sm" && width >= 768 && width < 992 || item === "md" && width >= 992 && width < 1200 || item === "lg" && width >= 1200);
      }
    }
    function getWidthRate(value, strictMode = false) {
      if (typeof value === "string" && /\bcol\-\w+\-(\d+)\b/.test(value)) {
        return parseInt(RegExp.$1, 10);
      }
      return strictMode ? 0 : value || 0;
    }
    function getLevelFromClassName(value, defaultValue = "default") {
      if (/\b(?:btn|text)-(link|primary|secondary|info|success|warning|danger|light|dark)\b/.test(value)) {
        return RegExp.$1;
      }
      return defaultValue;
    }
    function hasFile(object) {
      return Object.keys(object).some((key) => {
        let value = object[key];
        return value instanceof File || Array.isArray(value) && value.length && value[0] instanceof File;
      });
    }
    function object2formData(data, options = {
      arrayFormat: "indices",
      encodeValuesOnly: true
    }, fd = new FormData()) {
      let fileObjects = [];
      let others = {};
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value instanceof File) {
          fileObjects.push([key, value]);
        } else if (Array.isArray(value) && value.length && value[0] instanceof File) {
          value.forEach((value2) => fileObjects.push([`${key}[]`, value2]));
        } else {
          others[key] = value;
        }
      });
      qsstringify(others, options).split("&").forEach((item) => {
        let parts = item.split("=");
        parts[0] && fd.append(parts[0], decodeURIComponent(parts[1]));
      });
      fileObjects.forEach((fileObject) => fd.append(fileObject[0], fileObject[1], fileObject[1].name));
      return fd;
    }
    function loadScript(src) {
      return new Promise((ok, fail) => {
        const script = document.createElement("script");
        script.onerror = (reason) => fail(reason);
        if (~src.indexOf("{{callback}}")) {
          const callbackFn = `loadscriptcallback_${uuid()}`;
          window[callbackFn] = () => {
            ok();
            delete window[callbackFn];
          };
          src = src.replace("{{callback}}", callbackFn);
        } else {
          script.onload = () => ok();
        }
        script.src = src;
        document.head.appendChild(script);
      });
    }
    let scrollbarWidth;
    function getScrollbarWidth() {
      if (typeof scrollbarWidth !== "undefined") {
        return scrollbarWidth;
      }
      const outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.overflow = "scroll";
      outer.style.msOverflowStyle = "scrollbar";
      document.body.appendChild(outer);
      const inner = document.createElement("div");
      outer.appendChild(inner);
      scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      if (outer.parentNode) {
        outer.parentNode.removeChild(outer);
      }
      return scrollbarWidth;
    }
    function resolveValueByName(data, name) {
      return isPureVariable(name) ? resolveVariableAndFilter(name, data) : resolveVariable(name, data);
    }
    function getPropValue(props, getter) {
      var _a, _b;
      const { name, value, data, defaultValue } = props;
      return (_b = (_a = value != null ? value : getter == null ? void 0 : getter(props)) != null ? _a : resolveValueByName(data, name)) != null ? _b : defaultValue;
    }
    function detectPropValueChanged(props, prevProps, onChange, getter) {
      let nextValue;
      if (typeof props.value !== "undefined") {
        props.value !== prevProps.value && onChange(props.value);
      } else if ((nextValue = getter == null ? void 0 : getter(props)) !== void 0) {
        nextValue !== getter(prevProps) && onChange(nextValue);
      } else if (typeof props.name === "string" && (nextValue = resolveValueByName(props.data, props.name)) !== void 0) {
        nextValue !== resolveValueByName(prevProps.data, prevProps.name) && onChange(nextValue);
      } else if (props.defaultValue !== prevProps.defaultValue) {
        onChange(props.defaultValue);
      }
    }
    function pickEventsProps(props) {
      const ret = {};
      props && Object.keys(props).forEach((key) => /^on/.test(key) && (ret[key] = props[key]));
      return ret;
    }
    function removeHTMLTag(str2) {
      return str2.replace(/<\/?[^>]+(>|$)/g, "");
    }
    function __uri(id) {
      return id;
    }
    function omitControls(controls, omitItems) {
      return controls.filter((control) => !~omitItems.indexOf(control.name || control._name));
    }
    const padArr = (arr, size = 4) => {
      const ret = [];
      const pool = arr.concat();
      let from = 0;
      while (pool.length) {
        let host = ret[from] || (ret[from] = []);
        if (host.length >= size) {
          from += 1;
          continue;
        }
        host.push(pool.shift());
      }
      return ret;
    };

    function fenMoney(input, options = {}) {
      if (lodash.isNil(input))
        return options.emptyText || "N/A";
      const yuan = +(+input / 100).toFixed(2);
      return yuanMoney(yuan, options);
    }
    function yuanMoney(input, options = {}) {
      if (lodash.isNil(input))
        return options.emptyText || "N/A";
      const decimals = options.decimals || 2;
      const num = (input + "").replace(/[^0-9+-Ee.]/g, "");
      let n = !isFinite(+num) ? 0 : +num, prec = !isFinite(decimals) ? 0 : Math.abs(decimals), sep = options.thousandSep || ",", dec = options.decimalSep || ".", s = "", toFixedFix = function(n2, prec2) {
        const k = Math.pow(10, prec2);
        return "" + Math.ceil(n2 * k) / k;
      };
      s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
      const re = /(-?\d+)(\d{3})/;
      while (re.test(s[0])) {
        s[0] = s[0].replace(re, "$1" + sep + "$2");
      }
      if ((s[1] || "").length < prec) {
        s[1] = s[1] || "";
        s[1] += new Array(prec - s[1].length + 1).join("0");
      }
      return s.join(dec);
    }

    var formatter = /*#__PURE__*/Object.freeze({
        __proto__: null,
        fenMoney: fenMoney,
        yuanMoney: yuanMoney
    });

    const qs = qs$1;
    function filterEmpty(val, replaceText = "--") {
      if (!val && val !== 0)
        return replaceText;
      return val;
    }
    function formatText(val, name, options) {
      const f = formatter[name];
      let valText = String(val);
      if (typeof f === "function")
        valText = f(val, options);
      return valText;
    }

    var __defProp$8 = Object.defineProperty;
    var __defProps$4 = Object.defineProperties;
    var __getOwnPropDescs$4 = Object.getOwnPropertyDescriptors;
    var __getOwnPropSymbols$8 = Object.getOwnPropertySymbols;
    var __hasOwnProp$8 = Object.prototype.hasOwnProperty;
    var __propIsEnum$8 = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$8 = (obj, key, value) => key in obj ? __defProp$8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$8 = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$8.call(b, prop))
          __defNormalProp$8(a, prop, b[prop]);
      if (__getOwnPropSymbols$8)
        for (var prop of __getOwnPropSymbols$8(b)) {
          if (__propIsEnum$8.call(b, prop))
            __defNormalProp$8(a, prop, b[prop]);
        }
      return a;
    };
    var __spreadProps$4 = (a, b) => __defProps$4(a, __getOwnPropDescs$4(b));
    class HttpRequest {
      constructor(baseUrl, config) {
        this._queue = {};
        this._baseUrl = baseUrl;
        this._config = config;
      }
      async get(url, params, options = {}) {
        return this.fetch(__spreadProps$4(__spreadValues$8({}, options), { url, method: "GET", params }));
      }
      async post(url, data, options = {}) {
        return this.fetch(__spreadProps$4(__spreadValues$8({}, options), { url, method: "POST", data }));
      }
      async fetch(options) {
        const instance = axios__default["default"].create();
        const config = Object.assign(this.getInnerConfig(), options);
        if (options.isBuffer)
          config.responseType = "blob";
        this.interceptors(instance, options.url);
        const res = await instance.request(config);
        return res;
      }
      destroy(url) {
        delete this._queue[url];
      }
      getInnerConfig() {
        const config = {
          baseURL: this._baseUrl,
          withCredentials: true,
          method: "POST",
          timeout: 6e4,
          headers: {
            "Content-Type": "application/json"
          }
        };
        return config;
      }
      interceptors(instance, url) {
        instance.interceptors.request.use((config) => {
          var _a, _b;
          const beforeRequest = (_b = (_a = this._config) == null ? void 0 : _a.interceptors) == null ? void 0 : _b.beforeRequest;
          if (beforeRequest)
            return Promise.resolve().then(() => beforeRequest(config));
          return config;
        }, (error) => {
          var _a, _b;
          const requestError = (_b = (_a = this._config) == null ? void 0 : _a.interceptors) == null ? void 0 : _b.requestError;
          if (requestError)
            return Promise.resolve().then(() => requestError(error));
          return Promise.reject(error);
        });
        instance.interceptors.response.use((res) => {
          var _a, _b;
          const data = res && res.data;
          if (url)
            this.destroy(url);
          const afterResponse = (_b = (_a = this._config) == null ? void 0 : _a.interceptors) == null ? void 0 : _b.afterResponse;
          if (afterResponse)
            return Promise.resolve().then(() => afterResponse(res));
          return data;
        }, (error) => {
          var _a, _b;
          if (url)
            this.destroy(url);
          const responseError = (_b = (_a = this._config) == null ? void 0 : _a.interceptors) == null ? void 0 : _b.responseError;
          if (responseError)
            return Promise.resolve().then(() => responseError(error));
          const errorData = error && error.response;
          return Promise.reject(errorData);
        });
      }
    }

    function reloadUrl(url) {
      url = url || window.location.origin + window.location.hash;
      window.location.href = url;
    }
    function queryEl(el) {
      if (typeof el === "string") {
        const selected = document.querySelector(el);
        if (!selected) {
          vue.warn(`Cannot find element: ${el}`);
          return document.createElement("div");
        }
        return selected;
      } else {
        return el;
      }
    }

    var store2$1 = {exports: {}};

    /*! store2 - v2.13.1 - 2021-12-20
    * Copyright (c) 2021 Nathan Bubna; Licensed (MIT OR GPL-3.0) */

    (function (module) {
    ;(function(window, define) {
        var _ = {
            version: "2.13.1",
            areas: {},
            apis: {},

            // utilities
            inherit: function(api, o) {
                for (var p in api) {
                    if (!o.hasOwnProperty(p)) {
                        Object.defineProperty(o, p, Object.getOwnPropertyDescriptor(api, p));
                    }
                }
                return o;
            },
            stringify: function(d, fn) {
                return d === undefined || typeof d === "function" ? d+'' : JSON.stringify(d,fn||_.replace);
            },
            parse: function(s, fn) {
                // if it doesn't parse, return as is
                try{ return JSON.parse(s,fn||_.revive); }catch(e){ return s; }
            },

            // extension hooks
            fn: function(name, fn) {
                _.storeAPI[name] = fn;
                for (var api in _.apis) {
                    _.apis[api][name] = fn;
                }
            },
            get: function(area, key){ return area.getItem(key); },
            set: function(area, key, string){ area.setItem(key, string); },
            remove: function(area, key){ area.removeItem(key); },
            key: function(area, i){ return area.key(i); },
            length: function(area){ return area.length; },
            clear: function(area){ area.clear(); },

            // core functions
            Store: function(id, area, namespace) {
                var store = _.inherit(_.storeAPI, function(key, data, overwrite) {
                    if (arguments.length === 0){ return store.getAll(); }
                    if (typeof data === "function"){ return store.transact(key, data, overwrite); }// fn=data, alt=overwrite
                    if (data !== undefined){ return store.set(key, data, overwrite); }
                    if (typeof key === "string" || typeof key === "number"){ return store.get(key); }
                    if (typeof key === "function"){ return store.each(key); }
                    if (!key){ return store.clear(); }
                    return store.setAll(key, data);// overwrite=data, data=key
                });
                store._id = id;
                try {
                    var testKey = '__store2_test';
                    area.setItem(testKey, 'ok');
                    store._area = area;
                    area.removeItem(testKey);
                } catch (e) {
                    store._area = _.storage('fake');
                }
                store._ns = namespace || '';
                if (!_.areas[id]) {
                    _.areas[id] = store._area;
                }
                if (!_.apis[store._ns+store._id]) {
                    _.apis[store._ns+store._id] = store;
                }
                return store;
            },
            storeAPI: {
                // admin functions
                area: function(id, area) {
                    var store = this[id];
                    if (!store || !store.area) {
                        store = _.Store(id, area, this._ns);//new area-specific api in this namespace
                        if (!this[id]){ this[id] = store; }
                    }
                    return store;
                },
                namespace: function(namespace, singleArea) {
                    if (!namespace){
                        return this._ns ? this._ns.substring(0,this._ns.length-1) : '';
                    }
                    var ns = namespace, store = this[ns];
                    if (!store || !store.namespace) {
                        store = _.Store(this._id, this._area, this._ns+ns+'.');//new namespaced api
                        if (!this[ns]){ this[ns] = store; }
                        if (!singleArea) {
                            for (var name in _.areas) {
                                store.area(name, _.areas[name]);
                            }
                        }
                    }
                    return store;
                },
                isFake: function(force) {
                    if (force) {
                        this._real = this._area;
                        this._area = _.storage('fake');
                    } else if (force === false) {
                        this._area = this._real || this._area;
                    }
                    return this._area.name === 'fake';
                },
                toString: function() {
                    return 'store'+(this._ns?'.'+this.namespace():'')+'['+this._id+']';
                },

                // storage functions
                has: function(key) {
                    if (this._area.has) {
                        return this._area.has(this._in(key));//extension hook
                    }
                    return !!(this._in(key) in this._area);
                },
                size: function(){ return this.keys().length; },
                each: function(fn, fill) {// fill is used by keys(fillList) and getAll(fillList))
                    for (var i=0, m=_.length(this._area); i<m; i++) {
                        var key = this._out(_.key(this._area, i));
                        if (key !== undefined) {
                            if (fn.call(this, key, this.get(key), fill) === false) {
                                break;
                            }
                        }
                        if (m > _.length(this._area)) { m--; i--; }// in case of removeItem
                    }
                    return fill || this;
                },
                keys: function(fillList) {
                    return this.each(function(k, v, list){ list.push(k); }, fillList || []);
                },
                get: function(key, alt) {
                    var s = _.get(this._area, this._in(key)),
                        fn;
                    if (typeof alt === "function") {
                        fn = alt;
                        alt = null;
                    }
                    return s !== null ? _.parse(s, fn) :
                        alt != null ? alt : s;
                },
                getAll: function(fillObj) {
                    return this.each(function(k, v, all){ all[k] = v; }, fillObj || {});
                },
                transact: function(key, fn, alt) {
                    var val = this.get(key, alt),
                        ret = fn(val);
                    this.set(key, ret === undefined ? val : ret);
                    return this;
                },
                set: function(key, data, overwrite) {
                    var d = this.get(key),
                        replacer;
                    if (d != null && overwrite === false) {
                        return data;
                    }
                    if (typeof overwrite !== "boolean") {
                        replacer = overwrite;
                    }
                    return _.set(this._area, this._in(key), _.stringify(data, replacer)) || d;
                },
                setAll: function(data, overwrite) {
                    var changed, val;
                    for (var key in data) {
                        val = data[key];
                        if (this.set(key, val, overwrite) !== val) {
                            changed = true;
                        }
                    }
                    return changed;
                },
                add: function(key, data, replacer) {
                    var d = this.get(key);
                    if (d instanceof Array) {
                        data = d.concat(data);
                    } else if (d !== null) {
                        var type = typeof d;
                        if (type === typeof data && type === 'object') {
                            for (var k in data) {
                                d[k] = data[k];
                            }
                            data = d;
                        } else {
                            data = d + data;
                        }
                    }
                    _.set(this._area, this._in(key), _.stringify(data, replacer));
                    return data;
                },
                remove: function(key, alt) {
                    var d = this.get(key, alt);
                    _.remove(this._area, this._in(key));
                    return d;
                },
                clear: function() {
                    if (!this._ns) {
                        _.clear(this._area);
                    } else {
                        this.each(function(k){ _.remove(this._area, this._in(k)); }, 1);
                    }
                    return this;
                },
                clearAll: function() {
                    var area = this._area;
                    for (var id in _.areas) {
                        if (_.areas.hasOwnProperty(id)) {
                            this._area = _.areas[id];
                            this.clear();
                        }
                    }
                    this._area = area;
                    return this;
                },

                // internal use functions
                _in: function(k) {
                    if (typeof k !== "string"){ k = _.stringify(k); }
                    return this._ns ? this._ns + k : k;
                },
                _out: function(k) {
                    return this._ns ?
                        k && k.indexOf(this._ns) === 0 ?
                            k.substring(this._ns.length) :
                            undefined : // so each() knows to skip it
                        k;
                }
            },// end _.storeAPI
            storage: function(name) {
                return _.inherit(_.storageAPI, { items: {}, name: name });
            },
            storageAPI: {
                length: 0,
                has: function(k){ return this.items.hasOwnProperty(k); },
                key: function(i) {
                    var c = 0;
                    for (var k in this.items){
                        if (this.has(k) && i === c++) {
                            return k;
                        }
                    }
                },
                setItem: function(k, v) {
                    if (!this.has(k)) {
                        this.length++;
                    }
                    this.items[k] = v;
                },
                removeItem: function(k) {
                    if (this.has(k)) {
                        delete this.items[k];
                        this.length--;
                    }
                },
                getItem: function(k){ return this.has(k) ? this.items[k] : null; },
                clear: function(){ for (var k in this.items){ this.removeItem(k); } }
            }// end _.storageAPI
        };

        var store =
            // safely set this up (throws error in IE10/32bit mode for local files)
            _.Store("local", (function(){try{ return localStorage; }catch(e){}})());
        store.local = store;// for completeness
        store._ = _;// for extenders and debuggers...
        // safely setup store.session (throws exception in FF for file:/// urls)
        store.area("session", (function(){try{ return sessionStorage; }catch(e){}})());
        store.area("page", _.storage("page"));

        if (typeof define === 'function' && define.amd !== undefined) {
            define('store2', [], function () {
                return store;
            });
        } else if ('object' !== 'undefined' && module.exports) {
            module.exports = store;
        } else {
            // expose the primary store fn to the global object and save conflicts
            if (window.store){ _.conflict = window.store; }
            window.store = store;
        }

    })(commonjsGlobal, commonjsGlobal && commonjsGlobal.define);
    }(store2$1));

    var store2 = store2$1.exports;

    const storage = store2;

    let __config = {};
    const setConfig = (config) => {
      __config = Object.freeze(config);
    };
    const useConfig = (path, defaultValue) => {
      const cfg = lodash.get(__config, path, defaultValue);
      return cfg;
    };
    function useAppConfig(path, defaultValue) {
      const _path = path ? `.${path}` : "";
      return useConfig(`app${_path}`, defaultValue);
    }
    function useWidgetsConfig(path, defaultValue) {
      const _path = path ? `.${path}` : "";
      return useConfig(`widgets${_path}`, defaultValue);
    }
    function useComponentsConfig(path, defaultValue) {
      const _path = path ? `.${path}` : "";
      return useConfig(`components${_path}`, defaultValue);
    }
    function useApiRequest() {
      return useAppConfig("api.request");
    }
    const useEnv = (name) => {
      const section = name ? `env.${name}` : "env";
      return useConfig(section);
    };
    const useApis = () => {
      return useConfig("apis");
    };
    const useApi = (name) => {
      return useConfig(`apis.${name}`);
    };
    const useRescs = (path, defaultValue) => {
      const _path = path ? `.${path}` : "";
      return useConfig(`rescs${_path}`, defaultValue);
    };

    function getRefreshDuration() {
      const seconds = useConfig("app.auth.token.refreshDuration", TOKEN_REFRESH_DURATION);
      return seconds * 1e3;
    }
    let __tokenRefreshTimer = null;
    function checkStartAutoRefresh(flag = true) {
      const autoRefresh = useConfig("app.auth.token.autoRefresh");
      if (flag === false || autoRefresh) {
        __tokenRefreshTimer && clearTimeout(__tokenRefreshTimer);
      }
      if (autoRefresh) {
        const duration = getRefreshDuration();
        __tokenRefreshTimer = setInterval(refreshToken, duration);
      }
    }
    async function refreshToken(code) {
      const userApi = useApi("user");
      const requestTime = new Date().getTime();
      let tokenData = null;
      if (code) {
        if (userApi.getToken) {
          tokenData = await userApi.getToken(code);
        } else {
          tokenData = { accessToken: code };
        }
      } else {
        if (userApi.exchangeToken) {
          const refreshToken2 = getLocalRefreshToken();
          if (refreshToken2) {
            tokenData = await userApi.exchangeToken(refreshToken2);
          }
        }
      }
      if (tokenData) {
        tokenData.requestTime = requestTime;
        saveTokenData(tokenData);
      }
    }
    function resetToken() {
      const tokenData = getLocalTokenData();
      if (tokenData)
        saveTokenData(tokenData);
    }
    async function checkRefreshToken() {
      const tokenData = getTokenData();
      const requestTime = tokenData == null ? void 0 : tokenData.requestTime;
      if (!requestTime)
        return;
      if (new Date().getTime() - requestTime > getRefreshDuration()) {
        await refreshToken();
      }
    }
    function saveTokenData(tokenData) {
      if (!tokenData)
        return;
      storage.local.set(TOKEN_DATA_STORAGE_KEY, tokenData);
      storage.page.set(TOKEN_DATA_STORAGE_KEY, tokenData);
      checkStartAutoRefresh();
    }
    function clearTokenData() {
      storage.local.remove(TOKEN_DATA_STORAGE_KEY);
      storage.page.remove(TOKEN_DATA_STORAGE_KEY);
      checkStartAutoRefresh(false);
    }
    function getTokenData() {
      return storage.page.get(TOKEN_DATA_STORAGE_KEY);
    }
    function getAccessToken() {
      const tokenData = getTokenData();
      return tokenData == null ? void 0 : tokenData.accessToken;
    }
    function getLocalTokenData() {
      return storage.local.get(TOKEN_DATA_STORAGE_KEY);
    }
    function getLocalRefreshToken() {
      const tokenData = getLocalTokenData();
      return tokenData == null ? void 0 : tokenData.refreshToken;
    }

    function mitt(n){return {all:n=n||new Map,on:function(t,e){var i=n.get(t);i?i.push(e):n.set(t,[e]);},off:function(t,e){var i=n.get(t);i&&(e?i.splice(i.indexOf(e)>>>0,1):n.set(t,[]));},emit:function(t,e){var i=n.get(t);i&&i.slice().map(function(n){n(e);}),(i=n.get("*"))&&i.slice().map(function(n){n(t,e);});}}}

    class Emitter {
      constructor() {
        this._emitter = mitt();
      }
      get all() {
        return this._emitter.all;
      }
      get on() {
        return this._emitter.on;
      }
      get off() {
        return this._emitter.off;
      }
      get emit() {
        return this._emitter.emit;
      }
      ons(keys, handler) {
        if (typeof keys === "string")
          keys = [keys];
        if (!Array.isArray(keys) || !handler)
          return;
        keys.forEach((key) => {
          this.on(key, handler);
        });
      }
      offs(keys, handler) {
        if (typeof keys === "string")
          keys = [keys];
        if (!Array.isArray(keys) || !handler)
          return;
        keys.forEach((key) => {
          this.off(key, handler);
        });
      }
      emits(keys, payload) {
        if (typeof keys === "string")
          keys = [keys];
        if (!Array.isArray(keys))
          return;
        keys.forEach((key) => {
          this.emit(key, payload);
        });
      }
    }
    const emitter = new Emitter();

    function renderHtml(options, context = {}) {
      if (options && typeof options === "string")
        return filter(options, context);
      if (!options)
        return void 0;
      if ((options == null ? void 0 : options.visibleOn) && !evalExpression(options == null ? void 0 : options.visibleOn, context))
        return void 0;
      if (!options.tag && options.type)
        return renderCmpt(options, context);
      const props = deepFilter(options.props, context);
      const children = (options.children || []).map((it2) => {
        return renderHtml(it2, context);
      });
      return vue.h(options.tag, props, children);
    }
    function renderCmpt(options, context = {}) {
      if (options && typeof options === "string")
        return filter(options, context);
      if (!options)
        return void 0;
      if (options.visibleOn && !evalExpression(options == null ? void 0 : options.visibleOn, context))
        return void 0;
      if (!options.type && options.tag)
        return renderHtml(options, context);
      const cmpt = vue.resolveComponent(options.type);
      if (!cmpt)
        return void 0;
      const props = deepFilter(options.props, context);
      const children = {};
      if (options.children) {
        children.default = () => {
          return (options.children || []).map((it2) => {
            return renderCmpt(it2, context);
          });
        };
      }
      if (options.slots) {
        Object.keys(options.slots).forEach((key) => {
          const slot = options.slots[key];
          children[key] = () => {
            if (!slot)
              return void 0;
            if (Array.isArray(slot)) {
              return slot.map((it2) => renderCmpt(it2, context));
            } else {
              return renderCmpt(it, context);
            }
          };
        });
      }
      return vue.h(cmpt, props, children);
    }

    var __defProp$7 = Object.defineProperty;
    var __defProps$3 = Object.defineProperties;
    var __getOwnPropDescs$3 = Object.getOwnPropertyDescriptors;
    var __getOwnPropSymbols$7 = Object.getOwnPropertySymbols;
    var __hasOwnProp$7 = Object.prototype.hasOwnProperty;
    var __propIsEnum$7 = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$7 = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$7.call(b, prop))
          __defNormalProp$7(a, prop, b[prop]);
      if (__getOwnPropSymbols$7)
        for (var prop of __getOwnPropSymbols$7(b)) {
          if (__propIsEnum$7.call(b, prop))
            __defNormalProp$7(a, prop, b[prop]);
        }
      return a;
    };
    var __spreadProps$3 = (a, b) => __defProps$3(a, __getOwnPropDescs$3(b));
    function mapTree(tree, iterator, level = 1, depthFirst = false, paths = []) {
      return tree.map((item, index) => {
        if (depthFirst) {
          const children = item.children ? mapTree(item.children, iterator, level + 1, depthFirst, paths.concat(item)) : void 0;
          children && (item = __spreadProps$3(__spreadValues$7({}, item), { children }));
          item = iterator(item, index, level, paths) || __spreadValues$7({}, item);
          return item;
        }
        item = iterator(item, index, level, paths) || __spreadValues$7({}, item);
        if (item.children && item.children.splice) {
          item.children = mapTree(item.children, iterator, level + 1, depthFirst, paths.concat(item));
        }
        return item;
      });
    }
    function eachTree(tree, iterator, level = 1, parent) {
      tree.forEach((item, index) => {
        iterator(item, index, level, parent);
        if (item.children && item.children.splice) {
          eachTree(item.children, iterator, level + 1, item);
        }
      });
    }
    function findTree(tree, iterator) {
      let result = null;
      everyTree(tree, (item, key, level, paths) => {
        if (iterator(item, key, level, paths)) {
          result = item;
          return false;
        }
        return true;
      });
      return result;
    }
    function findTreeIndex(tree, iterator) {
      let idx = [];
      findTree(tree, (item, index, level, paths) => {
        if (iterator(item, index, level, paths)) {
          idx = [index];
          paths = paths.concat();
          paths.unshift({
            children: tree
          });
          for (let i = paths.length - 1; i > 0; i--) {
            const prev = paths[i - 1];
            const current = paths[i];
            idx.unshift(prev.children.indexOf(current));
          }
          return true;
        }
        return false;
      });
      return idx.length ? idx : void 0;
    }
    function getTree(tree, idx) {
      const indexes = Array.isArray(idx) ? idx.concat() : [idx];
      const lastIndex = indexes.pop();
      let list = tree;
      for (let i = 0, len = indexes.length; i < len; i++) {
        const index = indexes[i];
        if (!list[index]) {
          list = null;
          break;
        }
        list = list[index].children;
      }
      return list ? list[lastIndex] : void 0;
    }
    function filterTree(tree, iterator, level = 1, depthFirst = false) {
      if (depthFirst) {
        return tree.map((item) => {
          const children = item.children ? filterTree(item.children, iterator, level + 1, depthFirst) : void 0;
          if (Array.isArray(children) && Array.isArray(item.children) && children.length !== item.children.length) {
            item = __spreadProps$3(__spreadValues$7({}, item), { children });
          }
          return item;
        }).filter((item, index) => iterator(item, index, level));
      }
      return tree.filter((item, index) => iterator(item, index, level)).map((item) => {
        if (item.children && item.children.splice) {
          const children = filterTree(item.children, iterator, level + 1, depthFirst);
          if (Array.isArray(children) && Array.isArray(item.children) && children.length !== item.children.length) {
            item = __spreadProps$3(__spreadValues$7({}, item), { children });
          }
        }
        return item;
      });
    }
    function everyTree(tree, iterator, level = 1, paths = [], indexes = []) {
      return tree.every((item, index) => {
        const value = iterator(item, index, level, paths, indexes);
        if (value && item.children && item.children.splice) {
          return everyTree(item.children, iterator, level + 1, paths.concat(item), indexes.concat(index));
        }
        return value;
      });
    }
    function someTree(tree, iterator) {
      let result = false;
      everyTree(tree, (item, key, level, paths) => {
        if (iterator(item, key, level, paths)) {
          result = true;
          return false;
        }
        return true;
      });
      return result;
    }
    function flattenTree(tree, mapper) {
      let flattened = [];
      eachTree(tree, (item, index) => flattened.push(mapper ? mapper(item, index) : item));
      return flattened;
    }
    function spliceTree(tree, idx, deleteCount = 0, ...items) {
      const list = tree.concat();
      if (typeof idx === "number") {
        list.splice(idx, deleteCount, ...items);
      } else if (Array.isArray(idx) && idx.length) {
        idx = idx.concat();
        const lastIdx = idx.pop();
        let host = idx.reduce((list2, idx2) => {
          const child = __spreadProps$3(__spreadValues$7({}, list2[idx2]), {
            children: list2[idx2].children ? list2[idx2].children.concat() : []
          });
          list2[idx2] = child;
          return child.children;
        }, list);
        host.splice(lastIdx, deleteCount, ...items);
      }
      return list;
    }
    function getTreeDepth(tree) {
      return Math.max(...tree.map((item) => {
        if (Array.isArray(item.children)) {
          return 1 + getTreeDepth(item.children);
        }
        return 1;
      }));
    }
    function getTreeAncestors(tree, value, includeSelf = false) {
      let ancestors = null;
      findTree(tree, (item, index, level, paths) => {
        if (item === value) {
          ancestors = paths;
          if (includeSelf) {
            ancestors.push(item);
          }
          return true;
        }
        return false;
      });
      return ancestors;
    }
    function getTreeParent(tree, value) {
      const ancestors = getTreeAncestors(tree, value);
      return (ancestors == null ? void 0 : ancestors.length) ? ancestors[ancestors.length - 1] : null;
    }

    class Observable {
      constructor(subscribeAction) {
        this._subscribeAction = subscribeAction;
      }
      subscribe(oOrOnNext, onError, onCompleted) {
        const observer = new Observer(oOrOnNext, onError, onCompleted);
        const result = this._subscribeAction(observer);
        return new Subscription(observer, result);
      }
    }
    class Observer {
      constructor(onNext, onError, onCompleted) {
        this._isStopped = false;
        if (typeof onNext === "object") {
          this._onNext = onNext.next;
          this._onError = onNext.error;
          this._onCompleted = onNext.complete;
        } else {
          this._onNext = onNext;
          this._onError = onError;
          this._onCompleted = onCompleted;
        }
      }
      get isStopped() {
        return this._isStopped;
      }
      next(value) {
        if (!this.isStopped && this._onNext) {
          this._onNext(value);
        }
      }
      stop() {
        this._isStopped = true;
      }
      error(err) {
        if (!this.isStopped && this._onError) {
          this._isStopped = true;
          this._onError(err);
        }
      }
      complete(res) {
        if (!this.isStopped && this._onCompleted) {
          this._isStopped = true;
          this._onCompleted(res);
        }
      }
    }
    class Subscription {
      constructor(observer, result) {
        this._observer = observer;
        this._result = result;
      }
      unsubscribe() {
        this._observer.stop();
        this._result();
      }
    }

    var observable = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Observable: Observable,
        Observer: Observer,
        Subscription: Subscription
    });

    function resolveRadixCountReg(radix) {
      return !radix ? "*" : `{${radix.from || "1"},${radix.to || ""}}`;
    }
    function isNumeric(s) {
      return /^\-?(?:[1-9]\d*|0)(?:\.\d+)?$/.test(s);
    }
    function isDecimal(s, radix) {
      const regex = `^[-+]?(?:0|[1-9]\\d*)\\.\\d${resolveRadixCountReg(radix)}$`;
      return new RegExp(regex).test(s);
    }
    function isNegativeDecimal(s, radix) {
      const regex = `^\\-?(?:0|[1-9]\\d*)\\.\\d${resolveRadixCountReg(radix)}$`;
      return new RegExp(regex).test(s);
    }
    function isPositiveDecimal(s, radix) {
      const regex = `^\\+?(?:0|[1-9]\\d*)\\.\\d${resolveRadixCountReg(radix)}$`;
      return new RegExp(regex).test(s);
    }
    function isInteger(s) {
      return /^[-+]?(?:0|[1-9]\d*)$/.test(s);
    }
    function isPositiveInteger(s) {
      return /^\+?(?:0|[1-9]\d*)$/.test(s);
    }
    function isNegativeInteger(s) {
      return /^\-?(?:0|[1-9]\d*)$/.test(s);
    }
    function isMobile(s) {
      return /^1[3-9][0-9]\d{8}$/.test(s);
    }
    function isEmail(s) {
      return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(s);
    }
    function isIdCardNo(s) {
      return /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(s);
    }

    var validator = /*#__PURE__*/Object.freeze({
        __proto__: null,
        resolveRadixCountReg: resolveRadixCountReg,
        isNumeric: isNumeric,
        isDecimal: isDecimal,
        isNegativeDecimal: isNegativeDecimal,
        isPositiveDecimal: isPositiveDecimal,
        isInteger: isInteger,
        isPositiveInteger: isPositiveInteger,
        isNegativeInteger: isNegativeInteger,
        isMobile: isMobile,
        isEmail: isEmail,
        isIdCardNo: isIdCardNo
    });

    const b = /^(b|B)$/, symbol = {
      iec: {
        bits: ["b", "Kib", "Mib", "Gib", "Tib", "Pib", "Eib", "Zib", "Yib"],
        bytes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
      },
      jedec: {
        bits: ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"],
        bytes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
      }
    }, fullform = {
      iec: ["", "kibi", "mebi", "gibi", "tebi", "pebi", "exbi", "zebi", "yobi"],
      jedec: ["", "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta"]
    };
    function filesize(arg, descriptor = {}) {
      if (isNaN(arg)) {
        throw new TypeError("Invalid number");
      }
      const result = [];
      let val = 0;
      let e = descriptor.exponent !== void 0 ? descriptor.exponent : -1;
      const base = descriptor.base || 2;
      const bits = descriptor.bits === true;
      const ceil = base > 2 ? 1e3 : 1024;
      const full = descriptor.fullform === true;
      const fullforms = descriptor.fullforms instanceof Array ? descriptor.fullforms : [];
      const locale = descriptor.locale !== void 0 ? descriptor.locale : "";
      const localeOptions = descriptor.localeOptions || {};
      let num = Number(arg);
      const neg = num < 0;
      const output = descriptor.output || "string";
      const unix = descriptor.unix === true;
      const round = descriptor.round !== void 0 ? descriptor.round : unix ? 1 : 2;
      const separator = descriptor.separator !== void 0 ? descriptor.separator : "";
      const spacer = descriptor.spacer !== void 0 ? descriptor.spacer : unix ? "" : " ";
      const standard = base === 2 ? descriptor.standard || "jedec" : "jedec";
      const symbols = descriptor.symbols || {};
      if (neg) {
        num = -num;
      }
      if (e === -1 || isNaN(e)) {
        e = Math.floor(Math.log(num) / Math.log(ceil));
        if (e < 0) {
          e = 0;
        }
      }
      if (e > 8) {
        e = 8;
      }
      if (output === "exponent") {
        return e;
      }
      if (num === 0) {
        result[0] = 0;
        result[1] = unix ? "" : symbol[standard][bits ? "bits" : "bytes"][e];
      } else {
        val = num / (base === 2 ? Math.pow(2, e * 10) : Math.pow(1e3, e));
        if (bits) {
          val = val * 8;
          if (val >= ceil && e < 8) {
            val = val / ceil;
            e++;
          }
        }
        result[0] = Number(val.toFixed(e > 0 ? round : 0));
        if (result[0] === ceil && e < 8 && descriptor.exponent === void 0) {
          result[0] = 1;
          e++;
        }
        result[1] = base === 10 && e === 1 ? bits ? "kb" : "kB" : symbol[standard][bits ? "bits" : "bytes"][e];
        if (unix) {
          result[1] = standard === "jedec" ? result[1].charAt(0) : e > 0 ? result[1].replace(/B$/, "") : result[1];
          if (b.test(result[1])) {
            result[0] = Math.floor(result[0]);
            result[1] = "";
          }
        }
      }
      if (neg) {
        result[0] = -result[0];
      }
      result[1] = symbols[result[1]] || result[1];
      if (locale === true) {
        result[0] = result[0].toLocaleString();
      } else if (locale && locale.length > 0) {
        result[0] = result[0].toLocaleString(locale, localeOptions);
      } else if (separator.length > 0) {
        result[0] = result[0].toString().replace(".", separator);
      }
      if (output === "array") {
        return result;
      }
      if (full) {
        result[1] = fullforms[e] ? fullforms[e] : fullform[standard][e] + (bits ? "bit" : "byte") + (result[0] === 1 ? "" : "s");
      }
      if (output === "object") {
        return { value: result[0], symbol: result[1], exponent: e };
      }
      return result.join(spacer);
    }
    filesize.partial = (opt) => (arg) => filesize(arg, opt);

    const size = filesize;
    async function read(file, options) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
          if (!e.target) {
            reject("\u8BFB\u53D6\u6570\u636E\u9519\u8BEF");
          } else {
            resolve(e.target.result);
          }
        };
        switch (options.readAs) {
          case "dataUrl":
            reader.readAsDataURL(file);
            break;
          case "binaryString":
            reader.readAsBinaryString(file);
            break;
          case "text":
            reader.readAsText(file, options.encoding);
            break;
          case "arrayBuffer":
            reader.readAsArrayBuffer(file);
            break;
          default:
            reject("\u65E0\u6548\u8BFB\u53D6\u53C2\u6570");
        }
      });
    }
    function parseFileName(fullpath) {
      if (!fullpath) {
        return {
          name: "",
          fpath: "",
          fname: "",
          fullname: "",
          fullpath: "",
          postfix: "",
          ext: ""
        };
      }
      const extIndex = fullpath.lastIndexOf(".");
      let ext = "";
      let nakepath = fullpath;
      if (extIndex >= 0) {
        ext = fullpath.slice(extIndex + 1);
        nakepath = fullpath.slice(0, extIndex);
      }
      let fpath = "";
      let name = nakepath;
      let fullname = fullpath;
      const pathIndex = nakepath.lastIndexOf("/");
      if (pathIndex >= 0) {
        fpath = nakepath.slice(0, pathIndex);
        name = nakepath.slice(pathIndex + 1);
        fullname = fullpath.slice(pathIndex + 1);
      }
      const postfixIndex = fullname.lastIndexOf("__");
      let postfix = "";
      let fname = fullname;
      if (postfixIndex > 0) {
        postfix = fullname.slice(postfixIndex + 2);
        name = fullname.slice(0, postfixIndex);
        if (ext) {
          fname = `${name}.${ext}`;
        }
      }
      return {
        name,
        fpath,
        fname,
        fullname,
        fullpath,
        postfix,
        ext
      };
    }
    function getFileMimeType(filename) {
      const { ext } = parseFileName(filename);
      let filetype = void 0;
      switch (ext) {
        case "xls":
        case "xlsx":
          filetype = "application/ms-excel";
          break;
      }
      return filetype;
    }
    async function getFileUrls(names) {
      const fsApi = useApi("fs");
      const urls = await fsApi.getFileUrls(names);
      return urls;
    }
    async function getUrlByPath(name) {
      const urls = await getFileUrls([name]);
      return urls[0];
    }
    async function deleteFile(name) {
      const fsApi = useApi("fs");
      if (!name || !fsApi.deleteFile)
        return false;
      return fsApi.deleteFile(name);
    }
    async function download(url, options) {
      options = Object.assign({}, options);
      let filetype = options.filetype;
      let filename = options.filename;
      if (!filename) {
        const lastPathIndex = url.lastIndexOf("/");
        if (lastPathIndex < 0) {
          filename = url;
        } else {
          filename = url.substring(lastPathIndex + 1);
        }
      }
      let { ext } = parseFileName(filename);
      if (!filetype) {
        filetype = getFileMimeType(filename);
      }
      const res = await axios__default["default"].get(url, {
        headers: {
          "Content-Type": "application/json"
        },
        responseType: "blob"
      });
      if (res && res.status == 200) {
        if (res.data && res.data.type) {
          if (res.data.type === "image/jpeg" && ext !== "jpg" && ext !== "jpeg") {
            filename += ".jpeg";
          }
          filetype = res.data.type;
        }
        let blob = new Blob([res.data], { type: filetype });
        let downloadElement = document.createElement("a");
        let href = window.URL.createObjectURL(blob);
        downloadElement.href = href;
        downloadElement.download = decodeURIComponent(filename);
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);
        window.URL.revokeObjectURL(href);
        return;
      }
    }

    var file = /*#__PURE__*/Object.freeze({
        __proto__: null,
        size: size,
        read: read,
        parseFileName: parseFileName,
        getFileMimeType: getFileMimeType,
        getFileUrls: getFileUrls,
        getUrlByPath: getUrlByPath,
        deleteFile: deleteFile,
        download: download
    });

    var dayjs_min = {exports: {}};

    (function (module, exports) {
    !function(t,e){"object"=='object'&&"undefined"!='object'?module.exports=e():"function"==typeof undefined&&undefined.amd?undefined(e):(t="undefined"!=typeof globalThis?globalThis:t||self).dayjs=e();}(commonjsGlobal,(function(){"use strict";var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",f="month",h="quarter",c="year",d="date",$="Invalid Date",l=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},m=function(t,e,n){var r=String(t);return !r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},g={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return (e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return -t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,f),s=n-i<0,u=e.clone().add(r+(s?-1:1),f);return +(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return {M:f,y:c,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:h}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},D="en",v={};v[D]=M;var p=function(t){return t instanceof _},S=function(t,e,n){var r;if(!t)return D;if("string"==typeof t)v[t]&&(r=t),e&&(v[t]=e,r=t);else {var i=t.name;v[i]=t,r=i;}return !n&&r&&(D=r),r||!n&&D},w=function(t,e){if(p(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},O=g;O.l=S,O.i=p,O.w=function(t,e){return w(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=S(t.locale,null,!0),this.parse(t);}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(O.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(l);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.$x=t.x||{},this.init();},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},m.$utils=function(){return O},m.isValid=function(){return !(this.$d.toString()===$)},m.isSame=function(t,e){var n=w(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return w(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<w(t)},m.$g=function(t,e,n){return O.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!O.u(e)||e,h=O.p(t),$=function(t,e){var i=O.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},l=function(t,e){return O.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,g="set"+(this.$u?"UTC":"");switch(h){case c:return r?$(1,0):$(31,11);case f:return r?$(1,M):$(0,M+1);case o:var D=this.$locale().weekStart||0,v=(y<D?y+7:y)-D;return $(r?m-v:m+(6-v),M);case a:case d:return l(g+"Hours",0);case u:return l(g+"Minutes",1);case s:return l(g+"Seconds",2);case i:return l(g+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,o=O.p(t),h="set"+(this.$u?"UTC":""),$=(n={},n[a]=h+"Date",n[d]=h+"Date",n[f]=h+"Month",n[c]=h+"FullYear",n[u]=h+"Hours",n[s]=h+"Minutes",n[i]=h+"Seconds",n[r]=h+"Milliseconds",n)[o],l=o===a?this.$D+(e-this.$W):e;if(o===f||o===c){var y=this.clone().set(d,1);y.$d[$](l),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d;}else $&&this.$d[$](l);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[O.p(t)]()},m.add=function(r,h){var d,$=this;r=Number(r);var l=O.p(h),y=function(t){var e=w($);return O.w(e.date(e.date()+Math.round(t*r)),$)};if(l===f)return this.set(f,this.$M+r);if(l===c)return this.set(c,this.$y+r);if(l===a)return y(1);if(l===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[l]||1,m=this.$d.getTime()+r*M;return O.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||$;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=O.z(this),s=this.$H,u=this.$m,a=this.$M,o=n.weekdays,f=n.months,h=function(t,n,i,s){return t&&(t[n]||t(e,r))||i[n].substr(0,s)},c=function(t){return O.s(s%12||12,t,"0")},d=n.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:O.s(a+1,2,"0"),MMM:h(n.monthsShort,a,f,3),MMMM:h(f,a),D:this.$D,DD:O.s(this.$D,2,"0"),d:String(this.$W),dd:h(n.weekdaysMin,this.$W,o,2),ddd:h(n.weekdaysShort,this.$W,o,3),dddd:o[this.$W],H:String(s),HH:O.s(s,2,"0"),h:c(1),hh:c(2),a:d(s,u,!0),A:d(s,u,!1),m:String(u),mm:O.s(u,2,"0"),s:String(this.$s),ss:O.s(this.$s,2,"0"),SSS:O.s(this.$ms,3,"0"),Z:i};return r.replace(y,(function(t,e){return e||l[t]||i.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,$){var l,y=O.p(d),M=w(r),m=(M.utcOffset()-this.utcOffset())*e,g=this-M,D=O.m(this,M);return D=(l={},l[c]=D/12,l[f]=D,l[h]=D/3,l[o]=(g-m)/6048e5,l[a]=(g-m)/864e5,l[u]=g/n,l[s]=g/e,l[i]=g/t,l)[y]||g,$?D:O.a(D)},m.daysInMonth=function(){return this.endOf(f).$D},m.$locale=function(){return v[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=S(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return O.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),b=_.prototype;return w.prototype=b,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",f],["$y",c],["$D",d]].forEach((function(t){b[t[1]]=function(e){return this.$g(e,t[0],t[1])};})),w.extend=function(t,e){return t.$i||(t(e,_,w),t.$i=!0),w},w.locale=S,w.isDayjs=p,w.unix=function(t){return w(1e3*t)},w.en=v[D],w.Ls=v,w.p={},w}));
    }(dayjs_min, dayjs_min.exports));

    var dayjs = dayjs_min.exports;

    var zhCn$1 = {exports: {}};

    (function (module, exports) {
    !function(e,_){"object"=='object'&&"undefined"!='object'?module.exports=_(dayjs_min.exports):"function"==typeof undefined&&undefined.amd?undefined(["dayjs"],_):(e="undefined"!=typeof globalThis?globalThis:e||self).dayjs_locale_zh_cn=_(e.dayjs);}(commonjsGlobal,(function(e){"use strict";function _(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var t=_(e),d={name:"zh-cn",weekdays:"星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),weekdaysShort:"周日_周一_周二_周三_周四_周五_周六".split("_"),weekdaysMin:"日_一_二_三_四_五_六".split("_"),months:"一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),ordinal:function(e,_){return "W"===_?e+"周":e+"日"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY/MM/DD",LL:"YYYY年M月D日",LLL:"YYYY年M月D日Ah点mm分",LLLL:"YYYY年M月D日ddddAh点mm分",l:"YYYY/M/D",ll:"YYYY年M月D日",lll:"YYYY年M月D日 HH:mm",llll:"YYYY年M月D日dddd HH:mm"},relativeTime:{future:"%s内",past:"%s前",s:"几秒",m:"1 分钟",mm:"%d 分钟",h:"1 小时",hh:"%d 小时",d:"1 天",dd:"%d 天",M:"1 个月",MM:"%d 个月",y:"1 年",yy:"%d 年"},meridiem:function(e,_){var t=100*e+_;return t<600?"凌晨":t<900?"早上":t<1100?"上午":t<1300?"中午":t<1800?"下午":"晚上"}};return t.default.locale(d,null,!0),d}));
    }(zhCn$1, zhCn$1.exports));

    var zhCn = zhCn$1.exports;

    const MILLISECONDS_IN_DAY = 864e5;
    function format(dateVal, template) {
      template = template || "full";
      if (template === "simple" || template === "full_simple") {
        return simpleFormat(dateVal, template === "full_simple");
      }
      if (template === "date") {
        template = "YYYY-MM-DD";
      } else if (template === "normal") {
        template = "YYYY-MM-DD HH:mm";
      } else if (template === "full" || template === "datetime") {
        template = "YYYY-MM-DD HH:mm:ss";
      }
      const dateStr = dayjs(dateVal).format(template);
      return dateStr;
    }
    function simpleFormat(dateVal, withTime) {
      if (dateVal === void 0) {
        return "";
      }
      const d = new Date(dateVal);
      if (!d)
        return "";
      const nowDate = +new Date();
      const dateDiff = Math.floor((nowDate - d.valueOf()) / MILLISECONDS_IN_DAY);
      if (withTime === void 0 && dateDiff < 3) {
        withTime = true;
      }
      let t = "YYYY\u5E74MM\u6708DD\u65E5";
      if (withTime) {
        t = "YYYY\u5E74MM\u6708DD\u65E5 HH\u65F6mm";
      }
      if (dateDiff < 180) {
        t = "MM\u6708DD\u65E5";
        if (withTime) {
          t = "MM\u6708DD\u65E5 HH\u65F6mm";
        }
      }
      const dateStr = format(dateVal, t);
      if (dateStr === "Invalid Date")
        return "";
      return dateStr;
    }
    function parse(str, format2, locale, strict) {
      if (!str) {
        return new Date("");
      }
      const date = dayjs(str, format2, locale, strict).toDate();
      return date;
    }
    function addYears(dateVal, years) {
      return dayjs(dateVal).add(years, "y").toDate();
    }
    function addMonths(dateVal, months) {
      return dayjs(dateVal).add(months, "m").toDate();
    }
    function addDays(dateVal, days) {
      return dayjs(dateVal).add(days, "d").toDate();
    }
    function addHours(dateVal, hours) {
      return dayjs(dateVal).add(hours, "h").toDate();
    }
    function addMinutes(dateVal, minutes) {
      return dayjs(dateVal).add(minutes, "m").toDate();
    }
    function addSeconds(dateVal, seconds) {
      return dayjs(dateVal).add(seconds, "s").toDate();
    }
    function addMilliSeconds(dateVal, milliSeconds) {
      return dayjs(dateVal).add(milliSeconds, "ms").toDate();
    }
    function diff(formDate, toDate, unit) {
      return dayjs(formDate).diff(toDate, unit);
    }
    function isValid(date) {
      return !!date.getTime() && !isNaN(date.getTime());
    }

    var date = /*#__PURE__*/Object.freeze({
        __proto__: null,
        format: format,
        simpleFormat: simpleFormat,
        parse: parse,
        addYears: addYears,
        addMonths: addMonths,
        addDays: addDays,
        addHours: addHours,
        addMinutes: addMinutes,
        addSeconds: addSeconds,
        addMilliSeconds: addMilliSeconds,
        diff: diff,
        isValid: isValid
    });

    var __defProp$6 = Object.defineProperty;
    var __getOwnPropSymbols$6 = Object.getOwnPropertySymbols;
    var __hasOwnProp$6 = Object.prototype.hasOwnProperty;
    var __propIsEnum$6 = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$6 = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$6.call(b, prop))
          __defNormalProp$6(a, prop, b[prop]);
      if (__getOwnPropSymbols$6)
        for (var prop of __getOwnPropSymbols$6(b)) {
          if (__propIsEnum$6.call(b, prop))
            __defNormalProp$6(a, prop, b[prop]);
        }
      return a;
    };
    const Widget = vue.defineComponent({
      name: "Widget",
      props: {
        schema: {
          type: Object,
          default: () => ({})
        }
      },
      setup(props) {
        const schema = vue.ref(props.schema);
        function resolveWidget(type) {
          let wType = type;
          if (type && !type.startsWith("w-")) {
            wType = `w-${type}`;
          }
          const c = vue.resolveComponent(wType);
          return c;
        }
        function renderWidgets(ss) {
          if (Array.isArray(ss)) {
            const ws = ss.map((s) => {
              return renderWidget(s);
            });
            return ws;
          }
          return renderWidget(ss);
        }
        function renderWidget(s) {
          if (typeof s === "string") {
            s = {
              type: "html",
              html: s
            };
          }
          const w = resolveWidget(s.type);
          let bodyChild = null;
          if (s.body) {
            bodyChild = renderWidgets(s.body);
          }
          const childKeys = Object.keys(s).filter((key) => {
            return s[key] && s[key].type && typeof s[key].type === "string";
          });
          const children = childKeys.reduce((target, key) => {
            target[key] = () => renderWidgets(s[key]);
            return target;
          }, {});
          return vue.h(w, { schema: s }, __spreadValues$6({
            default: () => bodyChild
          }, children));
        }
        return () => renderWidgets(schema.value);
      }
    });

    const Entry = vue.defineComponent({
      name: "Entry",
      components: { Widget },
      props: {
        schema: {
          type: Object,
          default: () => ({})
        }
      },
      setup(props) {
        return () => {
          return vue.h("div", {
            class: {
              "w-entry": true
            }
          }, vue.h(Widget, { schema: props.schema }));
        };
      }
    });

    var entryMap = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Entry: Entry,
        Widget: Widget
    });

    var __defProp$5 = Object.defineProperty;
    var __getOwnPropSymbols$5 = Object.getOwnPropertySymbols;
    var __hasOwnProp$5 = Object.prototype.hasOwnProperty;
    var __propIsEnum$5 = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$5 = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$5.call(b, prop))
          __defNormalProp$5(a, prop, b[prop]);
      if (__getOwnPropSymbols$5)
        for (var prop of __getOwnPropSymbols$5(b)) {
          if (__propIsEnum$5.call(b, prop))
            __defNormalProp$5(a, prop, b[prop]);
        }
      return a;
    };
    class AppRenderer {
      constructor(options) {
        this._pages = {};
        this._options = options;
      }
      get options() {
        return this._options;
      }
      async render(options) {
        const app = App.instance;
        await app.store.dispatch("pages/addTemp", __spreadValues$5({
          teleportTo: options.el
        }, options));
        app.router.push(options.path);
        return this;
      }
    }

    const _App = class {
      constructor(options) {
        this._widgets = [];
        this._plugins = [];
        this._options = options;
        if (options.el) {
          this._el = queryEl(options.el);
        }
        this._renderer = new AppRenderer({});
      }
      static initialize(options) {
        _App.__instance = new _App(options);
        return _App.__instance;
      }
      static get instance() {
        return _App.__instance;
      }
      get ui() {
        return this._options.ui;
      }
      get schema() {
        return this._options.schema;
      }
      get store() {
        return this._options.store;
      }
      get router() {
        return this._options.router;
      }
      get plugins() {
        return this._plugins;
      }
      get widgets() {
        return this._widgets;
      }
      get vueApp() {
        return this._vueApp;
      }
      use(plugin, ...options) {
        const vueApp = this.vueApp;
        if (!vueApp) {
          vue.warn("\u8BF7\u5148\u6267\u884C\u5B9E\u4F8B\u5316\u518D\u52A0\u8F7D\u63D2\u4EF6\u3002");
          return this;
        }
        vueApp.use(plugin, ...options);
        return this;
      }
      async start() {
        const { ui, schema } = this;
        const vueApp = vue.createApp(ui.root, { schema });
        this._vueApp = vueApp;
        vueApp.use(this.store);
        return this;
      }
      mount(el) {
        const vueApp = this.vueApp;
        if (!vueApp) {
          vue.warn("\u8BF7\u5148\u6267\u884C\u5B9E\u4F8B\u5316\u518D\u52A0\u8F7D\u3002");
          return this;
        }
        const mountEl = el || this._el;
        vueApp.mount(mountEl);
        return this;
      }
      unmount() {
        const vueApp = this.vueApp;
        if (!vueApp) {
          vue.warn("\u5E94\u7528\u672A\u5B9E\u4F8B\u5316\u3002");
          return this;
        }
        this.vueApp.unmount();
        this._vueApp = void 0;
      }
      async render(options) {
        return _App.instance._renderer.render(options);
      }
      async apply(plugins, ...options) {
        const existsNames = this.plugins.map((p) => p.name);
        let pItems = [];
        if (Array.isArray(plugins)) {
          pItems = plugins;
        } else {
          pItems = [plugins];
        }
        for (const p of pItems) {
          if (p.name) {
            if (existsNames.includes(p.name)) {
              vue.warn(`\u63D2\u4EF6${p.name}\u5DF2\u5E94\u7528\uFF0C\u65E0\u6CD5\u91CD\u590D\u5E94\u7528\u3002`);
            } else {
              if (p.install) {
                await p.install(this, ...options);
              }
              this.plugins.push(p);
            }
          } else {
            throw new Error("\u8BF7\u63D0\u4F9B\u63D2\u4EF6\u540D\u79F0\u3002");
          }
        }
      }
      async register(widgets) {
        const vueApp = this.vueApp;
        if (!vueApp) {
          vue.warn("\u8BF7\u5148\u6267\u884C\u5B9E\u4F8B\u5316\u518D\u6CE8\u518C\u5FAE\u4EF6\u3002");
          return;
        }
        let wItems = [];
        if (Array.isArray(widgets)) {
          wItems = widgets;
        } else {
          wItems = [widgets];
        }
        const existsWNames = this.widgets.map((w) => w.name);
        for (const w of wItems) {
          if (w.name) {
            if (existsWNames.includes(w.name)) {
              vue.warn(`\u5FAE\u4EF6${w.name}\u5DF2\u6CE8\u518C\uFF0C\u65E0\u6CD5\u91CD\u590D\u6CE8\u518C\u3002`);
            } else {
              vueApp.component(w.name, w);
              this.widgets.push(w);
            }
          } else {
            throw new Error("\u8BF7\u63D0\u4F9B\u5FAE\u4EF6\u540D\u79F0\u3002");
          }
        }
      }
    };
    let App = _App;
    App.__instance = null;

    function useAppContext(data = {}) {
      const instance = App.instance;
      const context = { data };
      if (instance) {
        const store = instance.store;
        context.store = store;
        context.app = store.getters.app;
        context.user = store.getters.user;
        context.page = store.getters.page;
        context.route = instance.router.currentRoute.value;
      }
      return context;
    }

    function useWidgetSchema(schema, payload) {
      if (typeof schema === "function") {
        const context = useAppContext();
        return schema.call(null, context, payload);
      }
      return schema;
    }
    function useWidgetProps() {
      return {
        schema: {
          type: Object,
          required: true
        }
      };
    }
    function useWidgetEmitter(schema, handlerMap) {
      if (!handlerMap)
        return;
      Object.keys(handlerMap).forEach((key) => {
        if (!isWidgetEventKey(key))
          return;
        const evtTypes = schema[key];
        const evtHandler = handlerMap[key];
        emitter.ons(evtTypes, evtHandler);
      });
      vue.onUnmounted(() => {
        Object.keys(handlerMap).forEach((key) => {
          if (!isWidgetEventKey(key))
            return;
          const evtTypes = schema[key];
          const evtHandler = handlerMap[key];
          emitter.offs(evtTypes, evtHandler);
        });
      });
    }
    function isWidgetEventKey(key) {
      return typeof key === "string" && key.endsWith("On") && key !== "On";
    }

    const usePages = () => {
      return useConfig("pages");
    };
    const usePage = (path) => {
      const pages = usePages();
      if (!(pages == null ? void 0 : pages.length))
        return void 0;
      const page = pages.find((it) => (it == null ? void 0 : it.path) === path);
      return page;
    };

    var CPageLayout = vue.defineComponent({
      props: {
        pagePath: { type: String },
        pageSchema: { type: Object },
        teleportTo: { type: String }
      },
      async setup(props) {
        const pageLoader = usePageLoader();
        const innerSchema = vue.ref();
        vue.watch(() => [props.pagePath, props.pageSchema], () => {
          resetPageSchema();
        });
        async function resetPageSchema() {
          let pageSchema = props.pageSchema;
          if (!pageSchema) {
            pageSchema = await (pageLoader == null ? void 0 : pageLoader.loadPage(props.pagePath));
          }
          if (!pageSchema)
            pageSchema = { type: "blank" };
          pageSchema.type = pageSchema.type || "page";
          innerSchema.value = pageSchema;
        }
        await resetPageSchema();
        return () => {
          const innerWidget = vue.h(Widget, {
            schema: innerSchema
          });
          if (props.teleportTo) {
            return vue.h(vue.Teleport, { to: props.teleportTo }, innerWidget);
          } else {
            return innerWidget;
          }
        };
      }
    });

    var CAppLayout = vue.defineComponent({
      setup() {
        const store = useAppStore();
        const cachedPageKeys = vue.computed(() => {
          const keys = store.getters.visitedPages.map((it) => it.key);
          return keys;
        });
        return () => vue.h("div", {
          class: "c-app fs"
        }, vue.h(RouterView, ({ Component }) => !Component ? vue.h("div") : vue.h(vue.Transition, { mode: "out-in" }, () => vue.h(vue.KeepAlive, {
          "keep-alive-props": {
            include: cachedPageKeys
          }
        }, vue.h(vue.Suspense, {}, {
          default: () => vue.h(Component),
          fallback: () => vue.h("div", {}, "\u52A0\u8F7D\u4E2D...")
        })))));
      }
    });

    function getNormalizedOptions$1(options) {
      const opts = lodash.deepMerge(defaultOptions(), options);
      return opts;
    }
    const defaultOptions = () => {
      return {
        el: DEFAULT_MOUNT_EL,
        config: {
          env: {},
          app: {
            frame: {},
            menu: {
              showNav: false
            },
            page: {
              keepAlive: false
            }
          },
          apis: {},
          routes: []
        },
        extends: {
          widgets: [],
          components: []
        }
      };
    };
    const defaultRoutes = () => [
      {
        name: ROOT_ROUTE_NAME,
        path: "/",
        component: CAppLayout,
        redirect: DEFAULT_PAGE_PATH,
        children: []
      }
    ];
    const defaultMenus = () => [
      {
        name: DEFAULT_MENU_NAME,
        title: "\u9ED8\u8BA4",
        meta: {
          hidden: true
        },
        children: [
          {
            name: DEFAULT_PAGE_NAME,
            title: "\u9996\u9875",
            order: 0,
            icon: "",
            path: DEFAULT_PAGE_PATH,
            meta: {
              submodule: false,
              hidden: true,
              default: true,
              closeable: false
            }
          }
        ]
      }
    ];

    var __defProp$4 = Object.defineProperty;
    var __defProps$2 = Object.defineProperties;
    var __getOwnPropDescs$2 = Object.getOwnPropertyDescriptors;
    var __getOwnPropSymbols$4 = Object.getOwnPropertySymbols;
    var __hasOwnProp$4 = Object.prototype.hasOwnProperty;
    var __propIsEnum$4 = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$4 = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$4.call(b, prop))
          __defNormalProp$4(a, prop, b[prop]);
      if (__getOwnPropSymbols$4)
        for (var prop of __getOwnPropSymbols$4(b)) {
          if (__propIsEnum$4.call(b, prop))
            __defNormalProp$4(a, prop, b[prop]);
        }
      return a;
    };
    var __spreadProps$2 = (a, b) => __defProps$2(a, __getOwnPropDescs$2(b));
    const __cachedNodes = {};
    function createAppRoutes(router, submodules) {
      const exMenus = useConfig("menus", []);
      _normalizeMenus(exMenus);
      const defMenus = defaultMenus() || [];
      _normalizeMenus(defMenus);
      _mergeMenus(defMenus, exMenus);
      const appendedMenus = _filterAuthMenus(defMenus, submodules);
      _mergeMenus(submodules, appendedMenus);
      _sortMenus(submodules);
      const allMenus = flattenTree(submodules);
      const allMenuNames = allMenus.map((it) => it.name);
      const repeatedNames = findRepeats(allMenuNames);
      if (repeatedNames.length)
        throw new Error(`\u5B58\u5728\u91CD\u590D\u7684\u83DC\u5355\u540D"${repeatedNames.join()}"`);
      submodules.forEach((it) => {
        _createSubRoute(router, it, it);
      });
    }
    function pruneCachedPage(router, page) {
      const key = page == null ? void 0 : page.key;
      if (key && __cachedNodes[key]) {
        __cachedNodes[key] = void 0;
        delete __cachedNodes[key];
      }
      if ((page == null ? void 0 : page.isTemp) && (page == null ? void 0 : page.name)) {
        router.removeRoute(page == null ? void 0 : page.name);
      }
    }
    function createTmpRoute(router, menu, submodule) {
      menu.meta = Object.assign({
        hidden: true,
        isTemp: true
      }, menu.meta, {
        noCache: false
      });
      delete menu.meta.noCache;
      delete menu.meta.redirectQuery;
      menu.name = `${menu.name}__tmp_${uniqId()}`;
      return _createSubRoute(router, menu, submodule);
    }
    function _createSubRoute(router, menu, submodule) {
      var _a, _b, _c;
      let route = void 0;
      if (menu.path) {
        const pathInfo = _parseMenuPath(menu.path);
        pathInfo.query = Object.assign({}, pathInfo.query, menu.query);
        const routeMeta = Object.assign(__spreadValues$4({
          type: "page",
          name: menu.name,
          parentName: menu.parentName,
          submodule: submodule.name,
          isRoot: false,
          icon: menu.icon,
          label: menu.title,
          count: ((_a = menu.children) == null ? void 0 : _a.length) || 0,
          refererKey: menu.refererKey,
          menuPath: menu.path,
          schema: menu.schema,
          teleportTo: menu.teleportTo
        }, pathInfo), menu.meta, {
          menu
        });
        const pageKey = getPageKey(routeMeta);
        if (!submodule.defaultMenu && !((_b = menu.meta) == null ? void 0 : _b.hidden)) {
          submodule.defaultMenu = menu;
        }
        const existsRoute = router.getRouteByPageKey(pageKey);
        if (existsRoute)
          return existsRoute;
        routeMeta.pageKey = pageKey;
        route = __spreadProps$2(__spreadValues$4({
          name: menu.name
        }, pathInfo), {
          meta: routeMeta
        });
        if (menu.redirect) {
          route.redirect = menu.redirect;
        } else {
          route.component = _resolvePageComponent(routeMeta);
        }
        if (menu.path.startsWith(ROOT_MENU_PREFIX)) {
          menu.path = menu.path.substring(ROOT_MENU_PREFIX.length);
          routeMeta.isRoot = true;
          routeMeta.path = menu.path;
          router.addRoute(route);
        } else {
          router.addRoute(ROOT_ROUTE_NAME, route);
        }
      }
      if ((_c = menu.children) == null ? void 0 : _c.length) {
        menu.children.forEach((it) => {
          _createSubRoute(router, it, submodule);
        });
      }
      return route;
    }
    function _parseMenuPath(path) {
      const result = { path };
      if (path.indexOf("?") > 0) {
        const pathStr = path.substring(0, path.indexOf("?"));
        const queryStr = path.substring(pathStr.length + 1);
        result.path = pathStr;
        result.query = qs.parse(queryStr);
      }
      return result;
    }
    function _normalizeMenus(exMenus) {
      exMenus.forEach((it, index) => {
        var _a;
        if (!it.name) {
          it.name = _tmpMenuName();
          vue.warn(`\u5EFA\u8BAE\u4E3A\u83DC\u5355${it.title}\u63D0\u4F9B\u952E\u3002`);
        }
        it.order = it.order || index;
        if (it.name === "singles") {
          it.meta = __spreadValues$4({ isSingle: true }, it.meta);
        }
        if ((_a = it.children) == null ? void 0 : _a.length) {
          it.children.forEach((_it) => {
            var _a2;
            _it.parentName = it.name;
            if ((_a2 = it.meta) == null ? void 0 : _a2.isSingle) {
              _it.meta = __spreadValues$4({ isSingle: true }, _it.meta);
            }
          });
          _normalizeMenus(it.children);
        }
      });
    }
    let __tmpMenuIndex = 1;
    function _tmpMenuName() {
      return `_tmp_${new Date().getTime()}_${++__tmpMenuIndex}`;
    }
    function _mergeMenus(menus, exMenus) {
      exMenus.forEach((it) => {
        _mergeMenu(menus, it);
      });
    }
    function _mergeMenu(menus, exMenu) {
      var _a;
      if (!(exMenu == null ? void 0 : exMenu.name))
        return;
      const menuIndex = menus.findIndex((it) => it.name === exMenu.name);
      if (menuIndex < 0) {
        let pMenu = null;
        if (exMenu.parentName)
          pMenu = _findMenuByName(menus, exMenu.parentName, true);
        if (!pMenu) {
          menus.push(exMenu);
          return;
        }
        pMenu.children = [...pMenu.children || [], exMenu];
        return;
      }
      const menu = Object.assign({
        children: []
      }, menus[menuIndex], lodash.omit(exMenu, ["children"]));
      menu.order = exMenu.order || menus[menuIndex].order;
      if ((_a = exMenu.children) == null ? void 0 : _a.length) {
        _mergeMenus(menu.children, exMenu.children);
      }
      menus[menuIndex] = menu;
    }
    function _sortMenus(menus) {
      menus.sort((a, b) => {
        if (a.order > b.order)
          return 1;
        else if (a.order < b.order)
          return -1;
        else if (a.name > b.name)
          return 1;
        else if (a.name < b.name)
          return -1;
        else
          return 0;
      });
      menus.forEach((menu) => {
        var _a;
        ((_a = menu.children) == null ? void 0 : _a.length) && _sortMenus(menu.children);
      });
      return menus;
    }
    function _filterAuthMenus(menus, authMenus) {
      if (!(menus == null ? void 0 : menus.length))
        return [];
      const filteredMenus = menus.filter((it) => {
        if (it.isAuth && it.name) {
          const authMenu = _findMenuByName(authMenus, it.name, true);
          return !!authMenu;
        }
        return true;
      });
      filteredMenus.forEach((it) => {
        var _a;
        if ((_a = it.children) == null ? void 0 : _a.length) {
          it.children = _filterAuthMenus(it.children, authMenus);
        }
      });
      return filteredMenus;
    }
    function _findMenuByName(menus, name, recursive = false) {
      if (!name || !(menus == null ? void 0 : menus.length))
        return void 0;
      const menu = menus.find((it) => it.name === name);
      if (menu)
        return menu;
      if (recursive) {
        for (const it of menus) {
          if (it.children) {
            const m = _findMenuByName(it.children, name, recursive);
            if (m)
              return m;
          }
        }
      }
      return void 0;
    }
    function _resolvePageComponent(routeMeta) {
      const pageCmpt = vue.defineComponent({
        name: routeMeta.pageKey,
        setup: () => {
          return () => {
            return vue.h(CPageLayout, {
              pagePath: routeMeta.path,
              pageSchema: routeMeta.schema,
              teleportTo: routeMeta.teleportTo
            });
          };
        }
      });
      return pageCmpt;
    }

    var __defProp$3 = Object.defineProperty;
    var __defProps$1 = Object.defineProperties;
    var __getOwnPropDescs$1 = Object.getOwnPropertyDescriptors;
    var __getOwnPropSymbols$3 = Object.getOwnPropertySymbols;
    var __hasOwnProp$3 = Object.prototype.hasOwnProperty;
    var __propIsEnum$3 = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$3 = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$3.call(b, prop))
          __defNormalProp$3(a, prop, b[prop]);
      if (__getOwnPropSymbols$3)
        for (var prop of __getOwnPropSymbols$3(b)) {
          if (__propIsEnum$3.call(b, prop))
            __defNormalProp$3(a, prop, b[prop]);
        }
      return a;
    };
    var __spreadProps$1 = (a, b) => __defProps$1(a, __getOwnPropDescs$1(b));
    let router = void 0;
    function createAppRouter(config) {
      if (router)
        return router;
      const store = useAppStore();
      if (config == null ? void 0 : config.router) {
        router = config.router;
      } else {
        router = createRouter({
          history: createWebHashHistory(),
          routes: (config == null ? void 0 : config.routes) || []
        });
      }
      if (!router.goHome) {
        router.goHome = async () => {
          if (!router)
            return;
          return await router.push({ name: ROOT_ROUTE_NAME });
        };
      }
      if (!router.goto) {
        router.goto = async (to) => {
          var _a, _b, _c, _d, _e;
          if (!router)
            return;
          if (typeof to === "string" && (to.startsWith("http:") || to.startsWith("https:"))) {
            window.open(to);
            return;
          }
          if (to.name) {
            const ctx = useAppContext(to.data || {});
            const tmplRoute = router.getRouteByName(to.name);
            if ((_a = tmplRoute == null ? void 0 : tmplRoute.meta) == null ? void 0 : _a.menu) {
              const tmplData = deepFilter((_b = tmplRoute == null ? void 0 : tmplRoute.meta) == null ? void 0 : _b.menu, ctx);
              to = Object.assign({}, tmplData, to);
            }
          }
          let refererKey = to.refererKey;
          const currentRoute = router.currentRoute;
          if (!refererKey) {
            refererKey = (_c = currentRoute.value.meta) == null ? void 0 : _c.pageKey;
          }
          if (refererKey) {
            to.meta = __spreadProps$1(__spreadValues$3({}, to.meta), { refererKey });
          }
          const pageKey = getPageKey(to);
          if (pageKey === refererKey)
            return;
          const keeyAlive = useConfig("app.page.keeyAlive");
          if (!keeyAlive) {
            if (!refererKey) {
              await store.dispatch("pages/pruneVisited", {
                submodule: "ALL",
                redirect: false
              });
            } else if ((_d = currentRoute.value) == null ? void 0 : _d.meta) {
              await store.dispatch("pages/addVisited", {
                route: currentRoute.value,
                redirect: false
              });
            }
          }
          const toRoute = router.getRouteByPageKey(pageKey);
          if (!toRoute) {
            to.submodule = to.submodule || ((_e = store.getters.navMenu) == null ? void 0 : _e.submodule);
            await store.dispatch("pages/addTemp", to);
            return await router.push(to);
          } else {
            return await router.push(toRoute.meta);
          }
        };
      }
      if (!router.goBack) {
        router.goBack = async () => {
          var _a;
          if (!router)
            return;
          const route = router.currentRoute;
          const refererKey = (_a = route.value.meta) == null ? void 0 : _a.refererKey;
          if (refererKey) {
            const refererRoute = router.getRouteByPageKey(refererKey);
            const rerfereMeta = refererRoute == null ? void 0 : refererRoute.meta;
            if (rerfereMeta == null ? void 0 : rerfereMeta.name) {
              return await router.push({
                name: rerfereMeta.name,
                query: rerfereMeta.query
              });
            }
          }
          return router.go(-1);
        };
      }
      if (!router.close) {
        router.close = async (pageKey) => {
          var _a;
          const showNav = useConfig("app.menu.showNav");
          if (!showNav) {
            router == null ? void 0 : router.goBack();
          } else {
            const route = router.currentRoute.value;
            pageKey = pageKey || ((_a = route == null ? void 0 : route.meta) == null ? void 0 : _a.pageKey);
            if (!pageKey)
              return;
            store.dispatch("pages/removeVisited", { key: pageKey });
          }
        };
      }
      if (!router.getRouteByName) {
        router.getRouteByName = (name) => {
          if (!router)
            return;
          const routes = router.getRoutes();
          const route = routes.find((it) => it.name === name);
          return route;
        };
      }
      if (!router.getRouteByPageKey) {
        router.getRouteByPageKey = (key) => {
          if (!key || !router)
            return void 0;
          const routes = router.getRoutes();
          const route = routes.find((it) => {
            var _a;
            return ((_a = it.meta) == null ? void 0 : _a.pageKey) === key;
          });
          return route;
        };
      }
      if (!router.getRouteByMenuPath) {
        router.getRouteByMenuPath = (menuPath) => {
          if (!menuPath || !router)
            return void 0;
          const routes = router.getRoutes();
          const route = routes.find((it) => {
            var _a;
            return ((_a = it.meta) == null ? void 0 : _a.menuPath) === menuPath;
          });
          return route;
        };
      }
      if (config == null ? void 0 : config.beforeResolve) {
        router.beforeResolve(config == null ? void 0 : config.beforeResolve);
      }
      if (config == null ? void 0 : config.onError) {
        router.onError(config == null ? void 0 : config.onError);
      }
      if (config == null ? void 0 : config.beforeEach) {
        router.beforeEach(config == null ? void 0 : config.beforeEach);
      } else {
        router.beforeEach(async (to, from, next) => {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          if (!router)
            return;
          if (!from.name) {
            if (to.name === "404") {
              next({ name: ROOT_ROUTE_NAME, replace: true });
              return;
            }
            if ((_a = to.meta) == null ? void 0 : _a.isTemp) {
              if ((_b = to.meta) == null ? void 0 : _b.parentName) {
                next({ name: to.meta.parentName, replace: true });
              } else {
                next({ name: ROOT_ROUTE_NAME, replace: true });
              }
              return;
            } else if (!((_c = to.meta) == null ? void 0 : _c.redirectQuery)) {
              const menuPath = location.hash.substring(1);
              const route = router.getRouteByMenuPath(menuPath);
              if ((route == null ? void 0 : route.name) && route.name !== to.name) {
                next({ name: route.name, query: to.query, replace: true });
                return;
              }
            }
          }
          if ((_d = to.meta) == null ? void 0 : _d.redirectQuery) {
            const query = Object.assign({}, to.query, (_e = to.meta) == null ? void 0 : _e.redirectQuery);
            if (!lodash.deepEqual(query, to.query)) {
              next({ name: to.name, query, replace: true });
              return;
            }
          }
          if (((_f = to.meta) == null ? void 0 : _f.submodule) && !((_g = to.meta) == null ? void 0 : _g.isSingle)) {
            await store.dispatch("app/changeSubmodule", {
              name: (_h = to.meta) == null ? void 0 : _h.submodule,
              to
            });
          }
          next();
        });
      }
      if (config == null ? void 0 : config.afterEach) {
        router.afterEach(config == null ? void 0 : config.afterEach);
      } else {
        router.afterEach(async (to, from) => {
          var _a, _b;
          if (!router)
            return;
          await store.dispatch("pages/setCurrent", ((_a = to.meta) == null ? void 0 : _a.pageKey) || to.name);
          const keeyAlive = useConfig("app.page.keeyAlive");
          if (keeyAlive === false && from.name && ((_b = from.meta) == null ? void 0 : _b.isTemp)) {
            await store.dispatch("pages/removeVisited", {
              name: from.name
            });
            router.removeRoute(from.name);
          }
        });
      }
      return router;
    }
    function useAppRouter() {
      return router;
    }
    function useAppRoute() {
      return useRoute();
    }
    function pruneCurrentPage() {
      var _a;
      if (!router)
        return;
      const route = (_a = router.currentRoute) == null ? void 0 : _a.value;
      if (!(route == null ? void 0 : route.meta))
        return;
      pruneCachedPage(router, route.meta);
    }

    const state$2 = {
      loaded: false,
      appId: "",
      submodules: [],
      navMenu: {
        submodule: "",
        menus: [],
        current: "",
        collapsed: false
      },
      error: null
    };
    const getters$2 = {
      submodule: () => _getSubmodule(state$2.navMenu.submodule)
    };
    const mutations$2 = {
      setAppInfo(state2, payload) {
        const submodules = payload.submodules || [];
        submodules.forEach((it) => it.isSubmodule = true);
        state2.submodules = submodules;
        _setSubmodule(state2, {
          name: payload.default
        });
      },
      setAppLoaded(state2, loaded = true) {
        state2.loaded = loaded;
      },
      setNavMenu(state2, payload) {
        _setSubmodule(state2, payload);
      },
      setAppStates(state2, payload) {
        const pStates = payload;
        if (pStates) {
          for (const key in pStates) {
            state2[key] = pStates[key];
          }
        }
      }
    };
    const actions$2 = {
      load: async (context) => {
        const { commit, dispatch } = context;
        await dispatch("user/getUserInfo", {}, { root: true });
        const authLoader = useAuthLoader();
        if (authLoader) {
          let submodules = [];
          if (authLoader == null ? void 0 : authLoader.getMenuData)
            submodules = await authLoader.getMenuData();
          commit("setAppInfo", { submodules });
        }
      },
      changeSubmodule: async ({ commit, state: state2, getters: getters2 }, payload) => {
        var _a, _b, _c;
        const router = useAppRouter();
        const navMenu = state2.navMenu;
        if (payload.name === navMenu.submodule)
          return;
        commit("setNavMenu", payload);
        const submodule = getters2.submodule;
        if ((_a = submodule.meta) == null ? void 0 : _a.hidden)
          return;
        if (payload.to) {
          await router.goto(payload.to);
        } else if ((_b = submodule.defaultMenu) == null ? void 0 : _b.name) {
          await router.goto({ name: (_c = submodule.defaultMenu) == null ? void 0 : _c.name });
        } else {
          await router.goHome();
        }
      }
    };
    var app = {
      namespaced: true,
      state: state$2,
      getters: getters$2,
      mutations: mutations$2,
      actions: actions$2
    };
    function _getSubmodule(name) {
      const submodules = state$2.submodules.filter((it) => {
        var _a;
        return !((_a = it.meta) == null ? void 0 : _a.hidden);
      });
      let submodule = submodules[0];
      if (name)
        submodule = submodules.find((it) => it.name === name);
      return submodule;
    }
    function _setSubmodule(state2, payload) {
      const submodule = _getSubmodule(payload == null ? void 0 : payload.name);
      const navMenu = {
        submodule: "",
        current: "",
        collapsed: false,
        menus: []
      };
      if (submodule) {
        navMenu.submodule = submodule.name;
        navMenu.menus = submodule.children || [];
      }
      state2.navMenu = navMenu;
    }

    const state$1 = {
      logged: false,
      userId: "",
      mobile: "",
      avatar: "",
      username: "",
      nickname: "",
      menus: [],
      roles: [],
      permissions: []
    };
    const mutations$1 = {
      setUserInfo: (state2, payload) => {
        state2.logged = !!payload.username;
        state2.username = payload.username;
        state2.avatar = payload.avatar;
        state2.nickname = payload.nickname;
        state2.mobile = payload.mobile;
        state2.roles = payload.roles;
        state2.menus = payload.menus;
        state2.permissions = payload.permissions;
        const pStates = payload.states;
        if (pStates) {
          for (const key in pStates) {
            state2[key] = pStates[key];
          }
        }
      },
      setUserStates(state2, payload) {
        const pStates = payload;
        if (pStates) {
          for (const key in pStates) {
            state2[key] = pStates[key];
          }
        }
      }
    };
    const actions$1 = {
      async getUserInfo({ commit }, payload) {
        const authLoader = useAuthLoader();
        if (authLoader) {
          const res = await authLoader.getUserInfo(payload);
          commit("setUserInfo", res);
        }
      },
      async logout() {
        const authLoader = useAuthLoader();
        if (authLoader)
          authLoader.logout();
      }
    };
    var user = {
      namespaced: true,
      state: state$1,
      mutations: mutations$1,
      actions: actions$1
    };

    var __defProp$2 = Object.defineProperty;
    var __defProps = Object.defineProperties;
    var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
    var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
    var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
    var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$2 = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$2.call(b, prop))
          __defNormalProp$2(a, prop, b[prop]);
      if (__getOwnPropSymbols$2)
        for (var prop of __getOwnPropSymbols$2(b)) {
          if (__propIsEnum$2.call(b, prop))
            __defNormalProp$2(a, prop, b[prop]);
        }
      return a;
    };
    var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
    const state = {
      datas: {},
      current: "",
      defaults: [],
      visited: []
    };
    const getters$1 = {
      current: () => state.current,
      visited: () => state.visited
    };
    const mutations = {
      setCurrent: (state2, pageKey) => {
        state2.current = pageKey;
      },
      setDefaults: (state2, pages) => {
        state2.defaults = pages;
      },
      addVisited: (state2, page) => {
        if (!page.pageKey || page.noCache)
          return;
        if (!page.key)
          page.key = page.pageKey;
        if (state2.visited.some((v) => isSamePage(v, page)))
          return;
        const newPage = lodash.deepClone(page);
        let index = 0;
        const refererKey = page.refererKey;
        if (refererKey) {
          index = state2.visited.findIndex((item) => item.key === refererKey) + 1;
        } else {
          index = state2.visited.length;
        }
        if (newPage.default === true) {
          state2.visited = [newPage, ...state2.visited];
        } else {
          state2.visited.splice(index, 0, newPage);
          state2.visited = [...state2.visited];
        }
      },
      removeVisited: (state2, page) => {
        var _a;
        const router = (_a = App.instance) == null ? void 0 : _a.router;
        if (!router)
          return;
        const datas = state2.datas || {};
        const visitedArr = [];
        const pageDatas = {};
        for (const [i, v] of state2.visited.entries()) {
          if (isSamePage(v, page) && page.closeable !== false) {
            pruneCachedPage(router, page);
          } else {
            visitedArr.push(v);
            if (datas[v.key])
              pageDatas[v.key] = datas[v.key];
          }
        }
        state2.visited = visitedArr;
        state2.datas = pageDatas;
      },
      removeVisitedOthers: (state2, payload) => {
        var _a;
        const router = (_a = App.instance) == null ? void 0 : _a.router;
        if (!router)
          return;
        const { submodule, page } = payload;
        const datas = state2.datas || {};
        const visitedArr = [];
        const pageDatas = {};
        for (const v of state2.visited) {
          if (v.submodule === submodule && !isSamePage(v, page) && v.closeable !== false) {
            pruneCachedPage(router, page);
          } else {
            visitedArr.push(v);
            if (datas[v.key])
              pageDatas[v.key] = datas[v.key];
          }
        }
        state2.visited = visitedArr;
        state2.datas = pageDatas;
      },
      pruneVisited: (state2, submodule) => {
        var _a;
        const router = (_a = App.instance) == null ? void 0 : _a.router;
        if (!router)
          return;
        const datas = state2.datas || {};
        const visitedArr = [];
        const pageDatas = {};
        if (submodule !== "ALL") {
          for (const v of state2.visited) {
            if (v.submodule === submodule || v.closeable !== false) {
              pruneCachedPage(router, v);
            } else {
              visitedArr.push(v);
              if (datas[v.key])
                pageDatas[v.key] = datas[v.key];
            }
          }
        }
        state2.visited = visitedArr;
        state2.datas = pageDatas;
      },
      setPageData: (state2, payload) => {
        const datas = state2.datas || {};
        const { pageKey, path, data, type } = payload || {};
        const pageDatas = __spreadValues$2({}, datas);
        let pageData = datas[pageKey] || {};
        if (!type || type === "set") {
          if (!path) {
            pageData = data;
          } else {
            lodash.set(pageData, path, data);
          }
        } else if (type === "merge") {
          pageData = Object.assign(pageData, data);
        } else if (type === "deepMerge") {
          pageData = lodash.deepMerge(pageData, data);
        }
        if (type !== "delete") {
          pageDatas[pageKey] = pageData;
        } else {
          pageDatas[pageKey] = void 0;
          delete pageDatas[pageKey];
        }
        state2.datas = pageDatas;
      }
    };
    const actions = {
      setCurrent({ commit }, pageKey) {
        commit("setCurrent", pageKey);
      },
      async setDefaults({ commit, dispatch }, pages) {
        commit("setDefaults", pages);
        const promises = pages.map((it) => dispatch("addVisited", it));
        await Promise.all(promises);
      },
      async addVisited({ commit }, payload = { redirect: true }) {
        var _a, _b;
        const router = (_a = App.instance) == null ? void 0 : _a.router;
        if (!router)
          return;
        const page = (_b = payload == null ? void 0 : payload.route) == null ? void 0 : _b.meta;
        if (!(page == null ? void 0 : page.pageKey) || page.noCache)
          return;
        if (!page.key)
          page.key = page.pageKey;
        if (state.visited.some((v) => isSamePage(v, page)))
          return;
        commit("addVisited", page);
        if ((payload == null ? void 0 : payload.redirect) !== false) {
          await router.goto({ name: page.name, query: page.query });
        }
      },
      async removeVisited({ commit, rootGetters }, page) {
        var _a;
        const router = (_a = App.instance) == null ? void 0 : _a.router;
        if (!page || !router)
          return;
        const navItems = rootGetters.navPages;
        if (!navItems.length) {
          await router.goHome();
          return;
        }
        let currentIndex = navItems.findIndex((it) => it.key === page.key);
        if (currentIndex < 0)
          return;
        if (currentIndex > 0)
          currentIndex--;
        let currentPage = navItems[currentIndex];
        if (page.refererKey) {
          const refererPage = navItems.find((item) => item.key === page.refererKey);
          if (refererPage)
            currentPage = refererPage;
        }
        if (currentPage && navItems.length > 1) {
          await router.goto({ name: currentPage.name, query: currentPage.query });
          commit("removeVisited", page);
        } else {
          commit("removeVisited", page);
          await router.goHome();
        }
      },
      async removeVisitedOthers({ commit, rootGetters }, page) {
        var _a;
        const submodule = (_a = rootGetters.navMenu) == null ? void 0 : _a.submodule;
        commit("removeVisitedOthers", {
          submodule,
          page
        });
      },
      async pruneVisited({ commit, rootGetters }, payload = { redirect: true }) {
        var _a, _b;
        const router = (_a = App.instance) == null ? void 0 : _a.router;
        if (!router)
          return;
        const submodule = (payload == null ? void 0 : payload.submodule) || ((_b = rootGetters.navMenu) == null ? void 0 : _b.submodule);
        commit("pruneVisited", submodule);
        if ((payload == null ? void 0 : payload.redirect) !== false)
          await router.goHome();
      },
      async addTemp({ rootGetters }, menu) {
        var _a;
        const router = (_a = App.instance) == null ? void 0 : _a.router;
        if (!router)
          return;
        const submodule = rootGetters["app/submodule"];
        const tmpRoute = createTmpRoute(router, menu, submodule);
        return tmpRoute;
      },
      setPageData: ({ commit }, payload) => {
        var _a, _b, _c, _d, _e;
        const router = (_a = App.instance) == null ? void 0 : _a.router;
        if (!router)
          return;
        let pageKey = payload.pageKey;
        if (!pageKey) {
          const route = router.currentRoute;
          if ((_c = (_b = route.value) == null ? void 0 : _b.meta) == null ? void 0 : _c.pageKey) {
            pageKey = (_e = (_d = route.value) == null ? void 0 : _d.meta) == null ? void 0 : _e.pageKey;
          }
        }
        if (!pageKey)
          return;
        commit("setPageData", __spreadProps(__spreadValues$2({}, payload), { pageKey }));
      }
    };
    var pages = {
      namespaced: true,
      state,
      getters: getters$1,
      mutations,
      actions
    };
    function isSamePage(p1, p2) {
      if (!p1 || !p2)
        return false;
      return p1.key === p2.key;
    }

    const getters = {
      app: (state) => state.app,
      isAppLoaded: (state) => state.app.loaded,
      submodules: (state) => {
        return (state.app.submodules || []).filter((it) => {
          var _a;
          return !((_a = it.meta) == null ? void 0 : _a.hidden);
        });
      },
      navMenu: (state) => state.app.navMenu,
      pages: (state) => state.pages,
      page: (state) => {
        const pageKey = state.pages.current;
        const pageData = state.pages.datas[pageKey] || {};
        return {
          key: pageKey,
          data: pageData
        };
      },
      visitedPages: (state) => state.pages.visited,
      navPages: (state) => {
        var _a;
        const visited = state.pages.visited;
        const submodule = (_a = state.app.navMenu) == null ? void 0 : _a.submodule;
        const items = visited.filter((it) => {
          return !submodule || !it.submodule || it.submodule === submodule;
        });
        return items;
      },
      user: (state) => state.user,
      username: (state) => state.user.username,
      nickname: (state) => state.user.nickname,
      isLogged: (state) => state.user.logged,
      userAvatar: (state) => state.user.avatar,
      userRoles: (state) => state.user.roles,
      permissions: (state) => state.user.permissions
    };

    let store = void 0;
    function createAppStore() {
      if (store)
        return store;
      store = createStore({
        getters,
        modules: { app, user, pages }
      });
      return store;
    }
    function useAppStore() {
      return createAppStore();
    }

    const IAMAuthLoader = {
      name: "iam",
      async checkAuth() {
        const searchParams = new URL(window.location.href).searchParams;
        const code = searchParams.get("code");
        if (code) {
          await refreshToken(code);
        } else {
          await resetToken();
        }
        if (!getAccessToken()) {
          await IAMAuthLoader.logout();
        } else if (code) {
          reloadUrl();
        }
      },
      async getUserInfo() {
        const userApi = useApi("user");
        const res = await userApi.getUserInfo();
        return res;
      },
      async getMenuData() {
        var _a;
        const store = useAppStore();
        const menus = ((_a = store.getters.user) == null ? void 0 : _a.menus) || [];
        const navMenus = menus.map((it) => {
          return parseMenuItem(it);
        });
        return navMenus;
      },
      async logout() {
        const ENV = useEnv();
        const userApi = useApi("user");
        if (userApi.logout) {
          await userApi.logout();
        } else {
          await clearTokenData();
          const redirectUrl = encodeURIComponent(window.location.origin);
          const loginUrl = `${ENV.iamUrl}/oauth2?app_id=${ENV.appId}&redirect_url=${redirectUrl}&state=${uniqId()}`;
          window.location.href = loginUrl;
        }
      }
    };
    function parseMenuItem(menu) {
      const children = (menu.children || []).map((it) => {
        it.parentName = menu.keyName;
        return parseMenuItem(it);
      });
      const data = lodash.omit(menu, ["children"]);
      return {
        name: menu.keyName,
        parentName: menu.parentName,
        title: menu.menuName,
        icon: menu.icon,
        path: menu.path,
        order: menu.ordinal || 0,
        data,
        children
      };
    }

    const LocalAuthLoader = {
      name: "local",
      async checkAuth(config) {
        var _a, _b;
        const router = useAppRouter();
        const userApi = useApi("user");
        if (userApi.checkAuth) {
          await userApi.checkAuth(config);
        } else {
          const searchParams = new URL(window.location.href).searchParams;
          let token = searchParams.get("token");
          if (!token && (router == null ? void 0 : router.currentRoute)) {
            token = (_b = (_a = router == null ? void 0 : router.currentRoute.value) == null ? void 0 : _a.query) == null ? void 0 : _b.token;
          }
          if (token)
            await refreshToken(token);
        }
      },
      async getUserInfo() {
        const userApi = useApi("user");
        await resetToken();
        const res = await userApi.getUserInfo();
        return res;
      },
      async getMenuData() {
        var _a;
        const store = useAppStore();
        const menus = ((_a = store.getters.user) == null ? void 0 : _a.menus) || [];
        return menus;
      },
      async logout() {
        const userApi = useApi("user");
        if (userApi.logout) {
          userApi.logout();
        } else {
          await clearTokenData();
        }
      }
    };

    const authLoaders = [IAMAuthLoader, LocalAuthLoader];

    const LocalPageLoader = {
      name: "local",
      async loadPage(path) {
        const page = usePage(path);
        return page;
      }
    };

    const pageLoaders = [LocalPageLoader];

    const __appLoaders = {
      auth: authLoaders,
      page: pageLoaders
    };
    function useLoader(type, name) {
      if (!type || !name)
        return void 0;
      if (typeof name === "object") {
        return name;
      }
      const loaders = __appLoaders[type] || [];
      const loader = loaders.find((it) => it.name === name);
      return loader;
    }
    function useAuthLoader(name) {
      if (!name)
        name = useConfig("app.auth", {}).loader;
      if (!name)
        return void 0;
      return useLoader("auth", name);
    }
    function usePageLoader(name) {
      if (!name)
        name = useConfig("app.page", {}).loader;
      if (!name)
        return void 0;
      return useLoader("page", name);
    }

    var installRouter = async (app, options) => {
      if (!app.vueApp) {
        vue.warn("\u8BF7\u5148\u5B9E\u4F8B\u5316\u518D\u5B89\u88C5\u8DEF\u7531");
        return;
      }
      const { router, store } = app;
      const submodules = store.state.app.submodules;
      createAppRoutes(router, submodules);
      const routes = router.getRoutes();
      const defaultPages = routes.filter((it) => {
        var _a;
        return ((_a = it.meta) == null ? void 0 : _a.default) === true;
      }).map((it) => it.meta);
      await store.dispatch("pages/setDefaults", defaultPages, { root: true });
      app.vueApp.use(router);
      return router;
    };

    const permission = {
      mounted(el, binding) {
        const store = useAppStore();
        const { value } = binding;
        if (lodash.isNil(value))
          return;
        const roles = store.getters.permissions;
        if (value && Array.isArray(value)) {
          const permissionRoles = value.map((it) => {
            if (typeof it === "string") {
              return it.trim();
            }
            return it;
          });
          const hasPermission = roles.some((role) => {
            return permissionRoles.includes(role);
          });
          if (!hasPermission) {
            el.parentNode && el.parentNode.removeChild(el);
          }
        }
      }
    };

    const install$3 = function(app) {
      app.directive("perm", permission);
    };

    var index$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        install: install$3
    });

    const preventReClick = {
      mounted(el, binding) {
        el.addEventListener("click", () => {
          if (!el.disabled) {
            el.disabled = true;
            setTimeout(() => {
              el.disabled = false;
            }, binding.value || 1e3);
          }
        });
      }
    };

    const install$2 = function(app) {
      app.directive("preventReclick", preventReClick);
    };

    var index = /*#__PURE__*/Object.freeze({
        __proto__: null,
        install: install$2
    });

    var directivesMap = /*#__PURE__*/Object.freeze({
        __proto__: null,
        permission: index$1,
        preventReclick: index
    });

    var CHtml = vue.defineComponent({
      props: {
        html: { type: [String, Object] },
        contextData: { type: Object }
      },
      setup(props) {
        return () => {
          const context = useAppContext(props.contextData || {});
          if (!props.html)
            return "";
          const html = deepFilter(props.html, context);
          return renderHtml(html);
        };
      }
    });

    var CTpl = vue.defineComponent({
      props: {
        tpl: { type: [String, Object] },
        contextData: { type: Object }
      },
      setup(props) {
        const context = useAppContext(props.contextData || {});
        return () => {
          if (!props.tpl)
            return "";
          const text = filter(props.tpl, context);
          return text;
        };
      }
    });

    var CParentLayout = vue.defineComponent({
      setup() {
        return () => {
          vue.h(RouterView);
        };
      }
    });

    var componentsMap = /*#__PURE__*/Object.freeze({
        __proto__: null,
        CHtml: CHtml,
        CTpl: CTpl,
        CAppLayout: CAppLayout,
        CPageLayout: CPageLayout,
        CParentLayout: CParentLayout
    });

    var installComponents = async (target, options) => {
      var _a;
      const { vueApp } = target;
      if (!vueApp) {
        vue.warn("\u8BF7\u5148\u5B9E\u4F8B\u5316\u518D\u6CE8\u518C\u7EC4\u4EF6");
        return;
      }
      for (const key in directivesMap) {
        const item = directivesMap[key];
        if (item == null ? void 0 : item.install)
          item.install(vueApp);
      }
      for (const key in entryMap) {
        const cmpt = entryMap[key];
        const cmptName = cmpt.name || key;
        vueApp.component(cmptName, cmpt);
      }
      for (const key in componentsMap) {
        const cmpt = componentsMap[key];
        const cmptName = cmpt.name || key;
        vueApp.component(cmptName, cmpt);
      }
      const exComponents = ((_a = options.extends) == null ? void 0 : _a.components) || [];
      exComponents.forEach((cmpt) => {
        if (cmpt.name && cmpt.name.startsWith("C")) {
          vueApp.component(cmpt.name, cmpt);
        }
      });
    };

    var __defProp$1 = Object.defineProperty;
    var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
    var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
    var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
    var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues$1 = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp$1.call(b, prop))
          __defNormalProp$1(a, prop, b[prop]);
      if (__getOwnPropSymbols$1)
        for (var prop of __getOwnPropSymbols$1(b)) {
          if (__propIsEnum$1.call(b, prop))
            __defNormalProp$1(a, prop, b[prop]);
        }
      return a;
    };
    var WHtml = vue.defineComponent({
      props: {
        schema: { type: Object }
      },
      setup(props) {
        return () => {
          const htmlProps = lodash.omit(props.schema, ["type"]);
          return vue.h(CHtml, __spreadValues$1({}, htmlProps));
        };
      }
    });

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
    var WTpl = vue.defineComponent({
      props: {
        schema: { type: Object }
      },
      setup(props) {
        return () => {
          const tplProps = lodash.omit(props.schema, ["type"]);
          return vue.h(CTpl, __spreadValues({}, tplProps));
        };
      }
    });

    var widgetsMap = /*#__PURE__*/Object.freeze({
        __proto__: null,
        WHtml: WHtml,
        WTpl: WTpl
    });

    var installWidgets = async (target, options) => {
      var _a;
      const { vueApp } = target;
      if (!vueApp) {
        vue.warn("\u8BF7\u5148\u5B9E\u4F8B\u5316\u518D\u6CE8\u518C\u5FAE\u4EF6");
        return;
      }
      const innerWidgets = [];
      for (const key in widgetsMap) {
        const widget = widgetsMap[key];
        if (!widget.name)
          widget.name = key;
        innerWidgets.push(widget);
      }
      const exWidgets = ((_a = options.extends) == null ? void 0 : _a.widgets) || [];
      target.register([...exWidgets, ...innerWidgets]);
    };

    var installPlugins = async (target, options) => {
      var _a, _b, _c;
      if (!((_b = (_a = options == null ? void 0 : options.extends) == null ? void 0 : _a.plugins) == null ? void 0 : _b.length))
        return;
      if (target.apply) {
        await target.apply((_c = options.extends) == null ? void 0 : _c.plugins, options);
      }
    };

    async function install$1(app, options) {
      const vueApp = app.vueApp;
      vueApp.config.globalProperties.$runtime = app;
      vueApp.config.globalProperties.$emitter = emitter;
      await installComponents(app, options);
      await installWidgets(app, options);
      await installRouter(app, options);
      await installPlugins(app, options);
    }

    function getNormalizedOptions(options) {
      const opts = mergeAppOptions(defaultOptions(), options);
      const keepAlive = lodash.get(opts, "app.page.keepAlive");
      const showNav = lodash.get(opts, "app.menu.showNav");
      const frame = lodash.get(opts, "app.frame");
      if (lodash.isNil(keepAlive)) {
        if (frame !== false && showNav === true) {
          lodash.set(opts, "app.page.keepAlive", true);
        }
      }
      if (frame === false) {
        lodash.set(opts, "app.menu.showNav", false);
      }
      return opts;
    }
    function mergeAppOptions(targetOptions, sourceOptions) {
      const ui = sourceOptions == null ? void 0 : sourceOptions.ui;
      const _sourceOptions = lodash.omit(sourceOptions, "ui");
      const opts = lodash.deepMerge(targetOptions, _sourceOptions);
      opts.ui = ui;
      return opts;
    }

    function useApp() {
      return App.instance;
    }
    let __appError;
    async function startApp(options) {
      var _a;
      const opts = getNormalizedOptions(options);
      const config = opts.config;
      setConfig(config);
      const store = createAppStore();
      const router = createAppRouter(opts.ui.router);
      const runtimeApp = App.initialize({
        el: opts.el,
        schema: opts.schema,
        ui: opts.ui,
        store,
        router
      });
      const app = await runtimeApp.start();
      if (!app.vueApp) {
        vue.warn("\u521B\u5EFA\u5E94\u7528\u5931\u8D25\uFF0C\u8BF7\u786E\u8BA4\u4F20\u5165\u4E86\u6B63\u786E\u7684\u53C2\u6570\u3002");
        return;
      }
      if (app.ui.install)
        await app.ui.install(app, options);
      try {
        const authLoader = useAuthLoader();
        if (authLoader)
          await authLoader.checkAuth(config);
      } catch (ex) {
        __appError = new AppAuthError(ex, "\u9A8C\u8BC1\u6743\u9650\u9519\u8BEF");
      }
      try {
        await store.dispatch("app/load", opts);
        await install$1(runtimeApp, opts);
        const onLoad = (_a = config.app) == null ? void 0 : _a.onLoad;
        if (onLoad)
          await Promise.resolve().then(() => onLoad(runtimeApp, opts));
        store.commit("app/setAppLoaded");
      } catch (ex) {
        __appError = new AppLoadError(ex);
      }
      if (__appError)
        vue.warn("\u5E94\u7528\u542F\u52A8\u9519\u8BEF", __appError);
      if (opts.el)
        await mountApp(opts.el);
      return runtimeApp;
    }
    async function mountApp(el) {
      const runtimeApp = App.instance;
      const vueApp = runtimeApp == null ? void 0 : runtimeApp.vueApp;
      if (!vueApp)
        throw new Error("\u8BF7\u5148\u901A\u8FC7setupApp\u518D\u8FDB\u884C\u52A0\u8F7D");
      const router = vueApp.config.globalProperties.$router;
      if (!router)
        throw new Error("\u8BF7\u5148\u51FA\u5B9E\u4F8B\u5316\u5E94\u7528\u8DEF\u7531");
      await router.isReady();
      vueApp.mount(el);
      if (__appError) {
        const pathName = __appError.code === ErrorCodes.APP_AUTH_ERROR ? "403" : "500";
        await router.replace({
          name: pathName,
          params: {
            description: __appError.description,
            message: __appError.message
          }
        });
        __appError = void 0;
      }
      return vueApp;
    }

    async function install(renderer, options) {
      const vueApp = renderer.vueApp;
      vueApp.config.globalProperties.$renderer = renderer;
      vueApp.config.globalProperties.$emitter = emitter;
      if (RendererFactory.instance.ui.install) {
        await RendererFactory.instance.ui.install(renderer, options);
      }
    }

    const _RendererFactory = class {
      constructor(options) {
        this._options = options;
      }
      static initialize(options) {
        _RendererFactory.__instance = new _RendererFactory(options);
        return _RendererFactory.__instance;
      }
      static get instance() {
        return _RendererFactory.__instance;
      }
      get ui() {
        return this._options.ui;
      }
      get options() {
        return this._options;
      }
      async render(options) {
        const appRenderer = new Renderer(options);
        await appRenderer.render();
        return appRenderer;
      }
    };
    let RendererFactory = _RendererFactory;
    RendererFactory.__instance = null;
    class Renderer {
      constructor(options) {
        this._vueApp = null;
        this._widgets = [];
        this._options = options;
      }
      get vueApp() {
        return this._vueApp;
      }
      get options() {
        return this._options;
      }
      get widgets() {
        return this._widgets;
      }
      async render() {
        const factory = RendererFactory.instance;
        const options = this.options;
        const root = vue.defineComponent({
          setup() {
            return () => {
              return vue.h(Widget, { schema: options.schema });
            };
          }
        });
        this._vueApp = vue.createApp(root);
        await install(this, factory == null ? void 0 : factory.options);
        this._vueApp.mount(options.el);
        return this;
      }
      async unmount() {
        const { vueApp } = this;
        if (vueApp) {
          vueApp.unmount();
          this._vueApp = null;
        }
        this._widgets = [];
      }
      async register(widgets) {
        const vueApp = this.vueApp;
        if (!vueApp) {
          vue.warn("\u8BF7\u5148\u6267\u884C\u5B9E\u4F8B\u5316\u518D\u6CE8\u518C\u5FAE\u4EF6\u3002");
          return;
        }
        let wItems = [];
        if (Array.isArray(widgets)) {
          wItems = widgets;
        } else {
          wItems = [widgets];
        }
        const existsWNames = this.widgets.map((w) => w.name);
        for (const w of wItems) {
          if (w.name) {
            if (existsWNames.includes(w.name)) {
              vue.warn(`\u5FAE\u4EF6${w.name}\u5DF2\u6CE8\u518C\uFF0C\u65E0\u6CD5\u91CD\u590D\u6CE8\u518C\u3002`);
            } else {
              vueApp.component(w.name, w);
              this.widgets.push(w);
            }
          } else {
            throw new Error("\u8BF7\u63D0\u4F9B\u5FAE\u4EF6\u540D\u79F0\u3002");
          }
        }
      }
    }

    function useRendererFactory() {
      return RendererFactory.instance;
    }
    const startRenderer = async (options) => {
      const opts = lodash.deepMerge({}, options);
      const config = opts.config;
      setConfig(Object.freeze(config));
      const renderer = RendererFactory.initialize(lodash.omit(opts, ["config"]));
      return renderer;
    };

    exports.vue = vue__namespace;
    Object.defineProperty(exports, 'warn', {
        enumerable: true,
        get: function () { return vue.warn; }
    });
    exports.App = App;
    exports.DEFAULT_MENU_NAME = DEFAULT_MENU_NAME;
    exports.DEFAULT_MOUNT_EL = DEFAULT_MOUNT_EL;
    exports.DEFAULT_PAGE_NAME = DEFAULT_PAGE_NAME;
    exports.DEFAULT_PAGE_PATH = DEFAULT_PAGE_PATH;
    exports.Emitter = Emitter;
    exports.Entry = Entry;
    exports.HttpRequest = HttpRequest;
    exports.ROOT_MENU_PREFIX = ROOT_MENU_PREFIX;
    exports.ROOT_ROUTE_NAME = ROOT_ROUTE_NAME;
    exports.RUNTIME_GLOBAL_EVENTS = RUNTIME_GLOBAL_EVENTS;
    exports.Renderer = Renderer;
    exports.RendererFactory = RendererFactory;
    exports.TOKEN_DATA_STORAGE_KEY = TOKEN_DATA_STORAGE_KEY;
    exports.TOKEN_REFRESH_DURATION = TOKEN_REFRESH_DURATION;
    exports.Widget = Widget;
    exports._ = lodash;
    exports.checkRefreshToken = checkRefreshToken;
    exports.checkStartAutoRefresh = checkStartAutoRefresh;
    exports.clearTokenData = clearTokenData;
    exports.createAppRouter = createAppRouter;
    exports.createAppStore = createAppStore;
    exports.dateUtil = date;
    exports.eachTree = eachTree;
    exports.emitter = emitter;
    exports.everyTree = everyTree;
    exports.fileUtil = file;
    exports.filterEmpty = filterEmpty;
    exports.filterTree = filterTree;
    exports.findTree = findTree;
    exports.findTreeIndex = findTreeIndex;
    exports.flattenTree = flattenTree;
    exports.formatText = formatText;
    exports.formatter = formatter;
    exports.getAccessToken = getAccessToken;
    exports.getLocalRefreshToken = getLocalRefreshToken;
    exports.getLocalTokenData = getLocalTokenData;
    exports.getPageKey = getPageKey;
    exports.getRefreshDuration = getRefreshDuration;
    exports.getTokenData = getTokenData;
    exports.getTree = getTree;
    exports.getTreeAncestors = getTreeAncestors;
    exports.getTreeDepth = getTreeDepth;
    exports.getTreeParent = getTreeParent;
    exports.guid = guid;
    exports.isWidgetEventKey = isWidgetEventKey;
    exports.mapTree = mapTree;
    exports.mountApp = mountApp;
    exports.naturalCompare = naturalCompare;
    exports.noop = noop$2;
    exports.observable = observable;
    exports.pruneCurrentPage = pruneCurrentPage;
    exports.qs = qs;
    exports.queryEl = queryEl;
    exports.refreshToken = refreshToken;
    exports.reloadUrl = reloadUrl;
    exports.renderCmpt = renderCmpt;
    exports.renderHtml = renderHtml;
    exports.resetToken = resetToken;
    exports.saveTokenData = saveTokenData;
    exports.setConfig = setConfig;
    exports.simpleCompare = simpleCompare;
    exports.someTree = someTree;
    exports.spliceTree = spliceTree;
    exports.startApp = startApp;
    exports.startRenderer = startRenderer;
    exports.storage = storage;
    exports.tpl = tpl;
    exports.uniqId = uniqId;
    exports.useApi = useApi;
    exports.useApiRequest = useApiRequest;
    exports.useApis = useApis;
    exports.useApp = useApp;
    exports.useAppConfig = useAppConfig;
    exports.useAppContext = useAppContext;
    exports.useAppRoute = useAppRoute;
    exports.useAppRouter = useAppRouter;
    exports.useAppStore = useAppStore;
    exports.useAuthLoader = useAuthLoader;
    exports.useComponentsConfig = useComponentsConfig;
    exports.useConfig = useConfig;
    exports.useEnv = useEnv;
    exports.useLoader = useLoader;
    exports.usePage = usePage;
    exports.usePageLoader = usePageLoader;
    exports.usePages = usePages;
    exports.useRendererFactory = useRendererFactory;
    exports.useRescs = useRescs;
    exports.useWidgetEmitter = useWidgetEmitter;
    exports.useWidgetProps = useWidgetProps;
    exports.useWidgetSchema = useWidgetSchema;
    exports.useWidgetsConfig = useWidgetsConfig;
    exports.uuid = uuid;
    exports.validator = validator;
    exports.vueRouter = vueRouter_esmBundler;
    exports.vuex = vuex_esmBundler;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, Vue, axios);
