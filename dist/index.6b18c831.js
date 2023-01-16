// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"cspiS":[function(require,module,exports) {
"use strict";
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
module.bundle.HMR_BUNDLE_ID = "3fdb7f6e6b18c831";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, chrome, browser, globalThis, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: mixed;
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = "__parcel__error__overlay__";
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData,
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData = undefined;
}
module.bundle.Module = Module;
var checkedAssets, acceptedAssets, assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf("http") === 0 ? location.hostname : "localhost");
}
function getPort() {
    return HMR_PORT || location.port;
} // eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== "undefined") {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == "https:" && !/localhost|127.0.0.1|0.0.0.0/.test(hostname) ? "wss" : "ws";
    var ws = new WebSocket(protocol + "://" + hostname + (port ? ":" + port : "") + "/"); // Web extension context
    var extCtx = typeof chrome === "undefined" ? typeof browser === "undefined" ? null : browser : chrome; // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes("test.js");
    } // $FlowFixMe
    ws.onmessage = async function(event) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        acceptedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        var data = JSON.parse(event.data);
        if (data.type === "update") {
            // Remove error overlay if there is one
            if (typeof document !== "undefined") removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH); // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === "css" || asset.type === "js" && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear(); // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("parcelhmraccept"));
                await hmrApplyUpdates(assets);
                for(var i = 0; i < assetsToAccept.length; i++){
                    var id = assetsToAccept[i][1];
                    if (!acceptedAssets[id]) hmrAcceptRun(assetsToAccept[i][0], id);
                }
            } else fullReload();
        }
        if (data.type === "error") {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + "\n" + stack + "\n\n" + ansiDiagnostic.hints.join("\n"));
            }
            if (typeof document !== "undefined") {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html); // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    ws.onerror = function(e) {
        console.error(e.message);
    };
    ws.onclose = function() {
        console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
    };
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, "") : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + "</div>").join("")}
        </div>
        ${diagnostic.documentation ? `<div>📝 <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ""}
      </div>
    `;
    }
    errorHTML += "</div>";
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if ("reload" in location) location.reload();
    else if (extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute("href", link.getAttribute("href").split("?")[0] + "?" + Date.now()); // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href = links[i].getAttribute("href");
            var hostname = getHostname();
            var servedFromHMRServer = hostname === "localhost" ? new RegExp("^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):" + getPort()).test(href) : href.indexOf(hostname + ":" + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === "js") {
        if (typeof document !== "undefined") {
            let script = document.createElement("script");
            script.src = asset.url + "?t=" + Date.now();
            if (asset.outputFormat === "esmodule") script.type = "module";
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === "function") {
            // Worker scripts
            if (asset.outputFormat === "esmodule") return import(asset.url + "?t=" + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + "?t=" + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension bugfix for Chromium
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=1255412#c12
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3) {
                        if (typeof ServiceWorkerGlobalScope != "undefined" && global instanceof ServiceWorkerGlobalScope) {
                            extCtx.runtime.reload();
                            return;
                        }
                        asset.url = extCtx.runtime.getURL("/__parcel_hmr_proxy__?url=" + encodeURIComponent(asset.url + "?t=" + Date.now()));
                        return hmrDownload(asset);
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle, asset) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === "css") reloadCSS();
    else if (asset.type === "js") {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
             // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id1) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id1]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id1][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        } // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id1];
        delete bundle.cache[id1]; // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id1);
}
function hmrAcceptCheck(bundle, id, depsByBundle) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
     // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle, id, depsByBundle) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToAccept.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) return true;
}
function hmrAcceptRun(bundle, id) {
    var cached = bundle.cache[id];
    bundle.hotData = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData;
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData);
    });
    delete bundle.cache[id];
    bundle(id);
    cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) // $FlowFixMe[method-unbinding]
        assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
    });
    acceptedAssets[id] = true;
}

},{}],"i3Wj0":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
var _joyJs = require("../libraries/joy.js");
var _joyJsDefault = parcelHelpers.interopDefault(_joyJs);
window.addEventListener("load", (e)=>{
    const effectList = [
        {
            name: "solid fill",
            dropdownName: "Solid Fill",
            category: "Backgrounds",
            init: "Fill with {id:'color', type:'color', placeholder:[50, 0.8, 1.0]} and {id: 'whatever', type:'list'}",
            cursor: "./assets/cursors/fill-drip-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.addFill(my.data.color);
            }
        },
        {
            name: "gradient",
            dropdownName: "Gradient",
            category: "Backgrounds",
            init: "Gradient from {id:'color1', type:'color', placeholder:[50, 0.8, 1.0]} to {id:'color2', type:'color', placeholder:[100, 0.8, 1.0]}",
            cursor: "./assets/cursors/fill-drip-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.gradient(my.data.color1, my.data.color2);
            }
        },
        {
            name: "stripes",
            dropdownName: "Stripes",
            category: "Backgrounds",
            init: `Stripes {id:'something', type:'motif/solid fill'} of width {id:'stripeWidth', type:'number', min:1, max:300, placeholder:50}
				from {id:'color1', type:'color', placeholder:[0, 0.7, 0.8]} 
				to {id:'color2', type:'color', placeholder:[200, 0.7, 0.9]}`,
            cursor: "./assets/cursors/fill-drip-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.stripes(my.data.stripeWidth, my.data.color1, my.data.color2);
            }
        },
        {
            name: "circle",
            dropdownName: "Circle",
            category: "Shapes",
            init: `Circle of radius {id:'radius', type:'number', min:1, max:600, placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
            }
        },
        {
            name: "square",
            dropdownName: "Square",
            category: "Shapes",
            init: `Square of size {id:'size', type:'number', min:1, max:600, placeholder:40} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.addSquare(my.data.color, my.data.x, my.data.y, my.data.size);
            }
        },
        {
            name: "polygon",
            dropdownName: "Polygon",
            category: "Shapes",
            init: `Polygon with {id:'nsides', type:'number', placeholder:6} sides and radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.polygon(my.data.color, my.data.x, my.data.y, my.data.radius, my.data.nsides);
            }
        },
        {
            name: "star",
            dropdownName: "Star",
            category: "Shapes",
            init: `Star with {id:'npoints', type:'number', placeholder:7} points, outer {id:'r1', type:'number', placeholder:20}, inner {id:'r2', type:'number', placeholder:10} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.star(my.data.color, my.data.x, my.data.y, my.data.r1, my.data.r2, my.data.npoints);
            }
        },
        {
            name: "heart",
            dropdownName: "Heart",
            category: "Shapes",
            init: `Heart of size {id:'size', type:'number', placeholder:40} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.heart(my.data.color, my.data.x, my.data.y, my.data.size);
            }
        },
        {
            name: "straight line",
            dropdownName: "straight line",
            category: "Brushes",
            init: `Straight line from ({id:'x1', type:'number', placeholder:100}, {id:'y1', type:'number', placeholder:100})
			to ({id:'x2', type:'number', placeholder:200}, {id:'y2', type:'number', placeholder:200})
			in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}
			with width {id: 'lineWidth', type: 'number', placeholder: 5}`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "drag",
            onact: (my)=>{
                my.target.addLine(my.data.color, my.data.lineWidth, my.data.x1, my.data.y1, my.data.x2, my.data.y2, my.data.radius);
            }
        },
        {
            name: "brush",
            dropdownName: "Brush",
            category: "Brushes",
            init: `Brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} with width {id: 'lineWidth', type: 'number', placeholder: 8} along path {id:'pointsList', type:'string', placeholder:'20,50,200,250'}`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "drag",
            onact: (my)=>{
                my.target.addBrushStroke(my.data.color, my.data.lineWidth, my.data.pointsList);
            }
        },
        {
            name: "rainbow brush",
            dropdownName: "Rainbow Brush",
            category: "Brushes",
            init: `Rainbow brush with points {id:'pointsList', type:'string', placeholder:'20,50,200,250'}`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "drag",
            onact: (my)=>{
                my.target.addBrushStroke(my.data.pointsList);
            }
        },
        {
            name: "swirl",
            dropdownName: "Swirl",
            category: "Effects",
            init: `Add swirl of radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
            }
        },
        {
            name: "invert",
            dropdownName: "Invert",
            category: "Effects",
            init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray', 'dilate', 'blur'], placeholder:'invert'}`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.applyFilter(my.data.filter);
            }
        },
        {
            name: "grayscale",
            dropdownName: "Grayscale",
            category: "Effects",
            init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray', 'dilate', 'blur'], placeholder:'gray'}`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.applyFilter(my.data.filter);
            }
        },
        {
            name: "threshold",
            dropdownName: "Threshold",
            category: "Effects",
            init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray', 'dilate', 'blur'], placeholder:'threshold'}`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.applyFilter(my.data.filter);
            }
        },
        {
            name: "grid",
            dropdownName: "grid",
            category: "Patterns",
            init: `Repeat in grid with rows and columns`,
            cursor: "./assets/cursors/star-solid.svg",
            mouseActionType: "single-click",
            onact: (my)=>{
                my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
            }
        }, 
    ];
    const app = new MotifApp(effectList);
});
class MotifApp {
    constructor(effectList){
        this.effects = this.reindex(effectList, "name");
        this.sketch = this.initP5();
        this.sketch.addFill("#aaaaaa");
        this.sketch.clear("#aaaaaa");
        this.joy = this.initJoy();
        this.initUI();
        this.joy.actions.addAction("stencils/paperdoll", undefined, {});
        this.joy.actions.update();
    //TODO: add global effect settings such as line weight, color, etc to pass into current events that have a "preview"
    }
    initP5() {
        return new p5((s)=>{
            let points1 = null;
            let strokeColor = 0;
            let strokeWeight = 5;
            s.setup = ()=>{
                s.createCanvas(600, 600);
                s.background(255);
                s.setupFinished = true;
                s.noLoop();
            };
            s.draw = ()=>{
                if (points1) points1.renderLine(s, strokeColor, strokeWeight); //TODO: rethink this way of passing in preview line settings
            };
            s.clear = ()=>{
                if (!s.setupFinished) return;
                s.background(255);
            };
            s.addCircle = (color, x, y, r)=>{
                if (!s.setupFinished) return;
                s.fill(color);
                s.noStroke();
                s.circle(x, y, r * 2);
            };
            s.addSquare = (color, x, y, size)=>{
                s.push();
                s.rectMode(s.CENTER);
                s.fill(color);
                s.noStroke();
                s.rect(x, y, size, size);
                s.pop();
            };
            s.addFill = (color)=>{
                if (!s.setupFinished) return;
                s.fill(color);
                s.noStroke();
                s.rect(0, 0, s.width, s.height);
            };
            s.star = (color, x, y, r1, r2, npoints)=>{
                if (!s.setupFinished) return;
                let angle = s.TWO_PI / npoints;
                let halfAngle = angle / 2.0;
                s.fill(color);
                s.noStroke();
                s.beginShape();
                for(let a = 0; a < s.TWO_PI; a += angle){
                    let sx = x + s.cos(a) * r2;
                    let sy = y + s.sin(a) * r2;
                    s.vertex(sx, sy);
                    sx = x + s.cos(a + halfAngle) * r1;
                    sy = y + s.sin(a + halfAngle) * r1;
                    s.vertex(sx, sy);
                }
                s.endShape(s.CLOSE);
            };
            s.polygon = (color, x, y, r, nsides)=>{
                if (!s.setupFinished) return;
                nsides = Math.abs(nsides);
                s.fill(color);
                s.noStroke();
                let angle = s.TWO_PI / nsides;
                s.beginShape();
                for(let a = 0; a < s.TWO_PI; a += angle){
                    let sx = x + s.cos(a) * r;
                    let sy = y + s.sin(a) * r;
                    s.vertex(sx, sy);
                }
                s.endShape(s.CLOSE);
            };
            s.gradient = (color1, color2)=>{
                if (!s.setupFinished) return;
                let pcolor1 = s.color(color1);
                let pcolor2 = s.color(color2);
                s.noFill();
                s.strokeWeight(1);
                for(let i = 0; i < s.height; i++){
                    s.stroke(s.lerpColor(pcolor1, pcolor2, i / s.height));
                    s.line(0, i, s.width, i);
                }
            };
            s.stripes = (stripeWidth, color1, color2)=>{
                if (!s.setupFinished) return;
                s.push();
                s.translate(0, stripeWidth / 2); //so that top stripe is fully shown
                let pcolor1 = s.color(color1);
                let pcolor2 = s.color(color2);
                s.noFill();
                s.strokeWeight(stripeWidth);
                for(let i = 0; i < s.height; i += stripeWidth){
                    let c = s.lerpColor(pcolor1, pcolor2, i / (s.height - stripeWidth));
                    console.log(c);
                    s.stroke(c);
                    s.line(0, i, s.width, i);
                }
                s.pop();
            };
            //by Mithru: https://editor.p5js.org/Mithru/sketches/Hk1N1mMQg
            s.heart = (color, x, y, size)=>{
                if (!s.setupFinished) return;
                s.push();
                s.translate(0, -size / 2);
                s.fill(color);
                s.noStroke();
                s.beginShape();
                s.vertex(x, y);
                s.bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
                s.bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
                s.endShape(s.CLOSE);
                s.pop();
            };
            s.applyFilter = (filter)=>{
                s.filter(s[filter.toUpperCase()]);
            };
            s.stencil = (name, params)=>{};
            // s.setStrokeColor = (color) => {
            // 	strokeColor = color;
            // }
            // s.setStrokeWeight = (weight) => {
            // 	strokeWeight = weight;
            // }
            s.startPoints = (x, y)=>{
                points1 = new DrawnLine(x, y);
                console.log("inside start points function", points1);
                s.loop();
            };
            s.addPoint = (x, y)=>{
                points1.addPoint(x, y);
            };
            s.endPoints = ()=>{
                points1 = null;
                s.noLoop();
            };
            s.getPoint = (index)=>{
                return points1.points[index];
            };
            s.getLastPoint = ()=>{
                return points1.points[points1.points.length - 1];
            };
            s.pointsAsString = ()=>{
                return points1.toString();
            };
            s.mouseDragged = ()=>{
                if (points1) s.addPoint(s.mouseX, s.mouseY);
            };
            s.addLine = (color, lineWeight, x1, y1, x2, y2)=>{
                if (!s.setupFinished) return;
                s.strokeWeight(lineWeight);
                s.noFill();
                s.stroke(color);
                s.line(x1, y1, x2, y2);
            };
            s.addBrushStroke = (color, lineWeight, pointsString)=>{
                if (!s.setupFinished) return;
                s.push();
                s.noFill();
                s.strokeWeight(lineWeight);
                s.stroke(color);
                s.strokeJoin(s.ROUND);
                let points = pointsString.split(",");
                s.beginShape();
                for(let i = 0; i < points.length - 1; i += 2)s.vertex(points[i], points[i + 1]);
                s.endShape();
                s.pop();
            };
        }, "drawing-canvas");
    }
    initUI() {
        this.categories = [
            ...new Set(Object.values(this.effects).map((a)=>a.category))
        ]; //get unique categories from effect list
        let categoryToolbar = document.getElementsByClassName("category-toolbar")[0];
        let drawingToolbar = document.getElementsByClassName("drawing-toolbar")[0];
        this.categories.forEach((c)=>{
            // Create a button for the category and add it to the toolbar
            let categoryButton = this.createButton(c, c, [
                "category-button"
            ]);
            categoryToolbar.appendChild(categoryButton);
            // Create a div to hold the buttons that belong to this category. Hide all to start
            let drawingTools = this.createDiv(c + "-buttons", [
                c + "-buttons",
                "category-drawing-tools"
            ]);
            drawingToolbar.appendChild(drawingTools);
            drawingTools.classList.add("hidden");
            // Create effect buttons and add them to their category div
            let effectsInCategory = Object.values(this.effects).filter((effect)=>effect.category === c);
            let effectNames = effectsInCategory.map((a)=>a.name);
            effectNames.forEach((name)=>{
                let effectButton = this.createButton(name, name + "-button", [
                    "effect-button"
                ]);
                drawingTools.appendChild(effectButton);
                effectButton.addEventListener("click", (event)=>{
                    this.markSelectedById("effect-button", name + "-button"); //TODO: get self ID?
                //this.updateCursor(this.effects[name].cursor); //TODO
                });
            });
            // When category button is clicked, mark it selected and show the div containing its effect buttons
            categoryButton.addEventListener("click", (e)=>{
                this.markSelectedById("category-button", e.target.id);
                document.getElementsByClassName("category-drawing-tools").forEach((element)=>{
                    element.classList.add("hidden");
                });
                drawingTools.classList.remove("hidden");
                this.markSelectedById("effect-button", drawingTools.firstChild.id);
            });
        });
        //Mouse event listeners
        let dragging = false;
        let mouseDownOverCanvas = false; //TODO: doesn't work if you leave canvas with mouse down
        document.getElementById("drawing-canvas").addEventListener("mousedown", (e)=>{
            dragging = false;
            mouseDownOverCanvas = true;
            let activeEffect = this.getSelectedEffect();
            if (activeEffect) {
                if (this.effects[activeEffect].mouseActionType == "drag") {
                    this.sketch.set;
                    this.sketch.startPoints(this.sketch.mouseX, this.sketch.mouseY);
                } else this.addEvent(activeEffect, {
                    x: {
                        type: "number",
                        value: Math.round(this.sketch.mouseX)
                    },
                    y: {
                        type: "number",
                        value: Math.round(this.sketch.mouseY)
                    }
                });
            }
        });
        document.getElementById("drawing-canvas").addEventListener("mousemove", (e)=>{
            if (mouseDownOverCanvas) dragging = true;
        });
        document.getElementById("drawing-canvas").addEventListener("mouseup", (e)=>{
            // console.log(drag ? 'drag' : 'click');
            mouseDownOverCanvas = false;
            let activeEffect = this.getSelectedEffect();
            if (activeEffect) {
                if (this.effects[activeEffect].mouseActionType == "drag") {
                    this.sketch.addPoint(this.sketch.mouseX, this.sketch.mouseY);
                    if (activeEffect == "straight line") this.addEvent(activeEffect, {
                        x1: {
                            type: "number",
                            value: Math.round(this.sketch.getPoint(0).x)
                        },
                        y1: {
                            type: "number",
                            value: Math.round(this.sketch.getPoint(0).y)
                        },
                        x2: {
                            type: "number",
                            value: Math.round(this.sketch.getLastPoint().x)
                        },
                        y2: {
                            type: "number",
                            value: Math.round(this.sketch.getLastPoint().y)
                        }
                    });
                    else if (activeEffect == "brush") this.addEvent(activeEffect, {
                        pointsList: {
                            type: "number",
                            value: this.sketch.pointsAsString()
                        }
                    });
                    this.sketch.endPoints();
                }
            }
        });
    }
    addEvent(effectName, settings) {
        let effect = this.effects[effectName];
        settings.color = {
            type: "color",
            value: [
                Math.random() * 360,
                0.8,
                0.8
            ]
        };
        // let hexColor = document.getElementById('color-picker').value;
        // let hslColor = _rgbToHsl(_hexToRgb(hexColor));
        //TODO: make this match effect params
        // let params = ...settings;
        // {
        // 	// color: { type:'color', value:[50, 0.5, 1.0]},
        // 	// color: { type:'color', value:[hslColor[0], hslColor[1], hslColor[2]]},
        // 	color: { type:'color', value:[Math.random()*360, 0.8, 0.8]},
        // 	x: { type:'number', value: Math.round(settings.x)},
        // 	y: {type:'number', value: Math.round(settings.y)},
        // 	x1: { type:'number', value: Math.round(settings.x1)},
        // 	y1: {type:'number', value: Math.round(settings.y1)},
        // 	x2: { type:'number', value: Math.round(settings.x2)},
        // 	y2: {type:'number', value: Math.round(settings.y2)}
        // }
        this.joy.actions.addAction("motif/" + effectName, undefined, settings);
        this.joy.actions.update();
    }
    getSelectedEffect() {
        let selectedEffects = document.querySelectorAll(".effect-button.selected:not(.hidden)");
        if (selectedEffects.length > 0) {
            let selectedEffect = selectedEffects[0];
            return selectedEffect.value;
        } else return "";
    }
    markSelectedById(className, id) {
        document.getElementsByClassName(className).forEach((element)=>{
            element.classList.remove("selected");
        });
        document.getElementById(id).classList.add("selected");
    }
    createButton(name, id, classNames) {
        let b = document.createElement("input");
        b.setAttribute("type", "button");
        classNames.forEach((className)=>{
            b.classList.add(className);
        });
        b.setAttribute("value", name);
        b.setAttribute("id", id);
        return b;
    }
    createDiv(id, classNames) {
        let div = document.createElement("div");
        classNames.forEach((className)=>{
            div.classList.add(className);
        });
        div.setAttribute("id", id);
        return div;
    }
    reindex(list, key) {
        let dict = {};
        list.forEach((item)=>{
            dict[item[key]] = item;
        });
        return dict;
    }
    initJoy() {
        let data = (0, _joyJsDefault.default).loadFromURL();
        let sketch = this.sketch;
        let effects = this.effects;
        (0, _joyJsDefault.default).module("motif", function() {
            //Add from effects list
            Object.values(effects).forEach((effect)=>{
                console.log(effect);
                (0, _joyJsDefault.default).add({
                    name: effect.dropdownName,
                    type: "motif/" + effect.name,
                    tags: [
                        "motif",
                        "action"
                    ],
                    init: effect.init,
                    onact: effect.onact
                });
            });
        });
        (0, _joyJsDefault.default).module("stencils", function() {
            (0, _joyJsDefault.default).add({
                name: "Paper Doll",
                type: "stencils/paperdoll",
                tags: [
                    "stencils",
                    "action"
                ],
                // What the action does is EMBEDDED IN A PLAIN-LANGUAGE SENTENCE
                init: "Use stencil paper doll with clothing {id:'outfit', type:'choose', options:['dress','pants','shirt'], placeholder:'dress'}",
                // Callback
                onact: function(my) {
                    my.target.stencil("paperdoll", my.data.outfit);
                }
            });
        });
        // {
        // 	name: 'paper doll',
        // 	dropdownName: 'Paper doll',
        // 	category: 'Stencils',
        // 	init: `Paper doll with radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
        // 	at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
        // 	cursor: './assets/cursors/star-solid.svg',
        // 	onact: (my) => {
        // 		my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
        // 	}
        // },
        // {
        // 	name: 'box',
        // 	dropdownName: 'Box',
        // 	category: 'Stencils',
        // 	init: `Box with radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
        // 	at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
        // 	cursor: './assets/cursors/star-solid.svg',
        // 	onact: (my) => {
        // 		my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
        // 	}
        // },
        (0, _joyJsDefault.default).add({
            type: "list",
            tags: [
                "ui"
            ],
            initWidget: function(self) {
                self.dom = document.createElement("div");
                self.dom.innerHTML = "hello i am a list i promise";
            },
            onget: function(my) {
                return 3;
            }
        });
        let joy = (0, _joyJsDefault.default)({
            // Where the Joy editor goes:
            container: "#joy",
            // The words and widgets inside the editor:
            init: "To create my design: {id:'actions', type:'actions'} <hr> {type:'save'}",
            // Load data from URL, otherwise blank:
            data: data,
            // Actions to include:
            modules: [
                "motif",
                "instructions",
                "stencils",
                "math"
            ],
            previewActions: true,
            previewNumbers: true,
            // What to do when the user makes a change:
            onupdate: function(my) {
                sketch.clear();
                my.actions.act(sketch);
            }
        });
        return joy;
    }
}
let _rgbToHsl = (rgb)=>{
    // const [r, g, b] = rgbStr.slice(4, -1).split(',').map(Number);
    const [r, g, b] = Object.values(rgb);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = Math.floor((max + min) / 5.1);
    if (max === min) return [
        0,
        0,
        l / 100
    ];
    const d = max - min;
    const s = Math.floor(d / (l > 50 ? 510 - max - min : max + min) * 100);
    if (max === r) return [
        Math.floor(((g - b) / d + (g < b && 6)) * 60),
        s / 100,
        l / 100
    ];
    return max === g ? [
        Math.floor(((b - r) / d + 2) * 60),
        s / 100,
        l / 100
    ] : [
        Math.floor(((r - g) / d + 4) * 60),
        s / 100,
        l / 100
    ];
};
/* https://gist.github.com/mjackson/5311256 by kigiri*/ let _rgbStrToHsl = (rgbStr)=>{
    const [r, g, b] = rgbStr.slice(4, -1).split(",").map(Number);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = Math.floor((max + min) / 5.1);
    if (max === min) return [
        0,
        0,
        l
    ];
    const d = max - min;
    const s = Math.floor(d / (l > 50 ? 510 - max - min : max + min) * 100);
    if (max === r) return [
        Math.floor(((g - b) / d + (g < b && 6)) * 60),
        s,
        l
    ];
    return max === g ? [
        Math.floor(((b - r) / d + 2) * 60),
        s,
        l
    ] : [
        Math.floor(((r - g) / d + 4) * 60),
        s,
        l
    ];
};
/* https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */ let _hexToRgb = (hex)=>{
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
class DrawnLine {
    constructor(x, y){
        this.points = [];
        this.addPoint(x, y);
    }
    addPoint(x, y) {
        this.points.push({
            x: x,
            y: y
        });
    }
    toString() {
        let a = [];
        this.points.forEach((p)=>{
            a.push(Math.round(p.x));
            a.push(Math.round(p.y));
        });
        return a.toString();
    }
    renderPoints(s) {
        s.push();
        s.strokeWeight(5);
        s.noFill();
        s.stroke(0);
        this.points.forEach((p)=>{
            s.point(p.x, p.y);
        });
        s.pop();
    }
    renderLine(s, strokeColor, strokeWeight) {
        s.push();
        s.strokeWeight(strokeWeight);
        s.stroke(strokeColor);
        s.noFill();
        s.beginShape();
        this.points.forEach((p)=>{
            s.vertex(p.x, p.y);
        });
        s.endShape();
        s.pop();
    }
}

},{"../libraries/joy.js":"arNUp","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"arNUp":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * DEVELOPED BY
 * GIL LOPES BUENO
 * gilbueno.mail@gmail.com
 *
 * WORKS WITH:
 * IE8*, IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
 * For IE8 (and other legacy browsers) WatchJS will use dirty checking  
 *
 * FORK:
 * https://github.com/melanke/Watch.JS
 *
 * LICENSE: MIT
 */ "use strict";
/*****************

JOY.js: make happy little programs

VERSION 0 (the incredibly clunky first version) (sorry)

Created by Nicky Case http://ncase.me/

*****************/ // THE JOY MASTER
function Joy(options) {
    // You can call this as "new Joy()" or just "Joy()" 
    // var self = (this==window) ? {} : this;
    var self = {}; //NF changed with module import
    // Modules to import?
    if (options.modules) for(var i = 0; i < options.modules.length; i++)Joy.loadModule(options.modules[i]);
    // I'm a Joy.Actor!
    Joy.Actor.call(self, options);
    // Initialize References
    Joy.initReferences(self);
    // Allow previewing of... actions, numbers, variables?
    if (self.previewActions == undefined) self.previewActions = true;
    if (self.previewNumbers == undefined) self.previewNumbers = true;
    //if(self.previewVariables==undefined) self.previewVariables = false;
    self.activePreview = null;
    self.canPreview = function(type) {
        type = type.charAt(0).toUpperCase() + type.slice(1);
        var allowed = self["preview" + type];
        return allowed && !self.activePreview;
    };
    // And: automatically create MY widget!
    self.createWidget();
    if (self.container) {
        if (typeof self.container === "string") self.container = document.body.querySelector(self.container);
        self.container.appendChild(self.dom);
    }
    // Initialize UI & Modal
    Joy.ui.init(self);
    Joy.modal.init(self);
    // Update!
    self.onupdate = self.onupdate || function(my) {};
    self.update = function() {
        // Create a fake "my" 
        var my = {
            actor: self,
            data: {}
        };
        // Try to pre-evaluate all data beforehand!
        self.children.forEach(function(childActor) {
            var dataID = childActor.dataID;
            if (dataID) {
                var value = childActor.get();
                my.data[dataID] = value;
            }
        });
        // Aliases to all children too, though
        self.children.forEach(function(child) {
            if (child.id) my[child.id] = child;
        });
        // On Update!
        self.onupdate(my);
    };
    self.update();
    // Return to sender
    return self;
}
/*****************

ACTORS help the Player, Editor & Data talk to each other.

To create an Actor, you need to pass it a "options" object like so:
(ALL the parameters are optional, btw)
{
	id: "steps", // by default, this is actorID AND dataID
	dataID: "steps", // ONLY if actorID=/=dataID. (e.g. two actors modify same data)
	type: "number", // what Actor Template to inherit from, if any
	placeholder: 50 // if no data, what should be the placeholder?
}

*****************/ Joy.Actor = function(options, parent, data1) {
    var self = this;
    // Meta
    self._class_ = "Actor";
    self.options = options;
    self.parent = parent;
    self.top = self.parent ? self.parent.top : self; // if no parent, I'M top dog.
    // Inherit from Actor Template, if any. THEN inherit from "options"
    self.type = options.type;
    if (self.type) {
        var actorTemplate = Joy.getTemplateByType(self.type);
        _configure(self, actorTemplate);
    }
    _configure(self, self.options);
    // Adding child actors
    self.children = [];
    self.addChild = function(child, data) {
        // If child's not an Actor, it's options to create a new Actor.
        if (child._class_ != "Actor") child = new Joy.Actor(child, self, data);
        self.children.push(child);
        // If it has an ID, reference child with ID
        if (child.id) self[child.id] = child;
        // gimme
        return child;
    };
    self.removeChild = function(child) {
        _removeFromArray(self.children, child);
        child.kill();
    };
    // Update
    self.update = function() {
        if (self.onupdate) self.onupdate(self); // TODO: make consistent with .act()
        if (self.parent) self.parent.update();
    };
    // Kill!
    self.onkill = self.onkill || function() {};
    self.kill = function() {
        // Remove my DOM, if any.
        if (self.dom && self.dom.parentNode) self.dom.parentNode.removeChild(self.dom);
        // Un-watch my data
        unwatch(self.data, _onDataChange);
        // Kill all children, too
        while(self.children.length > 0)self.removeChild(self.children[0]);
        // On Kill?
        self.onkill(self);
    };
    /////////////////////////////////
    // ACTOR <-> DATA: //////////////
    /////////////////////////////////
    // Placeholder... convert to {value:w/e} object.
    if (self.placeholder === undefined) // If nothing, blank object.
    self.placeholder = {};
    if (typeof self.placeholder === "function") // If placeholder's a function, run it!
    self.placeholder = self.placeholder();
    if (typeof self.placeholder !== "object" || Array.isArray(self.placeholder)) // If placeholder value's not an object (or is array)
    self.placeholder = {
        value: _clone(self.placeholder)
    };
    // If data type not already specified, do that!
    if (!self.placeholder.type) self.placeholder.type = self.type;
    // If you didn't already pass in a data object, let's figure it out!
    self.data = self.data || data1;
    if (!self.data) {
        var parent = self.parent;
        var dataID = self.dataID;
        if (parent && dataID) {
            // if nothing, put placeholder in parent
            if (!parent.data[dataID]) parent.data[dataID] = _clone(self.placeholder);
            self.data = parent.data[dataID]; // i'm parent's sub-data!
        } else // ...otherwise, I'm standalone data.
        self.data = _clone(self.placeholder);
    }
    // Get & Set!
    self.getData = function(dataID) {
        return self.data[dataID];
    };
    self.setData = function(dataID, newValue, noUpdate) {
        _myEditLock = true; // lock!
        if (newValue === undefined) delete self.data[dataID]; // DELETE the thing!
        else self.data[dataID] = newValue;
        setTimeout(function() {
            _myEditLock = false;
        }, 1); // some threading issue, i dunno
        if (!noUpdate) self.update();
    };
    self.switchData = function(newData) {
        unwatch(self.data, _onDataChange); // unwatch old data
        self.data = newData;
        watch(self.data, _onDataChange); // watch new data
        if (self.onDataChange) self.onDataChange(newData);
    };
    // WATCH DATA
    var _myEditLock = false;
    var _onDataChange = function(attr, op, newValue, oldValue) {
        if (_myEditLock) return; // prevent double update
        if (self.onDataChange) self.onDataChange();
    };
    watch(self.data, _onDataChange);
    /////////////////////////////////
    // ACTOR <-> EDITOR: "WIDGETS" //
    /////////////////////////////////
    self.dom = null; // to be created in "createWidget"!
    // Init & Create Widget (if none, just put a "todo")
    self.initWidget = self.initWidget || function() {
        self.dom = document.createElement("span");
        self.dom.innerHTML = "[todo: '" + self.type + "' widget]";
    };
    self.createWidget = function() {
        self.initWidget(self); // bind
        return self.dom;
    };
    // "Preview Data"
    self.previewData = null;
    /////////////////////////////////
    // ACTOR <-> PLAYER: "TARGETS" //
    /////////////////////////////////
    // Actors can ACT ON targets...
    self.onact = self.onact || function() {};
    self.act = function(target, altData) {
        // Real or Preview data?
        var data;
        if (altData) data = _clone(altData);
        else if (self.previewData) data = _clone(self.previewData);
        else data = _clone(self.data);
        // Try to pre-evaluate all data beforehand!
        self.children.forEach(function(childActor) {
            var dataID = childActor.dataID;
            if (dataID) {
                var value = childActor.get(target);
                data[dataID] = value;
            }
        });
        // On Act!
        return self.onact({
            actor: self,
            target: target,
            data: data
        });
    };
    // ...or GET INFO from targets.
    self.onget = self.onget || function() {};
    self.get = function(target) {
        // Real or Preview data?
        var data = self.previewData ? self.previewData : self.data;
        data = _clone(data);
        // On Get!
        return self.onget({
            actor: self,
            target: target,
            data: data
        });
    };
    /////////////////////////////////
    // INITIALIZE ///////////////////
    /////////////////////////////////
    // Initialization: string or function?
    if (self.init) {
        if (typeof self.init === "string") Joy.initializeWithString(self, self.init);
        if (typeof self.init === "function") self.init(self);
    }
};
/*****************

ACTOR TEMPLATES that future Actors can be made from! Looks like this:

Joy.add({
	name: "Turn turtle", // what the Actions Widget calls it
	type: "turtle/turn", // what it's called in Actor & Data
	tags: ["turtle", "action"], // meta tags
	init: "Turn {id:'angle', type:'number', placeholder:10} degrees", // for init'ing actor & widget
	onact: function(my){
		my.target.turn(my.data.angle);
	}
});

*****************/ // Add Template 
Joy.templates = [];
Joy.add = function(template) {
    Joy.templates.push(template);
};
// Get Template
Joy.getTemplateByType = function(type) {
    var template1 = Joy.templates.find(function(template) {
        return template.type == type;
    });
    if (!template1) throw Error("No actor template of type '" + type + "'!");
    return template1;
};
Joy.getTemplatesByTag = function(tag) {
    return Joy.templates.filter(function(template) {
        return template.tags.indexOf(tag) >= 0;
    });
};
// Modify Templates
Joy.modify = function() {
    // Arguments: (type, callback) or (type, rename, callback)
    var type, rename, callback;
    if (arguments.length == 2) {
        type = arguments[0];
        callback = arguments[1];
    } else {
        type = arguments[0];
        rename = arguments[1];
        callback = arguments[2];
    }
    // New Template inherits from old...
    var newTemplate = {};
    var _old = Joy.getTemplateByType(type);
    _configure(newTemplate, _old);
    // Then inherits from modifications
    var modifications = callback(_old);
    _configure(newTemplate, modifications);
    // Then, either RENAME or REMOVE old actor template!
    if (rename) _old.type = rename;
    else _removeFromArray(Joy.templates, _old);
    // And add the new one!
    Joy.add(newTemplate);
};
// Converts a string into an ENTIRE ACTOR
Joy.initializeWithString = function(self, markup) {
    var actorOptions = [];
    var html = markup;
    // Split the markup into Actor Options & Widget HTML
    var startIndex = -1;
    var endIndex = -1;
    var stack = 0;
    // Go through each character. When you find a top-level "{...}" JSON string,
    // 1) parse it into an Actor Option
    // 2) replace it in the markup with a <span> saying where its widget should go
    for(var i = 0; i < html.length; i++){
        var character = html[i];
        // ONLY the top-level {...}'s...
        if (stack == 0 && character == "{") startIndex = i;
        if (character == "{") stack++;
        if (character == "}") stack--;
        if (stack == 0 && character == "}") {
            endIndex = i + 1;
            // Cut out start to end, save as JSON & replace markup with <span>
            var json = html.slice(startIndex, endIndex);
            json = json.replace(/(\w+)\:/g, "'$1':"); // cleanup: give nameerties quotes
            json = json.replace(/\'/g, '"'); // cleanup: replace ' with "
            json = JSON.parse(json);
            json.dataID = json.dataID || json.id; // cleanup: dataID=id by default
            actorOptions.push(json); // remember option!
            html = html.substr(0, startIndex) + "<span id='widget_" + json.id + "'></span>" + html.substr(endIndex); // replace markup
            // GO BACK TO THE BEGINNING & START OVER
            // because i'm too lazy to calculate where the index should go now
            i = 0;
            startIndex = -1;
            endIndex = -1;
            stack = 0;
        }
    }
    // Create all child Actors
    actorOptions.forEach(function(actorOption) {
        self.addChild(actorOption);
    });
    // Create Widget: html, and replace
    self.createWidget = function() {
        self.dom = document.createElement("span");
        self.dom.innerHTML = html;
        // Replace all <spans> with childrens' widgets.
        self.children.forEach(function(child) {
            // Make child create a widget!
            child.createWidget();
            // Replace <span> with child's widget
            var selector = "#widget_" + child.id;
            var span = self.dom.querySelector(selector);
            self.dom.replaceChild(child.dom, span);
        });
        // Return to sender
        return self.dom;
    };
};
/*****************

JOY MODULES

So that a player can slowly step up the staircase of complexity
(also maybe import Actors in the future?)

*****************/ Joy.modules = {};
Joy.module = function(id, callback) {
    Joy.modules[id] = callback;
};
Joy.loadModule = function(id) {
    var module = Joy.modules[id];
    if (!module) throw Error("There's no module called '" + id + "'!");
    module();
};
/******************************

GETTING & SETTING REFERENCES FROM TOP.DATA

This is so you can sync variables, functions, strings, object names, etc.

Each reference should have: Unique ID, Tag, Data, Watchers
// (when Watchers[].length==0, delete that reference. Garbage day)

******************************/ Joy.initReferences = function(actor) {
    // Create if not already
    var topdata = actor.top.data;
    if (!topdata._references) topdata._references = {};
    // Zero out all connected, it's a brand new world.
    for(var id in topdata._references){
        var ref = topdata._references[id];
        ref.connected = 0;
    }
};
Joy.createReference = function(actor, tags, data) {
    // The reference
    var topdata = actor.top.data;
    var reference = {
        id: _generateUID(topdata._references),
        tags: _forceToArray(tags),
        data: data,
        connected: 0 // tracks how many actors this thing actually depends on
    };
    topdata._references[reference.id] = reference;
    // Gimme
    return reference;
};
Joy.getReferenceById = function(actor, refID) {
    var topdata = actor.top.data;
    return topdata._references[refID];
};
Joy.getReferencesByTag = function(actor, tag) {
    var topdata = actor.top.data;
    var refs = [];
    for(var id in topdata._references){
        var ref = topdata._references[id];
        if (ref.tags.indexOf(tag) >= 0) refs.push(ref);
    }
    return refs;
};
Joy.connectReference = function(actor, refID) {
    var ref = Joy.getReferenceById(actor, refID);
    ref.connected++;
};
Joy.disconnectReference = function(actor, refID) {
    var ref = Joy.getReferenceById(actor, refID);
    ref.connected--;
    if (ref.connected == 0) Joy.deleteReference(actor, refID);
};
Joy.deleteReference = function(actor, refID) {
    var topdata = actor.top.data;
    var reference = topdata._references[refID];
    delete topdata._references[refID];
};
/*
Joy.watchReference = function(topdata, id){
	var reference = topdata._references[id];
	reference._creators++;
	return reference;
};

Joy.unwatchReference = function(topdata, id){

	// The reference?
	var reference = topdata._references[id];
	reference._creators--;

	// If no more _creators, DELETE.
	if(reference._creators==0) Joy.deleteReference(topdata, id);

	return reference;

};
*/ /******************************

SAVE & LOAD

No need for a server!
Just compresses JSON with LZ-String and puts it in the URL

******************************/ Joy.saveToURL = function(data) {
    var json = JSON.stringify(data); // Stringify
    var compressed = LZString.compressToEncodedURIComponent(json); // Compress
    var url = window.location.origin + window.location.pathname + "?data=" + compressed; // append to current URL
    // TODO: keep # and OTHER query stuff the same, just change ?data
    return url;
};
Joy.loadFromURL = function() {
    var hash = _getParameterByName("data");
    var decompressed = LZString.decompressFromEncodedURIComponent(hash);
    if (decompressed) {
        var data = JSON.parse(decompressed);
        return data;
    } else return null;
};
/**********************************

RANDOM CRAP TO MAKE MY LIFE EASIER

TODO: namespace these to avoid conflict

**********************************/ // For true believers
Math.TAU = 2 * Math.PI;
// Deep clone
var _clone = function(json) {
    return JSON.parse(JSON.stringify(json));
};
// "Configure": or just slap all properties of one object onto another
var _configure = function(target, config) {
    for(var key in config){
        var value = config[key];
        target[key] = value;
    }
};
// Array stuff
var _removeFromArray = function(array, toDelete) {
    var index = array.indexOf(toDelete);
    if (index < 0) return false;
    array.splice(index, 1);
    return true;
};
// Instant space
var _nbsp = function() {
    var span = document.createElement("span");
    span.innerHTML = "&nbsp;";
    return span;
};
// When in Rome, use a completely unuseable numeric system
// from http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
var _numberToRoman = function(num) {
    if (!+num) return NaN;
    var digits = String(+num).split(""), key = [
        "",
        "C",
        "CC",
        "CCC",
        "CD",
        "D",
        "DC",
        "DCC",
        "DCCC",
        "CM",
        "",
        "X",
        "XX",
        "XXX",
        "XL",
        "L",
        "LX",
        "LXX",
        "LXXX",
        "XC",
        "",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX"
    ], roman = "", i = 3;
    while(i--)roman = (key[+digits.pop() + i * 10] || "") + roman;
    var result = Array(+digits.join("") + 1).join("M") + roman;
    return result.toLowerCase();
};
// Number to Alphabetic Base 26
// from https://stackoverflow.com/a/8604591
var _numberToAlphabet = function(a) {
    var alpha = "abcdefghijklmnopqrstuvwxyz";
    // First figure out how many digits there are.
    var c = 0;
    var x = 1;
    while(a >= x){
        c++;
        a -= x;
        x *= 26;
    }
    // Now you can do normal base conversion.
    var s = "";
    for(var i = 0; i < c; i++){
        s = alpha.charAt(a % 26) + s;
        a = Math.floor(a / 26);
    }
    return s;
};
// Helps prevent copy-pasting weird stuff into contenteditable
// see: http://jsfiddle.net/marinagon/1v63t05q/
var _insertTextAtCursor = function(text) {
    var sel, range, html;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    } else if (document.selection && document.selection.createRange) document.selection.createRange().text = text;
};
var _preventWeirdCopyPaste = function(element) {
    element.addEventListener("paste", function(e) {
        e.preventDefault();
        if (e.clipboardData && e.clipboardData.getData) {
            var text = e.clipboardData.getData("text/plain");
            document.execCommand("insertHTML", false, text);
        } else if (window.clipboardData && window.clipboardData.getData) {
            var text = window.clipboardData.getData("Text");
            _insertTextAtCursor(text);
        }
    });
};
var _selectAll = function(input, collapseToEnd) {
    // select all text in contenteditable
    // see http://stackoverflow.com/a/6150060/145346
    var range = document.createRange();
    range.selectNodeContents(input);
    if (collapseToEnd) range.collapse(false); // total hack
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
};
var _unselectAll = function() {
    var selection = window.getSelection();
    selection.removeAllRanges();
};
var _fixStringInput = function(input) {
    // Empty? Fix that!
    if (input.innerText == "") {
        input.innerHTML = "&nbsp;"; // Is it empty? Let's fix that.
        _selectAll(input);
    }
    // Line breaks? HECK NO!
    if (input.innerHTML.search("<br>") >= 0) {
        input.innerHTML = input.innerHTML.replace(/(\<br\>)+/g, "&nbsp;");
        _selectAll(input, true);
    }
};
var _blurOnEnter = function(input) {
    input.addEventListener("keypress", function(event) {
        if (event.which === 13) {
            event.preventDefault();
            input.blur();
        }
    });
};
// Find a unique ID within an object
var _generateUID = function(obj) {
    var num = 0;
    var id;
    do {
        //id = Math.floor(Math.random()*1000000)+""; // a MILLION random IDs, hopefully don't go over
        id = "id" + num; // linear time but who cares
        num++;
    }while (obj[id]);
    return id;
};
// Make this an array, if not already
var _forceToArray = function(thing) {
    if (Array.isArray(thing)) return thing;
    else return [
        thing
    ];
};
// Generate a deterministically pseudo-random color from an ID
// TODO: not looking like crap. same luminance, etc.
//var _generateColor = function(obj){	};
// Remove all children from a DOM
var _emptyDOM = function(node) {
    while(node.hasChildNodes())node.removeChild(node.lastChild);
};
// Get Query Param
// thx to https://stackoverflow.com/a/901144
var _getParameterByName = function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};
////////////////////////////
// Good Color Shtuff ///////
// thx to: https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately/17243070#17243070
////////////////////////////
/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/ function _HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) s = h.s, v = h.v, h = h.h;
    h /= 360; // convert, yo.
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch(i % 6){
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}
function _HSVToRGBString(h, s, v) {
    if (arguments.length === 1) s = h[1], v = h[2], h = h[0]; // cast to different vars
    var rgb = _HSVtoRGB(h, s, v);
    return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
}
// well, "random"
var _randomHSVIndex = 0;
var _randomHSVArray = [
    [
        0,
        0.6,
        1.0
    ],
    [
        30,
        0.8,
        1.0
    ],
    //[120, 0.9, 0.9],
    [
        210,
        0.8,
        1.0
    ],
    [
        260,
        0.7,
        1.0
    ],
    [
        310,
        0.6,
        1.0
    ]
];
function _randomHSV() {
    var hsv = _randomHSVArray[_randomHSVIndex];
    _randomHSVIndex = (_randomHSVIndex + 1) % _randomHSVArray.length;
    //return _HSVToRGBString(hsv[0], hsv[1], hsv[2]);
    return hsv;
}
function _forceToRGB(color) {
    if (Array.isArray(color)) color = _HSVToRGBString(color[0], color[1], color[2]); // HSV
    return color;
}
!function(a) {
    module.exports = a();
}(function() {
    function x() {
        w = null;
        for(var a = 0; a < v.length; a++)v[a]();
        v.length = 0;
    }
    var a1 = {
        noMore: !1,
        useDirtyCheck: !1
    }, b1 = [], c1 = [], d1 = [], e1 = !1;
    try {
        e1 = Object.defineProperty && Object.defineProperty({}, "x", {});
    } catch (a2) {}
    var f1 = function(a) {
        var b = {};
        return a && "[object Function]" == b.toString.call(a);
    }, h1 = function(a) {
        return "[object Array]" === Object.prototype.toString.call(a);
    }, i1 = function(a) {
        return "[object Object]" === ({}).toString.apply(a);
    }, j1 = function(a, b) {
        var c = [], d = [];
        if ("string" != typeof a && "string" != typeof b) {
            if (h1(a) && b) for(var e = 0; e < a.length; e++)void 0 === b[e] && c.push(e);
            else for(var e in a)a.hasOwnProperty(e) && b && void 0 === b[e] && c.push(e);
            if (h1(b) && a) for(var f = 0; f < b.length; f++)void 0 === a[f] && d.push(f);
            else for(var f in b)b.hasOwnProperty(f) && a && void 0 === a[f] && d.push(f);
        }
        return {
            added: c,
            removed: d
        };
    }, k1 = function(a) {
        if (null == a || "object" != typeof a) return a;
        var b = a.constructor();
        for(var c in a)b[c] = a[c];
        return b;
    }, l1 = function(a3, b, c, d) {
        try {
            Object.observe(a3, function(a4) {
                a4.forEach(function(a) {
                    a.name === b && d(a.object[a.name]);
                });
            });
        } catch (e) {
            try {
                Object.defineProperty(a3, b, {
                    get: c,
                    set: function(a) {
                        d.call(this, a, !0);
                    },
                    enumerable: !0,
                    configurable: !0
                });
            } catch (e) {
                try {
                    Object.prototype.__defineGetter__.call(a3, b, c), Object.prototype.__defineSetter__.call(a3, b, function(a) {
                        d.call(this, a, !0);
                    });
                } catch (c) {
                    n1(a3, b, d);
                }
            }
        }
    }, m1 = function(a, b, c) {
        try {
            Object.defineProperty(a, b, {
                enumerable: !1,
                configurable: !0,
                writable: !1,
                value: c
            });
        } catch (d) {
            a[b] = c;
        }
    }, n1 = function(a, b, d) {
        c1[c1.length] = {
            prop: b,
            object: a,
            orig: k1(a[b]),
            callback: d
        };
    }, o1 = function() {
        f1(arguments[1]) ? p.apply(this, arguments) : h1(arguments[1]) ? q1.apply(this, arguments) : r.apply(this, arguments);
    }, p = function(a, b, c, d) {
        if ("string" != typeof a && (a instanceof Object || h1(a))) {
            if (h1(a)) {
                if (D(a, "__watchall__", b, c), void 0 === c || c > 0) for(var f = 0; f < a.length; f++)p(a[f], b, c, d);
            } else {
                var f, g = [];
                for(f in a)"$val" == f || !e1 && "watchers" === f || Object.prototype.hasOwnProperty.call(a, f) && g.push(f);
                q1(a, g, b, c, d);
            }
            d && R(a, "$$watchlengthsubjectroot", b, c);
        }
    }, q1 = function(a, b, c, d, e) {
        if ("string" != typeof a && (a instanceof Object || h1(a))) for(var f = 0; f < b.length; f++){
            var g = b[f];
            r(a, g, c, d, e);
        }
    }, r = function(a, b, c, d, e) {
        "string" != typeof a && (a instanceof Object || h1(a)) && (f1(a[b]) || (null != a[b] && (void 0 === d || d > 0) && p(a[b], c, void 0 !== d ? d - 1 : d), D(a, b, c, d), e && (void 0 === d || d > 0) && R(a, b, c, d)));
    }, s = function() {
        f1(arguments[1]) ? t.apply(this, arguments) : h1(arguments[1]) ? u.apply(this, arguments) : I.apply(this, arguments);
    }, t = function(a5, b) {
        if (!(a5 instanceof String) && (a5 instanceof Object || h1(a5))) {
            if (h1(a5)) {
                for(var c = [
                    "__watchall__"
                ], d = 0; d < a5.length; d++)c.push(d);
                u(a5, c, b);
            } else {
                var e = function(a) {
                    var c = [];
                    for(var d in a)a.hasOwnProperty(d) && (a[d] instanceof Object ? e(a[d]) : c.push(d));
                    u(a, c, b);
                };
                e(a5);
            }
        }
    }, u = function(a, b, c) {
        for(var d in b)b.hasOwnProperty(d) && I(a, b[d], c);
    }, v = [], w = null, y = function() {
        return w || (w = setTimeout(x)), w;
    }, z = function(a) {
        null == w && y(), v[v.length] = a;
    }, A = function() {
        var a = f1(arguments[2]) ? C : B;
        a.apply(this, arguments);
    }, B = function(a, b, c2, d2) {
        var i2, e = null, f = -1, g = h1(a), j2 = function(c, d, h, i) {
            var j = y();
            if (f !== j && (f = j, e = {
                type: "update"
            }, e.value = a, e.splices = null, z(function() {
                b.call(this, e), e = null;
            })), g && a === this && null !== e) {
                if ("pop" === d || "shift" === d) h = [], i = [
                    i
                ];
                else if ("push" === d || "unshift" === d) h = [
                    h
                ], i = [];
                else if ("splice" !== d) return;
                e.splices || (e.splices = []), e.splices[e.splices.length] = {
                    index: c,
                    deleteCount: i ? i.length : 0,
                    addedCount: h ? h.length : 0,
                    added: h,
                    deleted: i
                };
            }
        };
        i2 = 1 == c2 ? void 0 : 0, p(a, j2, i2, d2);
    }, C = function(a, b, c, d, e) {
        a && b && (r(a, b, function(a, b, f, g) {
            var j = {
                type: "update"
            };
            j.value = f, j.oldvalue = g, (d && i1(f) || h1(f)) && B(f, c, d, e), c.call(this, j);
        }, 0), (d && i1(a[b]) || h1(a[b])) && B(a[b], c, d, e));
    }, D = function(b, c, d3, e) {
        var f2 = !1, g1 = h1(b);
        b.watchers || (m1(b, "watchers", {}), g1 && H(b, function(a, d, f, g) {
            if (N(b, a, d, f, g), 0 !== e && f && (i1(f) || h1(f))) {
                var j, k, l, m, n = b.watchers[c];
                for((m = b.watchers.__watchall__) && (n = n ? n.concat(m) : m), l = n ? n.length : 0, j = 0; j < l; j++)if ("splice" !== d) p(f, n[j], void 0 === e ? e : e - 1);
                else for(k = 0; k < f.length; k++)p(f[k], n[j], void 0 === e ? e : e - 1);
            }
        })), b.watchers[c] || (b.watchers[c] = [], g1 || (f2 = !0));
        for(var j3 = 0; j3 < b.watchers[c].length; j3++)if (b.watchers[c][j3] === d3) return;
        if (b.watchers[c].push(d3), f2) {
            var k2 = b[c], o = function() {
                return k2;
            }, q = function(d, f) {
                var g = k2;
                if (k2 = d, 0 !== e && b[c] && (i1(b[c]) || h1(b[c])) && !b[c].watchers) {
                    var j, l = b.watchers[c].length;
                    for(j = 0; j < l; j++)p(b[c], b.watchers[c][j], void 0 === e ? e : e - 1);
                }
                return K(b, c) ? void L(b, c) : void (a1.noMore || g !== d && (f ? N(b, c, "set", d, g) : E(b, c, "set", d, g), a1.noMore = !1));
            };
            a1.useDirtyCheck ? n1(b, c, q) : l1(b, c, o, q);
        }
    }, E = function(a, b, c, d, e) {
        if (void 0 !== b) {
            var f, g, h = a.watchers[b];
            (g = a.watchers.__watchall__) && (h = h ? h.concat(g) : g), f = h ? h.length : 0;
            for(var i = 0; i < f; i++)h[i].call(a, b, c, d, e);
        } else for(var b in a)a.hasOwnProperty(b) && E(a, b, c, d, e);
    }, F = [
        "pop",
        "push",
        "reverse",
        "shift",
        "sort",
        "slice",
        "unshift",
        "splice"
    ], G = function(a, b, c, d) {
        m1(a, c, function() {
            var f, g, h, i, e = 0;
            if ("splice" === c) {
                var j = arguments[0], k = j + arguments[1];
                for(h = a.slice(j, k), g = [], f = 2; f < arguments.length; f++)g[f - 2] = arguments[f];
                e = j;
            } else g = arguments.length > 0 ? arguments[0] : void 0;
            return i = b.apply(a, arguments), "slice" !== c && ("pop" === c ? (h = i, e = a.length) : "push" === c ? e = a.length - 1 : "shift" === c ? h = i : "unshift" !== c && void 0 === g && (g = i), d.call(a, e, c, g, h)), i;
        });
    }, H = function(a, b) {
        if (f1(b) && a && !(a instanceof String) && h1(a)) for(var d, c = F.length; c--;)d = F[c], G(a, a[d], d, b);
    }, I = function(a, b, c) {
        if (b) {
            if (a.watchers[b]) {
                if (void 0 === c) delete a.watchers[b];
                else for(var d = 0; d < a.watchers[b].length; d++){
                    var e = a.watchers[b][d];
                    e == c && a.watchers[b].splice(d, 1);
                }
            }
        } else delete a.watchers;
        S(a, b, c), T(a, b);
    }, J = function(a, b) {
        if (a.watchers) {
            var c = "__wjs_suspend__" + (void 0 !== b ? b : "");
            a.watchers[c] = !0;
        }
    }, K = function(a, b) {
        return a.watchers && (a.watchers.__wjs_suspend__ || a.watchers["__wjs_suspend__" + b]);
    }, L = function(a, b) {
        z(function() {
            delete a.watchers.__wjs_suspend__, delete a.watchers["__wjs_suspend__" + b];
        });
    }, M = null, N = function(a, b, c, e, f) {
        d1[d1.length] = {
            obj: a,
            prop: b,
            mode: c,
            newval: e,
            oldval: f
        }, null === M && (M = setTimeout(O));
    }, O = function() {
        var a = null;
        M = null;
        for(var b = 0; b < d1.length; b++)a = d1[b], E(a.obj, a.prop, a.mode, a.newval, a.oldval);
        a && (d1 = [], a = null);
    }, P = function() {
        for(var a = 0; a < b1.length; a++){
            var d = b1[a];
            if ("$$watchlengthsubjectroot" === d.prop) {
                var e = j1(d.obj, d.actual);
                (e.added.length || e.removed.length) && (e.added.length && q1(d.obj, e.added, d.watcher, d.level - 1, !0), d.watcher.call(d.obj, "root", "differentattr", e, d.actual)), d.actual = k1(d.obj);
            } else {
                var e = j1(d.obj[d.prop], d.actual);
                if (e.added.length || e.removed.length) {
                    if (e.added.length) for(var f = 0; f < d.obj.watchers[d.prop].length; f++)q1(d.obj[d.prop], e.added, d.obj.watchers[d.prop][f], d.level - 1, !0);
                    E(d.obj, d.prop, "differentattr", e, d.actual);
                }
                d.actual = k1(d.obj[d.prop]);
            }
        }
        var g, h;
        if (c1.length > 0) for(var a = 0; a < c1.length; a++)g = c1[a], h = g.object[g.prop], Q(g.orig, h) || (g.orig = k1(h), g.callback(h));
    }, Q = function(a, b) {
        var c, d = !0;
        if (a !== b) {
            if (i1(a)) {
                for(c in a)if ((e1 || "watchers" !== c) && a[c] !== b[c]) {
                    d = !1;
                    break;
                }
            } else d = !1;
        }
        return d;
    }, R = function(a, c, d, e) {
        var f;
        f = k1("$$watchlengthsubjectroot" === c ? a : a[c]), b1.push({
            obj: a,
            prop: c,
            actual: f,
            watcher: d,
            level: e
        });
    }, S = function(a, c, d) {
        for(var e = 0; e < b1.length; e++){
            var f = b1[e];
            f.obj == a && (c && f.prop != c || d && f.watcher != d || b1.splice(e--, 1));
        }
    }, T = function(a, b) {
        for(var d, e = 0; e < c1.length; e++){
            var f = c1[e], g = f.object.watchers;
            d = f.object == a && (!b || f.prop == b) && g && (!b || !g[b] || 0 == g[b].length), d && c1.splice(e--, 1);
        }
    };
    return setInterval(P, 50), a1.watch = o1, a1.unwatch = s, a1.callWatchers = E, a1.suspend = J, a1.onChange = A, a1;
});
var LZString = function() {
    function o2(o, r) {
        if (!t1[o]) {
            t1[o] = {};
            for(var n = 0; n < o.length; n++)t1[o][o.charAt(n)] = n;
        }
        return t1[o][r];
    }
    var r1 = String.fromCharCode, n2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", e2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$", t1 = {}, i3 = {
        compressToBase64: function(o3) {
            if (null == o3) return "";
            var r = i3._compress(o3, 6, function(o) {
                return n2.charAt(o);
            });
            switch(r.length % 4){
                default:
                case 0:
                    return r;
                case 1:
                    return r + "===";
                case 2:
                    return r + "==";
                case 3:
                    return r + "=";
            }
        },
        decompressFromBase64: function(r) {
            return null == r ? "" : "" == r ? null : i3._decompress(r.length, 32, function(e) {
                return o2(n2, r.charAt(e));
            });
        },
        compressToUTF16: function(o4) {
            return null == o4 ? "" : i3._compress(o4, 15, function(o) {
                return r1(o + 32);
            }) + " ";
        },
        decompressFromUTF16: function(o) {
            return null == o ? "" : "" == o ? null : i3._decompress(o.length, 16384, function(r) {
                return o.charCodeAt(r) - 32;
            });
        },
        compressToUint8Array: function(o) {
            for(var r = i3.compress(o), n = new Uint8Array(2 * r.length), e = 0, t = r.length; t > e; e++){
                var s = r.charCodeAt(e);
                n[2 * e] = s >>> 8, n[2 * e + 1] = s % 256;
            }
            return n;
        },
        decompressFromUint8Array: function(o5) {
            if (null === o5 || void 0 === o5) return i3.decompress(o5);
            for(var n = new Array(o5.length / 2), e = 0, t = n.length; t > e; e++)n[e] = 256 * o5[2 * e] + o5[2 * e + 1];
            var s = [];
            return n.forEach(function(o) {
                s.push(r1(o));
            }), i3.decompress(s.join(""));
        },
        compressToEncodedURIComponent: function(o6) {
            return null == o6 ? "" : i3._compress(o6, 6, function(o) {
                return e2.charAt(o);
            });
        },
        decompressFromEncodedURIComponent: function(r) {
            return null == r ? "" : "" == r ? null : (r = r.replace(/ /g, "+"), i3._decompress(r.length, 32, function(n) {
                return o2(e2, r.charAt(n));
            }));
        },
        compress: function(o7) {
            return i3._compress(o7, 16, function(o) {
                return r1(o);
            });
        },
        _compress: function(o, r, n) {
            if (null == o) return "";
            var e, t, i, s = {}, p = {}, u = "", c = "", a = "", l = 2, f = 3, h = 2, d = [], m = 0, v = 0;
            for(i = 0; i < o.length; i += 1)if (u = o.charAt(i), Object.prototype.hasOwnProperty.call(s, u) || (s[u] = f++, p[u] = !0), c = a + u, Object.prototype.hasOwnProperty.call(s, c)) a = c;
            else {
                if (Object.prototype.hasOwnProperty.call(p, a)) {
                    if (a.charCodeAt(0) < 256) {
                        for(e = 0; h > e; e++)m <<= 1, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++;
                        for(t = a.charCodeAt(0), e = 0; 8 > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
                    } else {
                        for(t = 1, e = 0; h > e; e++)m = m << 1 | t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t = 0;
                        for(t = a.charCodeAt(0), e = 0; 16 > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
                    }
                    l--, 0 == l && (l = Math.pow(2, h), h++), delete p[a];
                } else for(t = s[a], e = 0; h > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
                l--, 0 == l && (l = Math.pow(2, h), h++), s[c] = f++, a = String(u);
            }
            if ("" !== a) {
                if (Object.prototype.hasOwnProperty.call(p, a)) {
                    if (a.charCodeAt(0) < 256) {
                        for(e = 0; h > e; e++)m <<= 1, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++;
                        for(t = a.charCodeAt(0), e = 0; 8 > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
                    } else {
                        for(t = 1, e = 0; h > e; e++)m = m << 1 | t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t = 0;
                        for(t = a.charCodeAt(0), e = 0; 16 > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
                    }
                    l--, 0 == l && (l = Math.pow(2, h), h++), delete p[a];
                } else for(t = s[a], e = 0; h > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
                l--, 0 == l && (l = Math.pow(2, h), h++);
            }
            for(t = 2, e = 0; h > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1;
            for(;;){
                if (m <<= 1, v == r - 1) {
                    d.push(n(m));
                    break;
                }
                v++;
            }
            return d.join("");
        },
        decompress: function(o) {
            return null == o ? "" : "" == o ? null : i3._decompress(o.length, 32768, function(r) {
                return o.charCodeAt(r);
            });
        },
        _decompress: function(o, n, e) {
            var t, i, s, p, u, c, a, l, f = [], h = 4, d = 4, m = 3, v = "", w = [], A = {
                val: e(0),
                position: n,
                index: 1
            };
            for(i = 0; 3 > i; i += 1)f[i] = i;
            for(p = 0, c = Math.pow(2, 2), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
            switch(t = p){
                case 0:
                    for(p = 0, c = Math.pow(2, 8), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                    l = r1(p);
                    break;
                case 1:
                    for(p = 0, c = Math.pow(2, 16), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                    l = r1(p);
                    break;
                case 2:
                    return "";
            }
            for(f[3] = l, s = l, w.push(l);;){
                if (A.index > o) return "";
                for(p = 0, c = Math.pow(2, m), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                switch(l = p){
                    case 0:
                        for(p = 0, c = Math.pow(2, 8), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                        f[d++] = r1(p), l = d - 1, h--;
                        break;
                    case 1:
                        for(p = 0, c = Math.pow(2, 16), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                        f[d++] = r1(p), l = d - 1, h--;
                        break;
                    case 2:
                        return w.join("");
                }
                if (0 == h && (h = Math.pow(2, m), m++), f[l]) v = f[l];
                else {
                    if (l !== d) return null;
                    v = s + s.charAt(0);
                }
                w.push(v), f[d++] = s + v.charAt(0), h--, s = v, 0 == h && (h = Math.pow(2, m), m++);
            }
        }
    };
    return i3;
}();
"function" == typeof define && define.amd ? define(function() {
    return LZString;
}) : null != module && (module.exports = LZString);
(function() {
    // SINGLETON
    var ui = {};
    Joy.ui = ui;
    ui.init = function(master) {
        // CSS
        master.dom.classList.add("joy-master");
        // Manual Scroll (to prevent it propagating up...)
        master.container.addEventListener("wheel", function(event) {
            var delta = event.deltaY;
            master.container.scrollTop += delta;
            event.preventDefault();
            return false;
        });
        // Prevent accidental backspace-history
        // because why the heck is this even a thing, jeez.
        // thx: https://stackoverflow.com/a/2768256
        document.body.addEventListener("keydown", function(event) {
            if (event.keyCode === 8) {
                var doPrevent = true;
                var types = [
                    "text",
                    "password",
                    "file",
                    "search",
                    "email",
                    "number",
                    "date",
                    "color",
                    "datetime",
                    "datetime-local",
                    "month",
                    "range",
                    "search",
                    "tel",
                    "time",
                    "url",
                    "week"
                ];
                var d = event.srcElement || event.target;
                var disabled = d.getAttribute("readonly") || d.getAttribute("disabled");
                if (!disabled) {
                    if (d.isContentEditable) doPrevent = false;
                    else if (d.tagName.toUpperCase() == "INPUT") {
                        var type = d.getAttribute("type");
                        if (type) type = type.toLowerCase();
                        if (types.indexOf(type) > -1) doPrevent = false;
                    } else if (d.tagName.toUpperCase() == "TEXTAREA") doPrevent = false;
                }
                if (doPrevent) {
                    event.preventDefault();
                    return false;
                }
            }
        });
    };
    /********************
Button's config:
{
	label: "derp",
	onclick: function(){},
	styles: ["round", "hollow"] // optional
}
********************/ ui.Button = function(config) {
        var self = this;
        // DOM. Pretty simple.
        var dom = document.createElement("div");
        dom.className = "joy-button";
        self.dom = dom;
        // Setting Label
        config.label = config.label || "";
        self.label = document.createElement("span");
        dom.appendChild(self.label);
        self.setLabel = function(newLabel) {
            self.label.innerHTML = newLabel;
        };
        self.setLabel(config.label);
        // On Click
        dom.onclick = function() {
            config.onclick();
        };
        // Styles
        self.styles = config.styles || [];
        for(var i = 0; i < self.styles.length; i++)dom.classList.add(self.styles[i]);
    };
    /********************
ChooserButton's config:
{
	value: [current value], (optional)
	staticLabel: "+", (optional)
	options: options,
	onchange: function(value){},
	position: "left" // optional: for the Joy.modal
	styles: ["round", "hollow"] // optional: for the button
}
********************/ ui.ChooserButton = function(config) {
        var self = this;
        // Properties
        self.value = config.value;
        self.options = config.options; // expose, coz may change later
        self.onchange = config.onchange;
        // IF NO VALUE, PICK FIRST ONE, WHATEVER
        if (!self.value) self.value = self.options[0].value;
        // This is just a Button that calls Chooser Popup when clicked
        ui.Button.call(self, {
            label: config.staticLabel === undefined ? "" : config.staticLabel,
            onclick: function() {
                // Chooser Modal!
                Joy.modal.Chooser({
                    source: self.dom,
                    options: self.options,
                    onchange: function(value) {
                        // Update value & label
                        self.value = value;
                        _updateLabel();
                        // On Select callback
                        self.onchange(value);
                    },
                    position: config.position
                });
            },
            styles: config.styles
        });
        // Helper method
        var _updateLabel = function() {
            if (config.staticLabel !== undefined) return; // if static, no.
            // Otherwise, find the corresponding label to my current value & set to that.
            var label = self.options.find(function(pair) {
                return pair.value == self.value;
            }).label;
            self.setLabel(label);
        };
        _updateLabel();
    };
    /********************
Scrubber's config:
{
	min: 0,
	max: 180,
	value: [current value],
	onchange: function(value){}
}
********************/ ui.Scrubber = function(config) {
        var self = this;
        // Config...
        var min = config.min;
        var max = config.max;
        // console.log(config);
        self.value = config.value;
        // DOM
        var dom = document.createElement("div");
        dom.className = "joy-scrubber";
        self.dom = dom;
        // DOM *is* Label
        self.setLabel = function(newValue) {
            dom.innerHTML = newValue.toFixed(self.sigfigs);
        };
        // On Value Change: make sure it's the right num of sigfigs
        var _onValueChange = function(newValue) {
            newValue = parseFloat(newValue.toFixed(self.sigfigs));
            config.onchange(newValue);
        };
        // DRAG IT, BABY
        var isDragging = false;
        var wasDragging = false;
        var lastDragX, startDragValue;
        var delta = 0;
        var _onmousedown = function(event) {
            isDragging = true;
            lastDragX = event.clientX;
            startDragValue = self.value;
            delta = 0;
            if (config.onstart) config.onstart();
        };
        var _onmousemove = function(event) {
            if (isDragging) {
                wasDragging = true;
                // What's the step?
                var step = Math.pow(0.1, self.sigfigs);
                step = parseFloat(step.toPrecision(1)); // floating point crap
                // Change number
                var velocity = event.clientX - lastDragX;
                lastDragX = event.clientX;
                var multiplier = Math.abs(velocity / 10);
                if (multiplier < 1) multiplier = 1;
                if (multiplier > 3) multiplier = 3;
                delta += velocity * multiplier;
                var dx = Math.floor(delta / 2);
                var newValue = startDragValue + dx * step;
                newValue = _boundNumber(newValue);
                // Only update if ACTUALLY new.
                if (self.value != newValue) {
                    self.value = newValue;
                    self.setLabel(newValue);
                    _onValueChange(newValue);
                }
            }
        };
        var _boundNumber = function(newValue) {
            if (min !== undefined && newValue < min) newValue = min;
            if (max !== undefined && newValue > max) newValue = max;
            // console.log("min ", min, " max ", max);
            return newValue;
        };
        var _onmouseup = function() {
            isDragging = false;
            if (config.onstop) config.onstop();
            setTimeout(function() {
                wasDragging = false; // so can't "click" if let go on scrubber
            }, 1);
        };
        // MOUSE EVENTS
        dom.addEventListener("mousedown", _onmousedown);
        window.addEventListener("mousemove", _onmousemove);
        window.addEventListener("mouseup", _onmouseup);
        // KILL ALL LISTENERS
        self.kill = function() {
            dom.removeEventListener("mousedown", _onmousedown);
            window.removeEventListener("mousemove", _onmousemove);
            window.removeEventListener("mouseup", _onmouseup);
        };
        // On click: edit manually!
        var _manuallyEditing = false;
        dom.onblur = function() {
            if (_manuallyEditing) {
                _manuallyEditing = false;
                dom.contentEditable = false;
                _unselectAll();
                // Done manually updating! The new number!
                _countSigFigs(dom.innerText); // re-calc sigfigs
                self.value = _parseNumber();
                self.setLabel(self.value);
                _onValueChange(self.value);
                // On Stop editing
                if (config.onstop) config.onstop();
            }
        };
        _preventWeirdCopyPaste(dom);
        _blurOnEnter(dom);
        dom.onclick = function() {
            if (wasDragging) return; // can't click if I was just dragging!
            _manuallyEditing = true;
            // Make it editable, and select it!
            dom.contentEditable = true;
            dom.spellcheck = false;
            _selectAll(dom);
            // On Start editing
            if (config.onstart) config.onstart();
        };
        dom.oninput = function(event) {
            if (!_manuallyEditing) return;
            // Also, no non-decimal or numbers
            var regex = /[^0-9.\-]/g;
            if (dom.innerText.match(regex)) dom.innerText = dom.innerText.replace(regex, "");
            _fixStringInput(dom);
            // Show that change!
            _onValueChange(_parseNumber());
        };
        var _parseNumber = function() {
            var num = parseFloat(dom.innerText);
            if (isNaN(num)) num = 0;
            num = _boundNumber(num);
            return num;
        };
        // How many significant digits?
        self.sigfigs = 0;
        var _countSigFigs = function(string) {
            string = string.toString();
            var sigfigs;
            var positionOfPeriod = string.search(/\./);
            if (positionOfPeriod >= 0) sigfigs = string.length - 1 - positionOfPeriod;
            else sigfigs = 0;
            self.sigfigs = sigfigs;
        };
        _countSigFigs(self.value);
        // Current value...
        self.setLabel(self.value);
    };
    /********************
String's config:
{
	prefix: "[",
	suffix: "]",
	color:"whatever",
	value: data.value,
	onchange: function(value){
		data.value = value;
		self.update();
	},
	styles: ["comment"]
}
********************/ ui.String = function(config) {
        var self = this;
        // DOM
        var dom = document.createElement("div");
        dom.className = "joy-string";
        self.dom = dom;
        // The Actual Part that's Content Editable
        var input = document.createElement("span");
        input.contentEditable = true;
        input.spellcheck = false;
        // Prefix & Suffix & Color: entirely cosmetic
        var prefixDOM = document.createElement("span");
        var suffixDOM = document.createElement("span");
        prefixDOM.innerHTML = config.prefix || "";
        suffixDOM.innerHTML = config.suffix || "";
        dom.appendChild(prefixDOM);
        dom.appendChild(input);
        dom.appendChild(suffixDOM);
        // On input!
        input.oninput = function(event) {
            _fixStringInput(input);
            var value = input.innerText; // NOT innerHTML
            config.onchange(value); // callback!
        };
        // On focus, select all
        input.onfocus = function() {
            _selectAll(input);
        };
        input.onblur = function() {
            _unselectAll();
        };
        _preventWeirdCopyPaste(input);
        // On pressing <enter>, DON'T line break, just blur
        input.onkeypress = function(e) {
            if (e.which == 13) {
                input.blur();
                return false;
            }
            return true;
        };
        // Set String
        self.setString = function(value) {
            input.innerText = value;
            _fixStringInput(input);
        };
        // Set Color, why not
        self.setColor = function(color) {
            color = _forceToRGB(color);
            dom.style.color = color;
            dom.style.borderColor = color;
        };
        if (config.color) self.setColor(config.color);
        // Styles
        self.styles = config.styles || [];
        for(var i = 0; i < self.styles.length; i++)dom.classList.add(self.styles[i]);
        // Start with the current value
        self.setString(config.value);
    };
    /********************
TextLine's config:
{
	multiline: true,
	readonly: true,
	width: number or "[style]",
	onchange: function(newValue){},
	placeholder: "//derp"
	styles: ["box"]
}
********************/ // TODO: a full WSIYWIG editor?
    // https://hackernoon.com/easily-create-an-html-editor-with-designmode-and-contenteditable-7ed1c465d39b
    ui.TextBox = function(config) {
        var self = this;
        // DOM
        var input;
        if (config.multiline) input = document.createElement("textarea");
        else {
            input = document.createElement("input");
            input.type = "text";
        }
        if (config.placeholder) input.placeholder = config.placeholder;
        input.spellcheck = false;
        input.className = "joy-textbox";
        self.dom = input;
        var dom = self.dom;
        // Config options
        if (config.readonly) {
            input.setAttribute("readonly", 1);
            input.addEventListener("click", function() {
                self.select();
            });
        } else input.oninput = function(event) {
            config.onchange(input.value);
        };
        if (config.width) input.style.width = typeof config.width === "number" ? config.width + "px" : config.width;
        // Get & Set Value
        self.getValue = function() {
            return input.value;
        };
        self.setValue = function(value) {
            input.value = value;
        };
        // Select
        self.select = function() {
            input.select();
        };
        // Styles
        self.styles = config.styles || [];
        for(var i = 0; i < self.styles.length; i++)dom.classList.add(self.styles[i]);
        // Start
        if (config.value) self.setValue(config.value);
        // If it's multiline, auto-resize!
        // Thanks to this: https://stackoverflow.com/a/25621277
        if (config.multiline) {
            var _onInput = function() {
                this.style.height = "auto";
                this.style.height = this.scrollHeight + "px";
            };
            dom.addEventListener("input", _onInput, false);
            setTimeout(function() {
                dom.setAttribute("style", "height:" + dom.scrollHeight + "px; overflow-y:hidden;");
            }, 1); // some threading thing?
        }
    };
})(); /********************

MODAL:
Places a big ol' modal dialogue bubble over the editor!

********************/ 
(function() {
    // SINGLETON
    var modal = {};
    Joy.modal = modal;
    modal.init = function(master) {
        // The main modal container
        modal.dom = document.createElement("div");
        modal.dom.id = "joy-modal";
        document.body.appendChild(modal.dom);
        // Transparent background you click to kill!
        modal.bg = document.createElement("div");
        modal.bg.id = "joy-bg";
        modal.bg.onclick = function() {
            modal.currentUI.kill();
        };
        modal.dom.appendChild(modal.bg);
        // The actual bubble box
        modal.box = document.createElement("div");
        modal.box.id = "joy-box";
        modal.box.className = "arrow_box";
        modal.dom.appendChild(modal.box);
        // NO SCROLL
        modal.dom.addEventListener("wheel", function(event) {
            event.preventDefault();
            return false;
        });
    };
    modal.show = function(ui) {
        modal.dom.style.display = "block"; // hi
        // Remember & add UI
        modal.currentUI = ui;
        modal.box.appendChild(ui.dom);
        // Position the Box
        var position = ui.config.position || "below";
        var boxBounds = modal.box.getBoundingClientRect();
        var sourceBounds = ui.config.source.getBoundingClientRect();
        var x, y, margin = 20;
        // HACK: IF BELOW & NO SPACE, do LEFT
        if (position == "below") {
            var y = sourceBounds.top + sourceBounds.height + margin; // y: bottom
            if (y + boxBounds.height > document.body.clientHeight) position = "left";
        }
        modal.box.setAttribute("position", position);
        switch(position){
            case "below":
                var x = sourceBounds.left + sourceBounds.width / 2; // x: middle
                var y = sourceBounds.top + sourceBounds.height + margin; // y: bottom
                x -= boxBounds.width / 2;
                break;
            case "left":
                var x = sourceBounds.left - margin; // x: left
                var y = sourceBounds.top + sourceBounds.height / 2; // y: middle
                x -= boxBounds.width;
                y -= boxBounds.height / 2;
                break;
        }
        modal.box.style.left = x + "px";
        modal.box.style.top = y + "px";
        // On Open
        if (modal.currentUI.config.onopen) modal.currentUI.config.onopen();
    };
    modal.hide = function() {
        _emptyDOM(modal.box);
        modal.dom.style.display = "none"; // bye
        // On Close
        if (modal.currentUI.config.onclose) modal.currentUI.config.onclose();
    };
    /********************
Chooser's config:
{
	source: [who this modal dialog should be "coming from"]
	value: [currently selected value, if any]
	options: [label-value pairs],
	onchange: function(value){}, // callback 
	position: "below" // default is "below"
};
********************/ modal.Chooser = function(config) {
        var self = {}; // just an obj to scope this stuff
        // Config
        self.config = config;
        // Create DOM
        var dom = document.createElement("div");
        dom.className = "joy-modal-chooser";
        self.dom = dom;
        // Create List DOM
        var list = document.createElement("div");
        dom.appendChild(list);
        // Populate with list of options
        self.options = [];
        self.categories = {};
        var _placeholder_ = "_placeholder_";
        var _makeCategory = function(category) {
            // dom
            var categoryDOM = document.createElement("div");
            list.appendChild(categoryDOM);
            // remember
            self.categories[category] = categoryDOM;
        };
        self.populate = function() {
            // Create categories, if any!
            for(var i = 0; i < config.options.length; i++){
                var option1 = config.options[i];
                var category = option1.category;
                if (category) // Category doesn't exist yet... make it!
                {
                    if (!self.categories[category]) _makeCategory(category);
                } else // Make a placholder if not alredy!
                if (!self.categories[_placeholder_]) _makeCategory(_placeholder_);
            }
            // Create options
            for(var i = 0; i < config.options.length; i++){
                // Create option
                var option1 = config.options[i];
                var optionDOM = document.createElement("div");
                optionDOM.innerHTML = option1.label;
                if (option1.color) optionDOM.style.color = option1.color;
                // Put it in its category!
                var category = option1.category || _placeholder_;
                self.categories[category].appendChild(optionDOM);
                // On Click!
                (function(option) {
                    // TODO: Hover & preview mode?
                    optionDOM.onclick = function(event) {
                        self.onchange(option.value);
                        event.stopPropagation(); // no, don't double-fire
                    };
                })(option1);
            }
        };
        self.populate();
        // On Select
        self.onchange = function(value) {
            self.kill();
            config.onchange(value); // on select AFTER kill, since can create ANOTHER modal
        };
        // Kill & Remove
        self.kill = function() {
            modal.hide(); // hide modal
        };
        // Show me!
        modal.show(self);
    };
    /********************
Color's config:
{
	source: [who this modal dialog should be "coming from"]
	value: [currently selected value, if any]
	onchange: function(value){}, // callback 
	onclose: function(){}
};
********************/ modal.Color = function(config) {
        var self = {}; // just an obj to scope this stuff
        // Config
        self.config = config;
        // Create DOM
        var dom = document.createElement("div");
        dom.className = "joy-modal-color";
        self.dom = dom;
        // COLOR is HSV.
        config.value = config.value || [
            0,
            1,
            1
        ];
        self.h = config.value[0];
        self.s = config.value[1];
        self.v = config.value[2];
        // THREE ELEMENTS:
        // 1. Color Wheel
        // 2. Color Value
        // 3. Color Pickers
        var WHEEL_SIZE = 150;
        var SPECTRUM_WIDTH = 15;
        var MARGIN_1 = 10;
        var MARGIN_2 = 10;
        var MARGIN_3 = 10;
        var FULL_WIDTH = MARGIN_1 + WHEEL_SIZE + MARGIN_2 + SPECTRUM_WIDTH + MARGIN_3;
        var FULL_HEIGHT = MARGIN_1 + WHEEL_SIZE + MARGIN_3;
        self.dom.style.width = FULL_WIDTH + "px";
        self.dom.style.height = FULL_HEIGHT + "px";
        /////////////////////////////
        // 1) The Color Wheel ///////
        /////////////////////////////
        var wheelCanvas = document.createElement("canvas");
        wheelCanvas.id = "joy-color-wheel";
        var wheelContext = wheelCanvas.getContext("2d");
        wheelCanvas.width = WHEEL_SIZE * 2;
        wheelCanvas.height = WHEEL_SIZE * 2;
        wheelCanvas.style.width = wheelCanvas.width / 2 + "px";
        wheelCanvas.style.height = wheelCanvas.height / 2 + "px";
        dom.appendChild(wheelCanvas);
        wheelCanvas.style.top = MARGIN_1 + "px";
        wheelCanvas.style.left = MARGIN_1 + "px";
        var _updateWheel = function() {
            // Image Data!
            var ctx = wheelContext;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            var w = wheelCanvas.width;
            var h = wheelCanvas.height;
            var image = ctx.createImageData(w, h);
            var imageData = image.data;
            // Create a circle of colors
            // Thanks to: https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43
            var cx = w / 2;
            var cy = h / 2;
            var radius = w / 2; // buffer for the crosshair
            var radiusBuffered = radius + 2; // small buffer for clipping
            for(var x = 0; x < w; x++)for(var y = 0; y < h; y++){
                var dx = x - cx;
                var dy = y - cy;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < radiusBuffered) {
                    if (distance >= radius) distance = radius;
                    // Angle & Distance, re-mapped to [0,1]
                    var angle = Math.atan2(dy, dx); // from [-tau/2, tau/2]
                    angle = (angle / Math.TAU + 0.5) * 360; // to [0,360]
                    distance = distance / radius; // to [0,1]
                    // HSV! (capitals, coz already using 'h')
                    var H = angle;
                    var S = distance;
                    var V = self.v;
                    // TO RGB
                    var rgb = _HSVtoRGB(H, S, V);
                    var i = (x + y * w) * 4;
                    imageData[i] = rgb[0];
                    imageData[i + 1] = rgb[1];
                    imageData[i + 2] = rgb[2];
                    imageData[i + 3] = 255;
                }
            }
            ctx.putImageData(image, 0, 0);
            // Clip it, for aliasing
            ctx.save();
            ctx.globalCompositeOperation = "destination-in";
            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.arc(cx, cy, radius, 0, Math.TAU);
            ctx.fill();
            ctx.restore();
        };
        _updateWheel();
        /////////////////////////////
        // 2) The Value Spectrum ////
        /////////////////////////////
        var spectrumCanvas = document.createElement("canvas");
        spectrumCanvas.id = "joy-color-value";
        var spectrumContext = spectrumCanvas.getContext("2d");
        spectrumCanvas.width = SPECTRUM_WIDTH * 2;
        spectrumCanvas.height = WHEEL_SIZE * 2;
        spectrumCanvas.style.width = spectrumCanvas.width / 2 + "px";
        spectrumCanvas.style.height = spectrumCanvas.height / 2 + "px";
        dom.appendChild(spectrumCanvas);
        spectrumCanvas.style.top = MARGIN_1 + "px";
        spectrumCanvas.style.right = MARGIN_3 + "px";
        var _updateSpectrum = function() {
            // Image data
            var ctx = spectrumContext;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            var w = spectrumCanvas.width;
            var h = spectrumCanvas.height;
            var image = ctx.createImageData(w, h);
            var imageData = image.data;
            // Just a good ol' spectrum of values
            for(var x = 0; x < w; x++)for(var y = 0; y < h; y++){
                // HSV! (capitals, coz already using 'h')
                var H = self.h;
                var S = self.s;
                var V = 1 - y / h;
                // TO RGB
                var rgb = _HSVtoRGB(H, S, V);
                var i = (x + y * w) * 4;
                imageData[i] = rgb[0];
                imageData[i + 1] = rgb[1];
                imageData[i + 2] = rgb[2];
                imageData[i + 3] = 255;
            }
            ctx.putImageData(image, 0, 0);
        };
        _updateSpectrum();
        /////////////////////////////
        // 3) The Color Pickers /////
        /////////////////////////////
        var pickerCanvas = document.createElement("canvas");
        pickerCanvas.id = "joy-color-picker";
        var pickerContext = pickerCanvas.getContext("2d");
        pickerCanvas.width = FULL_WIDTH * 2;
        pickerCanvas.height = FULL_HEIGHT * 2;
        pickerCanvas.style.width = pickerCanvas.width / 2 + "px";
        pickerCanvas.style.height = pickerCanvas.height / 2 + "px";
        dom.appendChild(pickerCanvas);
        var _updatePickers = function() {
            // What's the color?
            var x, y;
            var ctx = pickerContext;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = _HSVToRGBString(self.h, self.s, self.v);
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            // Draw it on the circle
            var cx = MARGIN_1 * 2 + wheelCanvas.width / 2;
            var cy = MARGIN_1 * 2 + wheelCanvas.height / 2;
            var angle = self.h * (Math.TAU / 360);
            var radius = self.s * (wheelCanvas.width / 2);
            x = cx - Math.cos(angle) * radius;
            y = cy - Math.sin(angle) * radius;
            ctx.beginPath();
            ctx.arc(x, y, SPECTRUM_WIDTH, 0, Math.TAU);
            ctx.fill();
            ctx.stroke();
            // Draw it on the spectrum
            var sx = MARGIN_1 * 2 + wheelCanvas.width + MARGIN_2 * 2 + spectrumCanvas.width / 2;
            var sy = MARGIN_1 * 2;
            x = sx;
            y = sy + spectrumCanvas.height * (1 - self.v);
            ctx.beginPath();
            ctx.arc(x, y, SPECTRUM_WIDTH, 0, Math.TAU);
            ctx.fill();
            ctx.stroke();
        };
        _updatePickers();
        // THE MOUSE EVENTS FOR THE PICKERS
        var editMode;
        var isDragging = false;
        var _update = function(event) {
            if (event.target != pickerCanvas) return; // if outta bounds forget it
            var x = event.offsetX * 2;
            var y = event.offsetY * 2;
            if (editMode == "hs") {
                x -= MARGIN_1 * 2;
                y -= MARGIN_1 * 2;
                _updateHS(x, y);
            } else {
                x -= MARGIN_1 * 2 + wheelCanvas.width + MARGIN_2 * 2;
                y -= MARGIN_1 * 2;
                _updateV(x, y);
            }
            // HEY TELL THE SOURCE
            _updateSource();
        };
        var _updateHS = function(x, y) {
            // get polar
            var radius = wheelCanvas.width / 2;
            var dx = x - radius;
            var dy = y - radius;
            var angle = Math.atan2(dy, dx);
            var distance = Math.sqrt(dx * dx + dy * dy);
            // Re-map
            angle = (angle / Math.TAU + 0.5) * 360; // to [0,360]
            if (angle < 0) angle = 0;
            if (angle > 360) angle = 360;
            distance = distance / radius; // to [0,1]
            if (distance < 0) distance = 0;
            if (distance > 1) distance = 1;
            // update
            self.h = angle;
            self.s = distance;
            _updateSpectrum();
            _updatePickers();
        };
        var _updateV = function(x, y) {
            self.v = 1 - y / spectrumCanvas.height;
            if (self.v < 0) self.v = 0;
            if (self.v > 1) self.v = 1;
            _updateWheel();
            _updatePickers();
        };
        var _onmousedown = function(event) {
            isDragging = true;
            if (event.offsetX * 2 < MARGIN_1 * 2 + wheelCanvas.width + MARGIN_2) editMode = "hs";
            else editMode = "v";
            _update(event);
        };
        var _onmousemove = function(event) {
            if (isDragging) _update(event);
        };
        var _onmouseup = function() {
            isDragging = false;
        };
        // MOUSE EVENTS
        pickerCanvas.addEventListener("mousedown", _onmousedown);
        window.addEventListener("mousemove", _onmousemove);
        window.addEventListener("mouseup", _onmouseup);
        // UPDATE SOURCE
        var _updateSource = function() {
            var newValue = [
                self.h,
                self.s,
                self.v
            ];
            newValue[0] = parseFloat(newValue[0].toFixed(0));
            newValue[1] = parseFloat(newValue[1].toFixed(2));
            newValue[2] = parseFloat(newValue[2].toFixed(2));
            config.onchange(newValue);
        };
        // Kill
        self.kill = function() {
            // KILL LISTENERS
            dom.removeEventListener("mousedown", _onmousedown);
            window.removeEventListener("mousemove", _onmousemove);
            window.removeEventListener("mouseup", _onmouseup);
            // Hide Modal
            modal.hide();
        };
        // Show me!
        modal.show(self);
    };
})(); /////////////////////////////////////////
// FUNDAMENTAL USER INTERACE ACTORS /////
/////////////////////////////////////////
// TODO: Angle widget
/****************

Raw number widget: JUST the scrubber, no chooser

Widget Options:
{id:'steps', type:'number', placeholder:10, min:0, max:180, step:1}

****************/ Joy.add({
    type: "number",
    tags: [
        "ui"
    ],
    initWidget: function(self) {
        // Scrubber IS the DOM
        var o = self.options;
        var scrubber = new Joy.ui.Scrubber({
            min: o.min,
            max: o.max,
            step: o.step,
            value: self.getData("value"),
            onstart: function() {
                self.top.activePreview = self;
            },
            onstop: function() {
                self.top.activePreview = null;
            },
            onchange: function(value) {
                self.setData("value", value);
            }
        });
        self.dom = scrubber.dom;
        // PREVIEW ON HOVER. WIGGLE IT JUST ONCE.
        var _ticker = null;
        var _fps = 30;
        self.dom.onmouseenter = function() {
            if (!self.top.canPreview("numbers")) return;
            // Create Preview Data
            self.previewData = _clone(self.data);
            // Wiggle by 5%... as long as that's not less than 0.5, not more than 2.
            var _amplitude = Math.abs(self.data.value * 0.05);
            //if(_amplitude<0.5) _amplitude=0.5; // TODO: WITH SIGFIG
            //if(_amplitude>3) _amplitude=3;
            if (_amplitude == 0) _amplitude = 1; // If it's EXACTLY zero, wiggle with 1, whatever.
            var _timer = 0;
            _ticker = setInterval(function() {
                if (!self.top.canPreview("numbers")) return _stopPreview(); // don't even
                _timer += Math.TAU / _fps / 0.25; // 0.25 seconds
                self.previewData.value = self.data.value + Math.sin(_timer) * _amplitude;
                self.update();
                if (_timer > Math.TAU) _stopPreview(); // yer done, son.
            }, 1000 / _fps);
        };
        var _stopPreview = function() {
            if (_ticker) clearInterval(_ticker);
            self.previewData = null;
            self.update();
        };
        self.dom.onmouseleave = _stopPreview;
    },
    onget: function(my) {
        return my.data.value;
    },
    placeholder: {
        value: 3
    }
});
/****************

A color widget! (for now, same as choose except paints DOM, too)

Widget Options:
{id:'direction', type:'choose', options:['left','right'], placeholder:'left'}

****************/ Joy.add({
    type: "color",
    tags: [
        "ui"
    ],
    initWidget: function(self) {
        // Color Button IS the DOM
        var colorButton = new Joy.ui.Button({
            label: "&nbsp;",
            onclick: function() {
                Joy.modal.Color({
                    source: self.dom,
                    value: self.getData("value"),
                    onchange: function(value) {
                        self.setData("value", value);
                        _changeLabelColor();
                    },
                    onopen: function() {
                        self.top.activePreview = self;
                    },
                    onclose: function() {
                        self.top.activePreview = null;
                    }
                });
            },
            styles: [
                "joy-color"
            ]
        });
        self.dom = colorButton.dom;
        // Change button color!
        var _changeLabelColor = function() {
            var hsl = self.getData("value");
            colorButton.dom.style.background = _HSVToRGBString(hsl);
        };
        _changeLabelColor();
        // PREVIEW ON HOVER
        // BOUNCE the HSL Value up & down!
        var _ticker = null;
        var _fps = 30;
        var _initialV, _vel, _timer;
        self.dom.onmouseenter = function() {
            if (!self.top.canPreview("numbers")) return; // yeah let's pretend it's a number
            // Create Preview Data
            _initialV = self.data.value[2];
            self.previewData = _clone(self.data);
            // Bounce up & down for HALF a second
            _timer = 0;
            _vel = 2 * (2 / _fps);
            _ticker = setInterval(function() {
                if (!self.top.canPreview("numbers")) return _stopPreview(); // don't
                // Bounce up & down
                var hsl = self.previewData.value;
                hsl[2] += _vel;
                if (hsl[2] > 1) {
                    hsl[2] = 1;
                    _vel *= -1;
                }
                if (hsl[2] < 0) {
                    hsl[2] = 0;
                    _vel *= -1;
                }
                self.update();
                // Done!
                _timer += 2 / _fps;
                if (_timer >= 1) _stopPreview();
            }, 1000 / _fps);
        };
        var _stopPreview = function() {
            if (_ticker) clearInterval(_ticker);
            self.previewData = null;
            self.update();
        };
        self.dom.onmouseleave = _stopPreview;
    },
    onget: function(my) {
        return _HSVToRGBString(my.data.value);
    },
    placeholder: function() {
        var hue = Math.floor(Math.random() * 360); // Random color!
        return [
            hue,
            0.8,
            1.0
        ];
    }
});
/****************

A choose-y thing

Widget Options:
{name:'direction', type:'choose', options:['left','right'], placeholder:'left'}
// TODO... "options" gets overrided soooo UHHHHH.

****************/ Joy.add({
    type: "choose",
    tags: [
        "ui"
    ],
    initWidget: function(self) {
        var data = self.data;
        // Options
        var options = self.options;
        for(var i = 0; i < options.length; i++){
            // convert to label/value if not already
            var o = options[i];
            if (!(o.label !== undefined && o.value !== undefined)) options[i] = {
                label: o.toString(),
                value: o
            };
        }
        // ChooserButton *IS* DOM
        var chooserButton = new Joy.ui.ChooserButton({
            value: data.value,
            options: options,
            onchange: function(value) {
                data.value = value;
                self.update(); // you oughta know!
            },
            styles: self.styles
        });
        self.dom = chooserButton.dom;
    },
    onget: function(my) {
        return my.data.value;
    }
});
/****************

A widget to type in strings!

Widget Options:
{name:'name', type:'string', prefix:'&ldquo;', suffix:'&rdquo;', color:"whatever"}

****************/ Joy.add({
    type: "string",
    tags: [
        "ui"
    ],
    initWidget: function(self) {
        // String *IS* DOM
        var o = self.options;
        self.stringUI = new Joy.ui.String({
            prefix: o.prefix,
            suffix: o.suffix,
            color: o.color,
            value: self.getData("value"),
            onchange: function(value) {
                self.setData("value", value);
            }
        });
        self.dom = self.stringUI.dom;
        // When data's changed, externally
        self.onDataChange = function() {
            var value = self.getData("value");
            self.stringUI.setString(value);
        };
    },
    onget: function(my) {
        return my.data.value;
    },
    placeholder: "???"
});
/****************

A widget to save data as hash!

Widget Options:
{type:'save'} // NO "id"! It just saves the top-most data.

****************/ Joy.add({
    type: "save",
    tags: [
        "ui"
    ],
    initWidget: function(self) {
        // DOM
        var dom = document.createElement("div");
        dom.className = "joy-save";
        self.dom = dom;
        // Save Button
        self.saveButton = new Joy.ui.Button({
            label: "save:",
            onclick: function() {
                var url = Joy.saveToURL(self.top.data);
                self.url.setValue(url);
                self.url.select();
                // info
                var chars = url.length;
                self.info.innerHTML = "P.S: you can shorten your link with <a href='http://tinyurl.com/' target='_blank'>TinyURL</a>!";
            }
        });
        dom.appendChild(self.saveButton.dom);
        // URL TextBox
        self.url = new Joy.ui.TextBox({
            readonly: true
        });
        dom.appendChild(self.url.dom);
        // Details: chars & tinyurl link
        self.info = document.createElement("div");
        self.info.id = "joy-save-info";
        dom.appendChild(self.info);
    }
});
////////////////////////////////////////////////////////
// THE BIG ACTOR: A "PROGRAMMABLE" LIST OF ACTIONS <3 //
////////////////////////////////////////////////////////
/****************

A nice list of actions.

WidgetConfig:
{type:'actions', name:'actions', resetVariables:false}

****************/ Joy.add({
    type: "actions",
    tags: [
        "ui"
    ],
    init: function(self) {
        if (self.resetVariables !== undefined) self.data.resetVariables = self.resetVariables;
    // TODO: ACTUALLY REFACTOR
    // TODO: Separate out Actor code from Widget code
    // so that this can run EVEN WITHOUT WIDGETS.
    // Using messages, probably.
    },
    initWidget: function(self) {
        var data2 = self.data;
        var actions = data2.actions;
        // DOM
        var dom = document.createElement("div");
        dom.className = "joy-actions";
        self.dom = dom;
        // List
        var list = document.createElement("list");
        list.id = "joy-list";
        dom.appendChild(list);
        // Preview Variables?
        /*var varPreview;
		if(self.top.canPreview("variables")){
			varPreview = document.createElement("div");
			varPreview.id = "joy-variables-preview";
			varPreview.innerHTML = "AHHHH";
			dom.appendChild(varPreview);
		}*/ //////////////////////////////////////////
        // Create Bullet /////////////////////////
        //////////////////////////////////////////
        var bulletOptions = [
            {
                label: "Add action above",
                value: "action_above"
            },
            {
                label: "Add action below",
                value: "action_below"
            },
            {
                label: "Delete",
                value: "delete"
            }
        ];
        var _onBulletChoice = function(entry, choice) {
            // ACTION ABOVE or BELOW
            var newActionWhere = 0;
            if (choice == "action_above") newActionWhere = -1; // above
            if (choice == "action_below") newActionWhere = 1; // below
            if (newActionWhere != 0) {
                var newEntryIndex = self.entries.indexOf(entry);
                if (newActionWhere > 0) newEntryIndex += 1;
                // Chooser Modal!
                Joy.modal.Chooser({
                    position: "left",
                    source: entry.bullet.dom,
                    options: actionOptions,
                    onchange: function(value) {
                        _addAction(value, newEntryIndex);
                        self.update(); // You oughta know!
                        _updateBullets(); // update the UI, re-number it.
                    }
                });
            }
            // DELETE
            if (choice == "delete") {
                _removeFromArray(self.entries, entry); // Delete entry from Entries[]
                _removeFromArray(actions, entry.actionData); // Delete action from Data's Actions[]
                self.removeChild(entry.actor); // Delete actor from Children[]
                list.removeChild(entry.dom); // Delete entry from DOM
                self.update(); // You oughta know!
                _updateBullets(); // update the UI, re-number it.
            }
        };
        var _createBullet = function(entry) {
            var bullet = new Joy.ui.ChooserButton({
                position: "left",
                staticLabel: _getBulletLabel(entry),
                options: bulletOptions,
                onchange: function(choice) {
                    _onBulletChoice(entry, choice);
                },
                styles: [
                    "joy-bullet"
                ]
            });
            bullet.dom.id = "joy-bullet";
            return bullet;
        };
        // Get the digit (or letter, or roman) for this bullet...
        var _getBulletLabel = function(entry) {
            // What index am I?
            var index = self.entries.indexOf(entry) + 1;
            // How many levels deep in "actions" am I?
            var levelsDeep = 0;
            var parent = self.parent;
            while(parent){
                if (parent.type == "actions") levelsDeep++;
                parent = parent.parent;
            }
            // Digit, Letter, or Roman? (Cycle around)
            var label;
            switch(levelsDeep % 3){
                case 0:
                    label = index;
                    break; // digits
                case 1:
                    label = _numberToAlphabet(index);
                    break; // letter
                case 2:
                    label = _numberToRoman(index);
                    break; // roman
            }
            return label;
        };
        // Re-number ALL these bad boys
        var _updateBullets = function() {
            for(var i = 0; i < self.entries.length; i++){
                var entry = self.entries[i];
                var bullet = entry.bullet;
                var label = _getBulletLabel(entry);
                bullet.setLabel(label);
            }
        };
        ////////////////////////////////////////////////////////////////////
        // Add Entry: Entries have a Bullet (the number) & actual widget! //
        ////////////////////////////////////////////////////////////////////
        self.entries = [];
        var _addEntry = function(actionData, atIndex) {
            // New entry
            var entry = {};
            var entryDOM = document.createElement("div");
            if (atIndex === undefined) atIndex = self.entries.length;
            self.entries.splice(atIndex, 0, entry);
            list.insertBefore(entryDOM, list.children[atIndex]);
            // The Bullet is a Chooser!
            var bullet = _createBullet(entry);
            var bulletContainer = document.createElement("div");
            bulletContainer.id = "joy-bullet-container";
            entryDOM.appendChild(bulletContainer);
            bulletContainer.appendChild(bullet.dom);
            // New Actor!
            var newActor = self.addChild({
                type: actionData.type
            }, actionData);
            // The Widget
            var newWidget = newActor.createWidget();
            newWidget.id = "joy-widget";
            entryDOM.appendChild(newWidget);
            // (Remember all this)
            entry.dom = entryDOM;
            entry.bullet = bullet;
            entry.actor = newActor;
            entry.widget = newWidget;
            entry.actionData = actionData;
            // PREVIEW ON HOVER
            // Also tell the action "_PREVIEW": how far in the action to go?
            var _calculatePreviewParam = function(event) {
                var param = event.offsetY / bullet.dom.getBoundingClientRect().height;
                if (param < 0) param = 0;
                if (param > 1) param = 1;
                _previewAction._PREVIEW = param;
                self.update();
            };
            var _previewAction;
            var _previewStyle;
            bulletContainer.onmouseenter = function(event) {
                if (!self.top.canPreview("actions")) return;
                self.top.activePreview = self;
                // Create Preview Data
                self.previewData = _clone(self.data);
                var actionIndex = self.entries.indexOf(entry);
                _previewAction = self.previewData.actions[actionIndex];
                // STOP after that action!
                self.previewData.actions.splice(actionIndex + 1, 0, {
                    STOP: true
                });
                // How far to go along action?
                _calculatePreviewParam(event);
                // Add in a style
                _previewStyle = document.createElement("style");
                document.head.appendChild(_previewStyle);
                _previewStyle.sheet.insertRule(".joy-actions.joy-previewing > #joy-list > div:nth-child(n+" + (actionIndex + 2) + ") { opacity:0.1; }");
                _previewStyle.sheet.insertRule(".joy-actions.joy-previewing > div.joy-bullet { opacity:0.1; }");
                dom.classList.add("joy-previewing");
            };
            bulletContainer.onmousemove = function(event) {
                if (self.previewData) _calculatePreviewParam(event);
            };
            bulletContainer.onmouseleave = function() {
                if (self.previewData) {
                    self.previewData = null;
                    self.top.activePreview = null;
                    self.update();
                    document.head.removeChild(_previewStyle);
                    dom.classList.remove("joy-previewing");
                }
            };
            return entry;
        };
        // add all INITIAL actions as widgets
        for(var i4 = 0; i4 < actions.length; i4++)_addEntry(actions[i4]);
        ///////////////////////////////////////
        // Add Action /////////////////////////
        ///////////////////////////////////////
        // Manually add New Action To Actions + Widgets + DOM
        var _addAction = function(actorType, atIndex, data = {}) {
            // Create that new entry & everything
            var newAction = {
                type: actorType,
                ...data
            };
            if (atIndex === undefined) actions.push(newAction);
            else actions.splice(atIndex, 0, newAction);
            var entry = _addEntry(newAction, atIndex);
        // Focus on that entry's widget!
        // entry.widget.focus();
        };
        self.addAction = _addAction; //FG added
        // Actions you can add:
        // TODO: INCLUDE ALIASED ACTIONS
        var actionOptions = [];
        if (self.onlyActions) for(var i4 = 0; i4 < self.onlyActions.length; i4++){
            var actionType = self.onlyActions[i4];
            var actorTemplate = Joy.getTemplateByType(actionType);
            var notActionTag = actorTemplate.tags.filter(function(tag) {
                return tag != "action"; // first tag that's NOT "action"
            })[0];
            actionOptions.push({
                label: actorTemplate.name,
                value: actionType,
                category: notActionTag
            });
        }
        else {
            var actionActors = Joy.getTemplatesByTag("action");
            for(var i4 = 0; i4 < actionActors.length; i4++){
                var actionActor = actionActors[i4];
                var notActionTag = actionActor.tags.filter(function(tag) {
                    return tag != "action";
                })[0];
                actionOptions.push({
                    label: actionActor.name,
                    value: actionActor.type,
                    category: notActionTag
                });
            }
        }
        // "+" Button: When clicked, prompt what actions to add!
        var addButton = new Joy.ui.ChooserButton({
            staticLabel: "+",
            options: actionOptions,
            onchange: function(value) {
                _addAction(value);
                self.update(); // You oughta know!
            },
            styles: [
                "joy-bullet"
            ]
        });
        dom.appendChild(addButton.dom);
    },
    onact: function(my) {
        // Create _vars, if not already there
        if (!my.target._variables) my.target._variables = {};
        // Reset all of target's variables?
        if (my.data.resetVariables) my.target._variables = {};
        // Do those actions, baby!!!
        for(var i = 0; i < my.data.actions.length; i++){
            // Stop?
            var actionData = my.data.actions[i];
            if (actionData.STOP) return "STOP";
            // Run 
            var actor = my.actor.entries[i].actor; // TODO: THIS IS A HACK AND SHOULD NOT RELY ON THAT
            var actorMessage = actor.act(my.target, actionData); // use ol' actor, but GIVEN data.
            if (actorMessage == "STOP") return actorMessage;
        }
    },
    placeholder: {
        actions: [],
        resetVariables: true
    }
});
/////////////////////////////////////////
// LOGIC ACTORS /////////////////////////
/////////////////////////////////////////
Joy.module("instructions", function() {
    Joy.add({
        name: "Repeat the following...",
        type: "instructions/repeat",
        tags: [
            "instructions",
            "action"
        ],
        init: "Repeat the following {id:'count', type:'number', min:1, placeholder:3} times: {id:'actions', type:'actions', resetVariables:false}",
        onact: function(my) {
            // Previewing? How much to preview?
            var param = 1;
            if (my.data._PREVIEW !== undefined) param = my.data._PREVIEW;
            // Loop through it... (as far as preview shows, anyway)
            var loops = Math.floor(my.data.count * param);
            for(var i = 0; i < loops; i++){
                var message = my.actor.actions.act(my.target);
                if (message == "STOP") return message; // STOP
            }
        }
    });
    /*Joy.add({
		name: "If... then...",
		type: "instructions/if",
		tags: ["instructions", "action"],
		init: "If AHHH, then: "+
			  "{id:'actions', type:'actions', resetVariables:false}",
		onact: function(my){
			var message = my.actor.actions.act(my.target);
			if(message=="STOP") return message; // STOP
		}
	});*/ Joy.add({
        name: "// Write a note",
        type: "instructions/comment",
        tags: [
            "instructions",
            "action"
        ],
        initWidget: function(self) {
            // DOM
            self.dom = document.createElement("div");
            // Comment Box
            self.box = new Joy.ui.TextBox({
                multiline: true,
                placeholder: "// your notes here",
                value: self.getData("value"),
                onchange: function(value) {
                    self.setData("value", value);
                },
                styles: [
                    "box"
                ]
            });
            self.dom.appendChild(self.box.dom);
        }
    });
});
// VARIABLE NAME: you're just a synchronized string, yo.
Joy.add({
    type: "variableName",
    tags: [
        "ui"
    ],
    init: function(self) {
        var variableType = self.variableType;
        // Unique Variable Name
        var _uniqueVariableName = function() {
            var varnames = Joy.getReferencesByTag(self, variableType).map(function(ref) {
                return ref.data.value;
            });
            var highestCount = 0;
            varnames.forEach(function(varname) {
                var num;
                if (varname == "thing") num = 1; // at least 1
                var match = varname.match(/thing\s(\d+)/);
                if (match) num = parseInt(match[1]); // or more
                if (highestCount < num) highestCount = num;
            });
            if (highestCount == 0) return "thing";
            else return "thing " + (highestCount + 1);
        };
        // Create Reference method
        self._createNewReference = function() {
            var refData = {
                value: _uniqueVariableName(),
                color: _randomHSV()
            };
            var ref = Joy.createReference(self, variableType, refData);
            self.setData("refID", ref.id, true); // Remember Ref ID. And DON'T update.
            Joy.connectReference(self, ref.id); // connect new ref
        };
        // Do I already have a reference? Create one if no.
        var refID1 = self.getData("refID");
        if (refID1) Joy.connectReference(self, refID1); // connect this ref
        else {
            // Well, first try seeing if there are any vars.
            // If so, connect to most recently created one
            var varReferences = Joy.getReferencesByTag(self, variableType);
            // CONFIG: self.startWithExisting!
            if (self.startWithExisting && varReferences.length > 0) {
                var latestReference = varReferences[varReferences.length - 1];
                refID1 = latestReference.id;
                self.setData("refID", refID1, true); // set data
                Joy.connectReference(self, refID1); // connect this ref
            } else // Otherwise, make a new one!
            self._createNewReference();
        }
        // Switch reference 
        self._switchReference = function(newRefID) {
            var refID = self.getData("refID");
            Joy.disconnectReference(self, refID); // disconnect old ref
            self.setData("refID", newRefID); // DO update this!
            Joy.connectReference(self, newRefID); // connect new ref
        };
    },
    initWidget: function(self) {
        self.dom = document.createElement("span");
        // The String edits my REFERENCE'S data.
        var refID2 = self.getData("refID");
        var refData = Joy.getReferenceById(self, refID2).data;
        var stringActor = self.addChild({
            type: "string",
            prefix: "[",
            suffix: "]",
            color: refData.color
        }, refData);
        var stringWidget = stringActor.createWidget();
        self.dom.appendChild(stringWidget);
        // This String Actor also updates its color
        var _old_stringActor_onDataChange = stringActor.onDataChange;
        stringActor.onDataChange = function() {
            _old_stringActor_onDataChange();
            var color = stringActor.getData("color");
            stringActor.stringUI.setColor(color);
        };
        // Chooser? Can choose to switch to other variables (or make new one)
        var variableType = self.variableType;
        var _showChooser = function() {
            var options = [];
            // Get all references that are of this type
            var refs = Joy.getReferencesByTag(self, variableType);
            var myRefID = self.getData("refID");
            refs.forEach(function(ref) {
                if (ref.id == myRefID) return; // don't show SELF
                var color = ref.data.color;
                color = _HSVToRGBString(color[0], color[1], color[2]);
                options.push({
                    label: "[" + ref.data.value + "]",
                    value: ref.id,
                    color: color
                });
            });
            // Meta Options:
            options.push({
                category: "meta",
                label: "(+new)",
                value: "NEW"
            });
            options.push({
                category: "meta",
                label: "(change color)",
                value: "CHANGE_COLOR"
            });
            // Show all possible variables!
            Joy.modal.Chooser({
                source: self.dom,
                options: options,
                onchange: function(newRefID) {
                    if (newRefID == "CHANGE_COLOR") // Just change color, ha.
                    Joy.modal.Color({
                        source: self.dom,
                        value: stringActor.getData("color"),
                        onchange: function(newColor) {
                            stringActor.setData("color", newColor);
                            stringActor.stringUI.setColor(newColor); // do this again coz edit lock
                        }
                    });
                    else {
                        // Make a new reference? Either way, set refID
                        if (newRefID == "NEW") {
                            var oldRefID = self.getData("refID");
                            Joy.disconnectReference(self, oldRefID); // disconnect old ref
                            self._createNewReference();
                            self.update(); // update, yo
                        } else self._switchReference(newRefID);
                        // Make String Widget edit that instead
                        var refID = self.getData("refID");
                        var ref = Joy.getReferenceById(self, refID);
                        stringActor.switchData(ref.data);
                    }
                }
            });
        };
        // Show ON CLICK!
        if (!self.noChooser) self.dom.onclick = _showChooser;
    },
    onget: function(my) {
        var refID = my.data.refID;
        var ref = Joy.getReferenceById(my.actor, refID);
        return ref.data.value; // returns the variable name
    },
    onkill: function(self) {
        // Disconnect any references I may have
        var refID = self.getData("refID");
        Joy.disconnectReference(self, refID); // disconnect old ref
    }
}); /////////////////////////////////////////
// MATH ACTORS //////////////////////////
/////////////////////////////////////////
Joy.module("math", function() {
    /*********************

	Alright. This is gonna be a big one.
	It needs to be able to chain math elements,
	and each element needs to be able to switch between
	scrubbers, variables, and other number-getter actors.

	Data:
	{
		type: "number",
		chain:[
			{type:"number_raw", value:3},
			{type:"choose", value:"*"},
			{type:"variableName", refID:whatever},
			{type:"choose", value:"+"},
			{type:"turtle/getAngle"}
		]
	}

	*********************/ Joy.modify("number", "number_raw", function(_old) {
        return {
            init: function(self) {
                // no variables?
                if (self.noVariables) return;
                // Force data to a chain...
                var originalValue = self.getData("value");
                if (typeof originalValue === "number") {
                    self.setData("value", undefined, true); // delete "value", no update
                    self.setData("chain", [
                        {
                            type: "number_raw",
                            value: originalValue
                        }
                    ], true); // create "chain", no update
                }
                // MAKE A NEW CHAIN ACTOR *AND DATA(?)*
                self._makeNewChainActor = function(chainItem, atIndex) {
                    // Make it
                    var chainActor;
                    var type = chainItem.type;
                    var options = {};
                    var isFirst = atIndex === undefined ? self.chainActors.length == 0 : atIndex == 0;
                    if (isFirst && self.options !== undefined) {
                        options.min = self.options.min;
                        options.max = self.options.max;
                    }
                    switch(type){
                        // Elements
                        case "number_raw":
                            chainActor = self.addChild({
                                type: type,
                                ...options
                            }, chainItem);
                            break;
                        case "variableName":
                            chainActor = self.addChild({
                                type: type,
                                variableType: "number",
                                noChooser: true
                            }, chainItem);
                            break;
                        // Operand
                        case "choose":
                            chainActor = self.addChild({
                                type: type,
                                options: [
                                    {
                                        label: "+",
                                        value: "+"
                                    },
                                    {
                                        label: "-",
                                        value: "-"
                                    },
                                    {
                                        label: "&times;",
                                        value: "*"
                                    },
                                    {
                                        label: "&divide;",
                                        value: "/"
                                    }
                                ],
                                styles: [
                                    "joy-math"
                                ]
                            }, chainItem);
                            break;
                    }
                    // Add or splice to Chain Actors array! *AND THE DATA*
                    var chain = self.getData("chain");
                    if (atIndex !== undefined) {
                        self.chainActors.splice(atIndex, 0, chainActor);
                        chain.splice(atIndex, 0, chainItem);
                    } else {
                        self.chainActors.push(chainActor);
                        chain.push(chainItem);
                    }
                    // Return
                    return chainActor;
                };
                // Create an actor for each element in the chain
                self.chainActors = []; // keep a chain parallel to children. this one's in ORDER.
                var realChain = self.getData("chain");
                var chain1 = _clone(realChain);
                realChain.splice(0, realChain.length); // empty out realChain
                for(var i = 0; i < chain1.length; i++)self._makeNewChainActor(chain1[i]);
                // REPLACE A CHAIN ACTOR *AND DATA*
                self._replaceChainActor = function(oldChainActor, newItem) {
                    // Delete old actor, and add new actor where it was
                    var oldIndex = self._deleteChainActor(oldChainActor);
                    var newChainActor = self._makeNewChainActor(newItem, oldIndex);
                    // update manually!
                    self.update();
                    // Return
                    return newChainActor;
                };
                // DELETE A CHAIN ACTOR *AND DATA*
                self._deleteChainActor = function(chainActor) {
                    // Delete actor
                    var oldIndex = self.chainActors.indexOf(chainActor);
                    _removeFromArray(self.chainActors, chainActor);
                    self.removeChild(chainActor);
                    // and data!
                    var chain = self.getData("chain");
                    chain.splice(oldIndex, 1);
                    // so can re-use index
                    return oldIndex;
                };
            },
            initWidget: function(self) {
                // no variables?
                if (self.noVariables) {
                    _old.initWidget(self);
                    return;
                }
                // Container!
                self.dom = document.createElement("span");
                self.dom.className = "joy-number";
                // Show Chooser!
                var _showChooser = function(chainActor) {
                    var options = [];
                    // Show placeholder number (unless i'm a number_raw, or there isn't one)
                    if (chainActor.type != "number_raw") {
                        var placeholderNumber = self.placeholder.value;
                        if (typeof placeholderNumber === "number") options.push({
                            label: placeholderNumber,
                            value: {
                                type: "number_raw",
                                value: placeholderNumber
                            }
                        });
                    }
                    // Show possible variables (except the current variable)
                    var refs = Joy.getReferencesByTag(self, "number");
                    var myRefID;
                    if (chainActor.type == "variableName") myRefID = chainActor.getData("refID");
                    refs.forEach(function(ref) {
                        if (ref.id == myRefID) return; // don't show SELF
                        var color = ref.data.color;
                        color = _HSVToRGBString(color[0], color[1], color[2]);
                        options.push({
                            label: "[" + ref.data.value + "]",
                            value: {
                                type: "variableName",
                                refID: ref.id
                            },
                            color: color
                        });
                    });
                    // Show all these dang options!
                    if (options.length > 0) Joy.modal.Chooser({
                        source: chainActor.dom,
                        options: options,
                        onchange: function(newItem) {
                            // REPLACE CHAIN ACTOR & ENTRY
                            var newChainActor = self._replaceChainActor(chainActor, newItem);
                            self._replaceChainEntry(chainActor, newChainActor);
                        }
                    });
                };
                // THE WAY TO ORGANIZE THIS: ENTRIES that have DOM *and* ACTOR
                self._chainEntries = [];
                // MAKE CHAIN ENTRY
                self._makeChainEntry = function(chainActor, atIndex) {
                    // Widget
                    var widget = document.createElement("span");
                    chainActor.createWidget();
                    widget.appendChild(chainActor.dom);
                    // Widget chooser, if NOT an operand
                    if (chainActor.type != "choose") {
                        var entry;
                        var moreButton = new Joy.ui.Button({
                            onclick: function() {
                                _showChainOptions(entry);
                            },
                            styles: [
                                "joy-more"
                            ]
                        });
                        widget.appendChild(moreButton.dom);
                    }
                    // Place in widget
                    if (atIndex !== undefined) {
                        if (atIndex < self.dom.childNodes.length) {
                            // replacing NOT at last child...
                            var beforeThisWidget = self.dom.childNodes[atIndex];
                            self.dom.insertBefore(widget, beforeThisWidget);
                        } else // Otherwise just append
                        self.dom.appendChild(widget);
                    } else self.dom.appendChild(widget);
                    // If it's NOT an operand, clicking it reveals options
                    if (chainActor.type != "choose") (function(ca) {
                        // HACK: click, NOT scrub. detect w/ time frame
                        var _mouseDownTime;
                        ca.dom.addEventListener("mousedown", function() {
                            _mouseDownTime = +new Date();
                        });
                        ca.dom.addEventListener("mouseup", function() {
                            var _time = +new Date();
                            if (_time - _mouseDownTime < 500) _showChooser(ca); // if clicked in less than a half second
                        });
                    })(chainActor);
                    // Entry
                    entry = {
                        widget: widget,
                        actor: chainActor
                    };
                    if (atIndex !== undefined) self._chainEntries.splice(atIndex, 0, entry);
                    else self._chainEntries.push(entry);
                };
                // DELETE CHAIN ENTRY
                self._deleteChainEntry = function(chainActor) {
                    // Get index (so can return later)
                    var entry1 = self._chainEntries.find(function(entry) {
                        return entry.actor == chainActor;
                    });
                    var index = self._chainEntries.indexOf(entry1);
                    // Delete widget & entry (actor's already been deleted)
                    var widget = entry1.widget;
                    self.dom.removeChild(widget);
                    _removeFromArray(self._chainEntries, entry1);
                    // Index?
                    return index;
                };
                // REPLACE CHAIN ENTRY
                self._replaceChainEntry = function(oldChainActor, newChainActor) {
                    var oldIndex = self._deleteChainEntry(oldChainActor);
                    self._makeChainEntry(newChainActor, oldIndex);
                };
                // SHOW CHAIN OPTIONS
                var _showChainOptions = function(entry) {
                    // Possible operands
                    var currentLabel = entry.widget.innerText;
                    var options = [
                        {
                            label: currentLabel + " + 2",
                            value: "+"
                        },
                        {
                            label: currentLabel + " - 2",
                            value: "-"
                        },
                        {
                            label: currentLabel + " &times; 2",
                            value: "*"
                        },
                        {
                            label: currentLabel + " &divide; 2",
                            value: "/"
                        }
                    ];
                    // To delete... which operand?
                    var elementIndex = self._chainEntries.indexOf(entry);
                    if (self._chainEntries.length > 1) {
                        // The operand...
                        var operandIndex;
                        if (elementIndex == 0) operandIndex = elementIndex + 1; // first
                        else operandIndex = elementIndex - 1; // not
                        // Label
                        var label;
                        var operandLabel = self._chainEntries[operandIndex].widget.innerText;
                        if (elementIndex == 0) label = currentLabel + " " + operandLabel; // first
                        else label = operandLabel + " " + currentLabel; // not
                        // Indices to delete
                        var indicesToDelete = [
                            elementIndex,
                            operandIndex
                        ].sort(); // increasing order
                        // Push option!
                        options.push({
                            category: "meta",
                            label: "(delete \u201C" + label + "\u201D)",
                            value: indicesToDelete
                        });
                    }
                    // Choose options!
                    Joy.modal.Chooser({
                        source: entry.widget,
                        options: options,
                        onchange: function(operand) {
                            // It's an operand...
                            if (typeof operand === "string") {
                                // Get index of the actor...
                                var index = self._chainEntries.indexOf(entry);
                                // Make the OPERAND actor(+data) & entry
                                index++;
                                var operandActor = self._makeNewChainActor({
                                    type: "choose",
                                    value: operand
                                }, index);
                                self._makeChainEntry(operandActor, index);
                                // Make the NUMBER actor(+data) & entry (just the number 2, why hot)
                                index++;
                                var numberActor = self._makeNewChainActor({
                                    type: "number_raw",
                                    value: 2
                                }, index);
                                self._makeChainEntry(numberActor, index);
                            } else {
                                // Otherwise, DELETE ACTOR & ENTRY!
                                var indices = operand;
                                for(var i = indices.length - 1; i >= 0; i--){
                                    var indexToDelete = indices[i];
                                    var actorToDelete = self._chainEntries[indexToDelete].actor;
                                    self._deleteChainActor(actorToDelete);
                                    self._deleteChainEntry(actorToDelete);
                                }
                            }
                            // Update!
                            self.update();
                        }
                    });
                };
                // For each chain actor, put in that entry
                for(var i5 = 0; i5 < self.chainActors.length; i5++){
                    var chainActor1 = self.chainActors[i5];
                    self._makeChainEntry(chainActor1);
                }
            },
            onget: function(my) {
                // no variables?
                if (my.actor.noVariables) return _old.onget(my);
                ////////////////
                var nums_and_ops = []; // just gets chain of nums & ops
                // EVALUATE EACH ELEMENT FIRST
                for(var i = 0; i < my.data.chain.length; i += 2){
                    // Synched indices!
                    var chainActor = my.actor.chainActors[i];
                    // Evaluate element
                    var num;
                    switch(chainActor.type){
                        case "number_raw":
                            num = chainActor.get(my.target);
                            break;
                        case "variableName":
                            var _variables = my.target._variables;
                            var varname = chainActor.get(my.target); // it's just a synchronized string
                            num = _variables[varname];
                            break;
                    }
                    // Any operator before it?
                    if (i > 0) {
                        var operandActor = my.actor.chainActors[i - 1];
                        var op = operandActor.get();
                        nums_and_ops.push(op);
                    }
                    // Push num
                    nums_and_ops.push(num);
                }
                // MULTIPLICATION AND DIVISION FIRST. LEFT-ASSOCIATIVE
                for(var i = 1; i < nums_and_ops.length; i += 2){
                    var op = nums_and_ops[i];
                    if (op == "*" || op == "/") {
                        // Do math to the two numbers
                        var num1 = nums_and_ops[i - 1];
                        var num2 = nums_and_ops[i + 1];
                        var res;
                        if (op == "*") res = num1 * num2;
                        else res = num1 / num2;
                        // Modify array, and set index back
                        // remove 3 items: num1, op, num2
                        // replace with 1 item: result
                        nums_and_ops.splice(i - 1, 3, res);
                        i -= 2;
                    } else continue;
                }
                // NOW DO ADDITION AND SUBTRACTION
                for(var i = 1; i < nums_and_ops.length; i += 2){
                    var op = nums_and_ops[i];
                    if (op == "+" || op == "-") {
                        // Do math to the two numbers
                        var num1 = nums_and_ops[i - 1];
                        var num2 = nums_and_ops[i + 1];
                        var res;
                        if (op == "+") res = num1 + num2;
                        else res = num1 - num2;
                        // Modify array, and set index back
                        // remove 3 items: num1, op, num2
                        // replace with 1 item: result
                        nums_and_ops.splice(i - 1, 3, res);
                        i -= 2;
                    } else continue;
                }
                return nums_and_ops[0];
            }
        };
    });
    /****************

	Set a variable to some number.

	****************/ Joy.add({
        name: "Set [number]",
        type: "math/set",
        tags: [
            "math",
            "action"
        ],
        init: "Set {id:'varname', type:'variableName', variableType:'number'} to {id:'value', type:'number'}",
        onact: function(my) {
            var _variables = my.target._variables;
            var varname = my.data.varname; // it's just a synchronized string
            _variables[varname] = my.data.value; // Set the variable
        }
    });
    /****************

	Do math on some variable

	****************/ Joy.add({
        name: "Do math to [number]",
        type: "math/operation",
        tags: [
            "math",
            "action"
        ],
        init: JSON.stringify({
            id: "operation",
            type: "choose",
            placeholder: "+",
            options: [
                {
                    label: "+ Increase",
                    value: "+"
                },
                {
                    label: "- Decrease",
                    value: "-"
                },
                {
                    label: "&times; Multiply",
                    value: "*"
                },
                {
                    label: "&divide; Divide",
                    value: "/"
                }
            ]
        }) + " {id:'varname', type:'variableName', variableType:'number', startWithExisting:true}" + " by {id:'value', type:'number'}",
        onact: function(my) {
            var vars = my.target._variables;
            var varname = my.data.varname;
            if (vars[varname] === undefined) vars[varname] = 0; // Set to 0, if nothing's there.
            switch(my.data.operation){
                case "+":
                    vars[varname] += my.data.value;
                    break;
                case "-":
                    vars[varname] -= my.data.value;
                    break;
                case "*":
                    vars[varname] *= my.data.value;
                    break;
                case "/":
                    vars[varname] /= my.data.value;
                    break;
            }
        }
    });
    /****************

	If then... for math

	****************/ Joy.add({
        name: "If [math] then...",
        type: "math/if",
        tags: [
            "math",
            "action"
        ],
        init: "If {id:'value1', type:'number'} {id:'test', type:'choose', options:['<','\u2264','=','\u2265','>'], placeholder:'='} {id:'value2', type:'number'}, then: {id:'actions', type:'actions', resetVariables:false}",
        onact: function(my) {
            var value1 = my.data.value1;
            var value2 = my.data.value2;
            var result;
            switch(my.data.test){
                case "<":
                    result = value1 < value2;
                    break;
                case "\u2264":
                    result = value1 <= value2;
                    break;
                case "=":
                    result = value1 == value2;
                    break;
                case "\u2265":
                    result = value1 >= value2;
                    break;
                case ">":
                    result = value1 > value2;
                    break;
            }
            if (result) {
                var message = my.actor.actions.act(my.target);
                if (message == "STOP") return message; // STOP
            }
        }
    });
});
Joy.module("random", function() {
    Joy.add({
        name: "With a X% chance...",
        type: "random/if",
        tags: [
            "random",
            "action"
        ],
        init: "With a {id:'chance', type:'number', min:0, max:100, placeholder:50}% chance, do:{id:'actions', type:'actions', resetVariables:false}",
        onact: function(my) {
            var probability = my.data.chance / 100;
            if (Math.random() < probability) {
                var message = my.actor.actions.act(my.target);
                if (message == "STOP") return message; // STOP
            }
        }
    });
    /****************

	Set a variable to some number.

	****************/ Joy.add({
        name: "Set random [number]",
        type: "random/set",
        tags: [
            "random",
            "action"
        ],
        init: "Set {id:'varname', type:'variableName', variableType:'number'} to a random {id:'numtype', type:'choose', options:['number','integer'], placeholder:'number'} between {id:'min', type:'number', placeholder:1} and {id:'max', type:'number', placeholder:100}",
        onact: function(my) {
            var _variables = my.target._variables;
            var varname = my.data.varname; // it's just a synchronized string
            var _min = my.data.min;
            var _max = my.data.max;
            var min = Math.min(_min, _max); // just in case
            var max = Math.max(_min, _max); // just in case
            var randomValue;
            if (my.data.numtype == "integer") randomValue = min + Math.floor(Math.random() * (max - min + 1));
            else randomValue = min + Math.random() * (max - min);
            _variables[varname] = randomValue; // Set the variable
        }
    });
});
exports.default = Joy;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gkKU3":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, "__esModule", {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || dest.hasOwnProperty(key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}]},["cspiS","i3Wj0"], "i3Wj0", "parcelRequire93f4")

//# sourceMappingURL=index.6b18c831.js.map
