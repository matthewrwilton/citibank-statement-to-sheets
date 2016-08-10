/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var parentJsonpFunction = window["webpackJsonp"];
/******/ 	window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules) {
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, callbacks = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId])
/******/ 				callbacks.push.apply(callbacks, installedChunks[chunkId]);
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			modules[moduleId] = moreModules[moduleId];
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules);
/******/ 		while(callbacks.length)
/******/ 			callbacks.shift().call(null, __webpack_require__);

/******/ 	};

/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// object to store loaded and loading chunks
/******/ 	// "0" means "already loaded"
/******/ 	// Array means "loading", array contains callbacks
/******/ 	var installedChunks = {
/******/ 		0:0
/******/ 	};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}

/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId, callback) {
/******/ 		// "0" is the signal for "already loaded"
/******/ 		if(installedChunks[chunkId] === 0)
/******/ 			return callback.call(null, __webpack_require__);

/******/ 		// an array means "currently loading".
/******/ 		if(installedChunks[chunkId] !== undefined) {
/******/ 			installedChunks[chunkId].push(callback);
/******/ 		} else {
/******/ 			// start chunk loading
/******/ 			installedChunks[chunkId] = [callback];
/******/ 			var head = document.getElementsByTagName('head')[0];
/******/ 			var script = document.createElement('script');
/******/ 			script.type = 'text/javascript';
/******/ 			script.charset = 'utf-8';
/******/ 			script.async = true;

/******/ 			script.src = __webpack_require__.p + "" + chunkId + ".bundle.js";
/******/ 			head.appendChild(script);
/******/ 		}
/******/ 	};

/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const ko = __webpack_require__(1);
	const Authoriser_1 = __webpack_require__(4);
	const PdfScraper_1 = __webpack_require__(6);
	const SheetAdder_1 = __webpack_require__(10);
	const SpreadsheetsLoader_1 = __webpack_require__(13);
	const SpreadsheetWriter_1 = __webpack_require__(16);
	const StatementParser_1 = __webpack_require__(18);
	class ViewModel {
	    constructor() {
	        this.authorising = ko.observable(true);
	        this.authorisationFailed = ko.observable(false);
	        this.error = ko.observable("");
	        this.importing = ko.observable(false);
	        this.loadingSheets = ko.observable(false);
	        this.loadingSheetsFailed = ko.observable(false);
	        this.passwordIncorrect = ko.observable(false);
	        this.passwordRequired = ko.observable(false);
	        this.selectedSheet = ko.observable(null);
	        this.sheets = ko.observableArray([]);
	        this.sheetsLoaded = ko.observable(false);
	        this.statement = ko.observable(null);
	        this.statementImported = ko.observable(false);
	        this.statementPassword = ko.observable("");
	        this.canImport = ko.pureComputed(() => {
	            let selectedSheet = this.selectedSheet();
	            return this.statementSelected() && selectedSheet !== null && selectedSheet !== undefined &&
	                (!this.passwordRequired() || this.statementPassword() !== "");
	        });
	        this.errored = ko.pureComputed(() => {
	            const error = this.error();
	            return error !== null && error !== "";
	        });
	        this.statementFileName = ko.pureComputed(() => {
	            let statement = this.statement();
	            return statement !== null ? statement.name : "";
	        });
	        this.statementSelected = ko.pureComputed(() => {
	            return this.statement() !== null;
	        });
	    }
	    authorise() {
	        this.authorisationFailed(false);
	        this.authorising(true);
	        let gapiAuthoriser = new Authoriser_1.default(this.handleGapiAuthorisation, this);
	        gapiAuthoriser.authorise();
	    }
	    importAnother() {
	        this.statementImported(false);
	    }
	    importStatement() {
	        let spreadsheetId = this.selectedSheet().id, sheetAdder = new SheetAdder_1.default();
	        this.importing(true);
	        sheetAdder.add(spreadsheetId)
	            .then((result) => {
	            if (result.successful) {
	                return;
	            }
	            else {
	                this.error("The application could not create a new sheet to import the statement into.");
	                console.error(`Could not add a new sheet for statement import. Error: ${result.errorMessage}`);
	                return Promise.reject("Failed to add sheet.");
	            }
	        })
	            .then(() => { return this.scrapePdf(); })
	            .then((statementText) => {
	            let statementParser = new StatementParser_1.default(), statementItems = statementParser.parse(statementText), sheetData = this.statementItemsToArray(statementItems), sheetWriter = new SpreadsheetWriter_1.default();
	            return sheetWriter.write(spreadsheetId, sheetData);
	        })
	            .then(result => {
	            if (result.successful) {
	                this.statementImported(true);
	                this.statement(null);
	            }
	            else {
	                this.error("The application failed to import statement details into the sheet.");
	                console.error(`Could not write statement data to sheet. Error: ${result.errorMessage}`);
	                return Promise.reject("Failed to write data to sheet.");
	            }
	        })
	            .then(() => { this.importing(false); }, (reason) => { this.importing(false); });
	    }
	    onStatementChange(data, event) {
	        let statementInput = event.target;
	        this.statementPassword("");
	        if (statementInput.files.length == 0) {
	            this.statement(null);
	            return;
	        }
	        this.statement(statementInput.files[0]);
	        this.scrapePdf()
	            .catch(() => { });
	    }
	    retry() {
	        this.error("");
	    }
	    handleGapiAuthorisation(result) {
	        if (result.authorised) {
	            this.loadGoogleSheets();
	        }
	        else {
	            console.error(`gapi authorisation error: ${result.errorMessage}`);
	            this.authorisationFailed(true);
	        }
	        this.authorising(false);
	    }
	    loadGoogleSheets() {
	        let sheetsLoader = new SpreadsheetsLoader_1.default();
	        this.loadingSheets(true);
	        sheetsLoader.load()
	            .then((result) => {
	            if (result.successful) {
	                ko.utils.arrayPushAll(this.sheets, result.sheets);
	                this.sheetsLoaded(true);
	            }
	            else {
	                console.error(`Could not load Sheets via Drive API. Error: ${result.errorMessage}`);
	                this.loadingSheetsFailed(true);
	            }
	            this.loadingSheets(false);
	        });
	    }
	    scrapePdf() {
	        let statementObjectUrl = window.URL.createObjectURL(this.statement()), pdfScraper = new PdfScraper_1.default();
	        return pdfScraper.scrapeText(statementObjectUrl, this.statementPassword())
	            .then(result => {
	            this.passwordRequired(false);
	            this.passwordIncorrect(false);
	            if (result.successful) {
	                return result.text;
	            }
	            else if (result.passwordRequired) {
	                this.passwordRequired(true);
	                return Promise.reject("Password required.");
	            }
	            else if (result.passwordIncorrect) {
	                this.passwordIncorrect(true);
	                return Promise.reject("Password incorrect.");
	            }
	        });
	    }
	    statementItemsToArray(items) {
	        return [[
	                "CARD NUMBER",
	                "DATE",
	                "DESCRIPTION",
	                "REFERENCE #",
	                "AMOUNT"
	            ]].concat(items.map(item => {
	            return [
	                item.cardNumber,
	                item.date,
	                item.transactionDetails,
	                item.referenceNumber,
	                item.amount
	            ];
	        }));
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ViewModel;
	const viewModel = new ViewModel();
	ko.applyBindings(viewModel);
	// Make authorise available on the window so it can be called once the gapi script has loaded
	// e.g. src="https://apis.google.com/js/client.js?onload=onGapiLoad"
	window.onGapiLoad = viewModel.authorise.bind(viewModel);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {/*!
	 * Knockout JavaScript library v3.4.0
	 * (c) Steven Sanderson - http://knockoutjs.com/
	 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
	 */

	(function(){
	var DEBUG=true;
	(function(undefined){
	    // (0, eval)('this') is a robust way of getting a reference to the global object
	    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
	    var window = this || (0, eval)('this'),
	        document = window['document'],
	        navigator = window['navigator'],
	        jQueryInstance = window["jQuery"],
	        JSON = window["JSON"];
	(function(factory) {
	    // Support three module loading scenarios
	    if ("function" === 'function' && __webpack_require__(3)['amd']) {
	        // [1] AMD anonymous module
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports, __webpack_require__], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (true) {
	        // [2] CommonJS/Node.js
	        factory(module['exports'] || exports);  // module.exports is for Node.js
	    } else {
	        // [3] No module loader (plain <script> tag) - put directly in global namespace
	        factory(window['ko'] = {});
	    }
	}(function(koExports, amdRequire){
	// Internally, all KO objects are attached to koExports (even the non-exported ones whose names will be minified by the closure compiler).
	// In the future, the following "ko" variable may be made distinct from "koExports" so that private objects are not externally reachable.
	var ko = typeof koExports !== 'undefined' ? koExports : {};
	// Google Closure Compiler helpers (used only to make the minified file smaller)
	ko.exportSymbol = function(koPath, object) {
	    var tokens = koPath.split(".");

	    // In the future, "ko" may become distinct from "koExports" (so that non-exported objects are not reachable)
	    // At that point, "target" would be set to: (typeof koExports !== "undefined" ? koExports : ko)
	    var target = ko;

	    for (var i = 0; i < tokens.length - 1; i++)
	        target = target[tokens[i]];
	    target[tokens[tokens.length - 1]] = object;
	};
	ko.exportProperty = function(owner, publicName, object) {
	    owner[publicName] = object;
	};
	ko.version = "3.4.0";

	ko.exportSymbol('version', ko.version);
	// For any options that may affect various areas of Knockout and aren't directly associated with data binding.
	ko.options = {
	    'deferUpdates': false,
	    'useOnlyNativeEvents': false
	};

	//ko.exportSymbol('options', ko.options);   // 'options' isn't minified
	ko.utils = (function () {
	    function objectForEach(obj, action) {
	        for (var prop in obj) {
	            if (obj.hasOwnProperty(prop)) {
	                action(prop, obj[prop]);
	            }
	        }
	    }

	    function extend(target, source) {
	        if (source) {
	            for(var prop in source) {
	                if(source.hasOwnProperty(prop)) {
	                    target[prop] = source[prop];
	                }
	            }
	        }
	        return target;
	    }

	    function setPrototypeOf(obj, proto) {
	        obj.__proto__ = proto;
	        return obj;
	    }

	    var canSetPrototype = ({ __proto__: [] } instanceof Array);
	    var canUseSymbols = !DEBUG && typeof Symbol === 'function';

	    // Represent the known event types in a compact way, then at runtime transform it into a hash with event name as key (for fast lookup)
	    var knownEvents = {}, knownEventTypesByEventName = {};
	    var keyEventTypeName = (navigator && /Firefox\/2/i.test(navigator.userAgent)) ? 'KeyboardEvent' : 'UIEvents';
	    knownEvents[keyEventTypeName] = ['keyup', 'keydown', 'keypress'];
	    knownEvents['MouseEvents'] = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
	    objectForEach(knownEvents, function(eventType, knownEventsForType) {
	        if (knownEventsForType.length) {
	            for (var i = 0, j = knownEventsForType.length; i < j; i++)
	                knownEventTypesByEventName[knownEventsForType[i]] = eventType;
	        }
	    });
	    var eventsThatMustBeRegisteredUsingAttachEvent = { 'propertychange': true }; // Workaround for an IE9 issue - https://github.com/SteveSanderson/knockout/issues/406

	    // Detect IE versions for bug workarounds (uses IE conditionals, not UA string, for robustness)
	    // Note that, since IE 10 does not support conditional comments, the following logic only detects IE < 10.
	    // Currently this is by design, since IE 10+ behaves correctly when treated as a standard browser.
	    // If there is a future need to detect specific versions of IE10+, we will amend this.
	    var ieVersion = document && (function() {
	        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

	        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
	        while (
	            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
	            iElems[0]
	        ) {}
	        return version > 4 ? version : undefined;
	    }());
	    var isIe6 = ieVersion === 6,
	        isIe7 = ieVersion === 7;

	    function isClickOnCheckableElement(element, eventType) {
	        if ((ko.utils.tagNameLower(element) !== "input") || !element.type) return false;
	        if (eventType.toLowerCase() != "click") return false;
	        var inputType = element.type;
	        return (inputType == "checkbox") || (inputType == "radio");
	    }

	    // For details on the pattern for changing node classes
	    // see: https://github.com/knockout/knockout/issues/1597
	    var cssClassNameRegex = /\S+/g;

	    function toggleDomNodeCssClass(node, classNames, shouldHaveClass) {
	        var addOrRemoveFn;
	        if (classNames) {
	            if (typeof node.classList === 'object') {
	                addOrRemoveFn = node.classList[shouldHaveClass ? 'add' : 'remove'];
	                ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
	                    addOrRemoveFn.call(node.classList, className);
	                });
	            } else if (typeof node.className['baseVal'] === 'string') {
	                // SVG tag .classNames is an SVGAnimatedString instance
	                toggleObjectClassPropertyString(node.className, 'baseVal', classNames, shouldHaveClass);
	            } else {
	                // node.className ought to be a string.
	                toggleObjectClassPropertyString(node, 'className', classNames, shouldHaveClass);
	            }
	        }
	    }

	    function toggleObjectClassPropertyString(obj, prop, classNames, shouldHaveClass) {
	        // obj/prop is either a node/'className' or a SVGAnimatedString/'baseVal'.
	        var currentClassNames = obj[prop].match(cssClassNameRegex) || [];
	        ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
	            ko.utils.addOrRemoveItem(currentClassNames, className, shouldHaveClass);
	        });
	        obj[prop] = currentClassNames.join(" ");
	    }

	    return {
	        fieldsIncludedWithJsonPost: ['authenticity_token', /^__RequestVerificationToken(_.*)?$/],

	        arrayForEach: function (array, action) {
	            for (var i = 0, j = array.length; i < j; i++)
	                action(array[i], i);
	        },

	        arrayIndexOf: function (array, item) {
	            if (typeof Array.prototype.indexOf == "function")
	                return Array.prototype.indexOf.call(array, item);
	            for (var i = 0, j = array.length; i < j; i++)
	                if (array[i] === item)
	                    return i;
	            return -1;
	        },

	        arrayFirst: function (array, predicate, predicateOwner) {
	            for (var i = 0, j = array.length; i < j; i++)
	                if (predicate.call(predicateOwner, array[i], i))
	                    return array[i];
	            return null;
	        },

	        arrayRemoveItem: function (array, itemToRemove) {
	            var index = ko.utils.arrayIndexOf(array, itemToRemove);
	            if (index > 0) {
	                array.splice(index, 1);
	            }
	            else if (index === 0) {
	                array.shift();
	            }
	        },

	        arrayGetDistinctValues: function (array) {
	            array = array || [];
	            var result = [];
	            for (var i = 0, j = array.length; i < j; i++) {
	                if (ko.utils.arrayIndexOf(result, array[i]) < 0)
	                    result.push(array[i]);
	            }
	            return result;
	        },

	        arrayMap: function (array, mapping) {
	            array = array || [];
	            var result = [];
	            for (var i = 0, j = array.length; i < j; i++)
	                result.push(mapping(array[i], i));
	            return result;
	        },

	        arrayFilter: function (array, predicate) {
	            array = array || [];
	            var result = [];
	            for (var i = 0, j = array.length; i < j; i++)
	                if (predicate(array[i], i))
	                    result.push(array[i]);
	            return result;
	        },

	        arrayPushAll: function (array, valuesToPush) {
	            if (valuesToPush instanceof Array)
	                array.push.apply(array, valuesToPush);
	            else
	                for (var i = 0, j = valuesToPush.length; i < j; i++)
	                    array.push(valuesToPush[i]);
	            return array;
	        },

	        addOrRemoveItem: function(array, value, included) {
	            var existingEntryIndex = ko.utils.arrayIndexOf(ko.utils.peekObservable(array), value);
	            if (existingEntryIndex < 0) {
	                if (included)
	                    array.push(value);
	            } else {
	                if (!included)
	                    array.splice(existingEntryIndex, 1);
	            }
	        },

	        canSetPrototype: canSetPrototype,

	        extend: extend,

	        setPrototypeOf: setPrototypeOf,

	        setPrototypeOfOrExtend: canSetPrototype ? setPrototypeOf : extend,

	        objectForEach: objectForEach,

	        objectMap: function(source, mapping) {
	            if (!source)
	                return source;
	            var target = {};
	            for (var prop in source) {
	                if (source.hasOwnProperty(prop)) {
	                    target[prop] = mapping(source[prop], prop, source);
	                }
	            }
	            return target;
	        },

	        emptyDomNode: function (domNode) {
	            while (domNode.firstChild) {
	                ko.removeNode(domNode.firstChild);
	            }
	        },

	        moveCleanedNodesToContainerElement: function(nodes) {
	            // Ensure it's a real array, as we're about to reparent the nodes and
	            // we don't want the underlying collection to change while we're doing that.
	            var nodesArray = ko.utils.makeArray(nodes);
	            var templateDocument = (nodesArray[0] && nodesArray[0].ownerDocument) || document;

	            var container = templateDocument.createElement('div');
	            for (var i = 0, j = nodesArray.length; i < j; i++) {
	                container.appendChild(ko.cleanNode(nodesArray[i]));
	            }
	            return container;
	        },

	        cloneNodes: function (nodesArray, shouldCleanNodes) {
	            for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
	                var clonedNode = nodesArray[i].cloneNode(true);
	                newNodesArray.push(shouldCleanNodes ? ko.cleanNode(clonedNode) : clonedNode);
	            }
	            return newNodesArray;
	        },

	        setDomNodeChildren: function (domNode, childNodes) {
	            ko.utils.emptyDomNode(domNode);
	            if (childNodes) {
	                for (var i = 0, j = childNodes.length; i < j; i++)
	                    domNode.appendChild(childNodes[i]);
	            }
	        },

	        replaceDomNodes: function (nodeToReplaceOrNodeArray, newNodesArray) {
	            var nodesToReplaceArray = nodeToReplaceOrNodeArray.nodeType ? [nodeToReplaceOrNodeArray] : nodeToReplaceOrNodeArray;
	            if (nodesToReplaceArray.length > 0) {
	                var insertionPoint = nodesToReplaceArray[0];
	                var parent = insertionPoint.parentNode;
	                for (var i = 0, j = newNodesArray.length; i < j; i++)
	                    parent.insertBefore(newNodesArray[i], insertionPoint);
	                for (var i = 0, j = nodesToReplaceArray.length; i < j; i++) {
	                    ko.removeNode(nodesToReplaceArray[i]);
	                }
	            }
	        },

	        fixUpContinuousNodeArray: function(continuousNodeArray, parentNode) {
	            // Before acting on a set of nodes that were previously outputted by a template function, we have to reconcile
	            // them against what is in the DOM right now. It may be that some of the nodes have already been removed, or that
	            // new nodes might have been inserted in the middle, for example by a binding. Also, there may previously have been
	            // leading comment nodes (created by rewritten string-based templates) that have since been removed during binding.
	            // So, this function translates the old "map" output array into its best guess of the set of current DOM nodes.
	            //
	            // Rules:
	            //   [A] Any leading nodes that have been removed should be ignored
	            //       These most likely correspond to memoization nodes that were already removed during binding
	            //       See https://github.com/knockout/knockout/pull/440
	            //   [B] Any trailing nodes that have been remove should be ignored
	            //       This prevents the code here from adding unrelated nodes to the array while processing rule [C]
	            //       See https://github.com/knockout/knockout/pull/1903
	            //   [C] We want to output a continuous series of nodes. So, ignore any nodes that have already been removed,
	            //       and include any nodes that have been inserted among the previous collection

	            if (continuousNodeArray.length) {
	                // The parent node can be a virtual element; so get the real parent node
	                parentNode = (parentNode.nodeType === 8 && parentNode.parentNode) || parentNode;

	                // Rule [A]
	                while (continuousNodeArray.length && continuousNodeArray[0].parentNode !== parentNode)
	                    continuousNodeArray.splice(0, 1);

	                // Rule [B]
	                while (continuousNodeArray.length > 1 && continuousNodeArray[continuousNodeArray.length - 1].parentNode !== parentNode)
	                    continuousNodeArray.length--;

	                // Rule [C]
	                if (continuousNodeArray.length > 1) {
	                    var current = continuousNodeArray[0], last = continuousNodeArray[continuousNodeArray.length - 1];
	                    // Replace with the actual new continuous node set
	                    continuousNodeArray.length = 0;
	                    while (current !== last) {
	                        continuousNodeArray.push(current);
	                        current = current.nextSibling;
	                    }
	                    continuousNodeArray.push(last);
	                }
	            }
	            return continuousNodeArray;
	        },

	        setOptionNodeSelectionState: function (optionNode, isSelected) {
	            // IE6 sometimes throws "unknown error" if you try to write to .selected directly, whereas Firefox struggles with setAttribute. Pick one based on browser.
	            if (ieVersion < 7)
	                optionNode.setAttribute("selected", isSelected);
	            else
	                optionNode.selected = isSelected;
	        },

	        stringTrim: function (string) {
	            return string === null || string === undefined ? '' :
	                string.trim ?
	                    string.trim() :
	                    string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
	        },

	        stringStartsWith: function (string, startsWith) {
	            string = string || "";
	            if (startsWith.length > string.length)
	                return false;
	            return string.substring(0, startsWith.length) === startsWith;
	        },

	        domNodeIsContainedBy: function (node, containedByNode) {
	            if (node === containedByNode)
	                return true;
	            if (node.nodeType === 11)
	                return false; // Fixes issue #1162 - can't use node.contains for document fragments on IE8
	            if (containedByNode.contains)
	                return containedByNode.contains(node.nodeType === 3 ? node.parentNode : node);
	            if (containedByNode.compareDocumentPosition)
	                return (containedByNode.compareDocumentPosition(node) & 16) == 16;
	            while (node && node != containedByNode) {
	                node = node.parentNode;
	            }
	            return !!node;
	        },

	        domNodeIsAttachedToDocument: function (node) {
	            return ko.utils.domNodeIsContainedBy(node, node.ownerDocument.documentElement);
	        },

	        anyDomNodeIsAttachedToDocument: function(nodes) {
	            return !!ko.utils.arrayFirst(nodes, ko.utils.domNodeIsAttachedToDocument);
	        },

	        tagNameLower: function(element) {
	            // For HTML elements, tagName will always be upper case; for XHTML elements, it'll be lower case.
	            // Possible future optimization: If we know it's an element from an XHTML document (not HTML),
	            // we don't need to do the .toLowerCase() as it will always be lower case anyway.
	            return element && element.tagName && element.tagName.toLowerCase();
	        },

	        catchFunctionErrors: function (delegate) {
	            return ko['onError'] ? function () {
	                try {
	                    return delegate.apply(this, arguments);
	                } catch (e) {
	                    ko['onError'] && ko['onError'](e);
	                    throw e;
	                }
	            } : delegate;
	        },

	        setTimeout: function (handler, timeout) {
	            return setTimeout(ko.utils.catchFunctionErrors(handler), timeout);
	        },

	        deferError: function (error) {
	            setTimeout(function () {
	                ko['onError'] && ko['onError'](error);
	                throw error;
	            }, 0);
	        },

	        registerEventHandler: function (element, eventType, handler) {
	            var wrappedHandler = ko.utils.catchFunctionErrors(handler);

	            var mustUseAttachEvent = ieVersion && eventsThatMustBeRegisteredUsingAttachEvent[eventType];
	            if (!ko.options['useOnlyNativeEvents'] && !mustUseAttachEvent && jQueryInstance) {
	                jQueryInstance(element)['bind'](eventType, wrappedHandler);
	            } else if (!mustUseAttachEvent && typeof element.addEventListener == "function")
	                element.addEventListener(eventType, wrappedHandler, false);
	            else if (typeof element.attachEvent != "undefined") {
	                var attachEventHandler = function (event) { wrappedHandler.call(element, event); },
	                    attachEventName = "on" + eventType;
	                element.attachEvent(attachEventName, attachEventHandler);

	                // IE does not dispose attachEvent handlers automatically (unlike with addEventListener)
	                // so to avoid leaks, we have to remove them manually. See bug #856
	                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
	                    element.detachEvent(attachEventName, attachEventHandler);
	                });
	            } else
	                throw new Error("Browser doesn't support addEventListener or attachEvent");
	        },

	        triggerEvent: function (element, eventType) {
	            if (!(element && element.nodeType))
	                throw new Error("element must be a DOM node when calling triggerEvent");

	            // For click events on checkboxes and radio buttons, jQuery toggles the element checked state *after* the
	            // event handler runs instead of *before*. (This was fixed in 1.9 for checkboxes but not for radio buttons.)
	            // IE doesn't change the checked state when you trigger the click event using "fireEvent".
	            // In both cases, we'll use the click method instead.
	            var useClickWorkaround = isClickOnCheckableElement(element, eventType);

	            if (!ko.options['useOnlyNativeEvents'] && jQueryInstance && !useClickWorkaround) {
	                jQueryInstance(element)['trigger'](eventType);
	            } else if (typeof document.createEvent == "function") {
	                if (typeof element.dispatchEvent == "function") {
	                    var eventCategory = knownEventTypesByEventName[eventType] || "HTMLEvents";
	                    var event = document.createEvent(eventCategory);
	                    event.initEvent(eventType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, element);
	                    element.dispatchEvent(event);
	                }
	                else
	                    throw new Error("The supplied element doesn't support dispatchEvent");
	            } else if (useClickWorkaround && element.click) {
	                element.click();
	            } else if (typeof element.fireEvent != "undefined") {
	                element.fireEvent("on" + eventType);
	            } else {
	                throw new Error("Browser doesn't support triggering events");
	            }
	        },

	        unwrapObservable: function (value) {
	            return ko.isObservable(value) ? value() : value;
	        },

	        peekObservable: function (value) {
	            return ko.isObservable(value) ? value.peek() : value;
	        },

	        toggleDomNodeCssClass: toggleDomNodeCssClass,

	        setTextContent: function(element, textContent) {
	            var value = ko.utils.unwrapObservable(textContent);
	            if ((value === null) || (value === undefined))
	                value = "";

	            // We need there to be exactly one child: a text node.
	            // If there are no children, more than one, or if it's not a text node,
	            // we'll clear everything and create a single text node.
	            var innerTextNode = ko.virtualElements.firstChild(element);
	            if (!innerTextNode || innerTextNode.nodeType != 3 || ko.virtualElements.nextSibling(innerTextNode)) {
	                ko.virtualElements.setDomNodeChildren(element, [element.ownerDocument.createTextNode(value)]);
	            } else {
	                innerTextNode.data = value;
	            }

	            ko.utils.forceRefresh(element);
	        },

	        setElementName: function(element, name) {
	            element.name = name;

	            // Workaround IE 6/7 issue
	            // - https://github.com/SteveSanderson/knockout/issues/197
	            // - http://www.matts411.com/post/setting_the_name_attribute_in_ie_dom/
	            if (ieVersion <= 7) {
	                try {
	                    element.mergeAttributes(document.createElement("<input name='" + element.name + "'/>"), false);
	                }
	                catch(e) {} // For IE9 with doc mode "IE9 Standards" and browser mode "IE9 Compatibility View"
	            }
	        },

	        forceRefresh: function(node) {
	            // Workaround for an IE9 rendering bug - https://github.com/SteveSanderson/knockout/issues/209
	            if (ieVersion >= 9) {
	                // For text nodes and comment nodes (most likely virtual elements), we will have to refresh the container
	                var elem = node.nodeType == 1 ? node : node.parentNode;
	                if (elem.style)
	                    elem.style.zoom = elem.style.zoom;
	            }
	        },

	        ensureSelectElementIsRenderedCorrectly: function(selectElement) {
	            // Workaround for IE9 rendering bug - it doesn't reliably display all the text in dynamically-added select boxes unless you force it to re-render by updating the width.
	            // (See https://github.com/SteveSanderson/knockout/issues/312, http://stackoverflow.com/questions/5908494/select-only-shows-first-char-of-selected-option)
	            // Also fixes IE7 and IE8 bug that causes selects to be zero width if enclosed by 'if' or 'with'. (See issue #839)
	            if (ieVersion) {
	                var originalWidth = selectElement.style.width;
	                selectElement.style.width = 0;
	                selectElement.style.width = originalWidth;
	            }
	        },

	        range: function (min, max) {
	            min = ko.utils.unwrapObservable(min);
	            max = ko.utils.unwrapObservable(max);
	            var result = [];
	            for (var i = min; i <= max; i++)
	                result.push(i);
	            return result;
	        },

	        makeArray: function(arrayLikeObject) {
	            var result = [];
	            for (var i = 0, j = arrayLikeObject.length; i < j; i++) {
	                result.push(arrayLikeObject[i]);
	            };
	            return result;
	        },

	        createSymbolOrString: function(identifier) {
	            return canUseSymbols ? Symbol(identifier) : identifier;
	        },

	        isIe6 : isIe6,
	        isIe7 : isIe7,
	        ieVersion : ieVersion,

	        getFormFields: function(form, fieldName) {
	            var fields = ko.utils.makeArray(form.getElementsByTagName("input")).concat(ko.utils.makeArray(form.getElementsByTagName("textarea")));
	            var isMatchingField = (typeof fieldName == 'string')
	                ? function(field) { return field.name === fieldName }
	                : function(field) { return fieldName.test(field.name) }; // Treat fieldName as regex or object containing predicate
	            var matches = [];
	            for (var i = fields.length - 1; i >= 0; i--) {
	                if (isMatchingField(fields[i]))
	                    matches.push(fields[i]);
	            };
	            return matches;
	        },

	        parseJson: function (jsonString) {
	            if (typeof jsonString == "string") {
	                jsonString = ko.utils.stringTrim(jsonString);
	                if (jsonString) {
	                    if (JSON && JSON.parse) // Use native parsing where available
	                        return JSON.parse(jsonString);
	                    return (new Function("return " + jsonString))(); // Fallback on less safe parsing for older browsers
	                }
	            }
	            return null;
	        },

	        stringifyJson: function (data, replacer, space) {   // replacer and space are optional
	            if (!JSON || !JSON.stringify)
	                throw new Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
	            return JSON.stringify(ko.utils.unwrapObservable(data), replacer, space);
	        },

	        postJson: function (urlOrForm, data, options) {
	            options = options || {};
	            var params = options['params'] || {};
	            var includeFields = options['includeFields'] || this.fieldsIncludedWithJsonPost;
	            var url = urlOrForm;

	            // If we were given a form, use its 'action' URL and pick out any requested field values
	            if((typeof urlOrForm == 'object') && (ko.utils.tagNameLower(urlOrForm) === "form")) {
	                var originalForm = urlOrForm;
	                url = originalForm.action;
	                for (var i = includeFields.length - 1; i >= 0; i--) {
	                    var fields = ko.utils.getFormFields(originalForm, includeFields[i]);
	                    for (var j = fields.length - 1; j >= 0; j--)
	                        params[fields[j].name] = fields[j].value;
	                }
	            }

	            data = ko.utils.unwrapObservable(data);
	            var form = document.createElement("form");
	            form.style.display = "none";
	            form.action = url;
	            form.method = "post";
	            for (var key in data) {
	                // Since 'data' this is a model object, we include all properties including those inherited from its prototype
	                var input = document.createElement("input");
	                input.type = "hidden";
	                input.name = key;
	                input.value = ko.utils.stringifyJson(ko.utils.unwrapObservable(data[key]));
	                form.appendChild(input);
	            }
	            objectForEach(params, function(key, value) {
	                var input = document.createElement("input");
	                input.type = "hidden";
	                input.name = key;
	                input.value = value;
	                form.appendChild(input);
	            });
	            document.body.appendChild(form);
	            options['submitter'] ? options['submitter'](form) : form.submit();
	            setTimeout(function () { form.parentNode.removeChild(form); }, 0);
	        }
	    }
	}());

	ko.exportSymbol('utils', ko.utils);
	ko.exportSymbol('utils.arrayForEach', ko.utils.arrayForEach);
	ko.exportSymbol('utils.arrayFirst', ko.utils.arrayFirst);
	ko.exportSymbol('utils.arrayFilter', ko.utils.arrayFilter);
	ko.exportSymbol('utils.arrayGetDistinctValues', ko.utils.arrayGetDistinctValues);
	ko.exportSymbol('utils.arrayIndexOf', ko.utils.arrayIndexOf);
	ko.exportSymbol('utils.arrayMap', ko.utils.arrayMap);
	ko.exportSymbol('utils.arrayPushAll', ko.utils.arrayPushAll);
	ko.exportSymbol('utils.arrayRemoveItem', ko.utils.arrayRemoveItem);
	ko.exportSymbol('utils.extend', ko.utils.extend);
	ko.exportSymbol('utils.fieldsIncludedWithJsonPost', ko.utils.fieldsIncludedWithJsonPost);
	ko.exportSymbol('utils.getFormFields', ko.utils.getFormFields);
	ko.exportSymbol('utils.peekObservable', ko.utils.peekObservable);
	ko.exportSymbol('utils.postJson', ko.utils.postJson);
	ko.exportSymbol('utils.parseJson', ko.utils.parseJson);
	ko.exportSymbol('utils.registerEventHandler', ko.utils.registerEventHandler);
	ko.exportSymbol('utils.stringifyJson', ko.utils.stringifyJson);
	ko.exportSymbol('utils.range', ko.utils.range);
	ko.exportSymbol('utils.toggleDomNodeCssClass', ko.utils.toggleDomNodeCssClass);
	ko.exportSymbol('utils.triggerEvent', ko.utils.triggerEvent);
	ko.exportSymbol('utils.unwrapObservable', ko.utils.unwrapObservable);
	ko.exportSymbol('utils.objectForEach', ko.utils.objectForEach);
	ko.exportSymbol('utils.addOrRemoveItem', ko.utils.addOrRemoveItem);
	ko.exportSymbol('utils.setTextContent', ko.utils.setTextContent);
	ko.exportSymbol('unwrap', ko.utils.unwrapObservable); // Convenient shorthand, because this is used so commonly

	if (!Function.prototype['bind']) {
	    // Function.prototype.bind is a standard part of ECMAScript 5th Edition (December 2009, http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf)
	    // In case the browser doesn't implement it natively, provide a JavaScript implementation. This implementation is based on the one in prototype.js
	    Function.prototype['bind'] = function (object) {
	        var originalFunction = this;
	        if (arguments.length === 1) {
	            return function () {
	                return originalFunction.apply(object, arguments);
	            };
	        } else {
	            var partialArgs = Array.prototype.slice.call(arguments, 1);
	            return function () {
	                var args = partialArgs.slice(0);
	                args.push.apply(args, arguments);
	                return originalFunction.apply(object, args);
	            };
	        }
	    };
	}

	ko.utils.domData = new (function () {
	    var uniqueId = 0;
	    var dataStoreKeyExpandoPropertyName = "__ko__" + (new Date).getTime();
	    var dataStore = {};

	    function getAll(node, createIfNotFound) {
	        var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
	        var hasExistingDataStore = dataStoreKey && (dataStoreKey !== "null") && dataStore[dataStoreKey];
	        if (!hasExistingDataStore) {
	            if (!createIfNotFound)
	                return undefined;
	            dataStoreKey = node[dataStoreKeyExpandoPropertyName] = "ko" + uniqueId++;
	            dataStore[dataStoreKey] = {};
	        }
	        return dataStore[dataStoreKey];
	    }

	    return {
	        get: function (node, key) {
	            var allDataForNode = getAll(node, false);
	            return allDataForNode === undefined ? undefined : allDataForNode[key];
	        },
	        set: function (node, key, value) {
	            if (value === undefined) {
	                // Make sure we don't actually create a new domData key if we are actually deleting a value
	                if (getAll(node, false) === undefined)
	                    return;
	            }
	            var allDataForNode = getAll(node, true);
	            allDataForNode[key] = value;
	        },
	        clear: function (node) {
	            var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
	            if (dataStoreKey) {
	                delete dataStore[dataStoreKey];
	                node[dataStoreKeyExpandoPropertyName] = null;
	                return true; // Exposing "did clean" flag purely so specs can infer whether things have been cleaned up as intended
	            }
	            return false;
	        },

	        nextKey: function () {
	            return (uniqueId++) + dataStoreKeyExpandoPropertyName;
	        }
	    };
	})();

	ko.exportSymbol('utils.domData', ko.utils.domData);
	ko.exportSymbol('utils.domData.clear', ko.utils.domData.clear); // Exporting only so specs can clear up after themselves fully

	ko.utils.domNodeDisposal = new (function () {
	    var domDataKey = ko.utils.domData.nextKey();
	    var cleanableNodeTypes = { 1: true, 8: true, 9: true };       // Element, Comment, Document
	    var cleanableNodeTypesWithDescendants = { 1: true, 9: true }; // Element, Document

	    function getDisposeCallbacksCollection(node, createIfNotFound) {
	        var allDisposeCallbacks = ko.utils.domData.get(node, domDataKey);
	        if ((allDisposeCallbacks === undefined) && createIfNotFound) {
	            allDisposeCallbacks = [];
	            ko.utils.domData.set(node, domDataKey, allDisposeCallbacks);
	        }
	        return allDisposeCallbacks;
	    }
	    function destroyCallbacksCollection(node) {
	        ko.utils.domData.set(node, domDataKey, undefined);
	    }

	    function cleanSingleNode(node) {
	        // Run all the dispose callbacks
	        var callbacks = getDisposeCallbacksCollection(node, false);
	        if (callbacks) {
	            callbacks = callbacks.slice(0); // Clone, as the array may be modified during iteration (typically, callbacks will remove themselves)
	            for (var i = 0; i < callbacks.length; i++)
	                callbacks[i](node);
	        }

	        // Erase the DOM data
	        ko.utils.domData.clear(node);

	        // Perform cleanup needed by external libraries (currently only jQuery, but can be extended)
	        ko.utils.domNodeDisposal["cleanExternalData"](node);

	        // Clear any immediate-child comment nodes, as these wouldn't have been found by
	        // node.getElementsByTagName("*") in cleanNode() (comment nodes aren't elements)
	        if (cleanableNodeTypesWithDescendants[node.nodeType])
	            cleanImmediateCommentTypeChildren(node);
	    }

	    function cleanImmediateCommentTypeChildren(nodeWithChildren) {
	        var child, nextChild = nodeWithChildren.firstChild;
	        while (child = nextChild) {
	            nextChild = child.nextSibling;
	            if (child.nodeType === 8)
	                cleanSingleNode(child);
	        }
	    }

	    return {
	        addDisposeCallback : function(node, callback) {
	            if (typeof callback != "function")
	                throw new Error("Callback must be a function");
	            getDisposeCallbacksCollection(node, true).push(callback);
	        },

	        removeDisposeCallback : function(node, callback) {
	            var callbacksCollection = getDisposeCallbacksCollection(node, false);
	            if (callbacksCollection) {
	                ko.utils.arrayRemoveItem(callbacksCollection, callback);
	                if (callbacksCollection.length == 0)
	                    destroyCallbacksCollection(node);
	            }
	        },

	        cleanNode : function(node) {
	            // First clean this node, where applicable
	            if (cleanableNodeTypes[node.nodeType]) {
	                cleanSingleNode(node);

	                // ... then its descendants, where applicable
	                if (cleanableNodeTypesWithDescendants[node.nodeType]) {
	                    // Clone the descendants list in case it changes during iteration
	                    var descendants = [];
	                    ko.utils.arrayPushAll(descendants, node.getElementsByTagName("*"));
	                    for (var i = 0, j = descendants.length; i < j; i++)
	                        cleanSingleNode(descendants[i]);
	                }
	            }
	            return node;
	        },

	        removeNode : function(node) {
	            ko.cleanNode(node);
	            if (node.parentNode)
	                node.parentNode.removeChild(node);
	        },

	        "cleanExternalData" : function (node) {
	            // Special support for jQuery here because it's so commonly used.
	            // Many jQuery plugins (including jquery.tmpl) store data using jQuery's equivalent of domData
	            // so notify it to tear down any resources associated with the node & descendants here.
	            if (jQueryInstance && (typeof jQueryInstance['cleanData'] == "function"))
	                jQueryInstance['cleanData']([node]);
	        }
	    };
	})();
	ko.cleanNode = ko.utils.domNodeDisposal.cleanNode; // Shorthand name for convenience
	ko.removeNode = ko.utils.domNodeDisposal.removeNode; // Shorthand name for convenience
	ko.exportSymbol('cleanNode', ko.cleanNode);
	ko.exportSymbol('removeNode', ko.removeNode);
	ko.exportSymbol('utils.domNodeDisposal', ko.utils.domNodeDisposal);
	ko.exportSymbol('utils.domNodeDisposal.addDisposeCallback', ko.utils.domNodeDisposal.addDisposeCallback);
	ko.exportSymbol('utils.domNodeDisposal.removeDisposeCallback', ko.utils.domNodeDisposal.removeDisposeCallback);
	(function () {
	    var none = [0, "", ""],
	        table = [1, "<table>", "</table>"],
	        tbody = [2, "<table><tbody>", "</tbody></table>"],
	        tr = [3, "<table><tbody><tr>", "</tr></tbody></table>"],
	        select = [1, "<select multiple='multiple'>", "</select>"],
	        lookup = {
	            'thead': table,
	            'tbody': table,
	            'tfoot': table,
	            'tr': tbody,
	            'td': tr,
	            'th': tr,
	            'option': select,
	            'optgroup': select
	        },

	        // This is needed for old IE if you're *not* using either jQuery or innerShiv. Doesn't affect other cases.
	        mayRequireCreateElementHack = ko.utils.ieVersion <= 8;

	    function getWrap(tags) {
	        var m = tags.match(/^<([a-z]+)[ >]/);
	        return (m && lookup[m[1]]) || none;
	    }

	    function simpleHtmlParse(html, documentContext) {
	        documentContext || (documentContext = document);
	        var windowContext = documentContext['parentWindow'] || documentContext['defaultView'] || window;

	        // Based on jQuery's "clean" function, but only accounting for table-related elements.
	        // If you have referenced jQuery, this won't be used anyway - KO will use jQuery's "clean" function directly

	        // Note that there's still an issue in IE < 9 whereby it will discard comment nodes that are the first child of
	        // a descendant node. For example: "<div><!-- mycomment -->abc</div>" will get parsed as "<div>abc</div>"
	        // This won't affect anyone who has referenced jQuery, and there's always the workaround of inserting a dummy node
	        // (possibly a text node) in front of the comment. So, KO does not attempt to workaround this IE issue automatically at present.

	        // Trim whitespace, otherwise indexOf won't work as expected
	        var tags = ko.utils.stringTrim(html).toLowerCase(), div = documentContext.createElement("div"),
	            wrap = getWrap(tags),
	            depth = wrap[0];

	        // Go to html and back, then peel off extra wrappers
	        // Note that we always prefix with some dummy text, because otherwise, IE<9 will strip out leading comment nodes in descendants. Total madness.
	        var markup = "ignored<div>" + wrap[1] + html + wrap[2] + "</div>";
	        if (typeof windowContext['innerShiv'] == "function") {
	            // Note that innerShiv is deprecated in favour of html5shiv. We should consider adding
	            // support for html5shiv (except if no explicit support is needed, e.g., if html5shiv
	            // somehow shims the native APIs so it just works anyway)
	            div.appendChild(windowContext['innerShiv'](markup));
	        } else {
	            if (mayRequireCreateElementHack) {
	                // The document.createElement('my-element') trick to enable custom elements in IE6-8
	                // only works if we assign innerHTML on an element associated with that document.
	                documentContext.appendChild(div);
	            }

	            div.innerHTML = markup;

	            if (mayRequireCreateElementHack) {
	                div.parentNode.removeChild(div);
	            }
	        }

	        // Move to the right depth
	        while (depth--)
	            div = div.lastChild;

	        return ko.utils.makeArray(div.lastChild.childNodes);
	    }

	    function jQueryHtmlParse(html, documentContext) {
	        // jQuery's "parseHTML" function was introduced in jQuery 1.8.0 and is a documented public API.
	        if (jQueryInstance['parseHTML']) {
	            return jQueryInstance['parseHTML'](html, documentContext) || []; // Ensure we always return an array and never null
	        } else {
	            // For jQuery < 1.8.0, we fall back on the undocumented internal "clean" function.
	            var elems = jQueryInstance['clean']([html], documentContext);

	            // As of jQuery 1.7.1, jQuery parses the HTML by appending it to some dummy parent nodes held in an in-memory document fragment.
	            // Unfortunately, it never clears the dummy parent nodes from the document fragment, so it leaks memory over time.
	            // Fix this by finding the top-most dummy parent element, and detaching it from its owner fragment.
	            if (elems && elems[0]) {
	                // Find the top-most parent element that's a direct child of a document fragment
	                var elem = elems[0];
	                while (elem.parentNode && elem.parentNode.nodeType !== 11 /* i.e., DocumentFragment */)
	                    elem = elem.parentNode;
	                // ... then detach it
	                if (elem.parentNode)
	                    elem.parentNode.removeChild(elem);
	            }

	            return elems;
	        }
	    }

	    ko.utils.parseHtmlFragment = function(html, documentContext) {
	        return jQueryInstance ?
	            jQueryHtmlParse(html, documentContext) :   // As below, benefit from jQuery's optimisations where possible
	            simpleHtmlParse(html, documentContext);  // ... otherwise, this simple logic will do in most common cases.
	    };

	    ko.utils.setHtml = function(node, html) {
	        ko.utils.emptyDomNode(node);

	        // There's no legitimate reason to display a stringified observable without unwrapping it, so we'll unwrap it
	        html = ko.utils.unwrapObservable(html);

	        if ((html !== null) && (html !== undefined)) {
	            if (typeof html != 'string')
	                html = html.toString();

	            // jQuery contains a lot of sophisticated code to parse arbitrary HTML fragments,
	            // for example <tr> elements which are not normally allowed to exist on their own.
	            // If you've referenced jQuery we'll use that rather than duplicating its code.
	            if (jQueryInstance) {
	                jQueryInstance(node)['html'](html);
	            } else {
	                // ... otherwise, use KO's own parsing logic.
	                var parsedNodes = ko.utils.parseHtmlFragment(html, node.ownerDocument);
	                for (var i = 0; i < parsedNodes.length; i++)
	                    node.appendChild(parsedNodes[i]);
	            }
	        }
	    };
	})();

	ko.exportSymbol('utils.parseHtmlFragment', ko.utils.parseHtmlFragment);
	ko.exportSymbol('utils.setHtml', ko.utils.setHtml);

	ko.memoization = (function () {
	    var memos = {};

	    function randomMax8HexChars() {
	        return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
	    }
	    function generateRandomId() {
	        return randomMax8HexChars() + randomMax8HexChars();
	    }
	    function findMemoNodes(rootNode, appendToArray) {
	        if (!rootNode)
	            return;
	        if (rootNode.nodeType == 8) {
	            var memoId = ko.memoization.parseMemoText(rootNode.nodeValue);
	            if (memoId != null)
	                appendToArray.push({ domNode: rootNode, memoId: memoId });
	        } else if (rootNode.nodeType == 1) {
	            for (var i = 0, childNodes = rootNode.childNodes, j = childNodes.length; i < j; i++)
	                findMemoNodes(childNodes[i], appendToArray);
	        }
	    }

	    return {
	        memoize: function (callback) {
	            if (typeof callback != "function")
	                throw new Error("You can only pass a function to ko.memoization.memoize()");
	            var memoId = generateRandomId();
	            memos[memoId] = callback;
	            return "<!--[ko_memo:" + memoId + "]-->";
	        },

	        unmemoize: function (memoId, callbackParams) {
	            var callback = memos[memoId];
	            if (callback === undefined)
	                throw new Error("Couldn't find any memo with ID " + memoId + ". Perhaps it's already been unmemoized.");
	            try {
	                callback.apply(null, callbackParams || []);
	                return true;
	            }
	            finally { delete memos[memoId]; }
	        },

	        unmemoizeDomNodeAndDescendants: function (domNode, extraCallbackParamsArray) {
	            var memos = [];
	            findMemoNodes(domNode, memos);
	            for (var i = 0, j = memos.length; i < j; i++) {
	                var node = memos[i].domNode;
	                var combinedParams = [node];
	                if (extraCallbackParamsArray)
	                    ko.utils.arrayPushAll(combinedParams, extraCallbackParamsArray);
	                ko.memoization.unmemoize(memos[i].memoId, combinedParams);
	                node.nodeValue = ""; // Neuter this node so we don't try to unmemoize it again
	                if (node.parentNode)
	                    node.parentNode.removeChild(node); // If possible, erase it totally (not always possible - someone else might just hold a reference to it then call unmemoizeDomNodeAndDescendants again)
	            }
	        },

	        parseMemoText: function (memoText) {
	            var match = memoText.match(/^\[ko_memo\:(.*?)\]$/);
	            return match ? match[1] : null;
	        }
	    };
	})();

	ko.exportSymbol('memoization', ko.memoization);
	ko.exportSymbol('memoization.memoize', ko.memoization.memoize);
	ko.exportSymbol('memoization.unmemoize', ko.memoization.unmemoize);
	ko.exportSymbol('memoization.parseMemoText', ko.memoization.parseMemoText);
	ko.exportSymbol('memoization.unmemoizeDomNodeAndDescendants', ko.memoization.unmemoizeDomNodeAndDescendants);
	ko.tasks = (function () {
	    var scheduler,
	        taskQueue = [],
	        taskQueueLength = 0,
	        nextHandle = 1,
	        nextIndexToProcess = 0;

	    if (window['MutationObserver']) {
	        // Chrome 27+, Firefox 14+, IE 11+, Opera 15+, Safari 6.1+
	        // From https://github.com/petkaantonov/bluebird * Copyright (c) 2014 Petka Antonov * License: MIT
	        scheduler = (function (callback) {
	            var div = document.createElement("div");
	            new MutationObserver(callback).observe(div, {attributes: true});
	            return function () { div.classList.toggle("foo"); };
	        })(scheduledProcess);
	    } else if (document && "onreadystatechange" in document.createElement("script")) {
	        // IE 6-10
	        // From https://github.com/YuzuJS/setImmediate * Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola * License: MIT
	        scheduler = function (callback) {
	            var script = document.createElement("script");
	            script.onreadystatechange = function () {
	                script.onreadystatechange = null;
	                document.documentElement.removeChild(script);
	                script = null;
	                callback();
	            };
	            document.documentElement.appendChild(script);
	        };
	    } else {
	        scheduler = function (callback) {
	            setTimeout(callback, 0);
	        };
	    }

	    function processTasks() {
	        if (taskQueueLength) {
	            // Each mark represents the end of a logical group of tasks and the number of these groups is
	            // limited to prevent unchecked recursion.
	            var mark = taskQueueLength, countMarks = 0;

	            // nextIndexToProcess keeps track of where we are in the queue; processTasks can be called recursively without issue
	            for (var task; nextIndexToProcess < taskQueueLength; ) {
	                if (task = taskQueue[nextIndexToProcess++]) {
	                    if (nextIndexToProcess > mark) {
	                        if (++countMarks >= 5000) {
	                            nextIndexToProcess = taskQueueLength;   // skip all tasks remaining in the queue since any of them could be causing the recursion
	                            ko.utils.deferError(Error("'Too much recursion' after processing " + countMarks + " task groups."));
	                            break;
	                        }
	                        mark = taskQueueLength;
	                    }
	                    try {
	                        task();
	                    } catch (ex) {
	                        ko.utils.deferError(ex);
	                    }
	                }
	            }
	        }
	    }

	    function scheduledProcess() {
	        processTasks();

	        // Reset the queue
	        nextIndexToProcess = taskQueueLength = taskQueue.length = 0;
	    }

	    function scheduleTaskProcessing() {
	        ko.tasks['scheduler'](scheduledProcess);
	    }

	    var tasks = {
	        'scheduler': scheduler,     // Allow overriding the scheduler

	        schedule: function (func) {
	            if (!taskQueueLength) {
	                scheduleTaskProcessing();
	            }

	            taskQueue[taskQueueLength++] = func;
	            return nextHandle++;
	        },

	        cancel: function (handle) {
	            var index = handle - (nextHandle - taskQueueLength);
	            if (index >= nextIndexToProcess && index < taskQueueLength) {
	                taskQueue[index] = null;
	            }
	        },

	        // For testing only: reset the queue and return the previous queue length
	        'resetForTesting': function () {
	            var length = taskQueueLength - nextIndexToProcess;
	            nextIndexToProcess = taskQueueLength = taskQueue.length = 0;
	            return length;
	        },

	        runEarly: processTasks
	    };

	    return tasks;
	})();

	ko.exportSymbol('tasks', ko.tasks);
	ko.exportSymbol('tasks.schedule', ko.tasks.schedule);
	//ko.exportSymbol('tasks.cancel', ko.tasks.cancel);  "cancel" isn't minified
	ko.exportSymbol('tasks.runEarly', ko.tasks.runEarly);
	ko.extenders = {
	    'throttle': function(target, timeout) {
	        // Throttling means two things:

	        // (1) For dependent observables, we throttle *evaluations* so that, no matter how fast its dependencies
	        //     notify updates, the target doesn't re-evaluate (and hence doesn't notify) faster than a certain rate
	        target['throttleEvaluation'] = timeout;

	        // (2) For writable targets (observables, or writable dependent observables), we throttle *writes*
	        //     so the target cannot change value synchronously or faster than a certain rate
	        var writeTimeoutInstance = null;
	        return ko.dependentObservable({
	            'read': target,
	            'write': function(value) {
	                clearTimeout(writeTimeoutInstance);
	                writeTimeoutInstance = ko.utils.setTimeout(function() {
	                    target(value);
	                }, timeout);
	            }
	        });
	    },

	    'rateLimit': function(target, options) {
	        var timeout, method, limitFunction;

	        if (typeof options == 'number') {
	            timeout = options;
	        } else {
	            timeout = options['timeout'];
	            method = options['method'];
	        }

	        // rateLimit supersedes deferred updates
	        target._deferUpdates = false;

	        limitFunction = method == 'notifyWhenChangesStop' ?  debounce : throttle;
	        target.limit(function(callback) {
	            return limitFunction(callback, timeout);
	        });
	    },

	    'deferred': function(target, options) {
	        if (options !== true) {
	            throw new Error('The \'deferred\' extender only accepts the value \'true\', because it is not supported to turn deferral off once enabled.')
	        }

	        if (!target._deferUpdates) {
	            target._deferUpdates = true;
	            target.limit(function (callback) {
	                var handle;
	                return function () {
	                    ko.tasks.cancel(handle);
	                    handle = ko.tasks.schedule(callback);
	                    target['notifySubscribers'](undefined, 'dirty');
	                };
	            });
	        }
	    },

	    'notify': function(target, notifyWhen) {
	        target["equalityComparer"] = notifyWhen == "always" ?
	            null :  // null equalityComparer means to always notify
	            valuesArePrimitiveAndEqual;
	    }
	};

	var primitiveTypes = { 'undefined':1, 'boolean':1, 'number':1, 'string':1 };
	function valuesArePrimitiveAndEqual(a, b) {
	    var oldValueIsPrimitive = (a === null) || (typeof(a) in primitiveTypes);
	    return oldValueIsPrimitive ? (a === b) : false;
	}

	function throttle(callback, timeout) {
	    var timeoutInstance;
	    return function () {
	        if (!timeoutInstance) {
	            timeoutInstance = ko.utils.setTimeout(function () {
	                timeoutInstance = undefined;
	                callback();
	            }, timeout);
	        }
	    };
	}

	function debounce(callback, timeout) {
	    var timeoutInstance;
	    return function () {
	        clearTimeout(timeoutInstance);
	        timeoutInstance = ko.utils.setTimeout(callback, timeout);
	    };
	}

	function applyExtenders(requestedExtenders) {
	    var target = this;
	    if (requestedExtenders) {
	        ko.utils.objectForEach(requestedExtenders, function(key, value) {
	            var extenderHandler = ko.extenders[key];
	            if (typeof extenderHandler == 'function') {
	                target = extenderHandler(target, value) || target;
	            }
	        });
	    }
	    return target;
	}

	ko.exportSymbol('extenders', ko.extenders);

	ko.subscription = function (target, callback, disposeCallback) {
	    this._target = target;
	    this.callback = callback;
	    this.disposeCallback = disposeCallback;
	    this.isDisposed = false;
	    ko.exportProperty(this, 'dispose', this.dispose);
	};
	ko.subscription.prototype.dispose = function () {
	    this.isDisposed = true;
	    this.disposeCallback();
	};

	ko.subscribable = function () {
	    ko.utils.setPrototypeOfOrExtend(this, ko_subscribable_fn);
	    ko_subscribable_fn.init(this);
	}

	var defaultEvent = "change";

	// Moved out of "limit" to avoid the extra closure
	function limitNotifySubscribers(value, event) {
	    if (!event || event === defaultEvent) {
	        this._limitChange(value);
	    } else if (event === 'beforeChange') {
	        this._limitBeforeChange(value);
	    } else {
	        this._origNotifySubscribers(value, event);
	    }
	}

	var ko_subscribable_fn = {
	    init: function(instance) {
	        instance._subscriptions = {};
	        instance._versionNumber = 1;
	    },

	    subscribe: function (callback, callbackTarget, event) {
	        var self = this;

	        event = event || defaultEvent;
	        var boundCallback = callbackTarget ? callback.bind(callbackTarget) : callback;

	        var subscription = new ko.subscription(self, boundCallback, function () {
	            ko.utils.arrayRemoveItem(self._subscriptions[event], subscription);
	            if (self.afterSubscriptionRemove)
	                self.afterSubscriptionRemove(event);
	        });

	        if (self.beforeSubscriptionAdd)
	            self.beforeSubscriptionAdd(event);

	        if (!self._subscriptions[event])
	            self._subscriptions[event] = [];
	        self._subscriptions[event].push(subscription);

	        return subscription;
	    },

	    "notifySubscribers": function (valueToNotify, event) {
	        event = event || defaultEvent;
	        if (event === defaultEvent) {
	            this.updateVersion();
	        }
	        if (this.hasSubscriptionsForEvent(event)) {
	            try {
	                ko.dependencyDetection.begin(); // Begin suppressing dependency detection (by setting the top frame to undefined)
	                for (var a = this._subscriptions[event].slice(0), i = 0, subscription; subscription = a[i]; ++i) {
	                    // In case a subscription was disposed during the arrayForEach cycle, check
	                    // for isDisposed on each subscription before invoking its callback
	                    if (!subscription.isDisposed)
	                        subscription.callback(valueToNotify);
	                }
	            } finally {
	                ko.dependencyDetection.end(); // End suppressing dependency detection
	            }
	        }
	    },

	    getVersion: function () {
	        return this._versionNumber;
	    },

	    hasChanged: function (versionToCheck) {
	        return this.getVersion() !== versionToCheck;
	    },

	    updateVersion: function () {
	        ++this._versionNumber;
	    },

	    limit: function(limitFunction) {
	        var self = this, selfIsObservable = ko.isObservable(self),
	            ignoreBeforeChange, previousValue, pendingValue, beforeChange = 'beforeChange';

	        if (!self._origNotifySubscribers) {
	            self._origNotifySubscribers = self["notifySubscribers"];
	            self["notifySubscribers"] = limitNotifySubscribers;
	        }

	        var finish = limitFunction(function() {
	            self._notificationIsPending = false;

	            // If an observable provided a reference to itself, access it to get the latest value.
	            // This allows computed observables to delay calculating their value until needed.
	            if (selfIsObservable && pendingValue === self) {
	                pendingValue = self();
	            }
	            ignoreBeforeChange = false;
	            if (self.isDifferent(previousValue, pendingValue)) {
	                self._origNotifySubscribers(previousValue = pendingValue);
	            }
	        });

	        self._limitChange = function(value) {
	            self._notificationIsPending = ignoreBeforeChange = true;
	            pendingValue = value;
	            finish();
	        };
	        self._limitBeforeChange = function(value) {
	            if (!ignoreBeforeChange) {
	                previousValue = value;
	                self._origNotifySubscribers(value, beforeChange);
	            }
	        };
	    },

	    hasSubscriptionsForEvent: function(event) {
	        return this._subscriptions[event] && this._subscriptions[event].length;
	    },

	    getSubscriptionsCount: function (event) {
	        if (event) {
	            return this._subscriptions[event] && this._subscriptions[event].length || 0;
	        } else {
	            var total = 0;
	            ko.utils.objectForEach(this._subscriptions, function(eventName, subscriptions) {
	                if (eventName !== 'dirty')
	                    total += subscriptions.length;
	            });
	            return total;
	        }
	    },

	    isDifferent: function(oldValue, newValue) {
	        return !this['equalityComparer'] || !this['equalityComparer'](oldValue, newValue);
	    },

	    extend: applyExtenders
	};

	ko.exportProperty(ko_subscribable_fn, 'subscribe', ko_subscribable_fn.subscribe);
	ko.exportProperty(ko_subscribable_fn, 'extend', ko_subscribable_fn.extend);
	ko.exportProperty(ko_subscribable_fn, 'getSubscriptionsCount', ko_subscribable_fn.getSubscriptionsCount);

	// For browsers that support proto assignment, we overwrite the prototype of each
	// observable instance. Since observables are functions, we need Function.prototype
	// to still be in the prototype chain.
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(ko_subscribable_fn, Function.prototype);
	}

	ko.subscribable['fn'] = ko_subscribable_fn;


	ko.isSubscribable = function (instance) {
	    return instance != null && typeof instance.subscribe == "function" && typeof instance["notifySubscribers"] == "function";
	};

	ko.exportSymbol('subscribable', ko.subscribable);
	ko.exportSymbol('isSubscribable', ko.isSubscribable);

	ko.computedContext = ko.dependencyDetection = (function () {
	    var outerFrames = [],
	        currentFrame,
	        lastId = 0;

	    // Return a unique ID that can be assigned to an observable for dependency tracking.
	    // Theoretically, you could eventually overflow the number storage size, resulting
	    // in duplicate IDs. But in JavaScript, the largest exact integral value is 2^53
	    // or 9,007,199,254,740,992. If you created 1,000,000 IDs per second, it would
	    // take over 285 years to reach that number.
	    // Reference http://blog.vjeux.com/2010/javascript/javascript-max_int-number-limits.html
	    function getId() {
	        return ++lastId;
	    }

	    function begin(options) {
	        outerFrames.push(currentFrame);
	        currentFrame = options;
	    }

	    function end() {
	        currentFrame = outerFrames.pop();
	    }

	    return {
	        begin: begin,

	        end: end,

	        registerDependency: function (subscribable) {
	            if (currentFrame) {
	                if (!ko.isSubscribable(subscribable))
	                    throw new Error("Only subscribable things can act as dependencies");
	                currentFrame.callback.call(currentFrame.callbackTarget, subscribable, subscribable._id || (subscribable._id = getId()));
	            }
	        },

	        ignore: function (callback, callbackTarget, callbackArgs) {
	            try {
	                begin();
	                return callback.apply(callbackTarget, callbackArgs || []);
	            } finally {
	                end();
	            }
	        },

	        getDependenciesCount: function () {
	            if (currentFrame)
	                return currentFrame.computed.getDependenciesCount();
	        },

	        isInitial: function() {
	            if (currentFrame)
	                return currentFrame.isInitial;
	        }
	    };
	})();

	ko.exportSymbol('computedContext', ko.computedContext);
	ko.exportSymbol('computedContext.getDependenciesCount', ko.computedContext.getDependenciesCount);
	ko.exportSymbol('computedContext.isInitial', ko.computedContext.isInitial);

	ko.exportSymbol('ignoreDependencies', ko.ignoreDependencies = ko.dependencyDetection.ignore);
	var observableLatestValue = ko.utils.createSymbolOrString('_latestValue');

	ko.observable = function (initialValue) {
	    function observable() {
	        if (arguments.length > 0) {
	            // Write

	            // Ignore writes if the value hasn't changed
	            if (observable.isDifferent(observable[observableLatestValue], arguments[0])) {
	                observable.valueWillMutate();
	                observable[observableLatestValue] = arguments[0];
	                observable.valueHasMutated();
	            }
	            return this; // Permits chained assignments
	        }
	        else {
	            // Read
	            ko.dependencyDetection.registerDependency(observable); // The caller only needs to be notified of changes if they did a "read" operation
	            return observable[observableLatestValue];
	        }
	    }

	    observable[observableLatestValue] = initialValue;

	    // Inherit from 'subscribable'
	    if (!ko.utils.canSetPrototype) {
	        // 'subscribable' won't be on the prototype chain unless we put it there directly
	        ko.utils.extend(observable, ko.subscribable['fn']);
	    }
	    ko.subscribable['fn'].init(observable);

	    // Inherit from 'observable'
	    ko.utils.setPrototypeOfOrExtend(observable, observableFn);

	    if (ko.options['deferUpdates']) {
	        ko.extenders['deferred'](observable, true);
	    }

	    return observable;
	}

	// Define prototype for observables
	var observableFn = {
	    'equalityComparer': valuesArePrimitiveAndEqual,
	    peek: function() { return this[observableLatestValue]; },
	    valueHasMutated: function () { this['notifySubscribers'](this[observableLatestValue]); },
	    valueWillMutate: function () { this['notifySubscribers'](this[observableLatestValue], 'beforeChange'); }
	};

	// Note that for browsers that don't support proto assignment, the
	// inheritance chain is created manually in the ko.observable constructor
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(observableFn, ko.subscribable['fn']);
	}

	var protoProperty = ko.observable.protoProperty = '__ko_proto__';
	observableFn[protoProperty] = ko.observable;

	ko.hasPrototype = function(instance, prototype) {
	    if ((instance === null) || (instance === undefined) || (instance[protoProperty] === undefined)) return false;
	    if (instance[protoProperty] === prototype) return true;
	    return ko.hasPrototype(instance[protoProperty], prototype); // Walk the prototype chain
	};

	ko.isObservable = function (instance) {
	    return ko.hasPrototype(instance, ko.observable);
	}
	ko.isWriteableObservable = function (instance) {
	    // Observable
	    if ((typeof instance == 'function') && instance[protoProperty] === ko.observable)
	        return true;
	    // Writeable dependent observable
	    if ((typeof instance == 'function') && (instance[protoProperty] === ko.dependentObservable) && (instance.hasWriteFunction))
	        return true;
	    // Anything else
	    return false;
	}

	ko.exportSymbol('observable', ko.observable);
	ko.exportSymbol('isObservable', ko.isObservable);
	ko.exportSymbol('isWriteableObservable', ko.isWriteableObservable);
	ko.exportSymbol('isWritableObservable', ko.isWriteableObservable);
	ko.exportSymbol('observable.fn', observableFn);
	ko.exportProperty(observableFn, 'peek', observableFn.peek);
	ko.exportProperty(observableFn, 'valueHasMutated', observableFn.valueHasMutated);
	ko.exportProperty(observableFn, 'valueWillMutate', observableFn.valueWillMutate);
	ko.observableArray = function (initialValues) {
	    initialValues = initialValues || [];

	    if (typeof initialValues != 'object' || !('length' in initialValues))
	        throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");

	    var result = ko.observable(initialValues);
	    ko.utils.setPrototypeOfOrExtend(result, ko.observableArray['fn']);
	    return result.extend({'trackArrayChanges':true});
	};

	ko.observableArray['fn'] = {
	    'remove': function (valueOrPredicate) {
	        var underlyingArray = this.peek();
	        var removedValues = [];
	        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
	        for (var i = 0; i < underlyingArray.length; i++) {
	            var value = underlyingArray[i];
	            if (predicate(value)) {
	                if (removedValues.length === 0) {
	                    this.valueWillMutate();
	                }
	                removedValues.push(value);
	                underlyingArray.splice(i, 1);
	                i--;
	            }
	        }
	        if (removedValues.length) {
	            this.valueHasMutated();
	        }
	        return removedValues;
	    },

	    'removeAll': function (arrayOfValues) {
	        // If you passed zero args, we remove everything
	        if (arrayOfValues === undefined) {
	            var underlyingArray = this.peek();
	            var allValues = underlyingArray.slice(0);
	            this.valueWillMutate();
	            underlyingArray.splice(0, underlyingArray.length);
	            this.valueHasMutated();
	            return allValues;
	        }
	        // If you passed an arg, we interpret it as an array of entries to remove
	        if (!arrayOfValues)
	            return [];
	        return this['remove'](function (value) {
	            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
	        });
	    },

	    'destroy': function (valueOrPredicate) {
	        var underlyingArray = this.peek();
	        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
	        this.valueWillMutate();
	        for (var i = underlyingArray.length - 1; i >= 0; i--) {
	            var value = underlyingArray[i];
	            if (predicate(value))
	                underlyingArray[i]["_destroy"] = true;
	        }
	        this.valueHasMutated();
	    },

	    'destroyAll': function (arrayOfValues) {
	        // If you passed zero args, we destroy everything
	        if (arrayOfValues === undefined)
	            return this['destroy'](function() { return true });

	        // If you passed an arg, we interpret it as an array of entries to destroy
	        if (!arrayOfValues)
	            return [];
	        return this['destroy'](function (value) {
	            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
	        });
	    },

	    'indexOf': function (item) {
	        var underlyingArray = this();
	        return ko.utils.arrayIndexOf(underlyingArray, item);
	    },

	    'replace': function(oldItem, newItem) {
	        var index = this['indexOf'](oldItem);
	        if (index >= 0) {
	            this.valueWillMutate();
	            this.peek()[index] = newItem;
	            this.valueHasMutated();
	        }
	    }
	};

	// Note that for browsers that don't support proto assignment, the
	// inheritance chain is created manually in the ko.observableArray constructor
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(ko.observableArray['fn'], ko.observable['fn']);
	}

	// Populate ko.observableArray.fn with read/write functions from native arrays
	// Important: Do not add any additional functions here that may reasonably be used to *read* data from the array
	// because we'll eval them without causing subscriptions, so ko.computed output could end up getting stale
	ko.utils.arrayForEach(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (methodName) {
	    ko.observableArray['fn'][methodName] = function () {
	        // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
	        // (for consistency with mutating regular observables)
	        var underlyingArray = this.peek();
	        this.valueWillMutate();
	        this.cacheDiffForKnownOperation(underlyingArray, methodName, arguments);
	        var methodCallResult = underlyingArray[methodName].apply(underlyingArray, arguments);
	        this.valueHasMutated();
	        // The native sort and reverse methods return a reference to the array, but it makes more sense to return the observable array instead.
	        return methodCallResult === underlyingArray ? this : methodCallResult;
	    };
	});

	// Populate ko.observableArray.fn with read-only functions from native arrays
	ko.utils.arrayForEach(["slice"], function (methodName) {
	    ko.observableArray['fn'][methodName] = function () {
	        var underlyingArray = this();
	        return underlyingArray[methodName].apply(underlyingArray, arguments);
	    };
	});

	ko.exportSymbol('observableArray', ko.observableArray);
	var arrayChangeEventName = 'arrayChange';
	ko.extenders['trackArrayChanges'] = function(target, options) {
	    // Use the provided options--each call to trackArrayChanges overwrites the previously set options
	    target.compareArrayOptions = {};
	    if (options && typeof options == "object") {
	        ko.utils.extend(target.compareArrayOptions, options);
	    }
	    target.compareArrayOptions['sparse'] = true;

	    // Only modify the target observable once
	    if (target.cacheDiffForKnownOperation) {
	        return;
	    }
	    var trackingChanges = false,
	        cachedDiff = null,
	        arrayChangeSubscription,
	        pendingNotifications = 0,
	        underlyingBeforeSubscriptionAddFunction = target.beforeSubscriptionAdd,
	        underlyingAfterSubscriptionRemoveFunction = target.afterSubscriptionRemove;

	    // Watch "subscribe" calls, and for array change events, ensure change tracking is enabled
	    target.beforeSubscriptionAdd = function (event) {
	        if (underlyingBeforeSubscriptionAddFunction)
	            underlyingBeforeSubscriptionAddFunction.call(target, event);
	        if (event === arrayChangeEventName) {
	            trackChanges();
	        }
	    };
	    // Watch "dispose" calls, and for array change events, ensure change tracking is disabled when all are disposed
	    target.afterSubscriptionRemove = function (event) {
	        if (underlyingAfterSubscriptionRemoveFunction)
	            underlyingAfterSubscriptionRemoveFunction.call(target, event);
	        if (event === arrayChangeEventName && !target.hasSubscriptionsForEvent(arrayChangeEventName)) {
	            arrayChangeSubscription.dispose();
	            trackingChanges = false;
	        }
	    };

	    function trackChanges() {
	        // Calling 'trackChanges' multiple times is the same as calling it once
	        if (trackingChanges) {
	            return;
	        }

	        trackingChanges = true;

	        // Intercept "notifySubscribers" to track how many times it was called.
	        var underlyingNotifySubscribersFunction = target['notifySubscribers'];
	        target['notifySubscribers'] = function(valueToNotify, event) {
	            if (!event || event === defaultEvent) {
	                ++pendingNotifications;
	            }
	            return underlyingNotifySubscribersFunction.apply(this, arguments);
	        };

	        // Each time the array changes value, capture a clone so that on the next
	        // change it's possible to produce a diff
	        var previousContents = [].concat(target.peek() || []);
	        cachedDiff = null;
	        arrayChangeSubscription = target.subscribe(function(currentContents) {
	            // Make a copy of the current contents and ensure it's an array
	            currentContents = [].concat(currentContents || []);

	            // Compute the diff and issue notifications, but only if someone is listening
	            if (target.hasSubscriptionsForEvent(arrayChangeEventName)) {
	                var changes = getChanges(previousContents, currentContents);
	            }

	            // Eliminate references to the old, removed items, so they can be GCed
	            previousContents = currentContents;
	            cachedDiff = null;
	            pendingNotifications = 0;

	            if (changes && changes.length) {
	                target['notifySubscribers'](changes, arrayChangeEventName);
	            }
	        });
	    }

	    function getChanges(previousContents, currentContents) {
	        // We try to re-use cached diffs.
	        // The scenarios where pendingNotifications > 1 are when using rate-limiting or the Deferred Updates
	        // plugin, which without this check would not be compatible with arrayChange notifications. Normally,
	        // notifications are issued immediately so we wouldn't be queueing up more than one.
	        if (!cachedDiff || pendingNotifications > 1) {
	            cachedDiff = ko.utils.compareArrays(previousContents, currentContents, target.compareArrayOptions);
	        }

	        return cachedDiff;
	    }

	    target.cacheDiffForKnownOperation = function(rawArray, operationName, args) {
	        // Only run if we're currently tracking changes for this observable array
	        // and there aren't any pending deferred notifications.
	        if (!trackingChanges || pendingNotifications) {
	            return;
	        }
	        var diff = [],
	            arrayLength = rawArray.length,
	            argsLength = args.length,
	            offset = 0;

	        function pushDiff(status, value, index) {
	            return diff[diff.length] = { 'status': status, 'value': value, 'index': index };
	        }
	        switch (operationName) {
	            case 'push':
	                offset = arrayLength;
	            case 'unshift':
	                for (var index = 0; index < argsLength; index++) {
	                    pushDiff('added', args[index], offset + index);
	                }
	                break;

	            case 'pop':
	                offset = arrayLength - 1;
	            case 'shift':
	                if (arrayLength) {
	                    pushDiff('deleted', rawArray[offset], offset);
	                }
	                break;

	            case 'splice':
	                // Negative start index means 'from end of array'. After that we clamp to [0...arrayLength].
	                // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
	                var startIndex = Math.min(Math.max(0, args[0] < 0 ? arrayLength + args[0] : args[0]), arrayLength),
	                    endDeleteIndex = argsLength === 1 ? arrayLength : Math.min(startIndex + (args[1] || 0), arrayLength),
	                    endAddIndex = startIndex + argsLength - 2,
	                    endIndex = Math.max(endDeleteIndex, endAddIndex),
	                    additions = [], deletions = [];
	                for (var index = startIndex, argsIndex = 2; index < endIndex; ++index, ++argsIndex) {
	                    if (index < endDeleteIndex)
	                        deletions.push(pushDiff('deleted', rawArray[index], index));
	                    if (index < endAddIndex)
	                        additions.push(pushDiff('added', args[argsIndex], index));
	                }
	                ko.utils.findMovesInArrayComparison(deletions, additions);
	                break;

	            default:
	                return;
	        }
	        cachedDiff = diff;
	    };
	};
	var computedState = ko.utils.createSymbolOrString('_state');

	ko.computed = ko.dependentObservable = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget, options) {
	    if (typeof evaluatorFunctionOrOptions === "object") {
	        // Single-parameter syntax - everything is on this "options" param
	        options = evaluatorFunctionOrOptions;
	    } else {
	        // Multi-parameter syntax - construct the options according to the params passed
	        options = options || {};
	        if (evaluatorFunctionOrOptions) {
	            options["read"] = evaluatorFunctionOrOptions;
	        }
	    }
	    if (typeof options["read"] != "function")
	        throw Error("Pass a function that returns the value of the ko.computed");

	    var writeFunction = options["write"];
	    var state = {
	        latestValue: undefined,
	        isStale: true,
	        isBeingEvaluated: false,
	        suppressDisposalUntilDisposeWhenReturnsFalse: false,
	        isDisposed: false,
	        pure: false,
	        isSleeping: false,
	        readFunction: options["read"],
	        evaluatorFunctionTarget: evaluatorFunctionTarget || options["owner"],
	        disposeWhenNodeIsRemoved: options["disposeWhenNodeIsRemoved"] || options.disposeWhenNodeIsRemoved || null,
	        disposeWhen: options["disposeWhen"] || options.disposeWhen,
	        domNodeDisposalCallback: null,
	        dependencyTracking: {},
	        dependenciesCount: 0,
	        evaluationTimeoutInstance: null
	    };

	    function computedObservable() {
	        if (arguments.length > 0) {
	            if (typeof writeFunction === "function") {
	                // Writing a value
	                writeFunction.apply(state.evaluatorFunctionTarget, arguments);
	            } else {
	                throw new Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
	            }
	            return this; // Permits chained assignments
	        } else {
	            // Reading the value
	            ko.dependencyDetection.registerDependency(computedObservable);
	            if (state.isStale || (state.isSleeping && computedObservable.haveDependenciesChanged())) {
	                computedObservable.evaluateImmediate();
	            }
	            return state.latestValue;
	        }
	    }

	    computedObservable[computedState] = state;
	    computedObservable.hasWriteFunction = typeof writeFunction === "function";

	    // Inherit from 'subscribable'
	    if (!ko.utils.canSetPrototype) {
	        // 'subscribable' won't be on the prototype chain unless we put it there directly
	        ko.utils.extend(computedObservable, ko.subscribable['fn']);
	    }
	    ko.subscribable['fn'].init(computedObservable);

	    // Inherit from 'computed'
	    ko.utils.setPrototypeOfOrExtend(computedObservable, computedFn);

	    if (options['pure']) {
	        state.pure = true;
	        state.isSleeping = true;     // Starts off sleeping; will awake on the first subscription
	        ko.utils.extend(computedObservable, pureComputedOverrides);
	    } else if (options['deferEvaluation']) {
	        ko.utils.extend(computedObservable, deferEvaluationOverrides);
	    }

	    if (ko.options['deferUpdates']) {
	        ko.extenders['deferred'](computedObservable, true);
	    }

	    if (DEBUG) {
	        // #1731 - Aid debugging by exposing the computed's options
	        computedObservable["_options"] = options;
	    }

	    if (state.disposeWhenNodeIsRemoved) {
	        // Since this computed is associated with a DOM node, and we don't want to dispose the computed
	        // until the DOM node is *removed* from the document (as opposed to never having been in the document),
	        // we'll prevent disposal until "disposeWhen" first returns false.
	        state.suppressDisposalUntilDisposeWhenReturnsFalse = true;

	        // disposeWhenNodeIsRemoved: true can be used to opt into the "only dispose after first false result"
	        // behaviour even if there's no specific node to watch. In that case, clear the option so we don't try
	        // to watch for a non-node's disposal. This technique is intended for KO's internal use only and shouldn't
	        // be documented or used by application code, as it's likely to change in a future version of KO.
	        if (!state.disposeWhenNodeIsRemoved.nodeType) {
	            state.disposeWhenNodeIsRemoved = null;
	        }
	    }

	    // Evaluate, unless sleeping or deferEvaluation is true
	    if (!state.isSleeping && !options['deferEvaluation']) {
	        computedObservable.evaluateImmediate();
	    }

	    // Attach a DOM node disposal callback so that the computed will be proactively disposed as soon as the node is
	    // removed using ko.removeNode. But skip if isActive is false (there will never be any dependencies to dispose).
	    if (state.disposeWhenNodeIsRemoved && computedObservable.isActive()) {
	        ko.utils.domNodeDisposal.addDisposeCallback(state.disposeWhenNodeIsRemoved, state.domNodeDisposalCallback = function () {
	            computedObservable.dispose();
	        });
	    }

	    return computedObservable;
	};

	// Utility function that disposes a given dependencyTracking entry
	function computedDisposeDependencyCallback(id, entryToDispose) {
	    if (entryToDispose !== null && entryToDispose.dispose) {
	        entryToDispose.dispose();
	    }
	}

	// This function gets called each time a dependency is detected while evaluating a computed.
	// It's factored out as a shared function to avoid creating unnecessary function instances during evaluation.
	function computedBeginDependencyDetectionCallback(subscribable, id) {
	    var computedObservable = this.computedObservable,
	        state = computedObservable[computedState];
	    if (!state.isDisposed) {
	        if (this.disposalCount && this.disposalCandidates[id]) {
	            // Don't want to dispose this subscription, as it's still being used
	            computedObservable.addDependencyTracking(id, subscribable, this.disposalCandidates[id]);
	            this.disposalCandidates[id] = null; // No need to actually delete the property - disposalCandidates is a transient object anyway
	            --this.disposalCount;
	        } else if (!state.dependencyTracking[id]) {
	            // Brand new subscription - add it
	            computedObservable.addDependencyTracking(id, subscribable, state.isSleeping ? { _target: subscribable } : computedObservable.subscribeToDependency(subscribable));
	        }
	    }
	}

	var computedFn = {
	    "equalityComparer": valuesArePrimitiveAndEqual,
	    getDependenciesCount: function () {
	        return this[computedState].dependenciesCount;
	    },
	    addDependencyTracking: function (id, target, trackingObj) {
	        if (this[computedState].pure && target === this) {
	            throw Error("A 'pure' computed must not be called recursively");
	        }

	        this[computedState].dependencyTracking[id] = trackingObj;
	        trackingObj._order = this[computedState].dependenciesCount++;
	        trackingObj._version = target.getVersion();
	    },
	    haveDependenciesChanged: function () {
	        var id, dependency, dependencyTracking = this[computedState].dependencyTracking;
	        for (id in dependencyTracking) {
	            if (dependencyTracking.hasOwnProperty(id)) {
	                dependency = dependencyTracking[id];
	                if (dependency._target.hasChanged(dependency._version)) {
	                    return true;
	                }
	            }
	        }
	    },
	    markDirty: function () {
	        // Process "dirty" events if we can handle delayed notifications
	        if (this._evalDelayed && !this[computedState].isBeingEvaluated) {
	            this._evalDelayed();
	        }
	    },
	    isActive: function () {
	        return this[computedState].isStale || this[computedState].dependenciesCount > 0;
	    },
	    respondToChange: function () {
	        // Ignore "change" events if we've already scheduled a delayed notification
	        if (!this._notificationIsPending) {
	            this.evaluatePossiblyAsync();
	        }
	    },
	    subscribeToDependency: function (target) {
	        if (target._deferUpdates && !this[computedState].disposeWhenNodeIsRemoved) {
	            var dirtySub = target.subscribe(this.markDirty, this, 'dirty'),
	                changeSub = target.subscribe(this.respondToChange, this);
	            return {
	                _target: target,
	                dispose: function () {
	                    dirtySub.dispose();
	                    changeSub.dispose();
	                }
	            };
	        } else {
	            return target.subscribe(this.evaluatePossiblyAsync, this);
	        }
	    },
	    evaluatePossiblyAsync: function () {
	        var computedObservable = this,
	            throttleEvaluationTimeout = computedObservable['throttleEvaluation'];
	        if (throttleEvaluationTimeout && throttleEvaluationTimeout >= 0) {
	            clearTimeout(this[computedState].evaluationTimeoutInstance);
	            this[computedState].evaluationTimeoutInstance = ko.utils.setTimeout(function () {
	                computedObservable.evaluateImmediate(true /*notifyChange*/);
	            }, throttleEvaluationTimeout);
	        } else if (computedObservable._evalDelayed) {
	            computedObservable._evalDelayed();
	        } else {
	            computedObservable.evaluateImmediate(true /*notifyChange*/);
	        }
	    },
	    evaluateImmediate: function (notifyChange) {
	        var computedObservable = this,
	            state = computedObservable[computedState],
	            disposeWhen = state.disposeWhen;

	        if (state.isBeingEvaluated) {
	            // If the evaluation of a ko.computed causes side effects, it's possible that it will trigger its own re-evaluation.
	            // This is not desirable (it's hard for a developer to realise a chain of dependencies might cause this, and they almost
	            // certainly didn't intend infinite re-evaluations). So, for predictability, we simply prevent ko.computeds from causing
	            // their own re-evaluation. Further discussion at https://github.com/SteveSanderson/knockout/pull/387
	            return;
	        }

	        // Do not evaluate (and possibly capture new dependencies) if disposed
	        if (state.isDisposed) {
	            return;
	        }

	        if (state.disposeWhenNodeIsRemoved && !ko.utils.domNodeIsAttachedToDocument(state.disposeWhenNodeIsRemoved) || disposeWhen && disposeWhen()) {
	            // See comment above about suppressDisposalUntilDisposeWhenReturnsFalse
	            if (!state.suppressDisposalUntilDisposeWhenReturnsFalse) {
	                computedObservable.dispose();
	                return;
	            }
	        } else {
	            // It just did return false, so we can stop suppressing now
	            state.suppressDisposalUntilDisposeWhenReturnsFalse = false;
	        }

	        state.isBeingEvaluated = true;
	        try {
	            this.evaluateImmediate_CallReadWithDependencyDetection(notifyChange);
	        } finally {
	            state.isBeingEvaluated = false;
	        }

	        if (!state.dependenciesCount) {
	            computedObservable.dispose();
	        }
	    },
	    evaluateImmediate_CallReadWithDependencyDetection: function (notifyChange) {
	        // This function is really just part of the evaluateImmediate logic. You would never call it from anywhere else.
	        // Factoring it out into a separate function means it can be independent of the try/catch block in evaluateImmediate,
	        // which contributes to saving about 40% off the CPU overhead of computed evaluation (on V8 at least).

	        var computedObservable = this,
	            state = computedObservable[computedState];

	        // Initially, we assume that none of the subscriptions are still being used (i.e., all are candidates for disposal).
	        // Then, during evaluation, we cross off any that are in fact still being used.
	        var isInitial = state.pure ? undefined : !state.dependenciesCount,   // If we're evaluating when there are no previous dependencies, it must be the first time
	            dependencyDetectionContext = {
	                computedObservable: computedObservable,
	                disposalCandidates: state.dependencyTracking,
	                disposalCount: state.dependenciesCount
	            };

	        ko.dependencyDetection.begin({
	            callbackTarget: dependencyDetectionContext,
	            callback: computedBeginDependencyDetectionCallback,
	            computed: computedObservable,
	            isInitial: isInitial
	        });

	        state.dependencyTracking = {};
	        state.dependenciesCount = 0;

	        var newValue = this.evaluateImmediate_CallReadThenEndDependencyDetection(state, dependencyDetectionContext);

	        if (computedObservable.isDifferent(state.latestValue, newValue)) {
	            if (!state.isSleeping) {
	                computedObservable["notifySubscribers"](state.latestValue, "beforeChange");
	            }

	            state.latestValue = newValue;

	            if (state.isSleeping) {
	                computedObservable.updateVersion();
	            } else if (notifyChange) {
	                computedObservable["notifySubscribers"](state.latestValue);
	            }
	        }

	        if (isInitial) {
	            computedObservable["notifySubscribers"](state.latestValue, "awake");
	        }
	    },
	    evaluateImmediate_CallReadThenEndDependencyDetection: function (state, dependencyDetectionContext) {
	        // This function is really part of the evaluateImmediate_CallReadWithDependencyDetection logic.
	        // You'd never call it from anywhere else. Factoring it out means that evaluateImmediate_CallReadWithDependencyDetection
	        // can be independent of try/finally blocks, which contributes to saving about 40% off the CPU
	        // overhead of computed evaluation (on V8 at least).

	        try {
	            var readFunction = state.readFunction;
	            return state.evaluatorFunctionTarget ? readFunction.call(state.evaluatorFunctionTarget) : readFunction();
	        } finally {
	            ko.dependencyDetection.end();

	            // For each subscription no longer being used, remove it from the active subscriptions list and dispose it
	            if (dependencyDetectionContext.disposalCount && !state.isSleeping) {
	                ko.utils.objectForEach(dependencyDetectionContext.disposalCandidates, computedDisposeDependencyCallback);
	            }

	            state.isStale = false;
	        }
	    },
	    peek: function () {
	        // Peek won't re-evaluate, except while the computed is sleeping or to get the initial value when "deferEvaluation" is set.
	        var state = this[computedState];
	        if ((state.isStale && !state.dependenciesCount) || (state.isSleeping && this.haveDependenciesChanged())) {
	            this.evaluateImmediate();
	        }
	        return state.latestValue;
	    },
	    limit: function (limitFunction) {
	        // Override the limit function with one that delays evaluation as well
	        ko.subscribable['fn'].limit.call(this, limitFunction);
	        this._evalDelayed = function () {
	            this._limitBeforeChange(this[computedState].latestValue);

	            this[computedState].isStale = true; // Mark as dirty

	            // Pass the observable to the "limit" code, which will access it when
	            // it's time to do the notification.
	            this._limitChange(this);
	        }
	    },
	    dispose: function () {
	        var state = this[computedState];
	        if (!state.isSleeping && state.dependencyTracking) {
	            ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
	                if (dependency.dispose)
	                    dependency.dispose();
	            });
	        }
	        if (state.disposeWhenNodeIsRemoved && state.domNodeDisposalCallback) {
	            ko.utils.domNodeDisposal.removeDisposeCallback(state.disposeWhenNodeIsRemoved, state.domNodeDisposalCallback);
	        }
	        state.dependencyTracking = null;
	        state.dependenciesCount = 0;
	        state.isDisposed = true;
	        state.isStale = false;
	        state.isSleeping = false;
	        state.disposeWhenNodeIsRemoved = null;
	    }
	};

	var pureComputedOverrides = {
	    beforeSubscriptionAdd: function (event) {
	        // If asleep, wake up the computed by subscribing to any dependencies.
	        var computedObservable = this,
	            state = computedObservable[computedState];
	        if (!state.isDisposed && state.isSleeping && event == 'change') {
	            state.isSleeping = false;
	            if (state.isStale || computedObservable.haveDependenciesChanged()) {
	                state.dependencyTracking = null;
	                state.dependenciesCount = 0;
	                state.isStale = true;
	                computedObservable.evaluateImmediate();
	            } else {
	                // First put the dependencies in order
	                var dependeciesOrder = [];
	                ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
	                    dependeciesOrder[dependency._order] = id;
	                });
	                // Next, subscribe to each one
	                ko.utils.arrayForEach(dependeciesOrder, function (id, order) {
	                    var dependency = state.dependencyTracking[id],
	                        subscription = computedObservable.subscribeToDependency(dependency._target);
	                    subscription._order = order;
	                    subscription._version = dependency._version;
	                    state.dependencyTracking[id] = subscription;
	                });
	            }
	            if (!state.isDisposed) {     // test since evaluating could trigger disposal
	                computedObservable["notifySubscribers"](state.latestValue, "awake");
	            }
	        }
	    },
	    afterSubscriptionRemove: function (event) {
	        var state = this[computedState];
	        if (!state.isDisposed && event == 'change' && !this.hasSubscriptionsForEvent('change')) {
	            ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
	                if (dependency.dispose) {
	                    state.dependencyTracking[id] = {
	                        _target: dependency._target,
	                        _order: dependency._order,
	                        _version: dependency._version
	                    };
	                    dependency.dispose();
	                }
	            });
	            state.isSleeping = true;
	            this["notifySubscribers"](undefined, "asleep");
	        }
	    },
	    getVersion: function () {
	        // Because a pure computed is not automatically updated while it is sleeping, we can't
	        // simply return the version number. Instead, we check if any of the dependencies have
	        // changed and conditionally re-evaluate the computed observable.
	        var state = this[computedState];
	        if (state.isSleeping && (state.isStale || this.haveDependenciesChanged())) {
	            this.evaluateImmediate();
	        }
	        return ko.subscribable['fn'].getVersion.call(this);
	    }
	};

	var deferEvaluationOverrides = {
	    beforeSubscriptionAdd: function (event) {
	        // This will force a computed with deferEvaluation to evaluate when the first subscription is registered.
	        if (event == 'change' || event == 'beforeChange') {
	            this.peek();
	        }
	    }
	};

	// Note that for browsers that don't support proto assignment, the
	// inheritance chain is created manually in the ko.computed constructor
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(computedFn, ko.subscribable['fn']);
	}

	// Set the proto chain values for ko.hasPrototype
	var protoProp = ko.observable.protoProperty; // == "__ko_proto__"
	ko.computed[protoProp] = ko.observable;
	computedFn[protoProp] = ko.computed;

	ko.isComputed = function (instance) {
	    return ko.hasPrototype(instance, ko.computed);
	};

	ko.isPureComputed = function (instance) {
	    return ko.hasPrototype(instance, ko.computed)
	        && instance[computedState] && instance[computedState].pure;
	};

	ko.exportSymbol('computed', ko.computed);
	ko.exportSymbol('dependentObservable', ko.computed);    // export ko.dependentObservable for backwards compatibility (1.x)
	ko.exportSymbol('isComputed', ko.isComputed);
	ko.exportSymbol('isPureComputed', ko.isPureComputed);
	ko.exportSymbol('computed.fn', computedFn);
	ko.exportProperty(computedFn, 'peek', computedFn.peek);
	ko.exportProperty(computedFn, 'dispose', computedFn.dispose);
	ko.exportProperty(computedFn, 'isActive', computedFn.isActive);
	ko.exportProperty(computedFn, 'getDependenciesCount', computedFn.getDependenciesCount);

	ko.pureComputed = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget) {
	    if (typeof evaluatorFunctionOrOptions === 'function') {
	        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget, {'pure':true});
	    } else {
	        evaluatorFunctionOrOptions = ko.utils.extend({}, evaluatorFunctionOrOptions);   // make a copy of the parameter object
	        evaluatorFunctionOrOptions['pure'] = true;
	        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget);
	    }
	}
	ko.exportSymbol('pureComputed', ko.pureComputed);

	(function() {
	    var maxNestedObservableDepth = 10; // Escape the (unlikely) pathalogical case where an observable's current value is itself (or similar reference cycle)

	    ko.toJS = function(rootObject) {
	        if (arguments.length == 0)
	            throw new Error("When calling ko.toJS, pass the object you want to convert.");

	        // We just unwrap everything at every level in the object graph
	        return mapJsObjectGraph(rootObject, function(valueToMap) {
	            // Loop because an observable's value might in turn be another observable wrapper
	            for (var i = 0; ko.isObservable(valueToMap) && (i < maxNestedObservableDepth); i++)
	                valueToMap = valueToMap();
	            return valueToMap;
	        });
	    };

	    ko.toJSON = function(rootObject, replacer, space) {     // replacer and space are optional
	        var plainJavaScriptObject = ko.toJS(rootObject);
	        return ko.utils.stringifyJson(plainJavaScriptObject, replacer, space);
	    };

	    function mapJsObjectGraph(rootObject, mapInputCallback, visitedObjects) {
	        visitedObjects = visitedObjects || new objectLookup();

	        rootObject = mapInputCallback(rootObject);
	        var canHaveProperties = (typeof rootObject == "object") && (rootObject !== null) && (rootObject !== undefined) && (!(rootObject instanceof RegExp)) && (!(rootObject instanceof Date)) && (!(rootObject instanceof String)) && (!(rootObject instanceof Number)) && (!(rootObject instanceof Boolean));
	        if (!canHaveProperties)
	            return rootObject;

	        var outputProperties = rootObject instanceof Array ? [] : {};
	        visitedObjects.save(rootObject, outputProperties);

	        visitPropertiesOrArrayEntries(rootObject, function(indexer) {
	            var propertyValue = mapInputCallback(rootObject[indexer]);

	            switch (typeof propertyValue) {
	                case "boolean":
	                case "number":
	                case "string":
	                case "function":
	                    outputProperties[indexer] = propertyValue;
	                    break;
	                case "object":
	                case "undefined":
	                    var previouslyMappedValue = visitedObjects.get(propertyValue);
	                    outputProperties[indexer] = (previouslyMappedValue !== undefined)
	                        ? previouslyMappedValue
	                        : mapJsObjectGraph(propertyValue, mapInputCallback, visitedObjects);
	                    break;
	            }
	        });

	        return outputProperties;
	    }

	    function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
	        if (rootObject instanceof Array) {
	            for (var i = 0; i < rootObject.length; i++)
	                visitorCallback(i);

	            // For arrays, also respect toJSON property for custom mappings (fixes #278)
	            if (typeof rootObject['toJSON'] == 'function')
	                visitorCallback('toJSON');
	        } else {
	            for (var propertyName in rootObject) {
	                visitorCallback(propertyName);
	            }
	        }
	    };

	    function objectLookup() {
	        this.keys = [];
	        this.values = [];
	    };

	    objectLookup.prototype = {
	        constructor: objectLookup,
	        save: function(key, value) {
	            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
	            if (existingIndex >= 0)
	                this.values[existingIndex] = value;
	            else {
	                this.keys.push(key);
	                this.values.push(value);
	            }
	        },
	        get: function(key) {
	            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
	            return (existingIndex >= 0) ? this.values[existingIndex] : undefined;
	        }
	    };
	})();

	ko.exportSymbol('toJS', ko.toJS);
	ko.exportSymbol('toJSON', ko.toJSON);
	(function () {
	    var hasDomDataExpandoProperty = '__ko__hasDomDataOptionValue__';

	    // Normally, SELECT elements and their OPTIONs can only take value of type 'string' (because the values
	    // are stored on DOM attributes). ko.selectExtensions provides a way for SELECTs/OPTIONs to have values
	    // that are arbitrary objects. This is very convenient when implementing things like cascading dropdowns.
	    ko.selectExtensions = {
	        readValue : function(element) {
	            switch (ko.utils.tagNameLower(element)) {
	                case 'option':
	                    if (element[hasDomDataExpandoProperty] === true)
	                        return ko.utils.domData.get(element, ko.bindingHandlers.options.optionValueDomDataKey);
	                    return ko.utils.ieVersion <= 7
	                        ? (element.getAttributeNode('value') && element.getAttributeNode('value').specified ? element.value : element.text)
	                        : element.value;
	                case 'select':
	                    return element.selectedIndex >= 0 ? ko.selectExtensions.readValue(element.options[element.selectedIndex]) : undefined;
	                default:
	                    return element.value;
	            }
	        },

	        writeValue: function(element, value, allowUnset) {
	            switch (ko.utils.tagNameLower(element)) {
	                case 'option':
	                    switch(typeof value) {
	                        case "string":
	                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, undefined);
	                            if (hasDomDataExpandoProperty in element) { // IE <= 8 throws errors if you delete non-existent properties from a DOM node
	                                delete element[hasDomDataExpandoProperty];
	                            }
	                            element.value = value;
	                            break;
	                        default:
	                            // Store arbitrary object using DomData
	                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, value);
	                            element[hasDomDataExpandoProperty] = true;

	                            // Special treatment of numbers is just for backward compatibility. KO 1.2.1 wrote numerical values to element.value.
	                            element.value = typeof value === "number" ? value : "";
	                            break;
	                    }
	                    break;
	                case 'select':
	                    if (value === "" || value === null)       // A blank string or null value will select the caption
	                        value = undefined;
	                    var selection = -1;
	                    for (var i = 0, n = element.options.length, optionValue; i < n; ++i) {
	                        optionValue = ko.selectExtensions.readValue(element.options[i]);
	                        // Include special check to handle selecting a caption with a blank string value
	                        if (optionValue == value || (optionValue == "" && value === undefined)) {
	                            selection = i;
	                            break;
	                        }
	                    }
	                    if (allowUnset || selection >= 0 || (value === undefined && element.size > 1)) {
	                        element.selectedIndex = selection;
	                    }
	                    break;
	                default:
	                    if ((value === null) || (value === undefined))
	                        value = "";
	                    element.value = value;
	                    break;
	            }
	        }
	    };
	})();

	ko.exportSymbol('selectExtensions', ko.selectExtensions);
	ko.exportSymbol('selectExtensions.readValue', ko.selectExtensions.readValue);
	ko.exportSymbol('selectExtensions.writeValue', ko.selectExtensions.writeValue);
	ko.expressionRewriting = (function () {
	    var javaScriptReservedWords = ["true", "false", "null", "undefined"];

	    // Matches something that can be assigned to--either an isolated identifier or something ending with a property accessor
	    // This is designed to be simple and avoid false negatives, but could produce false positives (e.g., a+b.c).
	    // This also will not properly handle nested brackets (e.g., obj1[obj2['prop']]; see #911).
	    var javaScriptAssignmentTarget = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i;

	    function getWriteableValue(expression) {
	        if (ko.utils.arrayIndexOf(javaScriptReservedWords, expression) >= 0)
	            return false;
	        var match = expression.match(javaScriptAssignmentTarget);
	        return match === null ? false : match[1] ? ('Object(' + match[1] + ')' + match[2]) : expression;
	    }

	    // The following regular expressions will be used to split an object-literal string into tokens

	        // These two match strings, either with double quotes or single quotes
	    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
	        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",
	        // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
	        // as a regular expression (this is handled by the parsing loop below).
	        stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',
	        // These characters have special meaning to the parser and must not appear in the middle of a
	        // token, except as part of a string.
	        specials = ',"\'{}()/:[\\]',
	        // Match text (at least two characters) that does not contain any of the above special characters,
	        // although some of the special characters are allowed to start it (all but the colon and comma).
	        // The text can contain spaces, but leading or trailing spaces are skipped.
	        everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',
	        // Match any non-space character not matched already. This will match colons and commas, since they're
	        // not matched by "everyThingElse", but will also match any other single character that wasn't already
	        // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
	        oneNotSpace = '[^\\s]',

	        // Create the actual regular expression by or-ing the above strings. The order is important.
	        bindingToken = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),

	        // Match end of previous token to determine whether a slash is a division or regex.
	        divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
	        keywordRegexLookBehind = {'in':1,'return':1,'typeof':1};

	    function parseObjectLiteral(objectLiteralString) {
	        // Trim leading and trailing spaces from the string
	        var str = ko.utils.stringTrim(objectLiteralString);

	        // Trim braces '{' surrounding the whole object literal
	        if (str.charCodeAt(0) === 123) str = str.slice(1, -1);

	        // Split into tokens
	        var result = [], toks = str.match(bindingToken), key, values = [], depth = 0;

	        if (toks) {
	            // Append a comma so that we don't need a separate code block to deal with the last item
	            toks.push(',');

	            for (var i = 0, tok; tok = toks[i]; ++i) {
	                var c = tok.charCodeAt(0);
	                // A comma signals the end of a key/value pair if depth is zero
	                if (c === 44) { // ","
	                    if (depth <= 0) {
	                        result.push((key && values.length) ? {key: key, value: values.join('')} : {'unknown': key || values.join('')});
	                        key = depth = 0;
	                        values = [];
	                        continue;
	                    }
	                // Simply skip the colon that separates the name and value
	                } else if (c === 58) { // ":"
	                    if (!depth && !key && values.length === 1) {
	                        key = values.pop();
	                        continue;
	                    }
	                // A set of slashes is initially matched as a regular expression, but could be division
	                } else if (c === 47 && i && tok.length > 1) {  // "/"
	                    // Look at the end of the previous token to determine if the slash is actually division
	                    var match = toks[i-1].match(divisionLookBehind);
	                    if (match && !keywordRegexLookBehind[match[0]]) {
	                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
	                        str = str.substr(str.indexOf(tok) + 1);
	                        toks = str.match(bindingToken);
	                        toks.push(',');
	                        i = -1;
	                        // Continue with just the slash
	                        tok = '/';
	                    }
	                // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
	                } else if (c === 40 || c === 123 || c === 91) { // '(', '{', '['
	                    ++depth;
	                } else if (c === 41 || c === 125 || c === 93) { // ')', '}', ']'
	                    --depth;
	                // The key will be the first token; if it's a string, trim the quotes
	                } else if (!key && !values.length && (c === 34 || c === 39)) { // '"', "'"
	                    tok = tok.slice(1, -1);
	                }
	                values.push(tok);
	            }
	        }
	        return result;
	    }

	    // Two-way bindings include a write function that allow the handler to update the value even if it's not an observable.
	    var twoWayBindings = {};

	    function preProcessBindings(bindingsStringOrKeyValueArray, bindingOptions) {
	        bindingOptions = bindingOptions || {};

	        function processKeyValue(key, val) {
	            var writableVal;
	            function callPreprocessHook(obj) {
	                return (obj && obj['preprocess']) ? (val = obj['preprocess'](val, key, processKeyValue)) : true;
	            }
	            if (!bindingParams) {
	                if (!callPreprocessHook(ko['getBindingHandler'](key)))
	                    return;

	                if (twoWayBindings[key] && (writableVal = getWriteableValue(val))) {
	                    // For two-way bindings, provide a write method in case the value
	                    // isn't a writable observable.
	                    propertyAccessorResultStrings.push("'" + key + "':function(_z){" + writableVal + "=_z}");
	                }
	            }
	            // Values are wrapped in a function so that each value can be accessed independently
	            if (makeValueAccessors) {
	                val = 'function(){return ' + val + ' }';
	            }
	            resultStrings.push("'" + key + "':" + val);
	        }

	        var resultStrings = [],
	            propertyAccessorResultStrings = [],
	            makeValueAccessors = bindingOptions['valueAccessors'],
	            bindingParams = bindingOptions['bindingParams'],
	            keyValueArray = typeof bindingsStringOrKeyValueArray === "string" ?
	                parseObjectLiteral(bindingsStringOrKeyValueArray) : bindingsStringOrKeyValueArray;

	        ko.utils.arrayForEach(keyValueArray, function(keyValue) {
	            processKeyValue(keyValue.key || keyValue['unknown'], keyValue.value);
	        });

	        if (propertyAccessorResultStrings.length)
	            processKeyValue('_ko_property_writers', "{" + propertyAccessorResultStrings.join(",") + " }");

	        return resultStrings.join(",");
	    }

	    return {
	        bindingRewriteValidators: [],

	        twoWayBindings: twoWayBindings,

	        parseObjectLiteral: parseObjectLiteral,

	        preProcessBindings: preProcessBindings,

	        keyValueArrayContainsKey: function(keyValueArray, key) {
	            for (var i = 0; i < keyValueArray.length; i++)
	                if (keyValueArray[i]['key'] == key)
	                    return true;
	            return false;
	        },

	        // Internal, private KO utility for updating model properties from within bindings
	        // property:            If the property being updated is (or might be) an observable, pass it here
	        //                      If it turns out to be a writable observable, it will be written to directly
	        // allBindings:         An object with a get method to retrieve bindings in the current execution context.
	        //                      This will be searched for a '_ko_property_writers' property in case you're writing to a non-observable
	        // key:                 The key identifying the property to be written. Example: for { hasFocus: myValue }, write to 'myValue' by specifying the key 'hasFocus'
	        // value:               The value to be written
	        // checkIfDifferent:    If true, and if the property being written is a writable observable, the value will only be written if
	        //                      it is !== existing value on that writable observable
	        writeValueToProperty: function(property, allBindings, key, value, checkIfDifferent) {
	            if (!property || !ko.isObservable(property)) {
	                var propWriters = allBindings.get('_ko_property_writers');
	                if (propWriters && propWriters[key])
	                    propWriters[key](value);
	            } else if (ko.isWriteableObservable(property) && (!checkIfDifferent || property.peek() !== value)) {
	                property(value);
	            }
	        }
	    };
	})();

	ko.exportSymbol('expressionRewriting', ko.expressionRewriting);
	ko.exportSymbol('expressionRewriting.bindingRewriteValidators', ko.expressionRewriting.bindingRewriteValidators);
	ko.exportSymbol('expressionRewriting.parseObjectLiteral', ko.expressionRewriting.parseObjectLiteral);
	ko.exportSymbol('expressionRewriting.preProcessBindings', ko.expressionRewriting.preProcessBindings);

	// Making bindings explicitly declare themselves as "two way" isn't ideal in the long term (it would be better if
	// all bindings could use an official 'property writer' API without needing to declare that they might). However,
	// since this is not, and has never been, a public API (_ko_property_writers was never documented), it's acceptable
	// as an internal implementation detail in the short term.
	// For those developers who rely on _ko_property_writers in their custom bindings, we expose _twoWayBindings as an
	// undocumented feature that makes it relatively easy to upgrade to KO 3.0. However, this is still not an official
	// public API, and we reserve the right to remove it at any time if we create a real public property writers API.
	ko.exportSymbol('expressionRewriting._twoWayBindings', ko.expressionRewriting.twoWayBindings);

	// For backward compatibility, define the following aliases. (Previously, these function names were misleading because
	// they referred to JSON specifically, even though they actually work with arbitrary JavaScript object literal expressions.)
	ko.exportSymbol('jsonExpressionRewriting', ko.expressionRewriting);
	ko.exportSymbol('jsonExpressionRewriting.insertPropertyAccessorsIntoJson', ko.expressionRewriting.preProcessBindings);
	(function() {
	    // "Virtual elements" is an abstraction on top of the usual DOM API which understands the notion that comment nodes
	    // may be used to represent hierarchy (in addition to the DOM's natural hierarchy).
	    // If you call the DOM-manipulating functions on ko.virtualElements, you will be able to read and write the state
	    // of that virtual hierarchy
	    //
	    // The point of all this is to support containerless templates (e.g., <!-- ko foreach:someCollection -->blah<!-- /ko -->)
	    // without having to scatter special cases all over the binding and templating code.

	    // IE 9 cannot reliably read the "nodeValue" property of a comment node (see https://github.com/SteveSanderson/knockout/issues/186)
	    // but it does give them a nonstandard alternative property called "text" that it can read reliably. Other browsers don't have that property.
	    // So, use node.text where available, and node.nodeValue elsewhere
	    var commentNodesHaveTextProperty = document && document.createComment("test").text === "<!--test-->";

	    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+([\s\S]+))?\s*-->$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/;
	    var endCommentRegex =   commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
	    var htmlTagsWithOptionallyClosingChildren = { 'ul': true, 'ol': true };

	    function isStartComment(node) {
	        return (node.nodeType == 8) && startCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
	    }

	    function isEndComment(node) {
	        return (node.nodeType == 8) && endCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
	    }

	    function getVirtualChildren(startComment, allowUnbalanced) {
	        var currentNode = startComment;
	        var depth = 1;
	        var children = [];
	        while (currentNode = currentNode.nextSibling) {
	            if (isEndComment(currentNode)) {
	                depth--;
	                if (depth === 0)
	                    return children;
	            }

	            children.push(currentNode);

	            if (isStartComment(currentNode))
	                depth++;
	        }
	        if (!allowUnbalanced)
	            throw new Error("Cannot find closing comment tag to match: " + startComment.nodeValue);
	        return null;
	    }

	    function getMatchingEndComment(startComment, allowUnbalanced) {
	        var allVirtualChildren = getVirtualChildren(startComment, allowUnbalanced);
	        if (allVirtualChildren) {
	            if (allVirtualChildren.length > 0)
	                return allVirtualChildren[allVirtualChildren.length - 1].nextSibling;
	            return startComment.nextSibling;
	        } else
	            return null; // Must have no matching end comment, and allowUnbalanced is true
	    }

	    function getUnbalancedChildTags(node) {
	        // e.g., from <div>OK</div><!-- ko blah --><span>Another</span>, returns: <!-- ko blah --><span>Another</span>
	        //       from <div>OK</div><!-- /ko --><!-- /ko -->,             returns: <!-- /ko --><!-- /ko -->
	        var childNode = node.firstChild, captureRemaining = null;
	        if (childNode) {
	            do {
	                if (captureRemaining)                   // We already hit an unbalanced node and are now just scooping up all subsequent nodes
	                    captureRemaining.push(childNode);
	                else if (isStartComment(childNode)) {
	                    var matchingEndComment = getMatchingEndComment(childNode, /* allowUnbalanced: */ true);
	                    if (matchingEndComment)             // It's a balanced tag, so skip immediately to the end of this virtual set
	                        childNode = matchingEndComment;
	                    else
	                        captureRemaining = [childNode]; // It's unbalanced, so start capturing from this point
	                } else if (isEndComment(childNode)) {
	                    captureRemaining = [childNode];     // It's unbalanced (if it wasn't, we'd have skipped over it already), so start capturing
	                }
	            } while (childNode = childNode.nextSibling);
	        }
	        return captureRemaining;
	    }

	    ko.virtualElements = {
	        allowedBindings: {},

	        childNodes: function(node) {
	            return isStartComment(node) ? getVirtualChildren(node) : node.childNodes;
	        },

	        emptyNode: function(node) {
	            if (!isStartComment(node))
	                ko.utils.emptyDomNode(node);
	            else {
	                var virtualChildren = ko.virtualElements.childNodes(node);
	                for (var i = 0, j = virtualChildren.length; i < j; i++)
	                    ko.removeNode(virtualChildren[i]);
	            }
	        },

	        setDomNodeChildren: function(node, childNodes) {
	            if (!isStartComment(node))
	                ko.utils.setDomNodeChildren(node, childNodes);
	            else {
	                ko.virtualElements.emptyNode(node);
	                var endCommentNode = node.nextSibling; // Must be the next sibling, as we just emptied the children
	                for (var i = 0, j = childNodes.length; i < j; i++)
	                    endCommentNode.parentNode.insertBefore(childNodes[i], endCommentNode);
	            }
	        },

	        prepend: function(containerNode, nodeToPrepend) {
	            if (!isStartComment(containerNode)) {
	                if (containerNode.firstChild)
	                    containerNode.insertBefore(nodeToPrepend, containerNode.firstChild);
	                else
	                    containerNode.appendChild(nodeToPrepend);
	            } else {
	                // Start comments must always have a parent and at least one following sibling (the end comment)
	                containerNode.parentNode.insertBefore(nodeToPrepend, containerNode.nextSibling);
	            }
	        },

	        insertAfter: function(containerNode, nodeToInsert, insertAfterNode) {
	            if (!insertAfterNode) {
	                ko.virtualElements.prepend(containerNode, nodeToInsert);
	            } else if (!isStartComment(containerNode)) {
	                // Insert after insertion point
	                if (insertAfterNode.nextSibling)
	                    containerNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
	                else
	                    containerNode.appendChild(nodeToInsert);
	            } else {
	                // Children of start comments must always have a parent and at least one following sibling (the end comment)
	                containerNode.parentNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
	            }
	        },

	        firstChild: function(node) {
	            if (!isStartComment(node))
	                return node.firstChild;
	            if (!node.nextSibling || isEndComment(node.nextSibling))
	                return null;
	            return node.nextSibling;
	        },

	        nextSibling: function(node) {
	            if (isStartComment(node))
	                node = getMatchingEndComment(node);
	            if (node.nextSibling && isEndComment(node.nextSibling))
	                return null;
	            return node.nextSibling;
	        },

	        hasBindingValue: isStartComment,

	        virtualNodeBindingValue: function(node) {
	            var regexMatch = (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
	            return regexMatch ? regexMatch[1] : null;
	        },

	        normaliseVirtualElementDomStructure: function(elementVerified) {
	            // Workaround for https://github.com/SteveSanderson/knockout/issues/155
	            // (IE <= 8 or IE 9 quirks mode parses your HTML weirdly, treating closing </li> tags as if they don't exist, thereby moving comment nodes
	            // that are direct descendants of <ul> into the preceding <li>)
	            if (!htmlTagsWithOptionallyClosingChildren[ko.utils.tagNameLower(elementVerified)])
	                return;

	            // Scan immediate children to see if they contain unbalanced comment tags. If they do, those comment tags
	            // must be intended to appear *after* that child, so move them there.
	            var childNode = elementVerified.firstChild;
	            if (childNode) {
	                do {
	                    if (childNode.nodeType === 1) {
	                        var unbalancedTags = getUnbalancedChildTags(childNode);
	                        if (unbalancedTags) {
	                            // Fix up the DOM by moving the unbalanced tags to where they most likely were intended to be placed - *after* the child
	                            var nodeToInsertBefore = childNode.nextSibling;
	                            for (var i = 0; i < unbalancedTags.length; i++) {
	                                if (nodeToInsertBefore)
	                                    elementVerified.insertBefore(unbalancedTags[i], nodeToInsertBefore);
	                                else
	                                    elementVerified.appendChild(unbalancedTags[i]);
	                            }
	                        }
	                    }
	                } while (childNode = childNode.nextSibling);
	            }
	        }
	    };
	})();
	ko.exportSymbol('virtualElements', ko.virtualElements);
	ko.exportSymbol('virtualElements.allowedBindings', ko.virtualElements.allowedBindings);
	ko.exportSymbol('virtualElements.emptyNode', ko.virtualElements.emptyNode);
	//ko.exportSymbol('virtualElements.firstChild', ko.virtualElements.firstChild);     // firstChild is not minified
	ko.exportSymbol('virtualElements.insertAfter', ko.virtualElements.insertAfter);
	//ko.exportSymbol('virtualElements.nextSibling', ko.virtualElements.nextSibling);   // nextSibling is not minified
	ko.exportSymbol('virtualElements.prepend', ko.virtualElements.prepend);
	ko.exportSymbol('virtualElements.setDomNodeChildren', ko.virtualElements.setDomNodeChildren);
	(function() {
	    var defaultBindingAttributeName = "data-bind";

	    ko.bindingProvider = function() {
	        this.bindingCache = {};
	    };

	    ko.utils.extend(ko.bindingProvider.prototype, {
	        'nodeHasBindings': function(node) {
	            switch (node.nodeType) {
	                case 1: // Element
	                    return node.getAttribute(defaultBindingAttributeName) != null
	                        || ko.components['getComponentNameForNode'](node);
	                case 8: // Comment node
	                    return ko.virtualElements.hasBindingValue(node);
	                default: return false;
	            }
	        },

	        'getBindings': function(node, bindingContext) {
	            var bindingsString = this['getBindingsString'](node, bindingContext),
	                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node) : null;
	            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ false);
	        },

	        'getBindingAccessors': function(node, bindingContext) {
	            var bindingsString = this['getBindingsString'](node, bindingContext),
	                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node, { 'valueAccessors': true }) : null;
	            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ true);
	        },

	        // The following function is only used internally by this default provider.
	        // It's not part of the interface definition for a general binding provider.
	        'getBindingsString': function(node, bindingContext) {
	            switch (node.nodeType) {
	                case 1: return node.getAttribute(defaultBindingAttributeName);   // Element
	                case 8: return ko.virtualElements.virtualNodeBindingValue(node); // Comment node
	                default: return null;
	            }
	        },

	        // The following function is only used internally by this default provider.
	        // It's not part of the interface definition for a general binding provider.
	        'parseBindingsString': function(bindingsString, bindingContext, node, options) {
	            try {
	                var bindingFunction = createBindingsStringEvaluatorViaCache(bindingsString, this.bindingCache, options);
	                return bindingFunction(bindingContext, node);
	            } catch (ex) {
	                ex.message = "Unable to parse bindings.\nBindings value: " + bindingsString + "\nMessage: " + ex.message;
	                throw ex;
	            }
	        }
	    });

	    ko.bindingProvider['instance'] = new ko.bindingProvider();

	    function createBindingsStringEvaluatorViaCache(bindingsString, cache, options) {
	        var cacheKey = bindingsString + (options && options['valueAccessors'] || '');
	        return cache[cacheKey]
	            || (cache[cacheKey] = createBindingsStringEvaluator(bindingsString, options));
	    }

	    function createBindingsStringEvaluator(bindingsString, options) {
	        // Build the source for a function that evaluates "expression"
	        // For each scope variable, add an extra level of "with" nesting
	        // Example result: with(sc1) { with(sc0) { return (expression) } }
	        var rewrittenBindings = ko.expressionRewriting.preProcessBindings(bindingsString, options),
	            functionBody = "with($context){with($data||{}){return{" + rewrittenBindings + "}}}";
	        return new Function("$context", "$element", functionBody);
	    }
	})();

	ko.exportSymbol('bindingProvider', ko.bindingProvider);
	(function () {
	    ko.bindingHandlers = {};

	    // The following element types will not be recursed into during binding.
	    var bindingDoesNotRecurseIntoElementTypes = {
	        // Don't want bindings that operate on text nodes to mutate <script> and <textarea> contents,
	        // because it's unexpected and a potential XSS issue.
	        // Also bindings should not operate on <template> elements since this breaks in Internet Explorer
	        // and because such elements' contents are always intended to be bound in a different context
	        // from where they appear in the document.
	        'script': true,
	        'textarea': true,
	        'template': true
	    };

	    // Use an overridable method for retrieving binding handlers so that a plugins may support dynamically created handlers
	    ko['getBindingHandler'] = function(bindingKey) {
	        return ko.bindingHandlers[bindingKey];
	    };

	    // The ko.bindingContext constructor is only called directly to create the root context. For child
	    // contexts, use bindingContext.createChildContext or bindingContext.extend.
	    ko.bindingContext = function(dataItemOrAccessor, parentContext, dataItemAlias, extendCallback) {

	        // The binding context object includes static properties for the current, parent, and root view models.
	        // If a view model is actually stored in an observable, the corresponding binding context object, and
	        // any child contexts, must be updated when the view model is changed.
	        function updateContext() {
	            // Most of the time, the context will directly get a view model object, but if a function is given,
	            // we call the function to retrieve the view model. If the function accesses any observables or returns
	            // an observable, the dependency is tracked, and those observables can later cause the binding
	            // context to be updated.
	            var dataItemOrObservable = isFunc ? dataItemOrAccessor() : dataItemOrAccessor,
	                dataItem = ko.utils.unwrapObservable(dataItemOrObservable);

	            if (parentContext) {
	                // When a "parent" context is given, register a dependency on the parent context. Thus whenever the
	                // parent context is updated, this context will also be updated.
	                if (parentContext._subscribable)
	                    parentContext._subscribable();

	                // Copy $root and any custom properties from the parent context
	                ko.utils.extend(self, parentContext);

	                // Because the above copy overwrites our own properties, we need to reset them.
	                // During the first execution, "subscribable" isn't set, so don't bother doing the update then.
	                if (subscribable) {
	                    self._subscribable = subscribable;
	                }
	            } else {
	                self['$parents'] = [];
	                self['$root'] = dataItem;

	                // Export 'ko' in the binding context so it will be available in bindings and templates
	                // even if 'ko' isn't exported as a global, such as when using an AMD loader.
	                // See https://github.com/SteveSanderson/knockout/issues/490
	                self['ko'] = ko;
	            }
	            self['$rawData'] = dataItemOrObservable;
	            self['$data'] = dataItem;
	            if (dataItemAlias)
	                self[dataItemAlias] = dataItem;

	            // The extendCallback function is provided when creating a child context or extending a context.
	            // It handles the specific actions needed to finish setting up the binding context. Actions in this
	            // function could also add dependencies to this binding context.
	            if (extendCallback)
	                extendCallback(self, parentContext, dataItem);

	            return self['$data'];
	        }
	        function disposeWhen() {
	            return nodes && !ko.utils.anyDomNodeIsAttachedToDocument(nodes);
	        }

	        var self = this,
	            isFunc = typeof(dataItemOrAccessor) == "function" && !ko.isObservable(dataItemOrAccessor),
	            nodes,
	            subscribable = ko.dependentObservable(updateContext, null, { disposeWhen: disposeWhen, disposeWhenNodeIsRemoved: true });

	        // At this point, the binding context has been initialized, and the "subscribable" computed observable is
	        // subscribed to any observables that were accessed in the process. If there is nothing to track, the
	        // computed will be inactive, and we can safely throw it away. If it's active, the computed is stored in
	        // the context object.
	        if (subscribable.isActive()) {
	            self._subscribable = subscribable;

	            // Always notify because even if the model ($data) hasn't changed, other context properties might have changed
	            subscribable['equalityComparer'] = null;

	            // We need to be able to dispose of this computed observable when it's no longer needed. This would be
	            // easy if we had a single node to watch, but binding contexts can be used by many different nodes, and
	            // we cannot assume that those nodes have any relation to each other. So instead we track any node that
	            // the context is attached to, and dispose the computed when all of those nodes have been cleaned.

	            // Add properties to *subscribable* instead of *self* because any properties added to *self* may be overwritten on updates
	            nodes = [];
	            subscribable._addNode = function(node) {
	                nodes.push(node);
	                ko.utils.domNodeDisposal.addDisposeCallback(node, function(node) {
	                    ko.utils.arrayRemoveItem(nodes, node);
	                    if (!nodes.length) {
	                        subscribable.dispose();
	                        self._subscribable = subscribable = undefined;
	                    }
	                });
	            };
	        }
	    }

	    // Extend the binding context hierarchy with a new view model object. If the parent context is watching
	    // any observables, the new child context will automatically get a dependency on the parent context.
	    // But this does not mean that the $data value of the child context will also get updated. If the child
	    // view model also depends on the parent view model, you must provide a function that returns the correct
	    // view model on each update.
	    ko.bindingContext.prototype['createChildContext'] = function (dataItemOrAccessor, dataItemAlias, extendCallback) {
	        return new ko.bindingContext(dataItemOrAccessor, this, dataItemAlias, function(self, parentContext) {
	            // Extend the context hierarchy by setting the appropriate pointers
	            self['$parentContext'] = parentContext;
	            self['$parent'] = parentContext['$data'];
	            self['$parents'] = (parentContext['$parents'] || []).slice(0);
	            self['$parents'].unshift(self['$parent']);
	            if (extendCallback)
	                extendCallback(self);
	        });
	    };

	    // Extend the binding context with new custom properties. This doesn't change the context hierarchy.
	    // Similarly to "child" contexts, provide a function here to make sure that the correct values are set
	    // when an observable view model is updated.
	    ko.bindingContext.prototype['extend'] = function(properties) {
	        // If the parent context references an observable view model, "_subscribable" will always be the
	        // latest view model object. If not, "_subscribable" isn't set, and we can use the static "$data" value.
	        return new ko.bindingContext(this._subscribable || this['$data'], this, null, function(self, parentContext) {
	            // This "child" context doesn't directly track a parent observable view model,
	            // so we need to manually set the $rawData value to match the parent.
	            self['$rawData'] = parentContext['$rawData'];
	            ko.utils.extend(self, typeof(properties) == "function" ? properties() : properties);
	        });
	    };

	    // Returns the valueAccesor function for a binding value
	    function makeValueAccessor(value) {
	        return function() {
	            return value;
	        };
	    }

	    // Returns the value of a valueAccessor function
	    function evaluateValueAccessor(valueAccessor) {
	        return valueAccessor();
	    }

	    // Given a function that returns bindings, create and return a new object that contains
	    // binding value-accessors functions. Each accessor function calls the original function
	    // so that it always gets the latest value and all dependencies are captured. This is used
	    // by ko.applyBindingsToNode and getBindingsAndMakeAccessors.
	    function makeAccessorsFromFunction(callback) {
	        return ko.utils.objectMap(ko.dependencyDetection.ignore(callback), function(value, key) {
	            return function() {
	                return callback()[key];
	            };
	        });
	    }

	    // Given a bindings function or object, create and return a new object that contains
	    // binding value-accessors functions. This is used by ko.applyBindingsToNode.
	    function makeBindingAccessors(bindings, context, node) {
	        if (typeof bindings === 'function') {
	            return makeAccessorsFromFunction(bindings.bind(null, context, node));
	        } else {
	            return ko.utils.objectMap(bindings, makeValueAccessor);
	        }
	    }

	    // This function is used if the binding provider doesn't include a getBindingAccessors function.
	    // It must be called with 'this' set to the provider instance.
	    function getBindingsAndMakeAccessors(node, context) {
	        return makeAccessorsFromFunction(this['getBindings'].bind(this, node, context));
	    }

	    function validateThatBindingIsAllowedForVirtualElements(bindingName) {
	        var validator = ko.virtualElements.allowedBindings[bindingName];
	        if (!validator)
	            throw new Error("The binding '" + bindingName + "' cannot be used with virtual elements")
	    }

	    function applyBindingsToDescendantsInternal (bindingContext, elementOrVirtualElement, bindingContextsMayDifferFromDomParentElement) {
	        var currentChild,
	            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement),
	            provider = ko.bindingProvider['instance'],
	            preprocessNode = provider['preprocessNode'];

	        // Preprocessing allows a binding provider to mutate a node before bindings are applied to it. For example it's
	        // possible to insert new siblings after it, and/or replace the node with a different one. This can be used to
	        // implement custom binding syntaxes, such as {{ value }} for string interpolation, or custom element types that
	        // trigger insertion of <template> contents at that point in the document.
	        if (preprocessNode) {
	            while (currentChild = nextInQueue) {
	                nextInQueue = ko.virtualElements.nextSibling(currentChild);
	                preprocessNode.call(provider, currentChild);
	            }
	            // Reset nextInQueue for the next loop
	            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement);
	        }

	        while (currentChild = nextInQueue) {
	            // Keep a record of the next child *before* applying bindings, in case the binding removes the current child from its position
	            nextInQueue = ko.virtualElements.nextSibling(currentChild);
	            applyBindingsToNodeAndDescendantsInternal(bindingContext, currentChild, bindingContextsMayDifferFromDomParentElement);
	        }
	    }

	    function applyBindingsToNodeAndDescendantsInternal (bindingContext, nodeVerified, bindingContextMayDifferFromDomParentElement) {
	        var shouldBindDescendants = true;

	        // Perf optimisation: Apply bindings only if...
	        // (1) We need to store the binding context on this node (because it may differ from the DOM parent node's binding context)
	        //     Note that we can't store binding contexts on non-elements (e.g., text nodes), as IE doesn't allow expando properties for those
	        // (2) It might have bindings (e.g., it has a data-bind attribute, or it's a marker for a containerless template)
	        var isElement = (nodeVerified.nodeType === 1);
	        if (isElement) // Workaround IE <= 8 HTML parsing weirdness
	            ko.virtualElements.normaliseVirtualElementDomStructure(nodeVerified);

	        var shouldApplyBindings = (isElement && bindingContextMayDifferFromDomParentElement)             // Case (1)
	                               || ko.bindingProvider['instance']['nodeHasBindings'](nodeVerified);       // Case (2)
	        if (shouldApplyBindings)
	            shouldBindDescendants = applyBindingsToNodeInternal(nodeVerified, null, bindingContext, bindingContextMayDifferFromDomParentElement)['shouldBindDescendants'];

	        if (shouldBindDescendants && !bindingDoesNotRecurseIntoElementTypes[ko.utils.tagNameLower(nodeVerified)]) {
	            // We're recursing automatically into (real or virtual) child nodes without changing binding contexts. So,
	            //  * For children of a *real* element, the binding context is certainly the same as on their DOM .parentNode,
	            //    hence bindingContextsMayDifferFromDomParentElement is false
	            //  * For children of a *virtual* element, we can't be sure. Evaluating .parentNode on those children may
	            //    skip over any number of intermediate virtual elements, any of which might define a custom binding context,
	            //    hence bindingContextsMayDifferFromDomParentElement is true
	            applyBindingsToDescendantsInternal(bindingContext, nodeVerified, /* bindingContextsMayDifferFromDomParentElement: */ !isElement);
	        }
	    }

	    var boundElementDomDataKey = ko.utils.domData.nextKey();


	    function topologicalSortBindings(bindings) {
	        // Depth-first sort
	        var result = [],                // The list of key/handler pairs that we will return
	            bindingsConsidered = {},    // A temporary record of which bindings are already in 'result'
	            cyclicDependencyStack = []; // Keeps track of a depth-search so that, if there's a cycle, we know which bindings caused it
	        ko.utils.objectForEach(bindings, function pushBinding(bindingKey) {
	            if (!bindingsConsidered[bindingKey]) {
	                var binding = ko['getBindingHandler'](bindingKey);
	                if (binding) {
	                    // First add dependencies (if any) of the current binding
	                    if (binding['after']) {
	                        cyclicDependencyStack.push(bindingKey);
	                        ko.utils.arrayForEach(binding['after'], function(bindingDependencyKey) {
	                            if (bindings[bindingDependencyKey]) {
	                                if (ko.utils.arrayIndexOf(cyclicDependencyStack, bindingDependencyKey) !== -1) {
	                                    throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + cyclicDependencyStack.join(", "));
	                                } else {
	                                    pushBinding(bindingDependencyKey);
	                                }
	                            }
	                        });
	                        cyclicDependencyStack.length--;
	                    }
	                    // Next add the current binding
	                    result.push({ key: bindingKey, handler: binding });
	                }
	                bindingsConsidered[bindingKey] = true;
	            }
	        });

	        return result;
	    }

	    function applyBindingsToNodeInternal(node, sourceBindings, bindingContext, bindingContextMayDifferFromDomParentElement) {
	        // Prevent multiple applyBindings calls for the same node, except when a binding value is specified
	        var alreadyBound = ko.utils.domData.get(node, boundElementDomDataKey);
	        if (!sourceBindings) {
	            if (alreadyBound) {
	                throw Error("You cannot apply bindings multiple times to the same element.");
	            }
	            ko.utils.domData.set(node, boundElementDomDataKey, true);
	        }

	        // Optimization: Don't store the binding context on this node if it's definitely the same as on node.parentNode, because
	        // we can easily recover it just by scanning up the node's ancestors in the DOM
	        // (note: here, parent node means "real DOM parent" not "virtual parent", as there's no O(1) way to find the virtual parent)
	        if (!alreadyBound && bindingContextMayDifferFromDomParentElement)
	            ko.storedBindingContextForNode(node, bindingContext);

	        // Use bindings if given, otherwise fall back on asking the bindings provider to give us some bindings
	        var bindings;
	        if (sourceBindings && typeof sourceBindings !== 'function') {
	            bindings = sourceBindings;
	        } else {
	            var provider = ko.bindingProvider['instance'],
	                getBindings = provider['getBindingAccessors'] || getBindingsAndMakeAccessors;

	            // Get the binding from the provider within a computed observable so that we can update the bindings whenever
	            // the binding context is updated or if the binding provider accesses observables.
	            var bindingsUpdater = ko.dependentObservable(
	                function() {
	                    bindings = sourceBindings ? sourceBindings(bindingContext, node) : getBindings.call(provider, node, bindingContext);
	                    // Register a dependency on the binding context to support observable view models.
	                    if (bindings && bindingContext._subscribable)
	                        bindingContext._subscribable();
	                    return bindings;
	                },
	                null, { disposeWhenNodeIsRemoved: node }
	            );

	            if (!bindings || !bindingsUpdater.isActive())
	                bindingsUpdater = null;
	        }

	        var bindingHandlerThatControlsDescendantBindings;
	        if (bindings) {
	            // Return the value accessor for a given binding. When bindings are static (won't be updated because of a binding
	            // context update), just return the value accessor from the binding. Otherwise, return a function that always gets
	            // the latest binding value and registers a dependency on the binding updater.
	            var getValueAccessor = bindingsUpdater
	                ? function(bindingKey) {
	                    return function() {
	                        return evaluateValueAccessor(bindingsUpdater()[bindingKey]);
	                    };
	                } : function(bindingKey) {
	                    return bindings[bindingKey];
	                };

	            // Use of allBindings as a function is maintained for backwards compatibility, but its use is deprecated
	            function allBindings() {
	                return ko.utils.objectMap(bindingsUpdater ? bindingsUpdater() : bindings, evaluateValueAccessor);
	            }
	            // The following is the 3.x allBindings API
	            allBindings['get'] = function(key) {
	                return bindings[key] && evaluateValueAccessor(getValueAccessor(key));
	            };
	            allBindings['has'] = function(key) {
	                return key in bindings;
	            };

	            // First put the bindings into the right order
	            var orderedBindings = topologicalSortBindings(bindings);

	            // Go through the sorted bindings, calling init and update for each
	            ko.utils.arrayForEach(orderedBindings, function(bindingKeyAndHandler) {
	                // Note that topologicalSortBindings has already filtered out any nonexistent binding handlers,
	                // so bindingKeyAndHandler.handler will always be nonnull.
	                var handlerInitFn = bindingKeyAndHandler.handler["init"],
	                    handlerUpdateFn = bindingKeyAndHandler.handler["update"],
	                    bindingKey = bindingKeyAndHandler.key;

	                if (node.nodeType === 8) {
	                    validateThatBindingIsAllowedForVirtualElements(bindingKey);
	                }

	                try {
	                    // Run init, ignoring any dependencies
	                    if (typeof handlerInitFn == "function") {
	                        ko.dependencyDetection.ignore(function() {
	                            var initResult = handlerInitFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);

	                            // If this binding handler claims to control descendant bindings, make a note of this
	                            if (initResult && initResult['controlsDescendantBindings']) {
	                                if (bindingHandlerThatControlsDescendantBindings !== undefined)
	                                    throw new Error("Multiple bindings (" + bindingHandlerThatControlsDescendantBindings + " and " + bindingKey + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
	                                bindingHandlerThatControlsDescendantBindings = bindingKey;
	                            }
	                        });
	                    }

	                    // Run update in its own computed wrapper
	                    if (typeof handlerUpdateFn == "function") {
	                        ko.dependentObservable(
	                            function() {
	                                handlerUpdateFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);
	                            },
	                            null,
	                            { disposeWhenNodeIsRemoved: node }
	                        );
	                    }
	                } catch (ex) {
	                    ex.message = "Unable to process binding \"" + bindingKey + ": " + bindings[bindingKey] + "\"\nMessage: " + ex.message;
	                    throw ex;
	                }
	            });
	        }

	        return {
	            'shouldBindDescendants': bindingHandlerThatControlsDescendantBindings === undefined
	        };
	    };

	    var storedBindingContextDomDataKey = ko.utils.domData.nextKey();
	    ko.storedBindingContextForNode = function (node, bindingContext) {
	        if (arguments.length == 2) {
	            ko.utils.domData.set(node, storedBindingContextDomDataKey, bindingContext);
	            if (bindingContext._subscribable)
	                bindingContext._subscribable._addNode(node);
	        } else {
	            return ko.utils.domData.get(node, storedBindingContextDomDataKey);
	        }
	    }

	    function getBindingContext(viewModelOrBindingContext) {
	        return viewModelOrBindingContext && (viewModelOrBindingContext instanceof ko.bindingContext)
	            ? viewModelOrBindingContext
	            : new ko.bindingContext(viewModelOrBindingContext);
	    }

	    ko.applyBindingAccessorsToNode = function (node, bindings, viewModelOrBindingContext) {
	        if (node.nodeType === 1) // If it's an element, workaround IE <= 8 HTML parsing weirdness
	            ko.virtualElements.normaliseVirtualElementDomStructure(node);
	        return applyBindingsToNodeInternal(node, bindings, getBindingContext(viewModelOrBindingContext), true);
	    };

	    ko.applyBindingsToNode = function (node, bindings, viewModelOrBindingContext) {
	        var context = getBindingContext(viewModelOrBindingContext);
	        return ko.applyBindingAccessorsToNode(node, makeBindingAccessors(bindings, context, node), context);
	    };

	    ko.applyBindingsToDescendants = function(viewModelOrBindingContext, rootNode) {
	        if (rootNode.nodeType === 1 || rootNode.nodeType === 8)
	            applyBindingsToDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
	    };

	    ko.applyBindings = function (viewModelOrBindingContext, rootNode) {
	        // If jQuery is loaded after Knockout, we won't initially have access to it. So save it here.
	        if (!jQueryInstance && window['jQuery']) {
	            jQueryInstance = window['jQuery'];
	        }

	        if (rootNode && (rootNode.nodeType !== 1) && (rootNode.nodeType !== 8))
	            throw new Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
	        rootNode = rootNode || window.document.body; // Make "rootNode" parameter optional

	        applyBindingsToNodeAndDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
	    };

	    // Retrieving binding context from arbitrary nodes
	    ko.contextFor = function(node) {
	        // We can only do something meaningful for elements and comment nodes (in particular, not text nodes, as IE can't store domdata for them)
	        switch (node.nodeType) {
	            case 1:
	            case 8:
	                var context = ko.storedBindingContextForNode(node);
	                if (context) return context;
	                if (node.parentNode) return ko.contextFor(node.parentNode);
	                break;
	        }
	        return undefined;
	    };
	    ko.dataFor = function(node) {
	        var context = ko.contextFor(node);
	        return context ? context['$data'] : undefined;
	    };

	    ko.exportSymbol('bindingHandlers', ko.bindingHandlers);
	    ko.exportSymbol('applyBindings', ko.applyBindings);
	    ko.exportSymbol('applyBindingsToDescendants', ko.applyBindingsToDescendants);
	    ko.exportSymbol('applyBindingAccessorsToNode', ko.applyBindingAccessorsToNode);
	    ko.exportSymbol('applyBindingsToNode', ko.applyBindingsToNode);
	    ko.exportSymbol('contextFor', ko.contextFor);
	    ko.exportSymbol('dataFor', ko.dataFor);
	})();
	(function(undefined) {
	    var loadingSubscribablesCache = {}, // Tracks component loads that are currently in flight
	        loadedDefinitionsCache = {};    // Tracks component loads that have already completed

	    ko.components = {
	        get: function(componentName, callback) {
	            var cachedDefinition = getObjectOwnProperty(loadedDefinitionsCache, componentName);
	            if (cachedDefinition) {
	                // It's already loaded and cached. Reuse the same definition object.
	                // Note that for API consistency, even cache hits complete asynchronously by default.
	                // You can bypass this by putting synchronous:true on your component config.
	                if (cachedDefinition.isSynchronousComponent) {
	                    ko.dependencyDetection.ignore(function() { // See comment in loaderRegistryBehaviors.js for reasoning
	                        callback(cachedDefinition.definition);
	                    });
	                } else {
	                    ko.tasks.schedule(function() { callback(cachedDefinition.definition); });
	                }
	            } else {
	                // Join the loading process that is already underway, or start a new one.
	                loadComponentAndNotify(componentName, callback);
	            }
	        },

	        clearCachedDefinition: function(componentName) {
	            delete loadedDefinitionsCache[componentName];
	        },

	        _getFirstResultFromLoaders: getFirstResultFromLoaders
	    };

	    function getObjectOwnProperty(obj, propName) {
	        return obj.hasOwnProperty(propName) ? obj[propName] : undefined;
	    }

	    function loadComponentAndNotify(componentName, callback) {
	        var subscribable = getObjectOwnProperty(loadingSubscribablesCache, componentName),
	            completedAsync;
	        if (!subscribable) {
	            // It's not started loading yet. Start loading, and when it's done, move it to loadedDefinitionsCache.
	            subscribable = loadingSubscribablesCache[componentName] = new ko.subscribable();
	            subscribable.subscribe(callback);

	            beginLoadingComponent(componentName, function(definition, config) {
	                var isSynchronousComponent = !!(config && config['synchronous']);
	                loadedDefinitionsCache[componentName] = { definition: definition, isSynchronousComponent: isSynchronousComponent };
	                delete loadingSubscribablesCache[componentName];

	                // For API consistency, all loads complete asynchronously. However we want to avoid
	                // adding an extra task schedule if it's unnecessary (i.e., the completion is already
	                // async).
	                //
	                // You can bypass the 'always asynchronous' feature by putting the synchronous:true
	                // flag on your component configuration when you register it.
	                if (completedAsync || isSynchronousComponent) {
	                    // Note that notifySubscribers ignores any dependencies read within the callback.
	                    // See comment in loaderRegistryBehaviors.js for reasoning
	                    subscribable['notifySubscribers'](definition);
	                } else {
	                    ko.tasks.schedule(function() {
	                        subscribable['notifySubscribers'](definition);
	                    });
	                }
	            });
	            completedAsync = true;
	        } else {
	            subscribable.subscribe(callback);
	        }
	    }

	    function beginLoadingComponent(componentName, callback) {
	        getFirstResultFromLoaders('getConfig', [componentName], function(config) {
	            if (config) {
	                // We have a config, so now load its definition
	                getFirstResultFromLoaders('loadComponent', [componentName, config], function(definition) {
	                    callback(definition, config);
	                });
	            } else {
	                // The component has no config - it's unknown to all the loaders.
	                // Note that this is not an error (e.g., a module loading error) - that would abort the
	                // process and this callback would not run. For this callback to run, all loaders must
	                // have confirmed they don't know about this component.
	                callback(null, null);
	            }
	        });
	    }

	    function getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders) {
	        // On the first call in the stack, start with the full set of loaders
	        if (!candidateLoaders) {
	            candidateLoaders = ko.components['loaders'].slice(0); // Use a copy, because we'll be mutating this array
	        }

	        // Try the next candidate
	        var currentCandidateLoader = candidateLoaders.shift();
	        if (currentCandidateLoader) {
	            var methodInstance = currentCandidateLoader[methodName];
	            if (methodInstance) {
	                var wasAborted = false,
	                    synchronousReturnValue = methodInstance.apply(currentCandidateLoader, argsExceptCallback.concat(function(result) {
	                        if (wasAborted) {
	                            callback(null);
	                        } else if (result !== null) {
	                            // This candidate returned a value. Use it.
	                            callback(result);
	                        } else {
	                            // Try the next candidate
	                            getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
	                        }
	                    }));

	                // Currently, loaders may not return anything synchronously. This leaves open the possibility
	                // that we'll extend the API to support synchronous return values in the future. It won't be
	                // a breaking change, because currently no loader is allowed to return anything except undefined.
	                if (synchronousReturnValue !== undefined) {
	                    wasAborted = true;

	                    // Method to suppress exceptions will remain undocumented. This is only to keep
	                    // KO's specs running tidily, since we can observe the loading got aborted without
	                    // having exceptions cluttering up the console too.
	                    if (!currentCandidateLoader['suppressLoaderExceptions']) {
	                        throw new Error('Component loaders must supply values by invoking the callback, not by returning values synchronously.');
	                    }
	                }
	            } else {
	                // This candidate doesn't have the relevant handler. Synchronously move on to the next one.
	                getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
	            }
	        } else {
	            // No candidates returned a value
	            callback(null);
	        }
	    }

	    // Reference the loaders via string name so it's possible for developers
	    // to replace the whole array by assigning to ko.components.loaders
	    ko.components['loaders'] = [];

	    ko.exportSymbol('components', ko.components);
	    ko.exportSymbol('components.get', ko.components.get);
	    ko.exportSymbol('components.clearCachedDefinition', ko.components.clearCachedDefinition);
	})();
	(function(undefined) {

	    // The default loader is responsible for two things:
	    // 1. Maintaining the default in-memory registry of component configuration objects
	    //    (i.e., the thing you're writing to when you call ko.components.register(someName, ...))
	    // 2. Answering requests for components by fetching configuration objects
	    //    from that default in-memory registry and resolving them into standard
	    //    component definition objects (of the form { createViewModel: ..., template: ... })
	    // Custom loaders may override either of these facilities, i.e.,
	    // 1. To supply configuration objects from some other source (e.g., conventions)
	    // 2. Or, to resolve configuration objects by loading viewmodels/templates via arbitrary logic.

	    var defaultConfigRegistry = {};

	    ko.components.register = function(componentName, config) {
	        if (!config) {
	            throw new Error('Invalid configuration for ' + componentName);
	        }

	        if (ko.components.isRegistered(componentName)) {
	            throw new Error('Component ' + componentName + ' is already registered');
	        }

	        defaultConfigRegistry[componentName] = config;
	    };

	    ko.components.isRegistered = function(componentName) {
	        return defaultConfigRegistry.hasOwnProperty(componentName);
	    };

	    ko.components.unregister = function(componentName) {
	        delete defaultConfigRegistry[componentName];
	        ko.components.clearCachedDefinition(componentName);
	    };

	    ko.components.defaultLoader = {
	        'getConfig': function(componentName, callback) {
	            var result = defaultConfigRegistry.hasOwnProperty(componentName)
	                ? defaultConfigRegistry[componentName]
	                : null;
	            callback(result);
	        },

	        'loadComponent': function(componentName, config, callback) {
	            var errorCallback = makeErrorCallback(componentName);
	            possiblyGetConfigFromAmd(errorCallback, config, function(loadedConfig) {
	                resolveConfig(componentName, errorCallback, loadedConfig, callback);
	            });
	        },

	        'loadTemplate': function(componentName, templateConfig, callback) {
	            resolveTemplate(makeErrorCallback(componentName), templateConfig, callback);
	        },

	        'loadViewModel': function(componentName, viewModelConfig, callback) {
	            resolveViewModel(makeErrorCallback(componentName), viewModelConfig, callback);
	        }
	    };

	    var createViewModelKey = 'createViewModel';

	    // Takes a config object of the form { template: ..., viewModel: ... }, and asynchronously convert it
	    // into the standard component definition format:
	    //    { template: <ArrayOfDomNodes>, createViewModel: function(params, componentInfo) { ... } }.
	    // Since both template and viewModel may need to be resolved asynchronously, both tasks are performed
	    // in parallel, and the results joined when both are ready. We don't depend on any promises infrastructure,
	    // so this is implemented manually below.
	    function resolveConfig(componentName, errorCallback, config, callback) {
	        var result = {},
	            makeCallBackWhenZero = 2,
	            tryIssueCallback = function() {
	                if (--makeCallBackWhenZero === 0) {
	                    callback(result);
	                }
	            },
	            templateConfig = config['template'],
	            viewModelConfig = config['viewModel'];

	        if (templateConfig) {
	            possiblyGetConfigFromAmd(errorCallback, templateConfig, function(loadedConfig) {
	                ko.components._getFirstResultFromLoaders('loadTemplate', [componentName, loadedConfig], function(resolvedTemplate) {
	                    result['template'] = resolvedTemplate;
	                    tryIssueCallback();
	                });
	            });
	        } else {
	            tryIssueCallback();
	        }

	        if (viewModelConfig) {
	            possiblyGetConfigFromAmd(errorCallback, viewModelConfig, function(loadedConfig) {
	                ko.components._getFirstResultFromLoaders('loadViewModel', [componentName, loadedConfig], function(resolvedViewModel) {
	                    result[createViewModelKey] = resolvedViewModel;
	                    tryIssueCallback();
	                });
	            });
	        } else {
	            tryIssueCallback();
	        }
	    }

	    function resolveTemplate(errorCallback, templateConfig, callback) {
	        if (typeof templateConfig === 'string') {
	            // Markup - parse it
	            callback(ko.utils.parseHtmlFragment(templateConfig));
	        } else if (templateConfig instanceof Array) {
	            // Assume already an array of DOM nodes - pass through unchanged
	            callback(templateConfig);
	        } else if (isDocumentFragment(templateConfig)) {
	            // Document fragment - use its child nodes
	            callback(ko.utils.makeArray(templateConfig.childNodes));
	        } else if (templateConfig['element']) {
	            var element = templateConfig['element'];
	            if (isDomElement(element)) {
	                // Element instance - copy its child nodes
	                callback(cloneNodesFromTemplateSourceElement(element));
	            } else if (typeof element === 'string') {
	                // Element ID - find it, then copy its child nodes
	                var elemInstance = document.getElementById(element);
	                if (elemInstance) {
	                    callback(cloneNodesFromTemplateSourceElement(elemInstance));
	                } else {
	                    errorCallback('Cannot find element with ID ' + element);
	                }
	            } else {
	                errorCallback('Unknown element type: ' + element);
	            }
	        } else {
	            errorCallback('Unknown template value: ' + templateConfig);
	        }
	    }

	    function resolveViewModel(errorCallback, viewModelConfig, callback) {
	        if (typeof viewModelConfig === 'function') {
	            // Constructor - convert to standard factory function format
	            // By design, this does *not* supply componentInfo to the constructor, as the intent is that
	            // componentInfo contains non-viewmodel data (e.g., the component's element) that should only
	            // be used in factory functions, not viewmodel constructors.
	            callback(function (params /*, componentInfo */) {
	                return new viewModelConfig(params);
	            });
	        } else if (typeof viewModelConfig[createViewModelKey] === 'function') {
	            // Already a factory function - use it as-is
	            callback(viewModelConfig[createViewModelKey]);
	        } else if ('instance' in viewModelConfig) {
	            // Fixed object instance - promote to createViewModel format for API consistency
	            var fixedInstance = viewModelConfig['instance'];
	            callback(function (params, componentInfo) {
	                return fixedInstance;
	            });
	        } else if ('viewModel' in viewModelConfig) {
	            // Resolved AMD module whose value is of the form { viewModel: ... }
	            resolveViewModel(errorCallback, viewModelConfig['viewModel'], callback);
	        } else {
	            errorCallback('Unknown viewModel value: ' + viewModelConfig);
	        }
	    }

	    function cloneNodesFromTemplateSourceElement(elemInstance) {
	        switch (ko.utils.tagNameLower(elemInstance)) {
	            case 'script':
	                return ko.utils.parseHtmlFragment(elemInstance.text);
	            case 'textarea':
	                return ko.utils.parseHtmlFragment(elemInstance.value);
	            case 'template':
	                // For browsers with proper <template> element support (i.e., where the .content property
	                // gives a document fragment), use that document fragment.
	                if (isDocumentFragment(elemInstance.content)) {
	                    return ko.utils.cloneNodes(elemInstance.content.childNodes);
	                }
	        }

	        // Regular elements such as <div>, and <template> elements on old browsers that don't really
	        // understand <template> and just treat it as a regular container
	        return ko.utils.cloneNodes(elemInstance.childNodes);
	    }

	    function isDomElement(obj) {
	        if (window['HTMLElement']) {
	            return obj instanceof HTMLElement;
	        } else {
	            return obj && obj.tagName && obj.nodeType === 1;
	        }
	    }

	    function isDocumentFragment(obj) {
	        if (window['DocumentFragment']) {
	            return obj instanceof DocumentFragment;
	        } else {
	            return obj && obj.nodeType === 11;
	        }
	    }

	    function possiblyGetConfigFromAmd(errorCallback, config, callback) {
	        if (typeof config['require'] === 'string') {
	            // The config is the value of an AMD module
	            if (amdRequire || window['require']) {
	                (amdRequire || window['require'])([config['require']], callback);
	            } else {
	                errorCallback('Uses require, but no AMD loader is present');
	            }
	        } else {
	            callback(config);
	        }
	    }

	    function makeErrorCallback(componentName) {
	        return function (message) {
	            throw new Error('Component \'' + componentName + '\': ' + message);
	        };
	    }

	    ko.exportSymbol('components.register', ko.components.register);
	    ko.exportSymbol('components.isRegistered', ko.components.isRegistered);
	    ko.exportSymbol('components.unregister', ko.components.unregister);

	    // Expose the default loader so that developers can directly ask it for configuration
	    // or to resolve configuration
	    ko.exportSymbol('components.defaultLoader', ko.components.defaultLoader);

	    // By default, the default loader is the only registered component loader
	    ko.components['loaders'].push(ko.components.defaultLoader);

	    // Privately expose the underlying config registry for use in old-IE shim
	    ko.components._allRegisteredComponents = defaultConfigRegistry;
	})();
	(function (undefined) {
	    // Overridable API for determining which component name applies to a given node. By overriding this,
	    // you can for example map specific tagNames to components that are not preregistered.
	    ko.components['getComponentNameForNode'] = function(node) {
	        var tagNameLower = ko.utils.tagNameLower(node);
	        if (ko.components.isRegistered(tagNameLower)) {
	            // Try to determine that this node can be considered a *custom* element; see https://github.com/knockout/knockout/issues/1603
	            if (tagNameLower.indexOf('-') != -1 || ('' + node) == "[object HTMLUnknownElement]" || (ko.utils.ieVersion <= 8 && node.tagName === tagNameLower)) {
	                return tagNameLower;
	            }
	        }
	    };

	    ko.components.addBindingsForCustomElement = function(allBindings, node, bindingContext, valueAccessors) {
	        // Determine if it's really a custom element matching a component
	        if (node.nodeType === 1) {
	            var componentName = ko.components['getComponentNameForNode'](node);
	            if (componentName) {
	                // It does represent a component, so add a component binding for it
	                allBindings = allBindings || {};

	                if (allBindings['component']) {
	                    // Avoid silently overwriting some other 'component' binding that may already be on the element
	                    throw new Error('Cannot use the "component" binding on a custom element matching a component');
	                }

	                var componentBindingValue = { 'name': componentName, 'params': getComponentParamsFromCustomElement(node, bindingContext) };

	                allBindings['component'] = valueAccessors
	                    ? function() { return componentBindingValue; }
	                    : componentBindingValue;
	            }
	        }

	        return allBindings;
	    }

	    var nativeBindingProviderInstance = new ko.bindingProvider();

	    function getComponentParamsFromCustomElement(elem, bindingContext) {
	        var paramsAttribute = elem.getAttribute('params');

	        if (paramsAttribute) {
	            var params = nativeBindingProviderInstance['parseBindingsString'](paramsAttribute, bindingContext, elem, { 'valueAccessors': true, 'bindingParams': true }),
	                rawParamComputedValues = ko.utils.objectMap(params, function(paramValue, paramName) {
	                    return ko.computed(paramValue, null, { disposeWhenNodeIsRemoved: elem });
	                }),
	                result = ko.utils.objectMap(rawParamComputedValues, function(paramValueComputed, paramName) {
	                    var paramValue = paramValueComputed.peek();
	                    // Does the evaluation of the parameter value unwrap any observables?
	                    if (!paramValueComputed.isActive()) {
	                        // No it doesn't, so there's no need for any computed wrapper. Just pass through the supplied value directly.
	                        // Example: "someVal: firstName, age: 123" (whether or not firstName is an observable/computed)
	                        return paramValue;
	                    } else {
	                        // Yes it does. Supply a computed property that unwraps both the outer (binding expression)
	                        // level of observability, and any inner (resulting model value) level of observability.
	                        // This means the component doesn't have to worry about multiple unwrapping. If the value is a
	                        // writable observable, the computed will also be writable and pass the value on to the observable.
	                        return ko.computed({
	                            'read': function() {
	                                return ko.utils.unwrapObservable(paramValueComputed());
	                            },
	                            'write': ko.isWriteableObservable(paramValue) && function(value) {
	                                paramValueComputed()(value);
	                            },
	                            disposeWhenNodeIsRemoved: elem
	                        });
	                    }
	                });

	            // Give access to the raw computeds, as long as that wouldn't overwrite any custom param also called '$raw'
	            // This is in case the developer wants to react to outer (binding) observability separately from inner
	            // (model value) observability, or in case the model value observable has subobservables.
	            if (!result.hasOwnProperty('$raw')) {
	                result['$raw'] = rawParamComputedValues;
	            }

	            return result;
	        } else {
	            // For consistency, absence of a "params" attribute is treated the same as the presence of
	            // any empty one. Otherwise component viewmodels need special code to check whether or not
	            // 'params' or 'params.$raw' is null/undefined before reading subproperties, which is annoying.
	            return { '$raw': {} };
	        }
	    }

	    // --------------------------------------------------------------------------------
	    // Compatibility code for older (pre-HTML5) IE browsers

	    if (ko.utils.ieVersion < 9) {
	        // Whenever you preregister a component, enable it as a custom element in the current document
	        ko.components['register'] = (function(originalFunction) {
	            return function(componentName) {
	                document.createElement(componentName); // Allows IE<9 to parse markup containing the custom element
	                return originalFunction.apply(this, arguments);
	            }
	        })(ko.components['register']);

	        // Whenever you create a document fragment, enable all preregistered component names as custom elements
	        // This is needed to make innerShiv/jQuery HTML parsing correctly handle the custom elements
	        document.createDocumentFragment = (function(originalFunction) {
	            return function() {
	                var newDocFrag = originalFunction(),
	                    allComponents = ko.components._allRegisteredComponents;
	                for (var componentName in allComponents) {
	                    if (allComponents.hasOwnProperty(componentName)) {
	                        newDocFrag.createElement(componentName);
	                    }
	                }
	                return newDocFrag;
	            };
	        })(document.createDocumentFragment);
	    }
	})();(function(undefined) {

	    var componentLoadingOperationUniqueId = 0;

	    ko.bindingHandlers['component'] = {
	        'init': function(element, valueAccessor, ignored1, ignored2, bindingContext) {
	            var currentViewModel,
	                currentLoadingOperationId,
	                disposeAssociatedComponentViewModel = function () {
	                    var currentViewModelDispose = currentViewModel && currentViewModel['dispose'];
	                    if (typeof currentViewModelDispose === 'function') {
	                        currentViewModelDispose.call(currentViewModel);
	                    }
	                    currentViewModel = null;
	                    // Any in-flight loading operation is no longer relevant, so make sure we ignore its completion
	                    currentLoadingOperationId = null;
	                },
	                originalChildNodes = ko.utils.makeArray(ko.virtualElements.childNodes(element));

	            ko.utils.domNodeDisposal.addDisposeCallback(element, disposeAssociatedComponentViewModel);

	            ko.computed(function () {
	                var value = ko.utils.unwrapObservable(valueAccessor()),
	                    componentName, componentParams;

	                if (typeof value === 'string') {
	                    componentName = value;
	                } else {
	                    componentName = ko.utils.unwrapObservable(value['name']);
	                    componentParams = ko.utils.unwrapObservable(value['params']);
	                }

	                if (!componentName) {
	                    throw new Error('No component name specified');
	                }

	                var loadingOperationId = currentLoadingOperationId = ++componentLoadingOperationUniqueId;
	                ko.components.get(componentName, function(componentDefinition) {
	                    // If this is not the current load operation for this element, ignore it.
	                    if (currentLoadingOperationId !== loadingOperationId) {
	                        return;
	                    }

	                    // Clean up previous state
	                    disposeAssociatedComponentViewModel();

	                    // Instantiate and bind new component. Implicitly this cleans any old DOM nodes.
	                    if (!componentDefinition) {
	                        throw new Error('Unknown component \'' + componentName + '\'');
	                    }
	                    cloneTemplateIntoElement(componentName, componentDefinition, element);
	                    var componentViewModel = createViewModel(componentDefinition, element, originalChildNodes, componentParams),
	                        childBindingContext = bindingContext['createChildContext'](componentViewModel, /* dataItemAlias */ undefined, function(ctx) {
	                            ctx['$component'] = componentViewModel;
	                            ctx['$componentTemplateNodes'] = originalChildNodes;
	                        });
	                    currentViewModel = componentViewModel;
	                    ko.applyBindingsToDescendants(childBindingContext, element);
	                });
	            }, null, { disposeWhenNodeIsRemoved: element });

	            return { 'controlsDescendantBindings': true };
	        }
	    };

	    ko.virtualElements.allowedBindings['component'] = true;

	    function cloneTemplateIntoElement(componentName, componentDefinition, element) {
	        var template = componentDefinition['template'];
	        if (!template) {
	            throw new Error('Component \'' + componentName + '\' has no template');
	        }

	        var clonedNodesArray = ko.utils.cloneNodes(template);
	        ko.virtualElements.setDomNodeChildren(element, clonedNodesArray);
	    }

	    function createViewModel(componentDefinition, element, originalChildNodes, componentParams) {
	        var componentViewModelFactory = componentDefinition['createViewModel'];
	        return componentViewModelFactory
	            ? componentViewModelFactory.call(componentDefinition, componentParams, { 'element': element, 'templateNodes': originalChildNodes })
	            : componentParams; // Template-only component
	    }

	})();
	var attrHtmlToJavascriptMap = { 'class': 'className', 'for': 'htmlFor' };
	ko.bindingHandlers['attr'] = {
	    'update': function(element, valueAccessor, allBindings) {
	        var value = ko.utils.unwrapObservable(valueAccessor()) || {};
	        ko.utils.objectForEach(value, function(attrName, attrValue) {
	            attrValue = ko.utils.unwrapObservable(attrValue);

	            // To cover cases like "attr: { checked:someProp }", we want to remove the attribute entirely
	            // when someProp is a "no value"-like value (strictly null, false, or undefined)
	            // (because the absence of the "checked" attr is how to mark an element as not checked, etc.)
	            var toRemove = (attrValue === false) || (attrValue === null) || (attrValue === undefined);
	            if (toRemove)
	                element.removeAttribute(attrName);

	            // In IE <= 7 and IE8 Quirks Mode, you have to use the Javascript property name instead of the
	            // HTML attribute name for certain attributes. IE8 Standards Mode supports the correct behavior,
	            // but instead of figuring out the mode, we'll just set the attribute through the Javascript
	            // property for IE <= 8.
	            if (ko.utils.ieVersion <= 8 && attrName in attrHtmlToJavascriptMap) {
	                attrName = attrHtmlToJavascriptMap[attrName];
	                if (toRemove)
	                    element.removeAttribute(attrName);
	                else
	                    element[attrName] = attrValue;
	            } else if (!toRemove) {
	                element.setAttribute(attrName, attrValue.toString());
	            }

	            // Treat "name" specially - although you can think of it as an attribute, it also needs
	            // special handling on older versions of IE (https://github.com/SteveSanderson/knockout/pull/333)
	            // Deliberately being case-sensitive here because XHTML would regard "Name" as a different thing
	            // entirely, and there's no strong reason to allow for such casing in HTML.
	            if (attrName === "name") {
	                ko.utils.setElementName(element, toRemove ? "" : attrValue.toString());
	            }
	        });
	    }
	};
	(function() {

	ko.bindingHandlers['checked'] = {
	    'after': ['value', 'attr'],
	    'init': function (element, valueAccessor, allBindings) {
	        var checkedValue = ko.pureComputed(function() {
	            // Treat "value" like "checkedValue" when it is included with "checked" binding
	            if (allBindings['has']('checkedValue')) {
	                return ko.utils.unwrapObservable(allBindings.get('checkedValue'));
	            } else if (allBindings['has']('value')) {
	                return ko.utils.unwrapObservable(allBindings.get('value'));
	            }

	            return element.value;
	        });

	        function updateModel() {
	            // This updates the model value from the view value.
	            // It runs in response to DOM events (click) and changes in checkedValue.
	            var isChecked = element.checked,
	                elemValue = useCheckedValue ? checkedValue() : isChecked;

	            // When we're first setting up this computed, don't change any model state.
	            if (ko.computedContext.isInitial()) {
	                return;
	            }

	            // We can ignore unchecked radio buttons, because some other radio
	            // button will be getting checked, and that one can take care of updating state.
	            if (isRadio && !isChecked) {
	                return;
	            }

	            var modelValue = ko.dependencyDetection.ignore(valueAccessor);
	            if (valueIsArray) {
	                var writableValue = rawValueIsNonArrayObservable ? modelValue.peek() : modelValue;
	                if (oldElemValue !== elemValue) {
	                    // When we're responding to the checkedValue changing, and the element is
	                    // currently checked, replace the old elem value with the new elem value
	                    // in the model array.
	                    if (isChecked) {
	                        ko.utils.addOrRemoveItem(writableValue, elemValue, true);
	                        ko.utils.addOrRemoveItem(writableValue, oldElemValue, false);
	                    }

	                    oldElemValue = elemValue;
	                } else {
	                    // When we're responding to the user having checked/unchecked a checkbox,
	                    // add/remove the element value to the model array.
	                    ko.utils.addOrRemoveItem(writableValue, elemValue, isChecked);
	                }
	                if (rawValueIsNonArrayObservable && ko.isWriteableObservable(modelValue)) {
	                    modelValue(writableValue);
	                }
	            } else {
	                ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'checked', elemValue, true);
	            }
	        };

	        function updateView() {
	            // This updates the view value from the model value.
	            // It runs in response to changes in the bound (checked) value.
	            var modelValue = ko.utils.unwrapObservable(valueAccessor());

	            if (valueIsArray) {
	                // When a checkbox is bound to an array, being checked represents its value being present in that array
	                element.checked = ko.utils.arrayIndexOf(modelValue, checkedValue()) >= 0;
	            } else if (isCheckbox) {
	                // When a checkbox is bound to any other value (not an array), being checked represents the value being trueish
	                element.checked = modelValue;
	            } else {
	                // For radio buttons, being checked means that the radio button's value corresponds to the model value
	                element.checked = (checkedValue() === modelValue);
	            }
	        };

	        var isCheckbox = element.type == "checkbox",
	            isRadio = element.type == "radio";

	        // Only bind to check boxes and radio buttons
	        if (!isCheckbox && !isRadio) {
	            return;
	        }

	        var rawValue = valueAccessor(),
	            valueIsArray = isCheckbox && (ko.utils.unwrapObservable(rawValue) instanceof Array),
	            rawValueIsNonArrayObservable = !(valueIsArray && rawValue.push && rawValue.splice),
	            oldElemValue = valueIsArray ? checkedValue() : undefined,
	            useCheckedValue = isRadio || valueIsArray;

	        // IE 6 won't allow radio buttons to be selected unless they have a name
	        if (isRadio && !element.name)
	            ko.bindingHandlers['uniqueName']['init'](element, function() { return true });

	        // Set up two computeds to update the binding:

	        // The first responds to changes in the checkedValue value and to element clicks
	        ko.computed(updateModel, null, { disposeWhenNodeIsRemoved: element });
	        ko.utils.registerEventHandler(element, "click", updateModel);

	        // The second responds to changes in the model value (the one associated with the checked binding)
	        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });

	        rawValue = undefined;
	    }
	};
	ko.expressionRewriting.twoWayBindings['checked'] = true;

	ko.bindingHandlers['checkedValue'] = {
	    'update': function (element, valueAccessor) {
	        element.value = ko.utils.unwrapObservable(valueAccessor());
	    }
	};

	})();var classesWrittenByBindingKey = '__ko__cssValue';
	ko.bindingHandlers['css'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor());
	        if (value !== null && typeof value == "object") {
	            ko.utils.objectForEach(value, function(className, shouldHaveClass) {
	                shouldHaveClass = ko.utils.unwrapObservable(shouldHaveClass);
	                ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
	            });
	        } else {
	            value = ko.utils.stringTrim(String(value || '')); // Make sure we don't try to store or set a non-string value
	            ko.utils.toggleDomNodeCssClass(element, element[classesWrittenByBindingKey], false);
	            element[classesWrittenByBindingKey] = value;
	            ko.utils.toggleDomNodeCssClass(element, value, true);
	        }
	    }
	};
	ko.bindingHandlers['enable'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor());
	        if (value && element.disabled)
	            element.removeAttribute("disabled");
	        else if ((!value) && (!element.disabled))
	            element.disabled = true;
	    }
	};

	ko.bindingHandlers['disable'] = {
	    'update': function (element, valueAccessor) {
	        ko.bindingHandlers['enable']['update'](element, function() { return !ko.utils.unwrapObservable(valueAccessor()) });
	    }
	};
	// For certain common events (currently just 'click'), allow a simplified data-binding syntax
	// e.g. click:handler instead of the usual full-length event:{click:handler}
	function makeEventHandlerShortcut(eventName) {
	    ko.bindingHandlers[eventName] = {
	        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	            var newValueAccessor = function () {
	                var result = {};
	                result[eventName] = valueAccessor();
	                return result;
	            };
	            return ko.bindingHandlers['event']['init'].call(this, element, newValueAccessor, allBindings, viewModel, bindingContext);
	        }
	    }
	}

	ko.bindingHandlers['event'] = {
	    'init' : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var eventsToHandle = valueAccessor() || {};
	        ko.utils.objectForEach(eventsToHandle, function(eventName) {
	            if (typeof eventName == "string") {
	                ko.utils.registerEventHandler(element, eventName, function (event) {
	                    var handlerReturnValue;
	                    var handlerFunction = valueAccessor()[eventName];
	                    if (!handlerFunction)
	                        return;

	                    try {
	                        // Take all the event args, and prefix with the viewmodel
	                        var argsForHandler = ko.utils.makeArray(arguments);
	                        viewModel = bindingContext['$data'];
	                        argsForHandler.unshift(viewModel);
	                        handlerReturnValue = handlerFunction.apply(viewModel, argsForHandler);
	                    } finally {
	                        if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
	                            if (event.preventDefault)
	                                event.preventDefault();
	                            else
	                                event.returnValue = false;
	                        }
	                    }

	                    var bubble = allBindings.get(eventName + 'Bubble') !== false;
	                    if (!bubble) {
	                        event.cancelBubble = true;
	                        if (event.stopPropagation)
	                            event.stopPropagation();
	                    }
	                });
	            }
	        });
	    }
	};
	// "foreach: someExpression" is equivalent to "template: { foreach: someExpression }"
	// "foreach: { data: someExpression, afterAdd: myfn }" is equivalent to "template: { foreach: someExpression, afterAdd: myfn }"
	ko.bindingHandlers['foreach'] = {
	    makeTemplateValueAccessor: function(valueAccessor) {
	        return function() {
	            var modelValue = valueAccessor(),
	                unwrappedValue = ko.utils.peekObservable(modelValue);    // Unwrap without setting a dependency here

	            // If unwrappedValue is the array, pass in the wrapped value on its own
	            // The value will be unwrapped and tracked within the template binding
	            // (See https://github.com/SteveSanderson/knockout/issues/523)
	            if ((!unwrappedValue) || typeof unwrappedValue.length == "number")
	                return { 'foreach': modelValue, 'templateEngine': ko.nativeTemplateEngine.instance };

	            // If unwrappedValue.data is the array, preserve all relevant options and unwrap again value so we get updates
	            ko.utils.unwrapObservable(modelValue);
	            return {
	                'foreach': unwrappedValue['data'],
	                'as': unwrappedValue['as'],
	                'includeDestroyed': unwrappedValue['includeDestroyed'],
	                'afterAdd': unwrappedValue['afterAdd'],
	                'beforeRemove': unwrappedValue['beforeRemove'],
	                'afterRender': unwrappedValue['afterRender'],
	                'beforeMove': unwrappedValue['beforeMove'],
	                'afterMove': unwrappedValue['afterMove'],
	                'templateEngine': ko.nativeTemplateEngine.instance
	            };
	        };
	    },
	    'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        return ko.bindingHandlers['template']['init'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor));
	    },
	    'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        return ko.bindingHandlers['template']['update'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
	    }
	};
	ko.expressionRewriting.bindingRewriteValidators['foreach'] = false; // Can't rewrite control flow bindings
	ko.virtualElements.allowedBindings['foreach'] = true;
	var hasfocusUpdatingProperty = '__ko_hasfocusUpdating';
	var hasfocusLastValue = '__ko_hasfocusLastValue';
	ko.bindingHandlers['hasfocus'] = {
	    'init': function(element, valueAccessor, allBindings) {
	        var handleElementFocusChange = function(isFocused) {
	            // Where possible, ignore which event was raised and determine focus state using activeElement,
	            // as this avoids phantom focus/blur events raised when changing tabs in modern browsers.
	            // However, not all KO-targeted browsers (Firefox 2) support activeElement. For those browsers,
	            // prevent a loss of focus when changing tabs/windows by setting a flag that prevents hasfocus
	            // from calling 'blur()' on the element when it loses focus.
	            // Discussion at https://github.com/SteveSanderson/knockout/pull/352
	            element[hasfocusUpdatingProperty] = true;
	            var ownerDoc = element.ownerDocument;
	            if ("activeElement" in ownerDoc) {
	                var active;
	                try {
	                    active = ownerDoc.activeElement;
	                } catch(e) {
	                    // IE9 throws if you access activeElement during page load (see issue #703)
	                    active = ownerDoc.body;
	                }
	                isFocused = (active === element);
	            }
	            var modelValue = valueAccessor();
	            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'hasfocus', isFocused, true);

	            //cache the latest value, so we can avoid unnecessarily calling focus/blur in the update function
	            element[hasfocusLastValue] = isFocused;
	            element[hasfocusUpdatingProperty] = false;
	        };
	        var handleElementFocusIn = handleElementFocusChange.bind(null, true);
	        var handleElementFocusOut = handleElementFocusChange.bind(null, false);

	        ko.utils.registerEventHandler(element, "focus", handleElementFocusIn);
	        ko.utils.registerEventHandler(element, "focusin", handleElementFocusIn); // For IE
	        ko.utils.registerEventHandler(element, "blur",  handleElementFocusOut);
	        ko.utils.registerEventHandler(element, "focusout",  handleElementFocusOut); // For IE
	    },
	    'update': function(element, valueAccessor) {
	        var value = !!ko.utils.unwrapObservable(valueAccessor());

	        if (!element[hasfocusUpdatingProperty] && element[hasfocusLastValue] !== value) {
	            value ? element.focus() : element.blur();

	            // In IE, the blur method doesn't always cause the element to lose focus (for example, if the window is not in focus).
	            // Setting focus to the body element does seem to be reliable in IE, but should only be used if we know that the current
	            // element was focused already.
	            if (!value && element[hasfocusLastValue]) {
	                element.ownerDocument.body.focus();
	            }

	            // For IE, which doesn't reliably fire "focus" or "blur" events synchronously
	            ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, value ? "focusin" : "focusout"]);
	        }
	    }
	};
	ko.expressionRewriting.twoWayBindings['hasfocus'] = true;

	ko.bindingHandlers['hasFocus'] = ko.bindingHandlers['hasfocus']; // Make "hasFocus" an alias
	ko.expressionRewriting.twoWayBindings['hasFocus'] = true;
	ko.bindingHandlers['html'] = {
	    'init': function() {
	        // Prevent binding on the dynamically-injected HTML (as developers are unlikely to expect that, and it has security implications)
	        return { 'controlsDescendantBindings': true };
	    },
	    'update': function (element, valueAccessor) {
	        // setHtml will unwrap the value if needed
	        ko.utils.setHtml(element, valueAccessor());
	    }
	};
	// Makes a binding like with or if
	function makeWithIfBinding(bindingKey, isWith, isNot, makeContextCallback) {
	    ko.bindingHandlers[bindingKey] = {
	        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	            var didDisplayOnLastUpdate,
	                savedNodes;
	            ko.computed(function() {
	                var dataValue = ko.utils.unwrapObservable(valueAccessor()),
	                    shouldDisplay = !isNot !== !dataValue, // equivalent to isNot ? !dataValue : !!dataValue
	                    isFirstRender = !savedNodes,
	                    needsRefresh = isFirstRender || isWith || (shouldDisplay !== didDisplayOnLastUpdate);

	                if (needsRefresh) {
	                    // Save a copy of the inner nodes on the initial update, but only if we have dependencies.
	                    if (isFirstRender && ko.computedContext.getDependenciesCount()) {
	                        savedNodes = ko.utils.cloneNodes(ko.virtualElements.childNodes(element), true /* shouldCleanNodes */);
	                    }

	                    if (shouldDisplay) {
	                        if (!isFirstRender) {
	                            ko.virtualElements.setDomNodeChildren(element, ko.utils.cloneNodes(savedNodes));
	                        }
	                        ko.applyBindingsToDescendants(makeContextCallback ? makeContextCallback(bindingContext, dataValue) : bindingContext, element);
	                    } else {
	                        ko.virtualElements.emptyNode(element);
	                    }

	                    didDisplayOnLastUpdate = shouldDisplay;
	                }
	            }, null, { disposeWhenNodeIsRemoved: element });
	            return { 'controlsDescendantBindings': true };
	        }
	    };
	    ko.expressionRewriting.bindingRewriteValidators[bindingKey] = false; // Can't rewrite control flow bindings
	    ko.virtualElements.allowedBindings[bindingKey] = true;
	}

	// Construct the actual binding handlers
	makeWithIfBinding('if');
	makeWithIfBinding('ifnot', false /* isWith */, true /* isNot */);
	makeWithIfBinding('with', true /* isWith */, false /* isNot */,
	    function(bindingContext, dataValue) {
	        return bindingContext['createChildContext'](dataValue);
	    }
	);
	var captionPlaceholder = {};
	ko.bindingHandlers['options'] = {
	    'init': function(element) {
	        if (ko.utils.tagNameLower(element) !== "select")
	            throw new Error("options binding applies only to SELECT elements");

	        // Remove all existing <option>s.
	        while (element.length > 0) {
	            element.remove(0);
	        }

	        // Ensures that the binding processor doesn't try to bind the options
	        return { 'controlsDescendantBindings': true };
	    },
	    'update': function (element, valueAccessor, allBindings) {
	        function selectedOptions() {
	            return ko.utils.arrayFilter(element.options, function (node) { return node.selected; });
	        }

	        var selectWasPreviouslyEmpty = element.length == 0,
	            multiple = element.multiple,
	            previousScrollTop = (!selectWasPreviouslyEmpty && multiple) ? element.scrollTop : null,
	            unwrappedArray = ko.utils.unwrapObservable(valueAccessor()),
	            valueAllowUnset = allBindings.get('valueAllowUnset') && allBindings['has']('value'),
	            includeDestroyed = allBindings.get('optionsIncludeDestroyed'),
	            arrayToDomNodeChildrenOptions = {},
	            captionValue,
	            filteredArray,
	            previousSelectedValues = [];

	        if (!valueAllowUnset) {
	            if (multiple) {
	                previousSelectedValues = ko.utils.arrayMap(selectedOptions(), ko.selectExtensions.readValue);
	            } else if (element.selectedIndex >= 0) {
	                previousSelectedValues.push(ko.selectExtensions.readValue(element.options[element.selectedIndex]));
	            }
	        }

	        if (unwrappedArray) {
	            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
	                unwrappedArray = [unwrappedArray];

	            // Filter out any entries marked as destroyed
	            filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
	                return includeDestroyed || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
	            });

	            // If caption is included, add it to the array
	            if (allBindings['has']('optionsCaption')) {
	                captionValue = ko.utils.unwrapObservable(allBindings.get('optionsCaption'));
	                // If caption value is null or undefined, don't show a caption
	                if (captionValue !== null && captionValue !== undefined) {
	                    filteredArray.unshift(captionPlaceholder);
	                }
	            }
	        } else {
	            // If a falsy value is provided (e.g. null), we'll simply empty the select element
	        }

	        function applyToObject(object, predicate, defaultValue) {
	            var predicateType = typeof predicate;
	            if (predicateType == "function")    // Given a function; run it against the data value
	                return predicate(object);
	            else if (predicateType == "string") // Given a string; treat it as a property name on the data value
	                return object[predicate];
	            else                                // Given no optionsText arg; use the data value itself
	                return defaultValue;
	        }

	        // The following functions can run at two different times:
	        // The first is when the whole array is being updated directly from this binding handler.
	        // The second is when an observable value for a specific array entry is updated.
	        // oldOptions will be empty in the first case, but will be filled with the previously generated option in the second.
	        var itemUpdate = false;
	        function optionForArrayItem(arrayEntry, index, oldOptions) {
	            if (oldOptions.length) {
	                previousSelectedValues = !valueAllowUnset && oldOptions[0].selected ? [ ko.selectExtensions.readValue(oldOptions[0]) ] : [];
	                itemUpdate = true;
	            }
	            var option = element.ownerDocument.createElement("option");
	            if (arrayEntry === captionPlaceholder) {
	                ko.utils.setTextContent(option, allBindings.get('optionsCaption'));
	                ko.selectExtensions.writeValue(option, undefined);
	            } else {
	                // Apply a value to the option element
	                var optionValue = applyToObject(arrayEntry, allBindings.get('optionsValue'), arrayEntry);
	                ko.selectExtensions.writeValue(option, ko.utils.unwrapObservable(optionValue));

	                // Apply some text to the option element
	                var optionText = applyToObject(arrayEntry, allBindings.get('optionsText'), optionValue);
	                ko.utils.setTextContent(option, optionText);
	            }
	            return [option];
	        }

	        // By using a beforeRemove callback, we delay the removal until after new items are added. This fixes a selection
	        // problem in IE<=8 and Firefox. See https://github.com/knockout/knockout/issues/1208
	        arrayToDomNodeChildrenOptions['beforeRemove'] =
	            function (option) {
	                element.removeChild(option);
	            };

	        function setSelectionCallback(arrayEntry, newOptions) {
	            if (itemUpdate && valueAllowUnset) {
	                // The model value is authoritative, so make sure its value is the one selected
	                // There is no need to use dependencyDetection.ignore since setDomNodeChildrenFromArrayMapping does so already.
	                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
	            } else if (previousSelectedValues.length) {
	                // IE6 doesn't like us to assign selection to OPTION nodes before they're added to the document.
	                // That's why we first added them without selection. Now it's time to set the selection.
	                var isSelected = ko.utils.arrayIndexOf(previousSelectedValues, ko.selectExtensions.readValue(newOptions[0])) >= 0;
	                ko.utils.setOptionNodeSelectionState(newOptions[0], isSelected);

	                // If this option was changed from being selected during a single-item update, notify the change
	                if (itemUpdate && !isSelected) {
	                    ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
	                }
	            }
	        }

	        var callback = setSelectionCallback;
	        if (allBindings['has']('optionsAfterRender') && typeof allBindings.get('optionsAfterRender') == "function") {
	            callback = function(arrayEntry, newOptions) {
	                setSelectionCallback(arrayEntry, newOptions);
	                ko.dependencyDetection.ignore(allBindings.get('optionsAfterRender'), null, [newOptions[0], arrayEntry !== captionPlaceholder ? arrayEntry : undefined]);
	            }
	        }

	        ko.utils.setDomNodeChildrenFromArrayMapping(element, filteredArray, optionForArrayItem, arrayToDomNodeChildrenOptions, callback);

	        ko.dependencyDetection.ignore(function () {
	            if (valueAllowUnset) {
	                // The model value is authoritative, so make sure its value is the one selected
	                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
	            } else {
	                // Determine if the selection has changed as a result of updating the options list
	                var selectionChanged;
	                if (multiple) {
	                    // For a multiple-select box, compare the new selection count to the previous one
	                    // But if nothing was selected before, the selection can't have changed
	                    selectionChanged = previousSelectedValues.length && selectedOptions().length < previousSelectedValues.length;
	                } else {
	                    // For a single-select box, compare the current value to the previous value
	                    // But if nothing was selected before or nothing is selected now, just look for a change in selection
	                    selectionChanged = (previousSelectedValues.length && element.selectedIndex >= 0)
	                        ? (ko.selectExtensions.readValue(element.options[element.selectedIndex]) !== previousSelectedValues[0])
	                        : (previousSelectedValues.length || element.selectedIndex >= 0);
	                }

	                // Ensure consistency between model value and selected option.
	                // If the dropdown was changed so that selection is no longer the same,
	                // notify the value or selectedOptions binding.
	                if (selectionChanged) {
	                    ko.utils.triggerEvent(element, "change");
	                }
	            }
	        });

	        // Workaround for IE bug
	        ko.utils.ensureSelectElementIsRenderedCorrectly(element);

	        if (previousScrollTop && Math.abs(previousScrollTop - element.scrollTop) > 20)
	            element.scrollTop = previousScrollTop;
	    }
	};
	ko.bindingHandlers['options'].optionValueDomDataKey = ko.utils.domData.nextKey();
	ko.bindingHandlers['selectedOptions'] = {
	    'after': ['options', 'foreach'],
	    'init': function (element, valueAccessor, allBindings) {
	        ko.utils.registerEventHandler(element, "change", function () {
	            var value = valueAccessor(), valueToWrite = [];
	            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
	                if (node.selected)
	                    valueToWrite.push(ko.selectExtensions.readValue(node));
	            });
	            ko.expressionRewriting.writeValueToProperty(value, allBindings, 'selectedOptions', valueToWrite);
	        });
	    },
	    'update': function (element, valueAccessor) {
	        if (ko.utils.tagNameLower(element) != "select")
	            throw new Error("values binding applies only to SELECT elements");

	        var newValue = ko.utils.unwrapObservable(valueAccessor()),
	            previousScrollTop = element.scrollTop;

	        if (newValue && typeof newValue.length == "number") {
	            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
	                var isSelected = ko.utils.arrayIndexOf(newValue, ko.selectExtensions.readValue(node)) >= 0;
	                if (node.selected != isSelected) {      // This check prevents flashing of the select element in IE
	                    ko.utils.setOptionNodeSelectionState(node, isSelected);
	                }
	            });
	        }

	        element.scrollTop = previousScrollTop;
	    }
	};
	ko.expressionRewriting.twoWayBindings['selectedOptions'] = true;
	ko.bindingHandlers['style'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor() || {});
	        ko.utils.objectForEach(value, function(styleName, styleValue) {
	            styleValue = ko.utils.unwrapObservable(styleValue);

	            if (styleValue === null || styleValue === undefined || styleValue === false) {
	                // Empty string removes the value, whereas null/undefined have no effect
	                styleValue = "";
	            }

	            element.style[styleName] = styleValue;
	        });
	    }
	};
	ko.bindingHandlers['submit'] = {
	    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        if (typeof valueAccessor() != "function")
	            throw new Error("The value for a submit binding must be a function");
	        ko.utils.registerEventHandler(element, "submit", function (event) {
	            var handlerReturnValue;
	            var value = valueAccessor();
	            try { handlerReturnValue = value.call(bindingContext['$data'], element); }
	            finally {
	                if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
	                    if (event.preventDefault)
	                        event.preventDefault();
	                    else
	                        event.returnValue = false;
	                }
	            }
	        });
	    }
	};
	ko.bindingHandlers['text'] = {
	    'init': function() {
	        // Prevent binding on the dynamically-injected text node (as developers are unlikely to expect that, and it has security implications).
	        // It should also make things faster, as we no longer have to consider whether the text node might be bindable.
	        return { 'controlsDescendantBindings': true };
	    },
	    'update': function (element, valueAccessor) {
	        ko.utils.setTextContent(element, valueAccessor());
	    }
	};
	ko.virtualElements.allowedBindings['text'] = true;
	(function () {

	if (window && window.navigator) {
	    var parseVersion = function (matches) {
	        if (matches) {
	            return parseFloat(matches[1]);
	        }
	    };

	    // Detect various browser versions because some old versions don't fully support the 'input' event
	    var operaVersion = window.opera && window.opera.version && parseInt(window.opera.version()),
	        userAgent = window.navigator.userAgent,
	        safariVersion = parseVersion(userAgent.match(/^(?:(?!chrome).)*version\/([^ ]*) safari/i)),
	        firefoxVersion = parseVersion(userAgent.match(/Firefox\/([^ ]*)/));
	}

	// IE 8 and 9 have bugs that prevent the normal events from firing when the value changes.
	// But it does fire the 'selectionchange' event on many of those, presumably because the
	// cursor is moving and that counts as the selection changing. The 'selectionchange' event is
	// fired at the document level only and doesn't directly indicate which element changed. We
	// set up just one event handler for the document and use 'activeElement' to determine which
	// element was changed.
	if (ko.utils.ieVersion < 10) {
	    var selectionChangeRegisteredName = ko.utils.domData.nextKey(),
	        selectionChangeHandlerName = ko.utils.domData.nextKey();
	    var selectionChangeHandler = function(event) {
	        var target = this.activeElement,
	            handler = target && ko.utils.domData.get(target, selectionChangeHandlerName);
	        if (handler) {
	            handler(event);
	        }
	    };
	    var registerForSelectionChangeEvent = function (element, handler) {
	        var ownerDoc = element.ownerDocument;
	        if (!ko.utils.domData.get(ownerDoc, selectionChangeRegisteredName)) {
	            ko.utils.domData.set(ownerDoc, selectionChangeRegisteredName, true);
	            ko.utils.registerEventHandler(ownerDoc, 'selectionchange', selectionChangeHandler);
	        }
	        ko.utils.domData.set(element, selectionChangeHandlerName, handler);
	    };
	}

	ko.bindingHandlers['textInput'] = {
	    'init': function (element, valueAccessor, allBindings) {

	        var previousElementValue = element.value,
	            timeoutHandle,
	            elementValueBeforeEvent;

	        var updateModel = function (event) {
	            clearTimeout(timeoutHandle);
	            elementValueBeforeEvent = timeoutHandle = undefined;

	            var elementValue = element.value;
	            if (previousElementValue !== elementValue) {
	                // Provide a way for tests to know exactly which event was processed
	                if (DEBUG && event) element['_ko_textInputProcessedEvent'] = event.type;
	                previousElementValue = elementValue;
	                ko.expressionRewriting.writeValueToProperty(valueAccessor(), allBindings, 'textInput', elementValue);
	            }
	        };

	        var deferUpdateModel = function (event) {
	            if (!timeoutHandle) {
	                // The elementValueBeforeEvent variable is set *only* during the brief gap between an
	                // event firing and the updateModel function running. This allows us to ignore model
	                // updates that are from the previous state of the element, usually due to techniques
	                // such as rateLimit. Such updates, if not ignored, can cause keystrokes to be lost.
	                elementValueBeforeEvent = element.value;
	                var handler = DEBUG ? updateModel.bind(element, {type: event.type}) : updateModel;
	                timeoutHandle = ko.utils.setTimeout(handler, 4);
	            }
	        };

	        // IE9 will mess up the DOM if you handle events synchronously which results in DOM changes (such as other bindings);
	        // so we'll make sure all updates are asynchronous
	        var ieUpdateModel = ko.utils.ieVersion == 9 ? deferUpdateModel : updateModel;

	        var updateView = function () {
	            var modelValue = ko.utils.unwrapObservable(valueAccessor());

	            if (modelValue === null || modelValue === undefined) {
	                modelValue = '';
	            }

	            if (elementValueBeforeEvent !== undefined && modelValue === elementValueBeforeEvent) {
	                ko.utils.setTimeout(updateView, 4);
	                return;
	            }

	            // Update the element only if the element and model are different. On some browsers, updating the value
	            // will move the cursor to the end of the input, which would be bad while the user is typing.
	            if (element.value !== modelValue) {
	                previousElementValue = modelValue;  // Make sure we ignore events (propertychange) that result from updating the value
	                element.value = modelValue;
	            }
	        };

	        var onEvent = function (event, handler) {
	            ko.utils.registerEventHandler(element, event, handler);
	        };

	        if (DEBUG && ko.bindingHandlers['textInput']['_forceUpdateOn']) {
	            // Provide a way for tests to specify exactly which events are bound
	            ko.utils.arrayForEach(ko.bindingHandlers['textInput']['_forceUpdateOn'], function(eventName) {
	                if (eventName.slice(0,5) == 'after') {
	                    onEvent(eventName.slice(5), deferUpdateModel);
	                } else {
	                    onEvent(eventName, updateModel);
	                }
	            });
	        } else {
	            if (ko.utils.ieVersion < 10) {
	                // Internet Explorer <= 8 doesn't support the 'input' event, but does include 'propertychange' that fires whenever
	                // any property of an element changes. Unlike 'input', it also fires if a property is changed from JavaScript code,
	                // but that's an acceptable compromise for this binding. IE 9 does support 'input', but since it doesn't fire it
	                // when using autocomplete, we'll use 'propertychange' for it also.
	                onEvent('propertychange', function(event) {
	                    if (event.propertyName === 'value') {
	                        ieUpdateModel(event);
	                    }
	                });

	                if (ko.utils.ieVersion == 8) {
	                    // IE 8 has a bug where it fails to fire 'propertychange' on the first update following a value change from
	                    // JavaScript code. It also doesn't fire if you clear the entire value. To fix this, we bind to the following
	                    // events too.
	                    onEvent('keyup', updateModel);      // A single keystoke
	                    onEvent('keydown', updateModel);    // The first character when a key is held down
	                }
	                if (ko.utils.ieVersion >= 8) {
	                    // Internet Explorer 9 doesn't fire the 'input' event when deleting text, including using
	                    // the backspace, delete, or ctrl-x keys, clicking the 'x' to clear the input, dragging text
	                    // out of the field, and cutting or deleting text using the context menu. 'selectionchange'
	                    // can detect all of those except dragging text out of the field, for which we use 'dragend'.
	                    // These are also needed in IE8 because of the bug described above.
	                    registerForSelectionChangeEvent(element, ieUpdateModel);  // 'selectionchange' covers cut, paste, drop, delete, etc.
	                    onEvent('dragend', deferUpdateModel);
	                }
	            } else {
	                // All other supported browsers support the 'input' event, which fires whenever the content of the element is changed
	                // through the user interface.
	                onEvent('input', updateModel);

	                if (safariVersion < 5 && ko.utils.tagNameLower(element) === "textarea") {
	                    // Safari <5 doesn't fire the 'input' event for <textarea> elements (it does fire 'textInput'
	                    // but only when typing). So we'll just catch as much as we can with keydown, cut, and paste.
	                    onEvent('keydown', deferUpdateModel);
	                    onEvent('paste', deferUpdateModel);
	                    onEvent('cut', deferUpdateModel);
	                } else if (operaVersion < 11) {
	                    // Opera 10 doesn't always fire the 'input' event for cut, paste, undo & drop operations.
	                    // We can try to catch some of those using 'keydown'.
	                    onEvent('keydown', deferUpdateModel);
	                } else if (firefoxVersion < 4.0) {
	                    // Firefox <= 3.6 doesn't fire the 'input' event when text is filled in through autocomplete
	                    onEvent('DOMAutoComplete', updateModel);

	                    // Firefox <=3.5 doesn't fire the 'input' event when text is dropped into the input.
	                    onEvent('dragdrop', updateModel);       // <3.5
	                    onEvent('drop', updateModel);           // 3.5
	                }
	            }
	        }

	        // Bind to the change event so that we can catch programmatic updates of the value that fire this event.
	        onEvent('change', updateModel);

	        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
	    }
	};
	ko.expressionRewriting.twoWayBindings['textInput'] = true;

	// textinput is an alias for textInput
	ko.bindingHandlers['textinput'] = {
	    // preprocess is the only way to set up a full alias
	    'preprocess': function (value, name, addBinding) {
	        addBinding('textInput', value);
	    }
	};

	})();ko.bindingHandlers['uniqueName'] = {
	    'init': function (element, valueAccessor) {
	        if (valueAccessor()) {
	            var name = "ko_unique_" + (++ko.bindingHandlers['uniqueName'].currentIndex);
	            ko.utils.setElementName(element, name);
	        }
	    }
	};
	ko.bindingHandlers['uniqueName'].currentIndex = 0;
	ko.bindingHandlers['value'] = {
	    'after': ['options', 'foreach'],
	    'init': function (element, valueAccessor, allBindings) {
	        // If the value binding is placed on a radio/checkbox, then just pass through to checkedValue and quit
	        if (element.tagName.toLowerCase() == "input" && (element.type == "checkbox" || element.type == "radio")) {
	            ko.applyBindingAccessorsToNode(element, { 'checkedValue': valueAccessor });
	            return;
	        }

	        // Always catch "change" event; possibly other events too if asked
	        var eventsToCatch = ["change"];
	        var requestedEventsToCatch = allBindings.get("valueUpdate");
	        var propertyChangedFired = false;
	        var elementValueBeforeEvent = null;

	        if (requestedEventsToCatch) {
	            if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
	                requestedEventsToCatch = [requestedEventsToCatch];
	            ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
	            eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
	        }

	        var valueUpdateHandler = function() {
	            elementValueBeforeEvent = null;
	            propertyChangedFired = false;
	            var modelValue = valueAccessor();
	            var elementValue = ko.selectExtensions.readValue(element);
	            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'value', elementValue);
	        }

	        // Workaround for https://github.com/SteveSanderson/knockout/issues/122
	        // IE doesn't fire "change" events on textboxes if the user selects a value from its autocomplete list
	        var ieAutoCompleteHackNeeded = ko.utils.ieVersion && element.tagName.toLowerCase() == "input" && element.type == "text"
	                                       && element.autocomplete != "off" && (!element.form || element.form.autocomplete != "off");
	        if (ieAutoCompleteHackNeeded && ko.utils.arrayIndexOf(eventsToCatch, "propertychange") == -1) {
	            ko.utils.registerEventHandler(element, "propertychange", function () { propertyChangedFired = true });
	            ko.utils.registerEventHandler(element, "focus", function () { propertyChangedFired = false });
	            ko.utils.registerEventHandler(element, "blur", function() {
	                if (propertyChangedFired) {
	                    valueUpdateHandler();
	                }
	            });
	        }

	        ko.utils.arrayForEach(eventsToCatch, function(eventName) {
	            // The syntax "after<eventname>" means "run the handler asynchronously after the event"
	            // This is useful, for example, to catch "keydown" events after the browser has updated the control
	            // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
	            var handler = valueUpdateHandler;
	            if (ko.utils.stringStartsWith(eventName, "after")) {
	                handler = function() {
	                    // The elementValueBeforeEvent variable is non-null *only* during the brief gap between
	                    // a keyX event firing and the valueUpdateHandler running, which is scheduled to happen
	                    // at the earliest asynchronous opportunity. We store this temporary information so that
	                    // if, between keyX and valueUpdateHandler, the underlying model value changes separately,
	                    // we can overwrite that model value change with the value the user just typed. Otherwise,
	                    // techniques like rateLimit can trigger model changes at critical moments that will
	                    // override the user's inputs, causing keystrokes to be lost.
	                    elementValueBeforeEvent = ko.selectExtensions.readValue(element);
	                    ko.utils.setTimeout(valueUpdateHandler, 0);
	                };
	                eventName = eventName.substring("after".length);
	            }
	            ko.utils.registerEventHandler(element, eventName, handler);
	        });

	        var updateFromModel = function () {
	            var newValue = ko.utils.unwrapObservable(valueAccessor());
	            var elementValue = ko.selectExtensions.readValue(element);

	            if (elementValueBeforeEvent !== null && newValue === elementValueBeforeEvent) {
	                ko.utils.setTimeout(updateFromModel, 0);
	                return;
	            }

	            var valueHasChanged = (newValue !== elementValue);

	            if (valueHasChanged) {
	                if (ko.utils.tagNameLower(element) === "select") {
	                    var allowUnset = allBindings.get('valueAllowUnset');
	                    var applyValueAction = function () {
	                        ko.selectExtensions.writeValue(element, newValue, allowUnset);
	                    };
	                    applyValueAction();

	                    if (!allowUnset && newValue !== ko.selectExtensions.readValue(element)) {
	                        // If you try to set a model value that can't be represented in an already-populated dropdown, reject that change,
	                        // because you're not allowed to have a model value that disagrees with a visible UI selection.
	                        ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
	                    } else {
	                        // Workaround for IE6 bug: It won't reliably apply values to SELECT nodes during the same execution thread
	                        // right after you've changed the set of OPTION nodes on it. So for that node type, we'll schedule a second thread
	                        // to apply the value as well.
	                        ko.utils.setTimeout(applyValueAction, 0);
	                    }
	                } else {
	                    ko.selectExtensions.writeValue(element, newValue);
	                }
	            }
	        };

	        ko.computed(updateFromModel, null, { disposeWhenNodeIsRemoved: element });
	    },
	    'update': function() {} // Keep for backwards compatibility with code that may have wrapped value binding
	};
	ko.expressionRewriting.twoWayBindings['value'] = true;
	ko.bindingHandlers['visible'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor());
	        var isCurrentlyVisible = !(element.style.display == "none");
	        if (value && !isCurrentlyVisible)
	            element.style.display = "";
	        else if ((!value) && isCurrentlyVisible)
	            element.style.display = "none";
	    }
	};
	// 'click' is just a shorthand for the usual full-length event:{click:handler}
	makeEventHandlerShortcut('click');
	// If you want to make a custom template engine,
	//
	// [1] Inherit from this class (like ko.nativeTemplateEngine does)
	// [2] Override 'renderTemplateSource', supplying a function with this signature:
	//
	//        function (templateSource, bindingContext, options) {
	//            // - templateSource.text() is the text of the template you should render
	//            // - bindingContext.$data is the data you should pass into the template
	//            //   - you might also want to make bindingContext.$parent, bindingContext.$parents,
	//            //     and bindingContext.$root available in the template too
	//            // - options gives you access to any other properties set on "data-bind: { template: options }"
	//            // - templateDocument is the document object of the template
	//            //
	//            // Return value: an array of DOM nodes
	//        }
	//
	// [3] Override 'createJavaScriptEvaluatorBlock', supplying a function with this signature:
	//
	//        function (script) {
	//            // Return value: Whatever syntax means "Evaluate the JavaScript statement 'script' and output the result"
	//            //               For example, the jquery.tmpl template engine converts 'someScript' to '${ someScript }'
	//        }
	//
	//     This is only necessary if you want to allow data-bind attributes to reference arbitrary template variables.
	//     If you don't want to allow that, you can set the property 'allowTemplateRewriting' to false (like ko.nativeTemplateEngine does)
	//     and then you don't need to override 'createJavaScriptEvaluatorBlock'.

	ko.templateEngine = function () { };

	ko.templateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
	    throw new Error("Override renderTemplateSource");
	};

	ko.templateEngine.prototype['createJavaScriptEvaluatorBlock'] = function (script) {
	    throw new Error("Override createJavaScriptEvaluatorBlock");
	};

	ko.templateEngine.prototype['makeTemplateSource'] = function(template, templateDocument) {
	    // Named template
	    if (typeof template == "string") {
	        templateDocument = templateDocument || document;
	        var elem = templateDocument.getElementById(template);
	        if (!elem)
	            throw new Error("Cannot find template with ID " + template);
	        return new ko.templateSources.domElement(elem);
	    } else if ((template.nodeType == 1) || (template.nodeType == 8)) {
	        // Anonymous template
	        return new ko.templateSources.anonymousTemplate(template);
	    } else
	        throw new Error("Unknown template type: " + template);
	};

	ko.templateEngine.prototype['renderTemplate'] = function (template, bindingContext, options, templateDocument) {
	    var templateSource = this['makeTemplateSource'](template, templateDocument);
	    return this['renderTemplateSource'](templateSource, bindingContext, options, templateDocument);
	};

	ko.templateEngine.prototype['isTemplateRewritten'] = function (template, templateDocument) {
	    // Skip rewriting if requested
	    if (this['allowTemplateRewriting'] === false)
	        return true;
	    return this['makeTemplateSource'](template, templateDocument)['data']("isRewritten");
	};

	ko.templateEngine.prototype['rewriteTemplate'] = function (template, rewriterCallback, templateDocument) {
	    var templateSource = this['makeTemplateSource'](template, templateDocument);
	    var rewritten = rewriterCallback(templateSource['text']());
	    templateSource['text'](rewritten);
	    templateSource['data']("isRewritten", true);
	};

	ko.exportSymbol('templateEngine', ko.templateEngine);

	ko.templateRewriting = (function () {
	    var memoizeDataBindingAttributeSyntaxRegex = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'|[^>]*))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi;
	    var memoizeVirtualContainerBindingSyntaxRegex = /<!--\s*ko\b\s*([\s\S]*?)\s*-->/g;

	    function validateDataBindValuesForRewriting(keyValueArray) {
	        var allValidators = ko.expressionRewriting.bindingRewriteValidators;
	        for (var i = 0; i < keyValueArray.length; i++) {
	            var key = keyValueArray[i]['key'];
	            if (allValidators.hasOwnProperty(key)) {
	                var validator = allValidators[key];

	                if (typeof validator === "function") {
	                    var possibleErrorMessage = validator(keyValueArray[i]['value']);
	                    if (possibleErrorMessage)
	                        throw new Error(possibleErrorMessage);
	                } else if (!validator) {
	                    throw new Error("This template engine does not support the '" + key + "' binding within its templates");
	                }
	            }
	        }
	    }

	    function constructMemoizedTagReplacement(dataBindAttributeValue, tagToRetain, nodeName, templateEngine) {
	        var dataBindKeyValueArray = ko.expressionRewriting.parseObjectLiteral(dataBindAttributeValue);
	        validateDataBindValuesForRewriting(dataBindKeyValueArray);
	        var rewrittenDataBindAttributeValue = ko.expressionRewriting.preProcessBindings(dataBindKeyValueArray, {'valueAccessors':true});

	        // For no obvious reason, Opera fails to evaluate rewrittenDataBindAttributeValue unless it's wrapped in an additional
	        // anonymous function, even though Opera's built-in debugger can evaluate it anyway. No other browser requires this
	        // extra indirection.
	        var applyBindingsToNextSiblingScript =
	            "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + rewrittenDataBindAttributeValue + " } })()},'" + nodeName.toLowerCase() + "')";
	        return templateEngine['createJavaScriptEvaluatorBlock'](applyBindingsToNextSiblingScript) + tagToRetain;
	    }

	    return {
	        ensureTemplateIsRewritten: function (template, templateEngine, templateDocument) {
	            if (!templateEngine['isTemplateRewritten'](template, templateDocument))
	                templateEngine['rewriteTemplate'](template, function (htmlString) {
	                    return ko.templateRewriting.memoizeBindingAttributeSyntax(htmlString, templateEngine);
	                }, templateDocument);
	        },

	        memoizeBindingAttributeSyntax: function (htmlString, templateEngine) {
	            return htmlString.replace(memoizeDataBindingAttributeSyntaxRegex, function () {
	                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[4], /* tagToRetain: */ arguments[1], /* nodeName: */ arguments[2], templateEngine);
	            }).replace(memoizeVirtualContainerBindingSyntaxRegex, function() {
	                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[1], /* tagToRetain: */ "<!-- ko -->", /* nodeName: */ "#comment", templateEngine);
	            });
	        },

	        applyMemoizedBindingsToNextSibling: function (bindings, nodeName) {
	            return ko.memoization.memoize(function (domNode, bindingContext) {
	                var nodeToBind = domNode.nextSibling;
	                if (nodeToBind && nodeToBind.nodeName.toLowerCase() === nodeName) {
	                    ko.applyBindingAccessorsToNode(nodeToBind, bindings, bindingContext);
	                }
	            });
	        }
	    }
	})();


	// Exported only because it has to be referenced by string lookup from within rewritten template
	ko.exportSymbol('__tr_ambtns', ko.templateRewriting.applyMemoizedBindingsToNextSibling);
	(function() {
	    // A template source represents a read/write way of accessing a template. This is to eliminate the need for template loading/saving
	    // logic to be duplicated in every template engine (and means they can all work with anonymous templates, etc.)
	    //
	    // Two are provided by default:
	    //  1. ko.templateSources.domElement       - reads/writes the text content of an arbitrary DOM element
	    //  2. ko.templateSources.anonymousElement - uses ko.utils.domData to read/write text *associated* with the DOM element, but
	    //                                           without reading/writing the actual element text content, since it will be overwritten
	    //                                           with the rendered template output.
	    // You can implement your own template source if you want to fetch/store templates somewhere other than in DOM elements.
	    // Template sources need to have the following functions:
	    //   text() 			- returns the template text from your storage location
	    //   text(value)		- writes the supplied template text to your storage location
	    //   data(key)			- reads values stored using data(key, value) - see below
	    //   data(key, value)	- associates "value" with this template and the key "key". Is used to store information like "isRewritten".
	    //
	    // Optionally, template sources can also have the following functions:
	    //   nodes()            - returns a DOM element containing the nodes of this template, where available
	    //   nodes(value)       - writes the given DOM element to your storage location
	    // If a DOM element is available for a given template source, template engines are encouraged to use it in preference over text()
	    // for improved speed. However, all templateSources must supply text() even if they don't supply nodes().
	    //
	    // Once you've implemented a templateSource, make your template engine use it by subclassing whatever template engine you were
	    // using and overriding "makeTemplateSource" to return an instance of your custom template source.

	    ko.templateSources = {};

	    // ---- ko.templateSources.domElement -----

	    // template types
	    var templateScript = 1,
	        templateTextArea = 2,
	        templateTemplate = 3,
	        templateElement = 4;

	    ko.templateSources.domElement = function(element) {
	        this.domElement = element;

	        if (element) {
	            var tagNameLower = ko.utils.tagNameLower(element);
	            this.templateType =
	                tagNameLower === "script" ? templateScript :
	                tagNameLower === "textarea" ? templateTextArea :
	                    // For browsers with proper <template> element support, where the .content property gives a document fragment
	                tagNameLower == "template" && element.content && element.content.nodeType === 11 ? templateTemplate :
	                templateElement;
	        }
	    }

	    ko.templateSources.domElement.prototype['text'] = function(/* valueToWrite */) {
	        var elemContentsProperty = this.templateType === templateScript ? "text"
	                                 : this.templateType === templateTextArea ? "value"
	                                 : "innerHTML";

	        if (arguments.length == 0) {
	            return this.domElement[elemContentsProperty];
	        } else {
	            var valueToWrite = arguments[0];
	            if (elemContentsProperty === "innerHTML")
	                ko.utils.setHtml(this.domElement, valueToWrite);
	            else
	                this.domElement[elemContentsProperty] = valueToWrite;
	        }
	    };

	    var dataDomDataPrefix = ko.utils.domData.nextKey() + "_";
	    ko.templateSources.domElement.prototype['data'] = function(key /*, valueToWrite */) {
	        if (arguments.length === 1) {
	            return ko.utils.domData.get(this.domElement, dataDomDataPrefix + key);
	        } else {
	            ko.utils.domData.set(this.domElement, dataDomDataPrefix + key, arguments[1]);
	        }
	    };

	    var templatesDomDataKey = ko.utils.domData.nextKey();
	    function getTemplateDomData(element) {
	        return ko.utils.domData.get(element, templatesDomDataKey) || {};
	    }
	    function setTemplateDomData(element, data) {
	        ko.utils.domData.set(element, templatesDomDataKey, data);
	    }

	    ko.templateSources.domElement.prototype['nodes'] = function(/* valueToWrite */) {
	        var element = this.domElement;
	        if (arguments.length == 0) {
	            var templateData = getTemplateDomData(element),
	                containerData = templateData.containerData;
	            return containerData || (
	                this.templateType === templateTemplate ? element.content :
	                this.templateType === templateElement ? element :
	                undefined);
	        } else {
	            var valueToWrite = arguments[0];
	            setTemplateDomData(element, {containerData: valueToWrite});
	        }
	    };

	    // ---- ko.templateSources.anonymousTemplate -----
	    // Anonymous templates are normally saved/retrieved as DOM nodes through "nodes".
	    // For compatibility, you can also read "text"; it will be serialized from the nodes on demand.
	    // Writing to "text" is still supported, but then the template data will not be available as DOM nodes.

	    ko.templateSources.anonymousTemplate = function(element) {
	        this.domElement = element;
	    }
	    ko.templateSources.anonymousTemplate.prototype = new ko.templateSources.domElement();
	    ko.templateSources.anonymousTemplate.prototype.constructor = ko.templateSources.anonymousTemplate;
	    ko.templateSources.anonymousTemplate.prototype['text'] = function(/* valueToWrite */) {
	        if (arguments.length == 0) {
	            var templateData = getTemplateDomData(this.domElement);
	            if (templateData.textData === undefined && templateData.containerData)
	                templateData.textData = templateData.containerData.innerHTML;
	            return templateData.textData;
	        } else {
	            var valueToWrite = arguments[0];
	            setTemplateDomData(this.domElement, {textData: valueToWrite});
	        }
	    };

	    ko.exportSymbol('templateSources', ko.templateSources);
	    ko.exportSymbol('templateSources.domElement', ko.templateSources.domElement);
	    ko.exportSymbol('templateSources.anonymousTemplate', ko.templateSources.anonymousTemplate);
	})();
	(function () {
	    var _templateEngine;
	    ko.setTemplateEngine = function (templateEngine) {
	        if ((templateEngine != undefined) && !(templateEngine instanceof ko.templateEngine))
	            throw new Error("templateEngine must inherit from ko.templateEngine");
	        _templateEngine = templateEngine;
	    }

	    function invokeForEachNodeInContinuousRange(firstNode, lastNode, action) {
	        var node, nextInQueue = firstNode, firstOutOfRangeNode = ko.virtualElements.nextSibling(lastNode);
	        while (nextInQueue && ((node = nextInQueue) !== firstOutOfRangeNode)) {
	            nextInQueue = ko.virtualElements.nextSibling(node);
	            action(node, nextInQueue);
	        }
	    }

	    function activateBindingsOnContinuousNodeArray(continuousNodeArray, bindingContext) {
	        // To be used on any nodes that have been rendered by a template and have been inserted into some parent element
	        // Walks through continuousNodeArray (which *must* be continuous, i.e., an uninterrupted sequence of sibling nodes, because
	        // the algorithm for walking them relies on this), and for each top-level item in the virtual-element sense,
	        // (1) Does a regular "applyBindings" to associate bindingContext with this node and to activate any non-memoized bindings
	        // (2) Unmemoizes any memos in the DOM subtree (e.g., to activate bindings that had been memoized during template rewriting)

	        if (continuousNodeArray.length) {
	            var firstNode = continuousNodeArray[0],
	                lastNode = continuousNodeArray[continuousNodeArray.length - 1],
	                parentNode = firstNode.parentNode,
	                provider = ko.bindingProvider['instance'],
	                preprocessNode = provider['preprocessNode'];

	            if (preprocessNode) {
	                invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node, nextNodeInRange) {
	                    var nodePreviousSibling = node.previousSibling;
	                    var newNodes = preprocessNode.call(provider, node);
	                    if (newNodes) {
	                        if (node === firstNode)
	                            firstNode = newNodes[0] || nextNodeInRange;
	                        if (node === lastNode)
	                            lastNode = newNodes[newNodes.length - 1] || nodePreviousSibling;
	                    }
	                });

	                // Because preprocessNode can change the nodes, including the first and last nodes, update continuousNodeArray to match.
	                // We need the full set, including inner nodes, because the unmemoize step might remove the first node (and so the real
	                // first node needs to be in the array).
	                continuousNodeArray.length = 0;
	                if (!firstNode) { // preprocessNode might have removed all the nodes, in which case there's nothing left to do
	                    return;
	                }
	                if (firstNode === lastNode) {
	                    continuousNodeArray.push(firstNode);
	                } else {
	                    continuousNodeArray.push(firstNode, lastNode);
	                    ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
	                }
	            }

	            // Need to applyBindings *before* unmemoziation, because unmemoization might introduce extra nodes (that we don't want to re-bind)
	            // whereas a regular applyBindings won't introduce new memoized nodes
	            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
	                if (node.nodeType === 1 || node.nodeType === 8)
	                    ko.applyBindings(bindingContext, node);
	            });
	            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
	                if (node.nodeType === 1 || node.nodeType === 8)
	                    ko.memoization.unmemoizeDomNodeAndDescendants(node, [bindingContext]);
	            });

	            // Make sure any changes done by applyBindings or unmemoize are reflected in the array
	            ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
	        }
	    }

	    function getFirstNodeFromPossibleArray(nodeOrNodeArray) {
	        return nodeOrNodeArray.nodeType ? nodeOrNodeArray
	                                        : nodeOrNodeArray.length > 0 ? nodeOrNodeArray[0]
	                                        : null;
	    }

	    function executeTemplate(targetNodeOrNodeArray, renderMode, template, bindingContext, options) {
	        options = options || {};
	        var firstTargetNode = targetNodeOrNodeArray && getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
	        var templateDocument = (firstTargetNode || template || {}).ownerDocument;
	        var templateEngineToUse = (options['templateEngine'] || _templateEngine);
	        ko.templateRewriting.ensureTemplateIsRewritten(template, templateEngineToUse, templateDocument);
	        var renderedNodesArray = templateEngineToUse['renderTemplate'](template, bindingContext, options, templateDocument);

	        // Loosely check result is an array of DOM nodes
	        if ((typeof renderedNodesArray.length != "number") || (renderedNodesArray.length > 0 && typeof renderedNodesArray[0].nodeType != "number"))
	            throw new Error("Template engine must return an array of DOM nodes");

	        var haveAddedNodesToParent = false;
	        switch (renderMode) {
	            case "replaceChildren":
	                ko.virtualElements.setDomNodeChildren(targetNodeOrNodeArray, renderedNodesArray);
	                haveAddedNodesToParent = true;
	                break;
	            case "replaceNode":
	                ko.utils.replaceDomNodes(targetNodeOrNodeArray, renderedNodesArray);
	                haveAddedNodesToParent = true;
	                break;
	            case "ignoreTargetNode": break;
	            default:
	                throw new Error("Unknown renderMode: " + renderMode);
	        }

	        if (haveAddedNodesToParent) {
	            activateBindingsOnContinuousNodeArray(renderedNodesArray, bindingContext);
	            if (options['afterRender'])
	                ko.dependencyDetection.ignore(options['afterRender'], null, [renderedNodesArray, bindingContext['$data']]);
	        }

	        return renderedNodesArray;
	    }

	    function resolveTemplateName(template, data, context) {
	        // The template can be specified as:
	        if (ko.isObservable(template)) {
	            // 1. An observable, with string value
	            return template();
	        } else if (typeof template === 'function') {
	            // 2. A function of (data, context) returning a string
	            return template(data, context);
	        } else {
	            // 3. A string
	            return template;
	        }
	    }

	    ko.renderTemplate = function (template, dataOrBindingContext, options, targetNodeOrNodeArray, renderMode) {
	        options = options || {};
	        if ((options['templateEngine'] || _templateEngine) == undefined)
	            throw new Error("Set a template engine before calling renderTemplate");
	        renderMode = renderMode || "replaceChildren";

	        if (targetNodeOrNodeArray) {
	            var firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);

	            var whenToDispose = function () { return (!firstTargetNode) || !ko.utils.domNodeIsAttachedToDocument(firstTargetNode); }; // Passive disposal (on next evaluation)
	            var activelyDisposeWhenNodeIsRemoved = (firstTargetNode && renderMode == "replaceNode") ? firstTargetNode.parentNode : firstTargetNode;

	            return ko.dependentObservable( // So the DOM is automatically updated when any dependency changes
	                function () {
	                    // Ensure we've got a proper binding context to work with
	                    var bindingContext = (dataOrBindingContext && (dataOrBindingContext instanceof ko.bindingContext))
	                        ? dataOrBindingContext
	                        : new ko.bindingContext(ko.utils.unwrapObservable(dataOrBindingContext));

	                    var templateName = resolveTemplateName(template, bindingContext['$data'], bindingContext),
	                        renderedNodesArray = executeTemplate(targetNodeOrNodeArray, renderMode, templateName, bindingContext, options);

	                    if (renderMode == "replaceNode") {
	                        targetNodeOrNodeArray = renderedNodesArray;
	                        firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
	                    }
	                },
	                null,
	                { disposeWhen: whenToDispose, disposeWhenNodeIsRemoved: activelyDisposeWhenNodeIsRemoved }
	            );
	        } else {
	            // We don't yet have a DOM node to evaluate, so use a memo and render the template later when there is a DOM node
	            return ko.memoization.memoize(function (domNode) {
	                ko.renderTemplate(template, dataOrBindingContext, options, domNode, "replaceNode");
	            });
	        }
	    };

	    ko.renderTemplateForEach = function (template, arrayOrObservableArray, options, targetNode, parentBindingContext) {
	        // Since setDomNodeChildrenFromArrayMapping always calls executeTemplateForArrayItem and then
	        // activateBindingsCallback for added items, we can store the binding context in the former to use in the latter.
	        var arrayItemContext;

	        // This will be called by setDomNodeChildrenFromArrayMapping to get the nodes to add to targetNode
	        var executeTemplateForArrayItem = function (arrayValue, index) {
	            // Support selecting template as a function of the data being rendered
	            arrayItemContext = parentBindingContext['createChildContext'](arrayValue, options['as'], function(context) {
	                context['$index'] = index;
	            });

	            var templateName = resolveTemplateName(template, arrayValue, arrayItemContext);
	            return executeTemplate(null, "ignoreTargetNode", templateName, arrayItemContext, options);
	        }

	        // This will be called whenever setDomNodeChildrenFromArrayMapping has added nodes to targetNode
	        var activateBindingsCallback = function(arrayValue, addedNodesArray, index) {
	            activateBindingsOnContinuousNodeArray(addedNodesArray, arrayItemContext);
	            if (options['afterRender'])
	                options['afterRender'](addedNodesArray, arrayValue);

	            // release the "cache" variable, so that it can be collected by
	            // the GC when its value isn't used from within the bindings anymore.
	            arrayItemContext = null;
	        };

	        return ko.dependentObservable(function () {
	            var unwrappedArray = ko.utils.unwrapObservable(arrayOrObservableArray) || [];
	            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
	                unwrappedArray = [unwrappedArray];

	            // Filter out any entries marked as destroyed
	            var filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
	                return options['includeDestroyed'] || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
	            });

	            // Call setDomNodeChildrenFromArrayMapping, ignoring any observables unwrapped within (most likely from a callback function).
	            // If the array items are observables, though, they will be unwrapped in executeTemplateForArrayItem and managed within setDomNodeChildrenFromArrayMapping.
	            ko.dependencyDetection.ignore(ko.utils.setDomNodeChildrenFromArrayMapping, null, [targetNode, filteredArray, executeTemplateForArrayItem, options, activateBindingsCallback]);

	        }, null, { disposeWhenNodeIsRemoved: targetNode });
	    };

	    var templateComputedDomDataKey = ko.utils.domData.nextKey();
	    function disposeOldComputedAndStoreNewOne(element, newComputed) {
	        var oldComputed = ko.utils.domData.get(element, templateComputedDomDataKey);
	        if (oldComputed && (typeof(oldComputed.dispose) == 'function'))
	            oldComputed.dispose();
	        ko.utils.domData.set(element, templateComputedDomDataKey, (newComputed && newComputed.isActive()) ? newComputed : undefined);
	    }

	    ko.bindingHandlers['template'] = {
	        'init': function(element, valueAccessor) {
	            // Support anonymous templates
	            var bindingValue = ko.utils.unwrapObservable(valueAccessor());
	            if (typeof bindingValue == "string" || bindingValue['name']) {
	                // It's a named template - clear the element
	                ko.virtualElements.emptyNode(element);
	            } else if ('nodes' in bindingValue) {
	                // We've been given an array of DOM nodes. Save them as the template source.
	                // There is no known use case for the node array being an observable array (if the output
	                // varies, put that behavior *into* your template - that's what templates are for), and
	                // the implementation would be a mess, so assert that it's not observable.
	                var nodes = bindingValue['nodes'] || [];
	                if (ko.isObservable(nodes)) {
	                    throw new Error('The "nodes" option must be a plain, non-observable array.');
	                }
	                var container = ko.utils.moveCleanedNodesToContainerElement(nodes); // This also removes the nodes from their current parent
	                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
	            } else {
	                // It's an anonymous template - store the element contents, then clear the element
	                var templateNodes = ko.virtualElements.childNodes(element),
	                    container = ko.utils.moveCleanedNodesToContainerElement(templateNodes); // This also removes the nodes from their current parent
	                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
	            }
	            return { 'controlsDescendantBindings': true };
	        },
	        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	            var value = valueAccessor(),
	                dataValue,
	                options = ko.utils.unwrapObservable(value),
	                shouldDisplay = true,
	                templateComputed = null,
	                templateName;

	            if (typeof options == "string") {
	                templateName = value;
	                options = {};
	            } else {
	                templateName = options['name'];

	                // Support "if"/"ifnot" conditions
	                if ('if' in options)
	                    shouldDisplay = ko.utils.unwrapObservable(options['if']);
	                if (shouldDisplay && 'ifnot' in options)
	                    shouldDisplay = !ko.utils.unwrapObservable(options['ifnot']);

	                dataValue = ko.utils.unwrapObservable(options['data']);
	            }

	            if ('foreach' in options) {
	                // Render once for each data point (treating data set as empty if shouldDisplay==false)
	                var dataArray = (shouldDisplay && options['foreach']) || [];
	                templateComputed = ko.renderTemplateForEach(templateName || element, dataArray, options, element, bindingContext);
	            } else if (!shouldDisplay) {
	                ko.virtualElements.emptyNode(element);
	            } else {
	                // Render once for this single data point (or use the viewModel if no data was provided)
	                var innerBindingContext = ('data' in options) ?
	                    bindingContext['createChildContext'](dataValue, options['as']) :  // Given an explitit 'data' value, we create a child binding context for it
	                    bindingContext;                                                        // Given no explicit 'data' value, we retain the same binding context
	                templateComputed = ko.renderTemplate(templateName || element, innerBindingContext, options, element);
	            }

	            // It only makes sense to have a single template computed per element (otherwise which one should have its output displayed?)
	            disposeOldComputedAndStoreNewOne(element, templateComputed);
	        }
	    };

	    // Anonymous templates can't be rewritten. Give a nice error message if you try to do it.
	    ko.expressionRewriting.bindingRewriteValidators['template'] = function(bindingValue) {
	        var parsedBindingValue = ko.expressionRewriting.parseObjectLiteral(bindingValue);

	        if ((parsedBindingValue.length == 1) && parsedBindingValue[0]['unknown'])
	            return null; // It looks like a string literal, not an object literal, so treat it as a named template (which is allowed for rewriting)

	        if (ko.expressionRewriting.keyValueArrayContainsKey(parsedBindingValue, "name"))
	            return null; // Named templates can be rewritten, so return "no error"
	        return "This template engine does not support anonymous templates nested within its templates";
	    };

	    ko.virtualElements.allowedBindings['template'] = true;
	})();

	ko.exportSymbol('setTemplateEngine', ko.setTemplateEngine);
	ko.exportSymbol('renderTemplate', ko.renderTemplate);
	// Go through the items that have been added and deleted and try to find matches between them.
	ko.utils.findMovesInArrayComparison = function (left, right, limitFailedCompares) {
	    if (left.length && right.length) {
	        var failedCompares, l, r, leftItem, rightItem;
	        for (failedCompares = l = 0; (!limitFailedCompares || failedCompares < limitFailedCompares) && (leftItem = left[l]); ++l) {
	            for (r = 0; rightItem = right[r]; ++r) {
	                if (leftItem['value'] === rightItem['value']) {
	                    leftItem['moved'] = rightItem['index'];
	                    rightItem['moved'] = leftItem['index'];
	                    right.splice(r, 1);         // This item is marked as moved; so remove it from right list
	                    failedCompares = r = 0;     // Reset failed compares count because we're checking for consecutive failures
	                    break;
	                }
	            }
	            failedCompares += r;
	        }
	    }
	};

	ko.utils.compareArrays = (function () {
	    var statusNotInOld = 'added', statusNotInNew = 'deleted';

	    // Simple calculation based on Levenshtein distance.
	    function compareArrays(oldArray, newArray, options) {
	        // For backward compatibility, if the third arg is actually a bool, interpret
	        // it as the old parameter 'dontLimitMoves'. Newer code should use { dontLimitMoves: true }.
	        options = (typeof options === 'boolean') ? { 'dontLimitMoves': options } : (options || {});
	        oldArray = oldArray || [];
	        newArray = newArray || [];

	        if (oldArray.length < newArray.length)
	            return compareSmallArrayToBigArray(oldArray, newArray, statusNotInOld, statusNotInNew, options);
	        else
	            return compareSmallArrayToBigArray(newArray, oldArray, statusNotInNew, statusNotInOld, options);
	    }

	    function compareSmallArrayToBigArray(smlArray, bigArray, statusNotInSml, statusNotInBig, options) {
	        var myMin = Math.min,
	            myMax = Math.max,
	            editDistanceMatrix = [],
	            smlIndex, smlIndexMax = smlArray.length,
	            bigIndex, bigIndexMax = bigArray.length,
	            compareRange = (bigIndexMax - smlIndexMax) || 1,
	            maxDistance = smlIndexMax + bigIndexMax + 1,
	            thisRow, lastRow,
	            bigIndexMaxForRow, bigIndexMinForRow;

	        for (smlIndex = 0; smlIndex <= smlIndexMax; smlIndex++) {
	            lastRow = thisRow;
	            editDistanceMatrix.push(thisRow = []);
	            bigIndexMaxForRow = myMin(bigIndexMax, smlIndex + compareRange);
	            bigIndexMinForRow = myMax(0, smlIndex - 1);
	            for (bigIndex = bigIndexMinForRow; bigIndex <= bigIndexMaxForRow; bigIndex++) {
	                if (!bigIndex)
	                    thisRow[bigIndex] = smlIndex + 1;
	                else if (!smlIndex)  // Top row - transform empty array into new array via additions
	                    thisRow[bigIndex] = bigIndex + 1;
	                else if (smlArray[smlIndex - 1] === bigArray[bigIndex - 1])
	                    thisRow[bigIndex] = lastRow[bigIndex - 1];                  // copy value (no edit)
	                else {
	                    var northDistance = lastRow[bigIndex] || maxDistance;       // not in big (deletion)
	                    var westDistance = thisRow[bigIndex - 1] || maxDistance;    // not in small (addition)
	                    thisRow[bigIndex] = myMin(northDistance, westDistance) + 1;
	                }
	            }
	        }

	        var editScript = [], meMinusOne, notInSml = [], notInBig = [];
	        for (smlIndex = smlIndexMax, bigIndex = bigIndexMax; smlIndex || bigIndex;) {
	            meMinusOne = editDistanceMatrix[smlIndex][bigIndex] - 1;
	            if (bigIndex && meMinusOne === editDistanceMatrix[smlIndex][bigIndex-1]) {
	                notInSml.push(editScript[editScript.length] = {     // added
	                    'status': statusNotInSml,
	                    'value': bigArray[--bigIndex],
	                    'index': bigIndex });
	            } else if (smlIndex && meMinusOne === editDistanceMatrix[smlIndex - 1][bigIndex]) {
	                notInBig.push(editScript[editScript.length] = {     // deleted
	                    'status': statusNotInBig,
	                    'value': smlArray[--smlIndex],
	                    'index': smlIndex });
	            } else {
	                --bigIndex;
	                --smlIndex;
	                if (!options['sparse']) {
	                    editScript.push({
	                        'status': "retained",
	                        'value': bigArray[bigIndex] });
	                }
	            }
	        }

	        // Set a limit on the number of consecutive non-matching comparisons; having it a multiple of
	        // smlIndexMax keeps the time complexity of this algorithm linear.
	        ko.utils.findMovesInArrayComparison(notInBig, notInSml, !options['dontLimitMoves'] && smlIndexMax * 10);

	        return editScript.reverse();
	    }

	    return compareArrays;
	})();

	ko.exportSymbol('utils.compareArrays', ko.utils.compareArrays);
	(function () {
	    // Objective:
	    // * Given an input array, a container DOM node, and a function from array elements to arrays of DOM nodes,
	    //   map the array elements to arrays of DOM nodes, concatenate together all these arrays, and use them to populate the container DOM node
	    // * Next time we're given the same combination of things (with the array possibly having mutated), update the container DOM node
	    //   so that its children is again the concatenation of the mappings of the array elements, but don't re-map any array elements that we
	    //   previously mapped - retain those nodes, and just insert/delete other ones

	    // "callbackAfterAddingNodes" will be invoked after any "mapping"-generated nodes are inserted into the container node
	    // You can use this, for example, to activate bindings on those nodes.

	    function mapNodeAndRefreshWhenChanged(containerNode, mapping, valueToMap, callbackAfterAddingNodes, index) {
	        // Map this array value inside a dependentObservable so we re-map when any dependency changes
	        var mappedNodes = [];
	        var dependentObservable = ko.dependentObservable(function() {
	            var newMappedNodes = mapping(valueToMap, index, ko.utils.fixUpContinuousNodeArray(mappedNodes, containerNode)) || [];

	            // On subsequent evaluations, just replace the previously-inserted DOM nodes
	            if (mappedNodes.length > 0) {
	                ko.utils.replaceDomNodes(mappedNodes, newMappedNodes);
	                if (callbackAfterAddingNodes)
	                    ko.dependencyDetection.ignore(callbackAfterAddingNodes, null, [valueToMap, newMappedNodes, index]);
	            }

	            // Replace the contents of the mappedNodes array, thereby updating the record
	            // of which nodes would be deleted if valueToMap was itself later removed
	            mappedNodes.length = 0;
	            ko.utils.arrayPushAll(mappedNodes, newMappedNodes);
	        }, null, { disposeWhenNodeIsRemoved: containerNode, disposeWhen: function() { return !ko.utils.anyDomNodeIsAttachedToDocument(mappedNodes); } });
	        return { mappedNodes : mappedNodes, dependentObservable : (dependentObservable.isActive() ? dependentObservable : undefined) };
	    }

	    var lastMappingResultDomDataKey = ko.utils.domData.nextKey(),
	        deletedItemDummyValue = ko.utils.domData.nextKey();

	    ko.utils.setDomNodeChildrenFromArrayMapping = function (domNode, array, mapping, options, callbackAfterAddingNodes) {
	        // Compare the provided array against the previous one
	        array = array || [];
	        options = options || {};
	        var isFirstExecution = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) === undefined;
	        var lastMappingResult = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) || [];
	        var lastArray = ko.utils.arrayMap(lastMappingResult, function (x) { return x.arrayEntry; });
	        var editScript = ko.utils.compareArrays(lastArray, array, options['dontLimitMoves']);

	        // Build the new mapping result
	        var newMappingResult = [];
	        var lastMappingResultIndex = 0;
	        var newMappingResultIndex = 0;

	        var nodesToDelete = [];
	        var itemsToProcess = [];
	        var itemsForBeforeRemoveCallbacks = [];
	        var itemsForMoveCallbacks = [];
	        var itemsForAfterAddCallbacks = [];
	        var mapData;

	        function itemMovedOrRetained(editScriptIndex, oldPosition) {
	            mapData = lastMappingResult[oldPosition];
	            if (newMappingResultIndex !== oldPosition)
	                itemsForMoveCallbacks[editScriptIndex] = mapData;
	            // Since updating the index might change the nodes, do so before calling fixUpContinuousNodeArray
	            mapData.indexObservable(newMappingResultIndex++);
	            ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode);
	            newMappingResult.push(mapData);
	            itemsToProcess.push(mapData);
	        }

	        function callCallback(callback, items) {
	            if (callback) {
	                for (var i = 0, n = items.length; i < n; i++) {
	                    if (items[i]) {
	                        ko.utils.arrayForEach(items[i].mappedNodes, function(node) {
	                            callback(node, i, items[i].arrayEntry);
	                        });
	                    }
	                }
	            }
	        }

	        for (var i = 0, editScriptItem, movedIndex; editScriptItem = editScript[i]; i++) {
	            movedIndex = editScriptItem['moved'];
	            switch (editScriptItem['status']) {
	                case "deleted":
	                    if (movedIndex === undefined) {
	                        mapData = lastMappingResult[lastMappingResultIndex];

	                        // Stop tracking changes to the mapping for these nodes
	                        if (mapData.dependentObservable) {
	                            mapData.dependentObservable.dispose();
	                            mapData.dependentObservable = undefined;
	                        }

	                        // Queue these nodes for later removal
	                        if (ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode).length) {
	                            if (options['beforeRemove']) {
	                                newMappingResult.push(mapData);
	                                itemsToProcess.push(mapData);
	                                if (mapData.arrayEntry === deletedItemDummyValue) {
	                                    mapData = null;
	                                } else {
	                                    itemsForBeforeRemoveCallbacks[i] = mapData;
	                                }
	                            }
	                            if (mapData) {
	                                nodesToDelete.push.apply(nodesToDelete, mapData.mappedNodes);
	                            }
	                        }
	                    }
	                    lastMappingResultIndex++;
	                    break;

	                case "retained":
	                    itemMovedOrRetained(i, lastMappingResultIndex++);
	                    break;

	                case "added":
	                    if (movedIndex !== undefined) {
	                        itemMovedOrRetained(i, movedIndex);
	                    } else {
	                        mapData = { arrayEntry: editScriptItem['value'], indexObservable: ko.observable(newMappingResultIndex++) };
	                        newMappingResult.push(mapData);
	                        itemsToProcess.push(mapData);
	                        if (!isFirstExecution)
	                            itemsForAfterAddCallbacks[i] = mapData;
	                    }
	                    break;
	            }
	        }

	        // Store a copy of the array items we just considered so we can difference it next time
	        ko.utils.domData.set(domNode, lastMappingResultDomDataKey, newMappingResult);

	        // Call beforeMove first before any changes have been made to the DOM
	        callCallback(options['beforeMove'], itemsForMoveCallbacks);

	        // Next remove nodes for deleted items (or just clean if there's a beforeRemove callback)
	        ko.utils.arrayForEach(nodesToDelete, options['beforeRemove'] ? ko.cleanNode : ko.removeNode);

	        // Next add/reorder the remaining items (will include deleted items if there's a beforeRemove callback)
	        for (var i = 0, nextNode = ko.virtualElements.firstChild(domNode), lastNode, node; mapData = itemsToProcess[i]; i++) {
	            // Get nodes for newly added items
	            if (!mapData.mappedNodes)
	                ko.utils.extend(mapData, mapNodeAndRefreshWhenChanged(domNode, mapping, mapData.arrayEntry, callbackAfterAddingNodes, mapData.indexObservable));

	            // Put nodes in the right place if they aren't there already
	            for (var j = 0; node = mapData.mappedNodes[j]; nextNode = node.nextSibling, lastNode = node, j++) {
	                if (node !== nextNode)
	                    ko.virtualElements.insertAfter(domNode, node, lastNode);
	            }

	            // Run the callbacks for newly added nodes (for example, to apply bindings, etc.)
	            if (!mapData.initialized && callbackAfterAddingNodes) {
	                callbackAfterAddingNodes(mapData.arrayEntry, mapData.mappedNodes, mapData.indexObservable);
	                mapData.initialized = true;
	            }
	        }

	        // If there's a beforeRemove callback, call it after reordering.
	        // Note that we assume that the beforeRemove callback will usually be used to remove the nodes using
	        // some sort of animation, which is why we first reorder the nodes that will be removed. If the
	        // callback instead removes the nodes right away, it would be more efficient to skip reordering them.
	        // Perhaps we'll make that change in the future if this scenario becomes more common.
	        callCallback(options['beforeRemove'], itemsForBeforeRemoveCallbacks);

	        // Replace the stored values of deleted items with a dummy value. This provides two benefits: it marks this item
	        // as already "removed" so we won't call beforeRemove for it again, and it ensures that the item won't match up
	        // with an actual item in the array and appear as "retained" or "moved".
	        for (i = 0; i < itemsForBeforeRemoveCallbacks.length; ++i) {
	            if (itemsForBeforeRemoveCallbacks[i]) {
	                itemsForBeforeRemoveCallbacks[i].arrayEntry = deletedItemDummyValue;
	            }
	        }

	        // Finally call afterMove and afterAdd callbacks
	        callCallback(options['afterMove'], itemsForMoveCallbacks);
	        callCallback(options['afterAdd'], itemsForAfterAddCallbacks);
	    }
	})();

	ko.exportSymbol('utils.setDomNodeChildrenFromArrayMapping', ko.utils.setDomNodeChildrenFromArrayMapping);
	ko.nativeTemplateEngine = function () {
	    this['allowTemplateRewriting'] = false;
	}

	ko.nativeTemplateEngine.prototype = new ko.templateEngine();
	ko.nativeTemplateEngine.prototype.constructor = ko.nativeTemplateEngine;
	ko.nativeTemplateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
	    var useNodesIfAvailable = !(ko.utils.ieVersion < 9), // IE<9 cloneNode doesn't work properly
	        templateNodesFunc = useNodesIfAvailable ? templateSource['nodes'] : null,
	        templateNodes = templateNodesFunc ? templateSource['nodes']() : null;

	    if (templateNodes) {
	        return ko.utils.makeArray(templateNodes.cloneNode(true).childNodes);
	    } else {
	        var templateText = templateSource['text']();
	        return ko.utils.parseHtmlFragment(templateText, templateDocument);
	    }
	};

	ko.nativeTemplateEngine.instance = new ko.nativeTemplateEngine();
	ko.setTemplateEngine(ko.nativeTemplateEngine.instance);

	ko.exportSymbol('nativeTemplateEngine', ko.nativeTemplateEngine);
	(function() {
	    ko.jqueryTmplTemplateEngine = function () {
	        // Detect which version of jquery-tmpl you're using. Unfortunately jquery-tmpl
	        // doesn't expose a version number, so we have to infer it.
	        // Note that as of Knockout 1.3, we only support jQuery.tmpl 1.0.0pre and later,
	        // which KO internally refers to as version "2", so older versions are no longer detected.
	        var jQueryTmplVersion = this.jQueryTmplVersion = (function() {
	            if (!jQueryInstance || !(jQueryInstance['tmpl']))
	                return 0;
	            // Since it exposes no official version number, we use our own numbering system. To be updated as jquery-tmpl evolves.
	            try {
	                if (jQueryInstance['tmpl']['tag']['tmpl']['open'].toString().indexOf('__') >= 0) {
	                    // Since 1.0.0pre, custom tags should append markup to an array called "__"
	                    return 2; // Final version of jquery.tmpl
	                }
	            } catch(ex) { /* Apparently not the version we were looking for */ }

	            return 1; // Any older version that we don't support
	        })();

	        function ensureHasReferencedJQueryTemplates() {
	            if (jQueryTmplVersion < 2)
	                throw new Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
	        }

	        function executeTemplate(compiledTemplate, data, jQueryTemplateOptions) {
	            return jQueryInstance['tmpl'](compiledTemplate, data, jQueryTemplateOptions);
	        }

	        this['renderTemplateSource'] = function(templateSource, bindingContext, options, templateDocument) {
	            templateDocument = templateDocument || document;
	            options = options || {};
	            ensureHasReferencedJQueryTemplates();

	            // Ensure we have stored a precompiled version of this template (don't want to reparse on every render)
	            var precompiled = templateSource['data']('precompiled');
	            if (!precompiled) {
	                var templateText = templateSource['text']() || "";
	                // Wrap in "with($whatever.koBindingContext) { ... }"
	                templateText = "{{ko_with $item.koBindingContext}}" + templateText + "{{/ko_with}}";

	                precompiled = jQueryInstance['template'](null, templateText);
	                templateSource['data']('precompiled', precompiled);
	            }

	            var data = [bindingContext['$data']]; // Prewrap the data in an array to stop jquery.tmpl from trying to unwrap any arrays
	            var jQueryTemplateOptions = jQueryInstance['extend']({ 'koBindingContext': bindingContext }, options['templateOptions']);

	            var resultNodes = executeTemplate(precompiled, data, jQueryTemplateOptions);
	            resultNodes['appendTo'](templateDocument.createElement("div")); // Using "appendTo" forces jQuery/jQuery.tmpl to perform necessary cleanup work

	            jQueryInstance['fragments'] = {}; // Clear jQuery's fragment cache to avoid a memory leak after a large number of template renders
	            return resultNodes;
	        };

	        this['createJavaScriptEvaluatorBlock'] = function(script) {
	            return "{{ko_code ((function() { return " + script + " })()) }}";
	        };

	        this['addTemplate'] = function(templateName, templateMarkup) {
	            document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
	        };

	        if (jQueryTmplVersion > 0) {
	            jQueryInstance['tmpl']['tag']['ko_code'] = {
	                open: "__.push($1 || '');"
	            };
	            jQueryInstance['tmpl']['tag']['ko_with'] = {
	                open: "with($1) {",
	                close: "} "
	            };
	        }
	    };

	    ko.jqueryTmplTemplateEngine.prototype = new ko.templateEngine();
	    ko.jqueryTmplTemplateEngine.prototype.constructor = ko.jqueryTmplTemplateEngine;

	    // Use this one by default *only if jquery.tmpl is referenced*
	    var jqueryTmplTemplateEngineInstance = new ko.jqueryTmplTemplateEngine();
	    if (jqueryTmplTemplateEngineInstance.jQueryTmplVersion > 0)
	        ko.setTemplateEngine(jqueryTmplTemplateEngineInstance);

	    ko.exportSymbol('jqueryTmplTemplateEngine', ko.jqueryTmplTemplateEngine);
	})();
	}));
	}());
	})();

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const AuthorisationResult_1 = __webpack_require__(5);
	class Authoriser {
	    constructor(handleAuthorisation, bindTarget) {
	        this.handleAuthorisation = handleAuthorisation;
	        this.bindTarget = bindTarget;
	    }
	    authorise() {
	        gapi.auth.authorize({
	            client_id: "572433782727-t18lsk18p4bgp272rjsadqtqdl06d37n.apps.googleusercontent.com",
	            scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets",
	            immediate: false
	        }, (result) => { this.authoriseCallback(result); });
	    }
	    authoriseCallback(result) {
	        let authorised = result.access_token !== undefined;
	        this.handleAuthorisation.bind(this.bindTarget)(new AuthorisationResult_1.default(authorised, result.error));
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Authoriser;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	class AuthorisationResult {
	    constructor(authorised, errorMessage) {
	        this.authorised = authorised;
	        this.errorMessage = errorMessage;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = AuthorisationResult;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const PDFJS = __webpack_require__(7); // Imports a global PDFJS object.
	const PdfScrapingResult_1 = __webpack_require__(9);
	class PdfScraper {
	    scrapeText(pdfFileUrl, password) {
	        let getDocumentPdfPromise = PDFJS.getDocument({
	            url: pdfFileUrl,
	            password: password
	        });
	        return Promise.resolve(getDocumentPdfPromise).then(pdfDocument => this.scrapePdfPages(pdfDocument), error => this.handleDocumentError(error));
	    }
	    isPasswordException(error) {
	        return error.name === "PasswordException";
	    }
	    handleDocumentError(error) {
	        if (this.isPasswordException(error)) {
	            switch (error.code) {
	                case 1 /* NeedPassword */: return PdfScrapingResult_1.default.errorPasswordRequired();
	                case 2 /* PasswordIncorrect */: return PdfScrapingResult_1.default.errorPasswordIncorrect();
	            }
	        }
	        throw error;
	    }
	    scrapePdfPages(pdfDocument) {
	        let pageScrapingPromises = [];
	        // NOTE: that PdfDocument.getPage(number) is 1 based.
	        for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
	            let pageScrapingPromise = Promise.resolve(pdfDocument.getPage(pageNum))
	                .then(page => this.scrapePageText(page));
	            pageScrapingPromises.push(pageScrapingPromise);
	        }
	        return Promise.all(pageScrapingPromises)
	            .then(pages => PdfScrapingResult_1.default.success([].concat(...pages)));
	    }
	    scrapePageText(page) {
	        return Promise.resolve(page.getTextContent())
	            .then(textContent => {
	            return textContent.items.map(item => { return item.str; });
	        });
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = PdfScraper;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {/* Copyright 2012 Mozilla Foundation
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/* jshint globalstrict: false */
	/* umdutils ignore */

	(function (root, factory) {
	  'use strict';
	  if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== 'undefined') {
	    factory(exports);
	  } else {
	factory((root.pdfjsDistBuildPdf = {}));
	  }
	}(this, function (exports) {
	  // Use strict in our context only - users might not want it
	  'use strict';

	var pdfjsVersion = '1.5.337';
	var pdfjsBuild = '11381cd';

	  var pdfjsFilePath =
	    typeof document !== 'undefined' && document.currentScript ?
	      document.currentScript.src : null;

	  var pdfjsLibs = {};

	  (function pdfjsWrapper() {



	(function (root, factory) {
	  {
	    factory((root.pdfjsSharedUtil = {}));
	  }
	}(this, function (exports) {

	var globalScope = (typeof window !== 'undefined') ? window :
	                  (typeof global !== 'undefined') ? global :
	                  (typeof self !== 'undefined') ? self : this;

	var FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];

	var TextRenderingMode = {
	  FILL: 0,
	  STROKE: 1,
	  FILL_STROKE: 2,
	  INVISIBLE: 3,
	  FILL_ADD_TO_PATH: 4,
	  STROKE_ADD_TO_PATH: 5,
	  FILL_STROKE_ADD_TO_PATH: 6,
	  ADD_TO_PATH: 7,
	  FILL_STROKE_MASK: 3,
	  ADD_TO_PATH_FLAG: 4
	};

	var ImageKind = {
	  GRAYSCALE_1BPP: 1,
	  RGB_24BPP: 2,
	  RGBA_32BPP: 3
	};

	var AnnotationType = {
	  TEXT: 1,
	  LINK: 2,
	  FREETEXT: 3,
	  LINE: 4,
	  SQUARE: 5,
	  CIRCLE: 6,
	  POLYGON: 7,
	  POLYLINE: 8,
	  HIGHLIGHT: 9,
	  UNDERLINE: 10,
	  SQUIGGLY: 11,
	  STRIKEOUT: 12,
	  STAMP: 13,
	  CARET: 14,
	  INK: 15,
	  POPUP: 16,
	  FILEATTACHMENT: 17,
	  SOUND: 18,
	  MOVIE: 19,
	  WIDGET: 20,
	  SCREEN: 21,
	  PRINTERMARK: 22,
	  TRAPNET: 23,
	  WATERMARK: 24,
	  THREED: 25,
	  REDACT: 26
	};

	var AnnotationFlag = {
	  INVISIBLE: 0x01,
	  HIDDEN: 0x02,
	  PRINT: 0x04,
	  NOZOOM: 0x08,
	  NOROTATE: 0x10,
	  NOVIEW: 0x20,
	  READONLY: 0x40,
	  LOCKED: 0x80,
	  TOGGLENOVIEW: 0x100,
	  LOCKEDCONTENTS: 0x200
	};

	var AnnotationBorderStyleType = {
	  SOLID: 1,
	  DASHED: 2,
	  BEVELED: 3,
	  INSET: 4,
	  UNDERLINE: 5
	};

	var StreamType = {
	  UNKNOWN: 0,
	  FLATE: 1,
	  LZW: 2,
	  DCT: 3,
	  JPX: 4,
	  JBIG: 5,
	  A85: 6,
	  AHX: 7,
	  CCF: 8,
	  RL: 9
	};

	var FontType = {
	  UNKNOWN: 0,
	  TYPE1: 1,
	  TYPE1C: 2,
	  CIDFONTTYPE0: 3,
	  CIDFONTTYPE0C: 4,
	  TRUETYPE: 5,
	  CIDFONTTYPE2: 6,
	  TYPE3: 7,
	  OPENTYPE: 8,
	  TYPE0: 9,
	  MMTYPE1: 10
	};

	var VERBOSITY_LEVELS = {
	  errors: 0,
	  warnings: 1,
	  infos: 5
	};

	// All the possible operations for an operator list.
	var OPS = {
	  // Intentionally start from 1 so it is easy to spot bad operators that will be
	  // 0's.
	  dependency: 1,
	  setLineWidth: 2,
	  setLineCap: 3,
	  setLineJoin: 4,
	  setMiterLimit: 5,
	  setDash: 6,
	  setRenderingIntent: 7,
	  setFlatness: 8,
	  setGState: 9,
	  save: 10,
	  restore: 11,
	  transform: 12,
	  moveTo: 13,
	  lineTo: 14,
	  curveTo: 15,
	  curveTo2: 16,
	  curveTo3: 17,
	  closePath: 18,
	  rectangle: 19,
	  stroke: 20,
	  closeStroke: 21,
	  fill: 22,
	  eoFill: 23,
	  fillStroke: 24,
	  eoFillStroke: 25,
	  closeFillStroke: 26,
	  closeEOFillStroke: 27,
	  endPath: 28,
	  clip: 29,
	  eoClip: 30,
	  beginText: 31,
	  endText: 32,
	  setCharSpacing: 33,
	  setWordSpacing: 34,
	  setHScale: 35,
	  setLeading: 36,
	  setFont: 37,
	  setTextRenderingMode: 38,
	  setTextRise: 39,
	  moveText: 40,
	  setLeadingMoveText: 41,
	  setTextMatrix: 42,
	  nextLine: 43,
	  showText: 44,
	  showSpacedText: 45,
	  nextLineShowText: 46,
	  nextLineSetSpacingShowText: 47,
	  setCharWidth: 48,
	  setCharWidthAndBounds: 49,
	  setStrokeColorSpace: 50,
	  setFillColorSpace: 51,
	  setStrokeColor: 52,
	  setStrokeColorN: 53,
	  setFillColor: 54,
	  setFillColorN: 55,
	  setStrokeGray: 56,
	  setFillGray: 57,
	  setStrokeRGBColor: 58,
	  setFillRGBColor: 59,
	  setStrokeCMYKColor: 60,
	  setFillCMYKColor: 61,
	  shadingFill: 62,
	  beginInlineImage: 63,
	  beginImageData: 64,
	  endInlineImage: 65,
	  paintXObject: 66,
	  markPoint: 67,
	  markPointProps: 68,
	  beginMarkedContent: 69,
	  beginMarkedContentProps: 70,
	  endMarkedContent: 71,
	  beginCompat: 72,
	  endCompat: 73,
	  paintFormXObjectBegin: 74,
	  paintFormXObjectEnd: 75,
	  beginGroup: 76,
	  endGroup: 77,
	  beginAnnotations: 78,
	  endAnnotations: 79,
	  beginAnnotation: 80,
	  endAnnotation: 81,
	  paintJpegXObject: 82,
	  paintImageMaskXObject: 83,
	  paintImageMaskXObjectGroup: 84,
	  paintImageXObject: 85,
	  paintInlineImageXObject: 86,
	  paintInlineImageXObjectGroup: 87,
	  paintImageXObjectRepeat: 88,
	  paintImageMaskXObjectRepeat: 89,
	  paintSolidColorImageMask: 90,
	  constructPath: 91
	};

	var verbosity = VERBOSITY_LEVELS.warnings;

	function setVerbosityLevel(level) {
	  verbosity = level;
	}

	function getVerbosityLevel() {
	  return verbosity;
	}

	// A notice for devs. These are good for things that are helpful to devs, such
	// as warning that Workers were disabled, which is important to devs but not
	// end users.
	function info(msg) {
	  if (verbosity >= VERBOSITY_LEVELS.infos) {
	    console.log('Info: ' + msg);
	  }
	}

	// Non-fatal warnings.
	function warn(msg) {
	  if (verbosity >= VERBOSITY_LEVELS.warnings) {
	    console.log('Warning: ' + msg);
	  }
	}

	// Deprecated API function -- display regardless of the PDFJS.verbosity setting.
	function deprecated(details) {
	  console.log('Deprecated API usage: ' + details);
	}

	// Fatal errors that should trigger the fallback UI and halt execution by
	// throwing an exception.
	function error(msg) {
	  if (verbosity >= VERBOSITY_LEVELS.errors) {
	    console.log('Error: ' + msg);
	    console.log(backtrace());
	  }
	  throw new Error(msg);
	}

	function backtrace() {
	  try {
	    throw new Error();
	  } catch (e) {
	    return e.stack ? e.stack.split('\n').slice(2).join('\n') : '';
	  }
	}

	function assert(cond, msg) {
	  if (!cond) {
	    error(msg);
	  }
	}

	var UNSUPPORTED_FEATURES = {
	  unknown: 'unknown',
	  forms: 'forms',
	  javaScript: 'javaScript',
	  smask: 'smask',
	  shadingPattern: 'shadingPattern',
	  font: 'font'
	};

	// Checks if URLs have the same origin. For non-HTTP based URLs, returns false.
	function isSameOrigin(baseUrl, otherUrl) {
	  try {
	    var base = new URL(baseUrl);
	    if (!base.origin || base.origin === 'null') {
	      return false; // non-HTTP url
	    }
	  } catch (e) {
	    return false;
	  }

	  var other = new URL(otherUrl, base);
	  return base.origin === other.origin;
	}

	// Validates if URL is safe and allowed, e.g. to avoid XSS.
	function isValidUrl(url, allowRelative) {
	  if (!url || typeof url !== 'string') {
	    return false;
	  }
	  // RFC 3986 (http://tools.ietf.org/html/rfc3986#section-3.1)
	  // scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
	  var protocol = /^[a-z][a-z0-9+\-.]*(?=:)/i.exec(url);
	  if (!protocol) {
	    return allowRelative;
	  }
	  protocol = protocol[0].toLowerCase();
	  switch (protocol) {
	    case 'http':
	    case 'https':
	    case 'ftp':
	    case 'mailto':
	    case 'tel':
	      return true;
	    default:
	      return false;
	  }
	}

	function shadow(obj, prop, value) {
	  Object.defineProperty(obj, prop, { value: value,
	                                     enumerable: true,
	                                     configurable: true,
	                                     writable: false });
	  return value;
	}

	function getLookupTableFactory(initializer) {
	  var lookup;
	  return function () {
	    if (initializer) {
	      lookup = Object.create(null);
	      initializer(lookup);
	      initializer = null;
	    }
	    return lookup;
	  };
	}

	var PasswordResponses = {
	  NEED_PASSWORD: 1,
	  INCORRECT_PASSWORD: 2
	};

	var PasswordException = (function PasswordExceptionClosure() {
	  function PasswordException(msg, code) {
	    this.name = 'PasswordException';
	    this.message = msg;
	    this.code = code;
	  }

	  PasswordException.prototype = new Error();
	  PasswordException.constructor = PasswordException;

	  return PasswordException;
	})();

	var UnknownErrorException = (function UnknownErrorExceptionClosure() {
	  function UnknownErrorException(msg, details) {
	    this.name = 'UnknownErrorException';
	    this.message = msg;
	    this.details = details;
	  }

	  UnknownErrorException.prototype = new Error();
	  UnknownErrorException.constructor = UnknownErrorException;

	  return UnknownErrorException;
	})();

	var InvalidPDFException = (function InvalidPDFExceptionClosure() {
	  function InvalidPDFException(msg) {
	    this.name = 'InvalidPDFException';
	    this.message = msg;
	  }

	  InvalidPDFException.prototype = new Error();
	  InvalidPDFException.constructor = InvalidPDFException;

	  return InvalidPDFException;
	})();

	var MissingPDFException = (function MissingPDFExceptionClosure() {
	  function MissingPDFException(msg) {
	    this.name = 'MissingPDFException';
	    this.message = msg;
	  }

	  MissingPDFException.prototype = new Error();
	  MissingPDFException.constructor = MissingPDFException;

	  return MissingPDFException;
	})();

	var UnexpectedResponseException =
	    (function UnexpectedResponseExceptionClosure() {
	  function UnexpectedResponseException(msg, status) {
	    this.name = 'UnexpectedResponseException';
	    this.message = msg;
	    this.status = status;
	  }

	  UnexpectedResponseException.prototype = new Error();
	  UnexpectedResponseException.constructor = UnexpectedResponseException;

	  return UnexpectedResponseException;
	})();

	var NotImplementedException = (function NotImplementedExceptionClosure() {
	  function NotImplementedException(msg) {
	    this.message = msg;
	  }

	  NotImplementedException.prototype = new Error();
	  NotImplementedException.prototype.name = 'NotImplementedException';
	  NotImplementedException.constructor = NotImplementedException;

	  return NotImplementedException;
	})();

	var MissingDataException = (function MissingDataExceptionClosure() {
	  function MissingDataException(begin, end) {
	    this.begin = begin;
	    this.end = end;
	    this.message = 'Missing data [' + begin + ', ' + end + ')';
	  }

	  MissingDataException.prototype = new Error();
	  MissingDataException.prototype.name = 'MissingDataException';
	  MissingDataException.constructor = MissingDataException;

	  return MissingDataException;
	})();

	var XRefParseException = (function XRefParseExceptionClosure() {
	  function XRefParseException(msg) {
	    this.message = msg;
	  }

	  XRefParseException.prototype = new Error();
	  XRefParseException.prototype.name = 'XRefParseException';
	  XRefParseException.constructor = XRefParseException;

	  return XRefParseException;
	})();

	var NullCharactersRegExp = /\x00/g;

	function removeNullCharacters(str) {
	  if (typeof str !== 'string') {
	    warn('The argument for removeNullCharacters must be a string.');
	    return str;
	  }
	  return str.replace(NullCharactersRegExp, '');
	}

	function bytesToString(bytes) {
	  assert(bytes !== null && typeof bytes === 'object' &&
	         bytes.length !== undefined, 'Invalid argument for bytesToString');
	  var length = bytes.length;
	  var MAX_ARGUMENT_COUNT = 8192;
	  if (length < MAX_ARGUMENT_COUNT) {
	    return String.fromCharCode.apply(null, bytes);
	  }
	  var strBuf = [];
	  for (var i = 0; i < length; i += MAX_ARGUMENT_COUNT) {
	    var chunkEnd = Math.min(i + MAX_ARGUMENT_COUNT, length);
	    var chunk = bytes.subarray(i, chunkEnd);
	    strBuf.push(String.fromCharCode.apply(null, chunk));
	  }
	  return strBuf.join('');
	}

	function stringToBytes(str) {
	  assert(typeof str === 'string', 'Invalid argument for stringToBytes');
	  var length = str.length;
	  var bytes = new Uint8Array(length);
	  for (var i = 0; i < length; ++i) {
	    bytes[i] = str.charCodeAt(i) & 0xFF;
	  }
	  return bytes;
	}

	/**
	 * Gets length of the array (Array, Uint8Array, or string) in bytes.
	 * @param {Array|Uint8Array|string} arr
	 * @returns {number}
	 */
	function arrayByteLength(arr) {
	  if (arr.length !== undefined) {
	    return arr.length;
	  }
	  assert(arr.byteLength !== undefined);
	  return arr.byteLength;
	}

	/**
	 * Combines array items (arrays) into single Uint8Array object.
	 * @param {Array} arr - the array of the arrays (Array, Uint8Array, or string).
	 * @returns {Uint8Array}
	 */
	function arraysToBytes(arr) {
	  // Shortcut: if first and only item is Uint8Array, return it.
	  if (arr.length === 1 && (arr[0] instanceof Uint8Array)) {
	    return arr[0];
	  }
	  var resultLength = 0;
	  var i, ii = arr.length;
	  var item, itemLength ;
	  for (i = 0; i < ii; i++) {
	    item = arr[i];
	    itemLength = arrayByteLength(item);
	    resultLength += itemLength;
	  }
	  var pos = 0;
	  var data = new Uint8Array(resultLength);
	  for (i = 0; i < ii; i++) {
	    item = arr[i];
	    if (!(item instanceof Uint8Array)) {
	      if (typeof item === 'string') {
	        item = stringToBytes(item);
	      } else {
	        item = new Uint8Array(item);
	      }
	    }
	    itemLength = item.byteLength;
	    data.set(item, pos);
	    pos += itemLength;
	  }
	  return data;
	}

	function string32(value) {
	  return String.fromCharCode((value >> 24) & 0xff, (value >> 16) & 0xff,
	                             (value >> 8) & 0xff, value & 0xff);
	}

	function log2(x) {
	  var n = 1, i = 0;
	  while (x > n) {
	    n <<= 1;
	    i++;
	  }
	  return i;
	}

	function readInt8(data, start) {
	  return (data[start] << 24) >> 24;
	}

	function readUint16(data, offset) {
	  return (data[offset] << 8) | data[offset + 1];
	}

	function readUint32(data, offset) {
	  return ((data[offset] << 24) | (data[offset + 1] << 16) |
	         (data[offset + 2] << 8) | data[offset + 3]) >>> 0;
	}

	// Lazy test the endianness of the platform
	// NOTE: This will be 'true' for simulated TypedArrays
	function isLittleEndian() {
	  var buffer8 = new Uint8Array(2);
	  buffer8[0] = 1;
	  var buffer16 = new Uint16Array(buffer8.buffer);
	  return (buffer16[0] === 1);
	}

	// Checks if it's possible to eval JS expressions.
	function isEvalSupported() {
	  try {
	    /* jshint evil: true */
	    new Function('');
	    return true;
	  } catch (e) {
	    return false;
	  }
	}

	var Uint32ArrayView = (function Uint32ArrayViewClosure() {

	  function Uint32ArrayView(buffer, length) {
	    this.buffer = buffer;
	    this.byteLength = buffer.length;
	    this.length = length === undefined ? (this.byteLength >> 2) : length;
	    ensureUint32ArrayViewProps(this.length);
	  }
	  Uint32ArrayView.prototype = Object.create(null);

	  var uint32ArrayViewSetters = 0;
	  function createUint32ArrayProp(index) {
	    return {
	      get: function () {
	        var buffer = this.buffer, offset = index << 2;
	        return (buffer[offset] | (buffer[offset + 1] << 8) |
	          (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24)) >>> 0;
	      },
	      set: function (value) {
	        var buffer = this.buffer, offset = index << 2;
	        buffer[offset] = value & 255;
	        buffer[offset + 1] = (value >> 8) & 255;
	        buffer[offset + 2] = (value >> 16) & 255;
	        buffer[offset + 3] = (value >>> 24) & 255;
	      }
	    };
	  }

	  function ensureUint32ArrayViewProps(length) {
	    while (uint32ArrayViewSetters < length) {
	      Object.defineProperty(Uint32ArrayView.prototype,
	        uint32ArrayViewSetters,
	        createUint32ArrayProp(uint32ArrayViewSetters));
	      uint32ArrayViewSetters++;
	    }
	  }

	  return Uint32ArrayView;
	})();

	exports.Uint32ArrayView = Uint32ArrayView;

	var IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];

	var Util = (function UtilClosure() {
	  function Util() {}

	  var rgbBuf = ['rgb(', 0, ',', 0, ',', 0, ')'];

	  // makeCssRgb() can be called thousands of times. Using |rgbBuf| avoids
	  // creating many intermediate strings.
	  Util.makeCssRgb = function Util_makeCssRgb(r, g, b) {
	    rgbBuf[1] = r;
	    rgbBuf[3] = g;
	    rgbBuf[5] = b;
	    return rgbBuf.join('');
	  };

	  // Concatenates two transformation matrices together and returns the result.
	  Util.transform = function Util_transform(m1, m2) {
	    return [
	      m1[0] * m2[0] + m1[2] * m2[1],
	      m1[1] * m2[0] + m1[3] * m2[1],
	      m1[0] * m2[2] + m1[2] * m2[3],
	      m1[1] * m2[2] + m1[3] * m2[3],
	      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
	      m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
	    ];
	  };

	  // For 2d affine transforms
	  Util.applyTransform = function Util_applyTransform(p, m) {
	    var xt = p[0] * m[0] + p[1] * m[2] + m[4];
	    var yt = p[0] * m[1] + p[1] * m[3] + m[5];
	    return [xt, yt];
	  };

	  Util.applyInverseTransform = function Util_applyInverseTransform(p, m) {
	    var d = m[0] * m[3] - m[1] * m[2];
	    var xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;
	    var yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;
	    return [xt, yt];
	  };

	  // Applies the transform to the rectangle and finds the minimum axially
	  // aligned bounding box.
	  Util.getAxialAlignedBoundingBox =
	    function Util_getAxialAlignedBoundingBox(r, m) {

	    var p1 = Util.applyTransform(r, m);
	    var p2 = Util.applyTransform(r.slice(2, 4), m);
	    var p3 = Util.applyTransform([r[0], r[3]], m);
	    var p4 = Util.applyTransform([r[2], r[1]], m);
	    return [
	      Math.min(p1[0], p2[0], p3[0], p4[0]),
	      Math.min(p1[1], p2[1], p3[1], p4[1]),
	      Math.max(p1[0], p2[0], p3[0], p4[0]),
	      Math.max(p1[1], p2[1], p3[1], p4[1])
	    ];
	  };

	  Util.inverseTransform = function Util_inverseTransform(m) {
	    var d = m[0] * m[3] - m[1] * m[2];
	    return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d,
	      (m[2] * m[5] - m[4] * m[3]) / d, (m[4] * m[1] - m[5] * m[0]) / d];
	  };

	  // Apply a generic 3d matrix M on a 3-vector v:
	  //   | a b c |   | X |
	  //   | d e f | x | Y |
	  //   | g h i |   | Z |
	  // M is assumed to be serialized as [a,b,c,d,e,f,g,h,i],
	  // with v as [X,Y,Z]
	  Util.apply3dTransform = function Util_apply3dTransform(m, v) {
	    return [
	      m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
	      m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
	      m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
	    ];
	  };

	  // This calculation uses Singular Value Decomposition.
	  // The SVD can be represented with formula A = USV. We are interested in the
	  // matrix S here because it represents the scale values.
	  Util.singularValueDecompose2dScale =
	    function Util_singularValueDecompose2dScale(m) {

	    var transpose = [m[0], m[2], m[1], m[3]];

	    // Multiply matrix m with its transpose.
	    var a = m[0] * transpose[0] + m[1] * transpose[2];
	    var b = m[0] * transpose[1] + m[1] * transpose[3];
	    var c = m[2] * transpose[0] + m[3] * transpose[2];
	    var d = m[2] * transpose[1] + m[3] * transpose[3];

	    // Solve the second degree polynomial to get roots.
	    var first = (a + d) / 2;
	    var second = Math.sqrt((a + d) * (a + d) - 4 * (a * d - c * b)) / 2;
	    var sx = first + second || 1;
	    var sy = first - second || 1;

	    // Scale values are the square roots of the eigenvalues.
	    return [Math.sqrt(sx), Math.sqrt(sy)];
	  };

	  // Normalize rectangle rect=[x1, y1, x2, y2] so that (x1,y1) < (x2,y2)
	  // For coordinate systems whose origin lies in the bottom-left, this
	  // means normalization to (BL,TR) ordering. For systems with origin in the
	  // top-left, this means (TL,BR) ordering.
	  Util.normalizeRect = function Util_normalizeRect(rect) {
	    var r = rect.slice(0); // clone rect
	    if (rect[0] > rect[2]) {
	      r[0] = rect[2];
	      r[2] = rect[0];
	    }
	    if (rect[1] > rect[3]) {
	      r[1] = rect[3];
	      r[3] = rect[1];
	    }
	    return r;
	  };

	  // Returns a rectangle [x1, y1, x2, y2] corresponding to the
	  // intersection of rect1 and rect2. If no intersection, returns 'false'
	  // The rectangle coordinates of rect1, rect2 should be [x1, y1, x2, y2]
	  Util.intersect = function Util_intersect(rect1, rect2) {
	    function compare(a, b) {
	      return a - b;
	    }

	    // Order points along the axes
	    var orderedX = [rect1[0], rect1[2], rect2[0], rect2[2]].sort(compare),
	        orderedY = [rect1[1], rect1[3], rect2[1], rect2[3]].sort(compare),
	        result = [];

	    rect1 = Util.normalizeRect(rect1);
	    rect2 = Util.normalizeRect(rect2);

	    // X: first and second points belong to different rectangles?
	    if ((orderedX[0] === rect1[0] && orderedX[1] === rect2[0]) ||
	        (orderedX[0] === rect2[0] && orderedX[1] === rect1[0])) {
	      // Intersection must be between second and third points
	      result[0] = orderedX[1];
	      result[2] = orderedX[2];
	    } else {
	      return false;
	    }

	    // Y: first and second points belong to different rectangles?
	    if ((orderedY[0] === rect1[1] && orderedY[1] === rect2[1]) ||
	        (orderedY[0] === rect2[1] && orderedY[1] === rect1[1])) {
	      // Intersection must be between second and third points
	      result[1] = orderedY[1];
	      result[3] = orderedY[2];
	    } else {
	      return false;
	    }

	    return result;
	  };

	  Util.sign = function Util_sign(num) {
	    return num < 0 ? -1 : 1;
	  };

	  var ROMAN_NUMBER_MAP = [
	    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
	    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
	    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
	  ];
	  /**
	   * Converts positive integers to (upper case) Roman numerals.
	   * @param {integer} number - The number that should be converted.
	   * @param {boolean} lowerCase - Indicates if the result should be converted
	   *   to lower case letters. The default is false.
	   * @return {string} The resulting Roman number.
	   */
	  Util.toRoman = function Util_toRoman(number, lowerCase) {
	    assert(isInt(number) && number > 0,
	           'The number should be a positive integer.');
	    var pos, romanBuf = [];
	    // Thousands
	    while (number >= 1000) {
	      number -= 1000;
	      romanBuf.push('M');
	    }
	    // Hundreds
	    pos = (number / 100) | 0;
	    number %= 100;
	    romanBuf.push(ROMAN_NUMBER_MAP[pos]);
	    // Tens
	    pos = (number / 10) | 0;
	    number %= 10;
	    romanBuf.push(ROMAN_NUMBER_MAP[10 + pos]);
	    // Ones
	    romanBuf.push(ROMAN_NUMBER_MAP[20 + number]);

	    var romanStr = romanBuf.join('');
	    return (lowerCase ? romanStr.toLowerCase() : romanStr);
	  };

	  Util.appendToArray = function Util_appendToArray(arr1, arr2) {
	    Array.prototype.push.apply(arr1, arr2);
	  };

	  Util.prependToArray = function Util_prependToArray(arr1, arr2) {
	    Array.prototype.unshift.apply(arr1, arr2);
	  };

	  Util.extendObj = function extendObj(obj1, obj2) {
	    for (var key in obj2) {
	      obj1[key] = obj2[key];
	    }
	  };

	  Util.getInheritableProperty = function Util_getInheritableProperty(dict,
	                                                                     name) {
	    while (dict && !dict.has(name)) {
	      dict = dict.get('Parent');
	    }
	    if (!dict) {
	      return null;
	    }
	    return dict.get(name);
	  };

	  Util.inherit = function Util_inherit(sub, base, prototype) {
	    sub.prototype = Object.create(base.prototype);
	    sub.prototype.constructor = sub;
	    for (var prop in prototype) {
	      sub.prototype[prop] = prototype[prop];
	    }
	  };

	  Util.loadScript = function Util_loadScript(src, callback) {
	    var script = document.createElement('script');
	    var loaded = false;
	    script.setAttribute('src', src);
	    if (callback) {
	      script.onload = function() {
	        if (!loaded) {
	          callback();
	        }
	        loaded = true;
	      };
	    }
	    document.getElementsByTagName('head')[0].appendChild(script);
	  };

	  return Util;
	})();

	/**
	 * PDF page viewport created based on scale, rotation and offset.
	 * @class
	 * @alias PageViewport
	 */
	var PageViewport = (function PageViewportClosure() {
	  /**
	   * @constructor
	   * @private
	   * @param viewBox {Array} xMin, yMin, xMax and yMax coordinates.
	   * @param scale {number} scale of the viewport.
	   * @param rotation {number} rotations of the viewport in degrees.
	   * @param offsetX {number} offset X
	   * @param offsetY {number} offset Y
	   * @param dontFlip {boolean} if true, axis Y will not be flipped.
	   */
	  function PageViewport(viewBox, scale, rotation, offsetX, offsetY, dontFlip) {
	    this.viewBox = viewBox;
	    this.scale = scale;
	    this.rotation = rotation;
	    this.offsetX = offsetX;
	    this.offsetY = offsetY;

	    // creating transform to convert pdf coordinate system to the normal
	    // canvas like coordinates taking in account scale and rotation
	    var centerX = (viewBox[2] + viewBox[0]) / 2;
	    var centerY = (viewBox[3] + viewBox[1]) / 2;
	    var rotateA, rotateB, rotateC, rotateD;
	    rotation = rotation % 360;
	    rotation = rotation < 0 ? rotation + 360 : rotation;
	    switch (rotation) {
	      case 180:
	        rotateA = -1; rotateB = 0; rotateC = 0; rotateD = 1;
	        break;
	      case 90:
	        rotateA = 0; rotateB = 1; rotateC = 1; rotateD = 0;
	        break;
	      case 270:
	        rotateA = 0; rotateB = -1; rotateC = -1; rotateD = 0;
	        break;
	      //case 0:
	      default:
	        rotateA = 1; rotateB = 0; rotateC = 0; rotateD = -1;
	        break;
	    }

	    if (dontFlip) {
	      rotateC = -rotateC; rotateD = -rotateD;
	    }

	    var offsetCanvasX, offsetCanvasY;
	    var width, height;
	    if (rotateA === 0) {
	      offsetCanvasX = Math.abs(centerY - viewBox[1]) * scale + offsetX;
	      offsetCanvasY = Math.abs(centerX - viewBox[0]) * scale + offsetY;
	      width = Math.abs(viewBox[3] - viewBox[1]) * scale;
	      height = Math.abs(viewBox[2] - viewBox[0]) * scale;
	    } else {
	      offsetCanvasX = Math.abs(centerX - viewBox[0]) * scale + offsetX;
	      offsetCanvasY = Math.abs(centerY - viewBox[1]) * scale + offsetY;
	      width = Math.abs(viewBox[2] - viewBox[0]) * scale;
	      height = Math.abs(viewBox[3] - viewBox[1]) * scale;
	    }
	    // creating transform for the following operations:
	    // translate(-centerX, -centerY), rotate and flip vertically,
	    // scale, and translate(offsetCanvasX, offsetCanvasY)
	    this.transform = [
	      rotateA * scale,
	      rotateB * scale,
	      rotateC * scale,
	      rotateD * scale,
	      offsetCanvasX - rotateA * scale * centerX - rotateC * scale * centerY,
	      offsetCanvasY - rotateB * scale * centerX - rotateD * scale * centerY
	    ];

	    this.width = width;
	    this.height = height;
	    this.fontScale = scale;
	  }
	  PageViewport.prototype = /** @lends PageViewport.prototype */ {
	    /**
	     * Clones viewport with additional properties.
	     * @param args {Object} (optional) If specified, may contain the 'scale' or
	     * 'rotation' properties to override the corresponding properties in
	     * the cloned viewport.
	     * @returns {PageViewport} Cloned viewport.
	     */
	    clone: function PageViewPort_clone(args) {
	      args = args || {};
	      var scale = 'scale' in args ? args.scale : this.scale;
	      var rotation = 'rotation' in args ? args.rotation : this.rotation;
	      return new PageViewport(this.viewBox.slice(), scale, rotation,
	                              this.offsetX, this.offsetY, args.dontFlip);
	    },
	    /**
	     * Converts PDF point to the viewport coordinates. For examples, useful for
	     * converting PDF location into canvas pixel coordinates.
	     * @param x {number} X coordinate.
	     * @param y {number} Y coordinate.
	     * @returns {Object} Object that contains 'x' and 'y' properties of the
	     * point in the viewport coordinate space.
	     * @see {@link convertToPdfPoint}
	     * @see {@link convertToViewportRectangle}
	     */
	    convertToViewportPoint: function PageViewport_convertToViewportPoint(x, y) {
	      return Util.applyTransform([x, y], this.transform);
	    },
	    /**
	     * Converts PDF rectangle to the viewport coordinates.
	     * @param rect {Array} xMin, yMin, xMax and yMax coordinates.
	     * @returns {Array} Contains corresponding coordinates of the rectangle
	     * in the viewport coordinate space.
	     * @see {@link convertToViewportPoint}
	     */
	    convertToViewportRectangle:
	      function PageViewport_convertToViewportRectangle(rect) {
	      var tl = Util.applyTransform([rect[0], rect[1]], this.transform);
	      var br = Util.applyTransform([rect[2], rect[3]], this.transform);
	      return [tl[0], tl[1], br[0], br[1]];
	    },
	    /**
	     * Converts viewport coordinates to the PDF location. For examples, useful
	     * for converting canvas pixel location into PDF one.
	     * @param x {number} X coordinate.
	     * @param y {number} Y coordinate.
	     * @returns {Object} Object that contains 'x' and 'y' properties of the
	     * point in the PDF coordinate space.
	     * @see {@link convertToViewportPoint}
	     */
	    convertToPdfPoint: function PageViewport_convertToPdfPoint(x, y) {
	      return Util.applyInverseTransform([x, y], this.transform);
	    }
	  };
	  return PageViewport;
	})();

	var PDFStringTranslateTable = [
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0x2D8, 0x2C7, 0x2C6, 0x2D9, 0x2DD, 0x2DB, 0x2DA, 0x2DC, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x2022, 0x2020, 0x2021, 0x2026, 0x2014,
	  0x2013, 0x192, 0x2044, 0x2039, 0x203A, 0x2212, 0x2030, 0x201E, 0x201C,
	  0x201D, 0x2018, 0x2019, 0x201A, 0x2122, 0xFB01, 0xFB02, 0x141, 0x152, 0x160,
	  0x178, 0x17D, 0x131, 0x142, 0x153, 0x161, 0x17E, 0, 0x20AC
	];

	function stringToPDFString(str) {
	  var i, n = str.length, strBuf = [];
	  if (str[0] === '\xFE' && str[1] === '\xFF') {
	    // UTF16BE BOM
	    for (i = 2; i < n; i += 2) {
	      strBuf.push(String.fromCharCode(
	        (str.charCodeAt(i) << 8) | str.charCodeAt(i + 1)));
	    }
	  } else {
	    for (i = 0; i < n; ++i) {
	      var code = PDFStringTranslateTable[str.charCodeAt(i)];
	      strBuf.push(code ? String.fromCharCode(code) : str.charAt(i));
	    }
	  }
	  return strBuf.join('');
	}

	function stringToUTF8String(str) {
	  return decodeURIComponent(escape(str));
	}

	function utf8StringToString(str) {
	  return unescape(encodeURIComponent(str));
	}

	function isEmptyObj(obj) {
	  for (var key in obj) {
	    return false;
	  }
	  return true;
	}

	function isBool(v) {
	  return typeof v === 'boolean';
	}

	function isInt(v) {
	  return typeof v === 'number' && ((v | 0) === v);
	}

	function isNum(v) {
	  return typeof v === 'number';
	}

	function isString(v) {
	  return typeof v === 'string';
	}

	function isArray(v) {
	  return v instanceof Array;
	}

	function isArrayBuffer(v) {
	  return typeof v === 'object' && v !== null && v.byteLength !== undefined;
	}

	// Checks if ch is one of the following characters: SPACE, TAB, CR or LF.
	function isSpace(ch) {
	  return (ch === 0x20 || ch === 0x09 || ch === 0x0D || ch === 0x0A);
	}

	/**
	 * Promise Capability object.
	 *
	 * @typedef {Object} PromiseCapability
	 * @property {Promise} promise - A promise object.
	 * @property {function} resolve - Fullfills the promise.
	 * @property {function} reject - Rejects the promise.
	 */

	/**
	 * Creates a promise capability object.
	 * @alias createPromiseCapability
	 *
	 * @return {PromiseCapability} A capability object contains:
	 * - a Promise, resolve and reject methods.
	 */
	function createPromiseCapability() {
	  var capability = {};
	  capability.promise = new Promise(function (resolve, reject) {
	    capability.resolve = resolve;
	    capability.reject = reject;
	  });
	  return capability;
	}

	/**
	 * Polyfill for Promises:
	 * The following promise implementation tries to generally implement the
	 * Promise/A+ spec. Some notable differences from other promise libaries are:
	 * - There currently isn't a seperate deferred and promise object.
	 * - Unhandled rejections eventually show an error if they aren't handled.
	 *
	 * Based off of the work in:
	 * https://bugzilla.mozilla.org/show_bug.cgi?id=810490
	 */
	(function PromiseClosure() {
	  if (globalScope.Promise) {
	    // Promises existing in the DOM/Worker, checking presence of all/resolve
	    if (typeof globalScope.Promise.all !== 'function') {
	      globalScope.Promise.all = function (iterable) {
	        var count = 0, results = [], resolve, reject;
	        var promise = new globalScope.Promise(function (resolve_, reject_) {
	          resolve = resolve_;
	          reject = reject_;
	        });
	        iterable.forEach(function (p, i) {
	          count++;
	          p.then(function (result) {
	            results[i] = result;
	            count--;
	            if (count === 0) {
	              resolve(results);
	            }
	          }, reject);
	        });
	        if (count === 0) {
	          resolve(results);
	        }
	        return promise;
	      };
	    }
	    if (typeof globalScope.Promise.resolve !== 'function') {
	      globalScope.Promise.resolve = function (value) {
	        return new globalScope.Promise(function (resolve) { resolve(value); });
	      };
	    }
	    if (typeof globalScope.Promise.reject !== 'function') {
	      globalScope.Promise.reject = function (reason) {
	        return new globalScope.Promise(function (resolve, reject) {
	          reject(reason);
	        });
	      };
	    }
	    if (typeof globalScope.Promise.prototype.catch !== 'function') {
	      globalScope.Promise.prototype.catch = function (onReject) {
	        return globalScope.Promise.prototype.then(undefined, onReject);
	      };
	    }
	    return;
	  }
	  var STATUS_PENDING = 0;
	  var STATUS_RESOLVED = 1;
	  var STATUS_REJECTED = 2;

	  // In an attempt to avoid silent exceptions, unhandled rejections are
	  // tracked and if they aren't handled in a certain amount of time an
	  // error is logged.
	  var REJECTION_TIMEOUT = 500;

	  var HandlerManager = {
	    handlers: [],
	    running: false,
	    unhandledRejections: [],
	    pendingRejectionCheck: false,

	    scheduleHandlers: function scheduleHandlers(promise) {
	      if (promise._status === STATUS_PENDING) {
	        return;
	      }

	      this.handlers = this.handlers.concat(promise._handlers);
	      promise._handlers = [];

	      if (this.running) {
	        return;
	      }
	      this.running = true;

	      setTimeout(this.runHandlers.bind(this), 0);
	    },

	    runHandlers: function runHandlers() {
	      var RUN_TIMEOUT = 1; // ms
	      var timeoutAt = Date.now() + RUN_TIMEOUT;
	      while (this.handlers.length > 0) {
	        var handler = this.handlers.shift();

	        var nextStatus = handler.thisPromise._status;
	        var nextValue = handler.thisPromise._value;

	        try {
	          if (nextStatus === STATUS_RESOLVED) {
	            if (typeof handler.onResolve === 'function') {
	              nextValue = handler.onResolve(nextValue);
	            }
	          } else if (typeof handler.onReject === 'function') {
	              nextValue = handler.onReject(nextValue);
	              nextStatus = STATUS_RESOLVED;

	              if (handler.thisPromise._unhandledRejection) {
	                this.removeUnhandeledRejection(handler.thisPromise);
	              }
	          }
	        } catch (ex) {
	          nextStatus = STATUS_REJECTED;
	          nextValue = ex;
	        }

	        handler.nextPromise._updateStatus(nextStatus, nextValue);
	        if (Date.now() >= timeoutAt) {
	          break;
	        }
	      }

	      if (this.handlers.length > 0) {
	        setTimeout(this.runHandlers.bind(this), 0);
	        return;
	      }

	      this.running = false;
	    },

	    addUnhandledRejection: function addUnhandledRejection(promise) {
	      this.unhandledRejections.push({
	        promise: promise,
	        time: Date.now()
	      });
	      this.scheduleRejectionCheck();
	    },

	    removeUnhandeledRejection: function removeUnhandeledRejection(promise) {
	      promise._unhandledRejection = false;
	      for (var i = 0; i < this.unhandledRejections.length; i++) {
	        if (this.unhandledRejections[i].promise === promise) {
	          this.unhandledRejections.splice(i);
	          i--;
	        }
	      }
	    },

	    scheduleRejectionCheck: function scheduleRejectionCheck() {
	      if (this.pendingRejectionCheck) {
	        return;
	      }
	      this.pendingRejectionCheck = true;
	      setTimeout(function rejectionCheck() {
	        this.pendingRejectionCheck = false;
	        var now = Date.now();
	        for (var i = 0; i < this.unhandledRejections.length; i++) {
	          if (now - this.unhandledRejections[i].time > REJECTION_TIMEOUT) {
	            var unhandled = this.unhandledRejections[i].promise._value;
	            var msg = 'Unhandled rejection: ' + unhandled;
	            if (unhandled.stack) {
	              msg += '\n' + unhandled.stack;
	            }
	            warn(msg);
	            this.unhandledRejections.splice(i);
	            i--;
	          }
	        }
	        if (this.unhandledRejections.length) {
	          this.scheduleRejectionCheck();
	        }
	      }.bind(this), REJECTION_TIMEOUT);
	    }
	  };

	  function Promise(resolver) {
	    this._status = STATUS_PENDING;
	    this._handlers = [];
	    try {
	      resolver.call(this, this._resolve.bind(this), this._reject.bind(this));
	    } catch (e) {
	      this._reject(e);
	    }
	  }
	  /**
	   * Builds a promise that is resolved when all the passed in promises are
	   * resolved.
	   * @param {array} promises array of data and/or promises to wait for.
	   * @return {Promise} New dependant promise.
	   */
	  Promise.all = function Promise_all(promises) {
	    var resolveAll, rejectAll;
	    var deferred = new Promise(function (resolve, reject) {
	      resolveAll = resolve;
	      rejectAll = reject;
	    });
	    var unresolved = promises.length;
	    var results = [];
	    if (unresolved === 0) {
	      resolveAll(results);
	      return deferred;
	    }
	    function reject(reason) {
	      if (deferred._status === STATUS_REJECTED) {
	        return;
	      }
	      results = [];
	      rejectAll(reason);
	    }
	    for (var i = 0, ii = promises.length; i < ii; ++i) {
	      var promise = promises[i];
	      var resolve = (function(i) {
	        return function(value) {
	          if (deferred._status === STATUS_REJECTED) {
	            return;
	          }
	          results[i] = value;
	          unresolved--;
	          if (unresolved === 0) {
	            resolveAll(results);
	          }
	        };
	      })(i);
	      if (Promise.isPromise(promise)) {
	        promise.then(resolve, reject);
	      } else {
	        resolve(promise);
	      }
	    }
	    return deferred;
	  };

	  /**
	   * Checks if the value is likely a promise (has a 'then' function).
	   * @return {boolean} true if value is thenable
	   */
	  Promise.isPromise = function Promise_isPromise(value) {
	    return value && typeof value.then === 'function';
	  };

	  /**
	   * Creates resolved promise
	   * @param value resolve value
	   * @returns {Promise}
	   */
	  Promise.resolve = function Promise_resolve(value) {
	    return new Promise(function (resolve) { resolve(value); });
	  };

	  /**
	   * Creates rejected promise
	   * @param reason rejection value
	   * @returns {Promise}
	   */
	  Promise.reject = function Promise_reject(reason) {
	    return new Promise(function (resolve, reject) { reject(reason); });
	  };

	  Promise.prototype = {
	    _status: null,
	    _value: null,
	    _handlers: null,
	    _unhandledRejection: null,

	    _updateStatus: function Promise__updateStatus(status, value) {
	      if (this._status === STATUS_RESOLVED ||
	          this._status === STATUS_REJECTED) {
	        return;
	      }

	      if (status === STATUS_RESOLVED &&
	          Promise.isPromise(value)) {
	        value.then(this._updateStatus.bind(this, STATUS_RESOLVED),
	                   this._updateStatus.bind(this, STATUS_REJECTED));
	        return;
	      }

	      this._status = status;
	      this._value = value;

	      if (status === STATUS_REJECTED && this._handlers.length === 0) {
	        this._unhandledRejection = true;
	        HandlerManager.addUnhandledRejection(this);
	      }

	      HandlerManager.scheduleHandlers(this);
	    },

	    _resolve: function Promise_resolve(value) {
	      this._updateStatus(STATUS_RESOLVED, value);
	    },

	    _reject: function Promise_reject(reason) {
	      this._updateStatus(STATUS_REJECTED, reason);
	    },

	    then: function Promise_then(onResolve, onReject) {
	      var nextPromise = new Promise(function (resolve, reject) {
	        this.resolve = resolve;
	        this.reject = reject;
	      });
	      this._handlers.push({
	        thisPromise: this,
	        onResolve: onResolve,
	        onReject: onReject,
	        nextPromise: nextPromise
	      });
	      HandlerManager.scheduleHandlers(this);
	      return nextPromise;
	    },

	    catch: function Promise_catch(onReject) {
	      return this.then(undefined, onReject);
	    }
	  };

	  globalScope.Promise = Promise;
	})();

	var StatTimer = (function StatTimerClosure() {
	  function rpad(str, pad, length) {
	    while (str.length < length) {
	      str += pad;
	    }
	    return str;
	  }
	  function StatTimer() {
	    this.started = Object.create(null);
	    this.times = [];
	    this.enabled = true;
	  }
	  StatTimer.prototype = {
	    time: function StatTimer_time(name) {
	      if (!this.enabled) {
	        return;
	      }
	      if (name in this.started) {
	        warn('Timer is already running for ' + name);
	      }
	      this.started[name] = Date.now();
	    },
	    timeEnd: function StatTimer_timeEnd(name) {
	      if (!this.enabled) {
	        return;
	      }
	      if (!(name in this.started)) {
	        warn('Timer has not been started for ' + name);
	      }
	      this.times.push({
	        'name': name,
	        'start': this.started[name],
	        'end': Date.now()
	      });
	      // Remove timer from started so it can be called again.
	      delete this.started[name];
	    },
	    toString: function StatTimer_toString() {
	      var i, ii;
	      var times = this.times;
	      var out = '';
	      // Find the longest name for padding purposes.
	      var longest = 0;
	      for (i = 0, ii = times.length; i < ii; ++i) {
	        var name = times[i]['name'];
	        if (name.length > longest) {
	          longest = name.length;
	        }
	      }
	      for (i = 0, ii = times.length; i < ii; ++i) {
	        var span = times[i];
	        var duration = span.end - span.start;
	        out += rpad(span['name'], ' ', longest) + ' ' + duration + 'ms\n';
	      }
	      return out;
	    }
	  };
	  return StatTimer;
	})();

	var createBlob = function createBlob(data, contentType) {
	  if (typeof Blob !== 'undefined') {
	    return new Blob([data], { type: contentType });
	  }
	  warn('The "Blob" constructor is not supported.');
	};

	var createObjectURL = (function createObjectURLClosure() {
	  // Blob/createObjectURL is not available, falling back to data schema.
	  var digits =
	    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	  return function createObjectURL(data, contentType, forceDataSchema) {
	    if (!forceDataSchema &&
	        typeof URL !== 'undefined' && URL.createObjectURL) {
	      var blob = createBlob(data, contentType);
	      return URL.createObjectURL(blob);
	    }

	    var buffer = 'data:' + contentType + ';base64,';
	    for (var i = 0, ii = data.length; i < ii; i += 3) {
	      var b1 = data[i] & 0xFF;
	      var b2 = data[i + 1] & 0xFF;
	      var b3 = data[i + 2] & 0xFF;
	      var d1 = b1 >> 2, d2 = ((b1 & 3) << 4) | (b2 >> 4);
	      var d3 = i + 1 < ii ? ((b2 & 0xF) << 2) | (b3 >> 6) : 64;
	      var d4 = i + 2 < ii ? (b3 & 0x3F) : 64;
	      buffer += digits[d1] + digits[d2] + digits[d3] + digits[d4];
	    }
	    return buffer;
	  };
	})();

	function MessageHandler(sourceName, targetName, comObj) {
	  this.sourceName = sourceName;
	  this.targetName = targetName;
	  this.comObj = comObj;
	  this.callbackIndex = 1;
	  this.postMessageTransfers = true;
	  var callbacksCapabilities = this.callbacksCapabilities = Object.create(null);
	  var ah = this.actionHandler = Object.create(null);

	  this._onComObjOnMessage = function messageHandlerComObjOnMessage(event) {
	    var data = event.data;
	    if (data.targetName !== this.sourceName) {
	      return;
	    }
	    if (data.isReply) {
	      var callbackId = data.callbackId;
	      if (data.callbackId in callbacksCapabilities) {
	        var callback = callbacksCapabilities[callbackId];
	        delete callbacksCapabilities[callbackId];
	        if ('error' in data) {
	          callback.reject(data.error);
	        } else {
	          callback.resolve(data.data);
	        }
	      } else {
	        error('Cannot resolve callback ' + callbackId);
	      }
	    } else if (data.action in ah) {
	      var action = ah[data.action];
	      if (data.callbackId) {
	        var sourceName = this.sourceName;
	        var targetName = data.sourceName;
	        Promise.resolve().then(function () {
	          return action[0].call(action[1], data.data);
	        }).then(function (result) {
	          comObj.postMessage({
	            sourceName: sourceName,
	            targetName: targetName,
	            isReply: true,
	            callbackId: data.callbackId,
	            data: result
	          });
	        }, function (reason) {
	          if (reason instanceof Error) {
	            // Serialize error to avoid "DataCloneError"
	            reason = reason + '';
	          }
	          comObj.postMessage({
	            sourceName: sourceName,
	            targetName: targetName,
	            isReply: true,
	            callbackId: data.callbackId,
	            error: reason
	          });
	        });
	      } else {
	        action[0].call(action[1], data.data);
	      }
	    } else {
	      error('Unknown action from worker: ' + data.action);
	    }
	  }.bind(this);
	  comObj.addEventListener('message', this._onComObjOnMessage);
	}

	MessageHandler.prototype = {
	  on: function messageHandlerOn(actionName, handler, scope) {
	    var ah = this.actionHandler;
	    if (ah[actionName]) {
	      error('There is already an actionName called "' + actionName + '"');
	    }
	    ah[actionName] = [handler, scope];
	  },
	  /**
	   * Sends a message to the comObj to invoke the action with the supplied data.
	   * @param {String} actionName Action to call.
	   * @param {JSON} data JSON data to send.
	   * @param {Array} [transfers] Optional list of transfers/ArrayBuffers
	   */
	  send: function messageHandlerSend(actionName, data, transfers) {
	    var message = {
	      sourceName: this.sourceName,
	      targetName: this.targetName,
	      action: actionName,
	      data: data
	    };
	    this.postMessage(message, transfers);
	  },
	  /**
	   * Sends a message to the comObj to invoke the action with the supplied data.
	   * Expects that other side will callback with the response.
	   * @param {String} actionName Action to call.
	   * @param {JSON} data JSON data to send.
	   * @param {Array} [transfers] Optional list of transfers/ArrayBuffers.
	   * @returns {Promise} Promise to be resolved with response data.
	   */
	  sendWithPromise:
	    function messageHandlerSendWithPromise(actionName, data, transfers) {
	    var callbackId = this.callbackIndex++;
	    var message = {
	      sourceName: this.sourceName,
	      targetName: this.targetName,
	      action: actionName,
	      data: data,
	      callbackId: callbackId
	    };
	    var capability = createPromiseCapability();
	    this.callbacksCapabilities[callbackId] = capability;
	    try {
	      this.postMessage(message, transfers);
	    } catch (e) {
	      capability.reject(e);
	    }
	    return capability.promise;
	  },
	  /**
	   * Sends raw message to the comObj.
	   * @private
	   * @param message {Object} Raw message.
	   * @param transfers List of transfers/ArrayBuffers, or undefined.
	   */
	  postMessage: function (message, transfers) {
	    if (transfers && this.postMessageTransfers) {
	      this.comObj.postMessage(message, transfers);
	    } else {
	      this.comObj.postMessage(message);
	    }
	  },

	  destroy: function () {
	    this.comObj.removeEventListener('message', this._onComObjOnMessage);
	  }
	};

	function loadJpegStream(id, imageUrl, objs) {
	  var img = new Image();
	  img.onload = (function loadJpegStream_onloadClosure() {
	    objs.resolve(id, img);
	  });
	  img.onerror = (function loadJpegStream_onerrorClosure() {
	    objs.resolve(id, null);
	    warn('Error during JPEG image loading');
	  });
	  img.src = imageUrl;
	}

	  // Polyfill from https://github.com/Polymer/URL
	/* Any copyright is dedicated to the Public Domain.
	 * http://creativecommons.org/publicdomain/zero/1.0/ */
	(function checkURLConstructor(scope) {
	  /* jshint ignore:start */

	  // feature detect for URL constructor
	  var hasWorkingUrl = false;
	  try {
	    if (typeof URL === 'function' &&
	        typeof URL.prototype === 'object' &&
	        ('origin' in URL.prototype)) {
	      var u = new URL('b', 'http://a');
	      u.pathname = 'c%20d';
	      hasWorkingUrl = u.href === 'http://a/c%20d';
	    }
	  } catch(e) { }

	  if (hasWorkingUrl)
	    return;

	  var relative = Object.create(null);
	  relative['ftp'] = 21;
	  relative['file'] = 0;
	  relative['gopher'] = 70;
	  relative['http'] = 80;
	  relative['https'] = 443;
	  relative['ws'] = 80;
	  relative['wss'] = 443;

	  var relativePathDotMapping = Object.create(null);
	  relativePathDotMapping['%2e'] = '.';
	  relativePathDotMapping['.%2e'] = '..';
	  relativePathDotMapping['%2e.'] = '..';
	  relativePathDotMapping['%2e%2e'] = '..';

	  function isRelativeScheme(scheme) {
	    return relative[scheme] !== undefined;
	  }

	  function invalid() {
	    clear.call(this);
	    this._isInvalid = true;
	  }

	  function IDNAToASCII(h) {
	    if ('' == h) {
	      invalid.call(this)
	    }
	    // XXX
	    return h.toLowerCase()
	  }

	  function percentEscape(c) {
	    var unicode = c.charCodeAt(0);
	    if (unicode > 0x20 &&
	       unicode < 0x7F &&
	       // " # < > ? `
	       [0x22, 0x23, 0x3C, 0x3E, 0x3F, 0x60].indexOf(unicode) == -1
	      ) {
	      return c;
	    }
	    return encodeURIComponent(c);
	  }

	  function percentEscapeQuery(c) {
	    // XXX This actually needs to encode c using encoding and then
	    // convert the bytes one-by-one.

	    var unicode = c.charCodeAt(0);
	    if (unicode > 0x20 &&
	       unicode < 0x7F &&
	       // " # < > ` (do not escape '?')
	       [0x22, 0x23, 0x3C, 0x3E, 0x60].indexOf(unicode) == -1
	      ) {
	      return c;
	    }
	    return encodeURIComponent(c);
	  }

	  var EOF = undefined,
	      ALPHA = /[a-zA-Z]/,
	      ALPHANUMERIC = /[a-zA-Z0-9\+\-\.]/;

	  function parse(input, stateOverride, base) {
	    function err(message) {
	      errors.push(message)
	    }

	    var state = stateOverride || 'scheme start',
	        cursor = 0,
	        buffer = '',
	        seenAt = false,
	        seenBracket = false,
	        errors = [];

	    loop: while ((input[cursor - 1] != EOF || cursor == 0) && !this._isInvalid) {
	      var c = input[cursor];
	      switch (state) {
	        case 'scheme start':
	          if (c && ALPHA.test(c)) {
	            buffer += c.toLowerCase(); // ASCII-safe
	            state = 'scheme';
	          } else if (!stateOverride) {
	            buffer = '';
	            state = 'no scheme';
	            continue;
	          } else {
	            err('Invalid scheme.');
	            break loop;
	          }
	          break;

	        case 'scheme':
	          if (c && ALPHANUMERIC.test(c)) {
	            buffer += c.toLowerCase(); // ASCII-safe
	          } else if (':' == c) {
	            this._scheme = buffer;
	            buffer = '';
	            if (stateOverride) {
	              break loop;
	            }
	            if (isRelativeScheme(this._scheme)) {
	              this._isRelative = true;
	            }
	            if ('file' == this._scheme) {
	              state = 'relative';
	            } else if (this._isRelative && base && base._scheme == this._scheme) {
	              state = 'relative or authority';
	            } else if (this._isRelative) {
	              state = 'authority first slash';
	            } else {
	              state = 'scheme data';
	            }
	          } else if (!stateOverride) {
	            buffer = '';
	            cursor = 0;
	            state = 'no scheme';
	            continue;
	          } else if (EOF == c) {
	            break loop;
	          } else {
	            err('Code point not allowed in scheme: ' + c)
	            break loop;
	          }
	          break;

	        case 'scheme data':
	          if ('?' == c) {
	            this._query = '?';
	            state = 'query';
	          } else if ('#' == c) {
	            this._fragment = '#';
	            state = 'fragment';
	          } else {
	            // XXX error handling
	            if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
	              this._schemeData += percentEscape(c);
	            }
	          }
	          break;

	        case 'no scheme':
	          if (!base || !(isRelativeScheme(base._scheme))) {
	            err('Missing scheme.');
	            invalid.call(this);
	          } else {
	            state = 'relative';
	            continue;
	          }
	          break;

	        case 'relative or authority':
	          if ('/' == c && '/' == input[cursor+1]) {
	            state = 'authority ignore slashes';
	          } else {
	            err('Expected /, got: ' + c);
	            state = 'relative';
	            continue
	          }
	          break;

	        case 'relative':
	          this._isRelative = true;
	          if ('file' != this._scheme)
	            this._scheme = base._scheme;
	          if (EOF == c) {
	            this._host = base._host;
	            this._port = base._port;
	            this._path = base._path.slice();
	            this._query = base._query;
	            this._username = base._username;
	            this._password = base._password;
	            break loop;
	          } else if ('/' == c || '\\' == c) {
	            if ('\\' == c)
	              err('\\ is an invalid code point.');
	            state = 'relative slash';
	          } else if ('?' == c) {
	            this._host = base._host;
	            this._port = base._port;
	            this._path = base._path.slice();
	            this._query = '?';
	            this._username = base._username;
	            this._password = base._password;
	            state = 'query';
	          } else if ('#' == c) {
	            this._host = base._host;
	            this._port = base._port;
	            this._path = base._path.slice();
	            this._query = base._query;
	            this._fragment = '#';
	            this._username = base._username;
	            this._password = base._password;
	            state = 'fragment';
	          } else {
	            var nextC = input[cursor+1]
	            var nextNextC = input[cursor+2]
	            if (
	              'file' != this._scheme || !ALPHA.test(c) ||
	              (nextC != ':' && nextC != '|') ||
	              (EOF != nextNextC && '/' != nextNextC && '\\' != nextNextC && '?' != nextNextC && '#' != nextNextC)) {
	              this._host = base._host;
	              this._port = base._port;
	              this._username = base._username;
	              this._password = base._password;
	              this._path = base._path.slice();
	              this._path.pop();
	            }
	            state = 'relative path';
	            continue;
	          }
	          break;

	        case 'relative slash':
	          if ('/' == c || '\\' == c) {
	            if ('\\' == c) {
	              err('\\ is an invalid code point.');
	            }
	            if ('file' == this._scheme) {
	              state = 'file host';
	            } else {
	              state = 'authority ignore slashes';
	            }
	          } else {
	            if ('file' != this._scheme) {
	              this._host = base._host;
	              this._port = base._port;
	              this._username = base._username;
	              this._password = base._password;
	            }
	            state = 'relative path';
	            continue;
	          }
	          break;

	        case 'authority first slash':
	          if ('/' == c) {
	            state = 'authority second slash';
	          } else {
	            err("Expected '/', got: " + c);
	            state = 'authority ignore slashes';
	            continue;
	          }
	          break;

	        case 'authority second slash':
	          state = 'authority ignore slashes';
	          if ('/' != c) {
	            err("Expected '/', got: " + c);
	            continue;
	          }
	          break;

	        case 'authority ignore slashes':
	          if ('/' != c && '\\' != c) {
	            state = 'authority';
	            continue;
	          } else {
	            err('Expected authority, got: ' + c);
	          }
	          break;

	        case 'authority':
	          if ('@' == c) {
	            if (seenAt) {
	              err('@ already seen.');
	              buffer += '%40';
	            }
	            seenAt = true;
	            for (var i = 0; i < buffer.length; i++) {
	              var cp = buffer[i];
	              if ('\t' == cp || '\n' == cp || '\r' == cp) {
	                err('Invalid whitespace in authority.');
	                continue;
	              }
	              // XXX check URL code points
	              if (':' == cp && null === this._password) {
	                this._password = '';
	                continue;
	              }
	              var tempC = percentEscape(cp);
	              (null !== this._password) ? this._password += tempC : this._username += tempC;
	            }
	            buffer = '';
	          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
	            cursor -= buffer.length;
	            buffer = '';
	            state = 'host';
	            continue;
	          } else {
	            buffer += c;
	          }
	          break;

	        case 'file host':
	          if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
	            if (buffer.length == 2 && ALPHA.test(buffer[0]) && (buffer[1] == ':' || buffer[1] == '|')) {
	              state = 'relative path';
	            } else if (buffer.length == 0) {
	              state = 'relative path start';
	            } else {
	              this._host = IDNAToASCII.call(this, buffer);
	              buffer = '';
	              state = 'relative path start';
	            }
	            continue;
	          } else if ('\t' == c || '\n' == c || '\r' == c) {
	            err('Invalid whitespace in file host.');
	          } else {
	            buffer += c;
	          }
	          break;

	        case 'host':
	        case 'hostname':
	          if (':' == c && !seenBracket) {
	            // XXX host parsing
	            this._host = IDNAToASCII.call(this, buffer);
	            buffer = '';
	            state = 'port';
	            if ('hostname' == stateOverride) {
	              break loop;
	            }
	          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
	            this._host = IDNAToASCII.call(this, buffer);
	            buffer = '';
	            state = 'relative path start';
	            if (stateOverride) {
	              break loop;
	            }
	            continue;
	          } else if ('\t' != c && '\n' != c && '\r' != c) {
	            if ('[' == c) {
	              seenBracket = true;
	            } else if (']' == c) {
	              seenBracket = false;
	            }
	            buffer += c;
	          } else {
	            err('Invalid code point in host/hostname: ' + c);
	          }
	          break;

	        case 'port':
	          if (/[0-9]/.test(c)) {
	            buffer += c;
	          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c || stateOverride) {
	            if ('' != buffer) {
	              var temp = parseInt(buffer, 10);
	              if (temp != relative[this._scheme]) {
	                this._port = temp + '';
	              }
	              buffer = '';
	            }
	            if (stateOverride) {
	              break loop;
	            }
	            state = 'relative path start';
	            continue;
	          } else if ('\t' == c || '\n' == c || '\r' == c) {
	            err('Invalid code point in port: ' + c);
	          } else {
	            invalid.call(this);
	          }
	          break;

	        case 'relative path start':
	          if ('\\' == c)
	            err("'\\' not allowed in path.");
	          state = 'relative path';
	          if ('/' != c && '\\' != c) {
	            continue;
	          }
	          break;

	        case 'relative path':
	          if (EOF == c || '/' == c || '\\' == c || (!stateOverride && ('?' == c || '#' == c))) {
	            if ('\\' == c) {
	              err('\\ not allowed in relative path.');
	            }
	            var tmp;
	            if (tmp = relativePathDotMapping[buffer.toLowerCase()]) {
	              buffer = tmp;
	            }
	            if ('..' == buffer) {
	              this._path.pop();
	              if ('/' != c && '\\' != c) {
	                this._path.push('');
	              }
	            } else if ('.' == buffer && '/' != c && '\\' != c) {
	              this._path.push('');
	            } else if ('.' != buffer) {
	              if ('file' == this._scheme && this._path.length == 0 && buffer.length == 2 && ALPHA.test(buffer[0]) && buffer[1] == '|') {
	                buffer = buffer[0] + ':';
	              }
	              this._path.push(buffer);
	            }
	            buffer = '';
	            if ('?' == c) {
	              this._query = '?';
	              state = 'query';
	            } else if ('#' == c) {
	              this._fragment = '#';
	              state = 'fragment';
	            }
	          } else if ('\t' != c && '\n' != c && '\r' != c) {
	            buffer += percentEscape(c);
	          }
	          break;

	        case 'query':
	          if (!stateOverride && '#' == c) {
	            this._fragment = '#';
	            state = 'fragment';
	          } else if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
	            this._query += percentEscapeQuery(c);
	          }
	          break;

	        case 'fragment':
	          if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
	            this._fragment += c;
	          }
	          break;
	      }

	      cursor++;
	    }
	  }

	  function clear() {
	    this._scheme = '';
	    this._schemeData = '';
	    this._username = '';
	    this._password = null;
	    this._host = '';
	    this._port = '';
	    this._path = [];
	    this._query = '';
	    this._fragment = '';
	    this._isInvalid = false;
	    this._isRelative = false;
	  }

	  // Does not process domain names or IP addresses.
	  // Does not handle encoding for the query parameter.
	  function jURL(url, base /* , encoding */) {
	    if (base !== undefined && !(base instanceof jURL))
	      base = new jURL(String(base));

	    this._url = url;
	    clear.call(this);

	    var input = url.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, '');
	    // encoding = encoding || 'utf-8'

	    parse.call(this, input, null, base);
	  }

	  jURL.prototype = {
	    toString: function() {
	      return this.href;
	    },
	    get href() {
	      if (this._isInvalid)
	        return this._url;

	      var authority = '';
	      if ('' != this._username || null != this._password) {
	        authority = this._username +
	            (null != this._password ? ':' + this._password : '') + '@';
	      }

	      return this.protocol +
	          (this._isRelative ? '//' + authority + this.host : '') +
	          this.pathname + this._query + this._fragment;
	    },
	    set href(href) {
	      clear.call(this);
	      parse.call(this, href);
	    },

	    get protocol() {
	      return this._scheme + ':';
	    },
	    set protocol(protocol) {
	      if (this._isInvalid)
	        return;
	      parse.call(this, protocol + ':', 'scheme start');
	    },

	    get host() {
	      return this._isInvalid ? '' : this._port ?
	          this._host + ':' + this._port : this._host;
	    },
	    set host(host) {
	      if (this._isInvalid || !this._isRelative)
	        return;
	      parse.call(this, host, 'host');
	    },

	    get hostname() {
	      return this._host;
	    },
	    set hostname(hostname) {
	      if (this._isInvalid || !this._isRelative)
	        return;
	      parse.call(this, hostname, 'hostname');
	    },

	    get port() {
	      return this._port;
	    },
	    set port(port) {
	      if (this._isInvalid || !this._isRelative)
	        return;
	      parse.call(this, port, 'port');
	    },

	    get pathname() {
	      return this._isInvalid ? '' : this._isRelative ?
	          '/' + this._path.join('/') : this._schemeData;
	    },
	    set pathname(pathname) {
	      if (this._isInvalid || !this._isRelative)
	        return;
	      this._path = [];
	      parse.call(this, pathname, 'relative path start');
	    },

	    get search() {
	      return this._isInvalid || !this._query || '?' == this._query ?
	          '' : this._query;
	    },
	    set search(search) {
	      if (this._isInvalid || !this._isRelative)
	        return;
	      this._query = '?';
	      if ('?' == search[0])
	        search = search.slice(1);
	      parse.call(this, search, 'query');
	    },

	    get hash() {
	      return this._isInvalid || !this._fragment || '#' == this._fragment ?
	          '' : this._fragment;
	    },
	    set hash(hash) {
	      if (this._isInvalid)
	        return;
	      this._fragment = '#';
	      if ('#' == hash[0])
	        hash = hash.slice(1);
	      parse.call(this, hash, 'fragment');
	    },

	    get origin() {
	      var host;
	      if (this._isInvalid || !this._scheme) {
	        return '';
	      }
	      // javascript: Gecko returns String(""), WebKit/Blink String("null")
	      // Gecko throws error for "data://"
	      // data: Gecko returns "", Blink returns "data://", WebKit returns "null"
	      // Gecko returns String("") for file: mailto:
	      // WebKit/Blink returns String("SCHEME://") for file: mailto:
	      switch (this._scheme) {
	        case 'data':
	        case 'file':
	        case 'javascript':
	        case 'mailto':
	          return 'null';
	      }
	      host = this.host;
	      if (!host) {
	        return '';
	      }
	      return this._scheme + '://' + host;
	    }
	  };

	  // Copy over the static methods
	  var OriginalURL = scope.URL;
	  if (OriginalURL) {
	    jURL.createObjectURL = function(blob) {
	      // IE extension allows a second optional options argument.
	      // http://msdn.microsoft.com/en-us/library/ie/hh772302(v=vs.85).aspx
	      return OriginalURL.createObjectURL.apply(OriginalURL, arguments);
	    };
	    jURL.revokeObjectURL = function(url) {
	      OriginalURL.revokeObjectURL(url);
	    };
	  }

	  scope.URL = jURL;
	  /* jshint ignore:end */
	})(globalScope);

	exports.FONT_IDENTITY_MATRIX = FONT_IDENTITY_MATRIX;
	exports.IDENTITY_MATRIX = IDENTITY_MATRIX;
	exports.OPS = OPS;
	exports.VERBOSITY_LEVELS = VERBOSITY_LEVELS;
	exports.UNSUPPORTED_FEATURES = UNSUPPORTED_FEATURES;
	exports.AnnotationBorderStyleType = AnnotationBorderStyleType;
	exports.AnnotationFlag = AnnotationFlag;
	exports.AnnotationType = AnnotationType;
	exports.FontType = FontType;
	exports.ImageKind = ImageKind;
	exports.InvalidPDFException = InvalidPDFException;
	exports.MessageHandler = MessageHandler;
	exports.MissingDataException = MissingDataException;
	exports.MissingPDFException = MissingPDFException;
	exports.NotImplementedException = NotImplementedException;
	exports.PageViewport = PageViewport;
	exports.PasswordException = PasswordException;
	exports.PasswordResponses = PasswordResponses;
	exports.StatTimer = StatTimer;
	exports.StreamType = StreamType;
	exports.TextRenderingMode = TextRenderingMode;
	exports.UnexpectedResponseException = UnexpectedResponseException;
	exports.UnknownErrorException = UnknownErrorException;
	exports.Util = Util;
	exports.XRefParseException = XRefParseException;
	exports.arrayByteLength = arrayByteLength;
	exports.arraysToBytes = arraysToBytes;
	exports.assert = assert;
	exports.bytesToString = bytesToString;
	exports.createBlob = createBlob;
	exports.createPromiseCapability = createPromiseCapability;
	exports.createObjectURL = createObjectURL;
	exports.deprecated = deprecated;
	exports.error = error;
	exports.getLookupTableFactory = getLookupTableFactory;
	exports.getVerbosityLevel = getVerbosityLevel;
	exports.globalScope = globalScope;
	exports.info = info;
	exports.isArray = isArray;
	exports.isArrayBuffer = isArrayBuffer;
	exports.isBool = isBool;
	exports.isEmptyObj = isEmptyObj;
	exports.isInt = isInt;
	exports.isNum = isNum;
	exports.isString = isString;
	exports.isSpace = isSpace;
	exports.isSameOrigin = isSameOrigin;
	exports.isValidUrl = isValidUrl;
	exports.isLittleEndian = isLittleEndian;
	exports.isEvalSupported = isEvalSupported;
	exports.loadJpegStream = loadJpegStream;
	exports.log2 = log2;
	exports.readInt8 = readInt8;
	exports.readUint16 = readUint16;
	exports.readUint32 = readUint32;
	exports.removeNullCharacters = removeNullCharacters;
	exports.setVerbosityLevel = setVerbosityLevel;
	exports.shadow = shadow;
	exports.string32 = string32;
	exports.stringToBytes = stringToBytes;
	exports.stringToPDFString = stringToPDFString;
	exports.stringToUTF8String = stringToUTF8String;
	exports.utf8StringToString = utf8StringToString;
	exports.warn = warn;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplayDOMUtils = {}), root.pdfjsSharedUtil);
	  }
	}(this, function (exports, sharedUtil) {

	var removeNullCharacters = sharedUtil.removeNullCharacters;
	var warn = sharedUtil.warn;

	/**
	 * Optimised CSS custom property getter/setter.
	 * @class
	 */
	var CustomStyle = (function CustomStyleClosure() {

	  // As noted on: http://www.zachstronaut.com/posts/2009/02/17/
	  //              animate-css-transforms-firefox-webkit.html
	  // in some versions of IE9 it is critical that ms appear in this list
	  // before Moz
	  var prefixes = ['ms', 'Moz', 'Webkit', 'O'];
	  var _cache = Object.create(null);

	  function CustomStyle() {}

	  CustomStyle.getProp = function get(propName, element) {
	    // check cache only when no element is given
	    if (arguments.length === 1 && typeof _cache[propName] === 'string') {
	      return _cache[propName];
	    }

	    element = element || document.documentElement;
	    var style = element.style, prefixed, uPropName;

	    // test standard property first
	    if (typeof style[propName] === 'string') {
	      return (_cache[propName] = propName);
	    }

	    // capitalize
	    uPropName = propName.charAt(0).toUpperCase() + propName.slice(1);

	    // test vendor specific properties
	    for (var i = 0, l = prefixes.length; i < l; i++) {
	      prefixed = prefixes[i] + uPropName;
	      if (typeof style[prefixed] === 'string') {
	        return (_cache[propName] = prefixed);
	      }
	    }

	    //if all fails then set to undefined
	    return (_cache[propName] = 'undefined');
	  };

	  CustomStyle.setProp = function set(propName, element, str) {
	    var prop = this.getProp(propName);
	    if (prop !== 'undefined') {
	      element.style[prop] = str;
	    }
	  };

	  return CustomStyle;
	})();

	function hasCanvasTypedArrays() {
	  var canvas = document.createElement('canvas');
	  canvas.width = canvas.height = 1;
	  var ctx = canvas.getContext('2d');
	  var imageData = ctx.createImageData(1, 1);
	  return (typeof imageData.data.buffer !== 'undefined');
	}

	var LinkTarget = {
	  NONE: 0, // Default value.
	  SELF: 1,
	  BLANK: 2,
	  PARENT: 3,
	  TOP: 4,
	};

	var LinkTargetStringMap = [
	  '',
	  '_self',
	  '_blank',
	  '_parent',
	  '_top'
	];

	/**
	 * @typedef ExternalLinkParameters
	 * @typedef {Object} ExternalLinkParameters
	 * @property {string} url - An absolute URL.
	 * @property {LinkTarget} target - The link target.
	 * @property {string} rel - The link relationship.
	 */

	/**
	 * Adds various attributes (href, title, target, rel) to hyperlinks.
	 * @param {HTMLLinkElement} link - The link element.
	 * @param {ExternalLinkParameters} params
	 */
	function addLinkAttributes(link, params) {
	  var url = params && params.url;
	  link.href = link.title = (url ? removeNullCharacters(url) : '');

	  if (url) {
	    var target = params.target;
	    if (typeof target === 'undefined') {
	      target = getDefaultSetting('externalLinkTarget');
	    }
	    link.target = LinkTargetStringMap[target];

	    var rel = params.rel;
	    if (typeof rel === 'undefined') {
	      rel = getDefaultSetting('externalLinkRel');
	    }
	    link.rel = rel;
	  }
	}

	// Gets the file name from a given URL.
	function getFilenameFromUrl(url) {
	  var anchor = url.indexOf('#');
	  var query = url.indexOf('?');
	  var end = Math.min(
	    anchor > 0 ? anchor : url.length,
	    query > 0 ? query : url.length);
	  return url.substring(url.lastIndexOf('/', end) + 1, end);
	}

	function getDefaultSetting(id) {
	  // The list of the settings and their default is maintained for backward
	  // compatibility and shall not be extended or modified. See also global.js.
	  var globalSettings = sharedUtil.globalScope.PDFJS;
	  switch (id) {
	    case 'pdfBug':
	      return globalSettings ? globalSettings.pdfBug : false;
	    case 'disableAutoFetch':
	      return globalSettings ? globalSettings.disableAutoFetch : false;
	    case 'disableStream':
	      return globalSettings ? globalSettings.disableStream : false;
	    case 'disableRange':
	      return globalSettings ? globalSettings.disableRange : false;
	    case 'disableFontFace':
	      return globalSettings ? globalSettings.disableFontFace : false;
	    case 'disableCreateObjectURL':
	      return globalSettings ? globalSettings.disableCreateObjectURL : false;
	    case 'disableWebGL':
	      return globalSettings ? globalSettings.disableWebGL : true;
	    case 'cMapUrl':
	      return globalSettings ? globalSettings.cMapUrl : null;
	    case 'cMapPacked':
	      return globalSettings ? globalSettings.cMapPacked : false;
	    case 'postMessageTransfers':
	      return globalSettings ? globalSettings.postMessageTransfers : true;
	    case 'workerSrc':
	      return globalSettings ? globalSettings.workerSrc : null;
	    case 'disableWorker':
	      return globalSettings ? globalSettings.disableWorker : false;
	    case 'maxImageSize':
	      return globalSettings ? globalSettings.maxImageSize : -1;
	    case 'imageResourcesPath':
	      return globalSettings ? globalSettings.imageResourcesPath : '';
	    case 'isEvalSupported':
	      return globalSettings ? globalSettings.isEvalSupported : true;
	    case 'externalLinkTarget':
	      if (!globalSettings) {
	        return LinkTarget.NONE;
	      }
	      switch (globalSettings.externalLinkTarget) {
	        case LinkTarget.NONE:
	        case LinkTarget.SELF:
	        case LinkTarget.BLANK:
	        case LinkTarget.PARENT:
	        case LinkTarget.TOP:
	          return globalSettings.externalLinkTarget;
	      }
	      warn('PDFJS.externalLinkTarget is invalid: ' +
	           globalSettings.externalLinkTarget);
	      // Reset the external link target, to suppress further warnings.
	      globalSettings.externalLinkTarget = LinkTarget.NONE;
	      return LinkTarget.NONE;
	    case 'externalLinkRel':
	      return globalSettings ? globalSettings.externalLinkRel : 'noreferrer';
	    case 'enableStats':
	      return !!(globalSettings && globalSettings.enableStats);
	    default:
	      throw new Error('Unknown default setting: ' + id);
	  }
	}

	function isExternalLinkTargetSet() {
	  var externalLinkTarget = getDefaultSetting('externalLinkTarget');
	  switch (externalLinkTarget) {
	    case LinkTarget.NONE:
	      return false;
	    case LinkTarget.SELF:
	    case LinkTarget.BLANK:
	    case LinkTarget.PARENT:
	    case LinkTarget.TOP:
	      return true;
	  }
	}

	exports.CustomStyle = CustomStyle;
	exports.addLinkAttributes = addLinkAttributes;
	exports.isExternalLinkTargetSet = isExternalLinkTargetSet;
	exports.getFilenameFromUrl = getFilenameFromUrl;
	exports.LinkTarget = LinkTarget;
	exports.hasCanvasTypedArrays = hasCanvasTypedArrays;
	exports.getDefaultSetting = getDefaultSetting;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplayFontLoader = {}), root.pdfjsSharedUtil);
	  }
	}(this, function (exports, sharedUtil) {

	var assert = sharedUtil.assert;
	var bytesToString = sharedUtil.bytesToString;
	var string32 = sharedUtil.string32;
	var shadow = sharedUtil.shadow;
	var warn = sharedUtil.warn;

	function FontLoader(docId) {
	  this.docId = docId;
	  this.styleElement = null;
	  this.nativeFontFaces = [];
	  this.loadTestFontId = 0;
	  this.loadingContext = {
	    requests: [],
	    nextRequestId: 0
	  };
	}
	FontLoader.prototype = {
	  insertRule: function fontLoaderInsertRule(rule) {
	    var styleElement = this.styleElement;
	    if (!styleElement) {
	      styleElement = this.styleElement = document.createElement('style');
	      styleElement.id = 'PDFJS_FONT_STYLE_TAG_' + this.docId;
	      document.documentElement.getElementsByTagName('head')[0].appendChild(
	        styleElement);
	    }

	    var styleSheet = styleElement.sheet;
	    styleSheet.insertRule(rule, styleSheet.cssRules.length);
	  },

	  clear: function fontLoaderClear() {
	    var styleElement = this.styleElement;
	    if (styleElement) {
	      styleElement.parentNode.removeChild(styleElement);
	      styleElement = this.styleElement = null;
	    }
	    this.nativeFontFaces.forEach(function(nativeFontFace) {
	      document.fonts.delete(nativeFontFace);
	    });
	    this.nativeFontFaces.length = 0;
	  },
	  get loadTestFont() {
	    // This is a CFF font with 1 glyph for '.' that fills its entire width and
	    // height.
	    return shadow(this, 'loadTestFont', atob(
	      'T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQ' +
	      'AABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwA' +
	      'AAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbm' +
	      'FtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAA' +
	      'AADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6A' +
	      'ABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAA' +
	      'MQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAA' +
	      'AAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAA' +
	      'AAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQ' +
	      'AAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMA' +
	      'AQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAA' +
	      'EAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAA' +
	      'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAA' +
	      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
	      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
	      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
	      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAA' +
	      'AAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgc' +
	      'A/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWF' +
	      'hYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQA' +
	      'AAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAg' +
	      'ABAAAAAAAAAAAD6AAAAAAAAA=='
	    ));
	  },

	  addNativeFontFace: function fontLoader_addNativeFontFace(nativeFontFace) {
	    this.nativeFontFaces.push(nativeFontFace);
	    document.fonts.add(nativeFontFace);
	  },

	  bind: function fontLoaderBind(fonts, callback) {
	    var rules = [];
	    var fontsToLoad = [];
	    var fontLoadPromises = [];
	    var getNativeFontPromise = function(nativeFontFace) {
	      // Return a promise that is always fulfilled, even when the font fails to
	      // load.
	      return nativeFontFace.loaded.catch(function(e) {
	        warn('Failed to load font "' + nativeFontFace.family + '": ' + e);
	      });
	    };
	    for (var i = 0, ii = fonts.length; i < ii; i++) {
	      var font = fonts[i];

	      // Add the font to the DOM only once or skip if the font
	      // is already loaded.
	      if (font.attached || font.loading === false) {
	        continue;
	      }
	      font.attached = true;

	      if (FontLoader.isFontLoadingAPISupported) {
	        var nativeFontFace = font.createNativeFontFace();
	        if (nativeFontFace) {
	          this.addNativeFontFace(nativeFontFace);
	          fontLoadPromises.push(getNativeFontPromise(nativeFontFace));
	        }
	      } else {
	        var rule = font.createFontFaceRule();
	        if (rule) {
	          this.insertRule(rule);
	          rules.push(rule);
	          fontsToLoad.push(font);
	        }
	      }
	    }

	    var request = this.queueLoadingCallback(callback);
	    if (FontLoader.isFontLoadingAPISupported) {
	      Promise.all(fontLoadPromises).then(function() {
	        request.complete();
	      });
	    } else if (rules.length > 0 && !FontLoader.isSyncFontLoadingSupported) {
	      this.prepareFontLoadEvent(rules, fontsToLoad, request);
	    } else {
	      request.complete();
	    }
	  },

	  queueLoadingCallback: function FontLoader_queueLoadingCallback(callback) {
	    function LoadLoader_completeRequest() {
	      assert(!request.end, 'completeRequest() cannot be called twice');
	      request.end = Date.now();

	      // sending all completed requests in order how they were queued
	      while (context.requests.length > 0 && context.requests[0].end) {
	        var otherRequest = context.requests.shift();
	        setTimeout(otherRequest.callback, 0);
	      }
	    }

	    var context = this.loadingContext;
	    var requestId = 'pdfjs-font-loading-' + (context.nextRequestId++);
	    var request = {
	      id: requestId,
	      complete: LoadLoader_completeRequest,
	      callback: callback,
	      started: Date.now()
	    };
	    context.requests.push(request);
	    return request;
	  },

	  prepareFontLoadEvent: function fontLoaderPrepareFontLoadEvent(rules,
	                                                                fonts,
	                                                                request) {
	      /** Hack begin */
	      // There's currently no event when a font has finished downloading so the
	      // following code is a dirty hack to 'guess' when a font is
	      // ready. It's assumed fonts are loaded in order, so add a known test
	      // font after the desired fonts and then test for the loading of that
	      // test font.

	      function int32(data, offset) {
	        return (data.charCodeAt(offset) << 24) |
	               (data.charCodeAt(offset + 1) << 16) |
	               (data.charCodeAt(offset + 2) << 8) |
	               (data.charCodeAt(offset + 3) & 0xff);
	      }

	      function spliceString(s, offset, remove, insert) {
	        var chunk1 = s.substr(0, offset);
	        var chunk2 = s.substr(offset + remove);
	        return chunk1 + insert + chunk2;
	      }

	      var i, ii;

	      var canvas = document.createElement('canvas');
	      canvas.width = 1;
	      canvas.height = 1;
	      var ctx = canvas.getContext('2d');

	      var called = 0;
	      function isFontReady(name, callback) {
	        called++;
	        // With setTimeout clamping this gives the font ~100ms to load.
	        if(called > 30) {
	          warn('Load test font never loaded.');
	          callback();
	          return;
	        }
	        ctx.font = '30px ' + name;
	        ctx.fillText('.', 0, 20);
	        var imageData = ctx.getImageData(0, 0, 1, 1);
	        if (imageData.data[3] > 0) {
	          callback();
	          return;
	        }
	        setTimeout(isFontReady.bind(null, name, callback));
	      }

	      var loadTestFontId = 'lt' + Date.now() + this.loadTestFontId++;
	      // Chromium seems to cache fonts based on a hash of the actual font data,
	      // so the font must be modified for each load test else it will appear to
	      // be loaded already.
	      // TODO: This could maybe be made faster by avoiding the btoa of the full
	      // font by splitting it in chunks before hand and padding the font id.
	      var data = this.loadTestFont;
	      var COMMENT_OFFSET = 976; // has to be on 4 byte boundary (for checksum)
	      data = spliceString(data, COMMENT_OFFSET, loadTestFontId.length,
	                          loadTestFontId);
	      // CFF checksum is important for IE, adjusting it
	      var CFF_CHECKSUM_OFFSET = 16;
	      var XXXX_VALUE = 0x58585858; // the "comment" filled with 'X'
	      var checksum = int32(data, CFF_CHECKSUM_OFFSET);
	      for (i = 0, ii = loadTestFontId.length - 3; i < ii; i += 4) {
	        checksum = (checksum - XXXX_VALUE + int32(loadTestFontId, i)) | 0;
	      }
	      if (i < loadTestFontId.length) { // align to 4 bytes boundary
	        checksum = (checksum - XXXX_VALUE +
	                    int32(loadTestFontId + 'XXX', i)) | 0;
	      }
	      data = spliceString(data, CFF_CHECKSUM_OFFSET, 4, string32(checksum));

	      var url = 'url(data:font/opentype;base64,' + btoa(data) + ');';
	      var rule = '@font-face { font-family:"' + loadTestFontId + '";src:' +
	                 url + '}';
	      this.insertRule(rule);

	      var names = [];
	      for (i = 0, ii = fonts.length; i < ii; i++) {
	        names.push(fonts[i].loadedName);
	      }
	      names.push(loadTestFontId);

	      var div = document.createElement('div');
	      div.setAttribute('style',
	                       'visibility: hidden;' +
	                       'width: 10px; height: 10px;' +
	                       'position: absolute; top: 0px; left: 0px;');
	      for (i = 0, ii = names.length; i < ii; ++i) {
	        var span = document.createElement('span');
	        span.textContent = 'Hi';
	        span.style.fontFamily = names[i];
	        div.appendChild(span);
	      }
	      document.body.appendChild(div);

	      isFontReady(loadTestFontId, function() {
	        document.body.removeChild(div);
	        request.complete();
	      });
	      /** Hack end */
	  }
	};
	FontLoader.isFontLoadingAPISupported = typeof document !== 'undefined' &&
	                                       !!document.fonts;
	Object.defineProperty(FontLoader, 'isSyncFontLoadingSupported', {
	  get: function () {
	    if (typeof navigator === 'undefined') {
	      // node.js - we can pretend sync font loading is supported.
	      return shadow(FontLoader, 'isSyncFontLoadingSupported', true);
	    }

	    var supported = false;

	    // User agent string sniffing is bad, but there is no reliable way to tell
	    // if font is fully loaded and ready to be used with canvas.
	    var m = /Mozilla\/5.0.*?rv:(\d+).*? Gecko/.exec(navigator.userAgent);
	    if (m && m[1] >= 14) {
	      supported = true;
	    }
	    // TODO other browsers
	    return shadow(FontLoader, 'isSyncFontLoadingSupported', supported);
	  },
	  enumerable: true,
	  configurable: true
	});

	var IsEvalSupportedCached = {
	  get value() {
	    return shadow(this, 'value', sharedUtil.isEvalSupported());
	  }
	};

	var FontFaceObject = (function FontFaceObjectClosure() {
	  function FontFaceObject(translatedData, options) {
	    this.compiledGlyphs = Object.create(null);
	    // importing translated data
	    for (var i in translatedData) {
	      this[i] = translatedData[i];
	    }
	    this.options = options;
	  }
	  FontFaceObject.prototype = {
	    createNativeFontFace: function FontFaceObject_createNativeFontFace() {
	      if (!this.data) {
	        return null;
	      }

	      if (this.options.disableFontFace) {
	        this.disableFontFace = true;
	        return null;
	      }

	      var nativeFontFace = new FontFace(this.loadedName, this.data, {});

	      if (this.options.fontRegistry) {
	        this.options.fontRegistry.registerFont(this);
	      }
	      return nativeFontFace;
	    },

	    createFontFaceRule: function FontFaceObject_createFontFaceRule() {
	      if (!this.data) {
	        return null;
	      }

	      if (this.options.disableFontFace) {
	        this.disableFontFace = true;
	        return null;
	      }

	      var data = bytesToString(new Uint8Array(this.data));
	      var fontName = this.loadedName;

	      // Add the font-face rule to the document
	      var url = ('url(data:' + this.mimetype + ';base64,' + btoa(data) + ');');
	      var rule = '@font-face { font-family:"' + fontName + '";src:' + url + '}';

	      if (this.options.fontRegistry) {
	        this.options.fontRegistry.registerFont(this, url);
	      }

	      return rule;
	    },

	    getPathGenerator:
	        function FontFaceObject_getPathGenerator(objs, character) {
	      if (!(character in this.compiledGlyphs)) {
	        var cmds = objs.get(this.loadedName + '_path_' + character);
	        var current, i, len;

	        // If we can, compile cmds into JS for MAXIMUM SPEED
	        if (this.options.isEvalSupported && IsEvalSupportedCached.value) {
	          var args, js = '';
	          for (i = 0, len = cmds.length; i < len; i++) {
	            current = cmds[i];

	            if (current.args !== undefined) {
	              args = current.args.join(',');
	            } else {
	              args = '';
	            }

	            js += 'c.' + current.cmd + '(' + args + ');\n';
	          }
	          /* jshint -W054 */
	          this.compiledGlyphs[character] = new Function('c', 'size', js);
	        } else {
	          // But fall back on using Function.prototype.apply() if we're
	          // blocked from using eval() for whatever reason (like CSP policies)
	          this.compiledGlyphs[character] = function(c, size) {
	            for (i = 0, len = cmds.length; i < len; i++) {
	              current = cmds[i];

	              if (current.cmd === 'scale') {
	                current.args = [size, -size];
	              }

	              c[current.cmd].apply(c, current.args);
	            }
	          };
	        }
	      }
	      return this.compiledGlyphs[character];
	    }
	  };
	  return FontFaceObject;
	})();

	exports.FontFaceObject = FontFaceObject;
	exports.FontLoader = FontLoader;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplayMetadata = {}), root.pdfjsSharedUtil);
	  }
	}(this, function (exports, sharedUtil) {

	var error = sharedUtil.error;

	  function fixMetadata(meta) {
	    return meta.replace(/>\\376\\377([^<]+)/g, function(all, codes) {
	      var bytes = codes.replace(/\\([0-3])([0-7])([0-7])/g,
	                                function(code, d1, d2, d3) {
	        return String.fromCharCode(d1 * 64 + d2 * 8 + d3 * 1);
	      });
	      var chars = '';
	      for (var i = 0; i < bytes.length; i += 2) {
	        var code = bytes.charCodeAt(i) * 256 + bytes.charCodeAt(i + 1);
	        chars += code >= 32 && code < 127 && code !== 60 && code !== 62 &&
	          code !== 38 && false ? String.fromCharCode(code) :
	          '&#x' + (0x10000 + code).toString(16).substring(1) + ';';
	      }
	      return '>' + chars;
	    });
	  }

	  function Metadata(meta) {
	    if (typeof meta === 'string') {
	      // Ghostscript produces invalid metadata
	      meta = fixMetadata(meta);

	      var parser = new DOMParser();
	      meta = parser.parseFromString(meta, 'application/xml');
	    } else if (!(meta instanceof Document)) {
	      error('Metadata: Invalid metadata object');
	    }

	    this.metaDocument = meta;
	    this.metadata = Object.create(null);
	    this.parse();
	  }

	  Metadata.prototype = {
	    parse: function Metadata_parse() {
	      var doc = this.metaDocument;
	      var rdf = doc.documentElement;

	      if (rdf.nodeName.toLowerCase() !== 'rdf:rdf') { // Wrapped in <xmpmeta>
	        rdf = rdf.firstChild;
	        while (rdf && rdf.nodeName.toLowerCase() !== 'rdf:rdf') {
	          rdf = rdf.nextSibling;
	        }
	      }

	      var nodeName = (rdf) ? rdf.nodeName.toLowerCase() : null;
	      if (!rdf || nodeName !== 'rdf:rdf' || !rdf.hasChildNodes()) {
	        return;
	      }

	      var children = rdf.childNodes, desc, entry, name, i, ii, length, iLength;
	      for (i = 0, length = children.length; i < length; i++) {
	        desc = children[i];
	        if (desc.nodeName.toLowerCase() !== 'rdf:description') {
	          continue;
	        }

	        for (ii = 0, iLength = desc.childNodes.length; ii < iLength; ii++) {
	          if (desc.childNodes[ii].nodeName.toLowerCase() !== '#text') {
	            entry = desc.childNodes[ii];
	            name = entry.nodeName.toLowerCase();
	            this.metadata[name] = entry.textContent.trim();
	          }
	        }
	      }
	    },

	    get: function Metadata_get(name) {
	      return this.metadata[name] || null;
	    },

	    has: function Metadata_has(name) {
	      return typeof this.metadata[name] !== 'undefined';
	    }
	  };

	exports.Metadata = Metadata;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplaySVG = {}), root.pdfjsSharedUtil);
	  }
	}(this, function (exports, sharedUtil) {
	var FONT_IDENTITY_MATRIX = sharedUtil.FONT_IDENTITY_MATRIX;
	var IDENTITY_MATRIX = sharedUtil.IDENTITY_MATRIX;
	var ImageKind = sharedUtil.ImageKind;
	var OPS = sharedUtil.OPS;
	var Util = sharedUtil.Util;
	var isNum = sharedUtil.isNum;
	var isArray = sharedUtil.isArray;
	var warn = sharedUtil.warn;
	var createObjectURL = sharedUtil.createObjectURL;

	var SVG_DEFAULTS = {
	  fontStyle: 'normal',
	  fontWeight: 'normal',
	  fillColor: '#000000'
	};

	var convertImgDataToPng = (function convertImgDataToPngClosure() {
	  var PNG_HEADER =
	    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

	  var CHUNK_WRAPPER_SIZE = 12;

	  var crcTable = new Int32Array(256);
	  for (var i = 0; i < 256; i++) {
	    var c = i;
	    for (var h = 0; h < 8; h++) {
	      if (c & 1) {
	        c = 0xedB88320 ^ ((c >> 1) & 0x7fffffff);
	      } else {
	        c = (c >> 1) & 0x7fffffff;
	      }
	    }
	    crcTable[i] = c;
	  }

	  function crc32(data, start, end) {
	    var crc = -1;
	    for (var i = start; i < end; i++) {
	      var a = (crc ^ data[i]) & 0xff;
	      var b = crcTable[a];
	      crc = (crc >>> 8) ^ b;
	    }
	    return crc ^ -1;
	  }

	  function writePngChunk(type, body, data, offset) {
	    var p = offset;
	    var len = body.length;

	    data[p] = len >> 24 & 0xff;
	    data[p + 1] = len >> 16 & 0xff;
	    data[p + 2] = len >> 8 & 0xff;
	    data[p + 3] = len & 0xff;
	    p += 4;

	    data[p] = type.charCodeAt(0) & 0xff;
	    data[p + 1] = type.charCodeAt(1) & 0xff;
	    data[p + 2] = type.charCodeAt(2) & 0xff;
	    data[p + 3] = type.charCodeAt(3) & 0xff;
	    p += 4;

	    data.set(body, p);
	    p += body.length;

	    var crc = crc32(data, offset + 4, p);

	    data[p] = crc >> 24 & 0xff;
	    data[p + 1] = crc >> 16 & 0xff;
	    data[p + 2] = crc >> 8 & 0xff;
	    data[p + 3] = crc & 0xff;
	  }

	  function adler32(data, start, end) {
	    var a = 1;
	    var b = 0;
	    for (var i = start; i < end; ++i) {
	      a = (a + (data[i] & 0xff)) % 65521;
	      b = (b + a) % 65521;
	    }
	    return (b << 16) | a;
	  }

	  function encode(imgData, kind, forceDataSchema) {
	    var width = imgData.width;
	    var height = imgData.height;
	    var bitDepth, colorType, lineSize;
	    var bytes = imgData.data;

	    switch (kind) {
	      case ImageKind.GRAYSCALE_1BPP:
	        colorType = 0;
	        bitDepth = 1;
	        lineSize = (width + 7) >> 3;
	        break;
	      case ImageKind.RGB_24BPP:
	        colorType = 2;
	        bitDepth = 8;
	        lineSize = width * 3;
	        break;
	      case ImageKind.RGBA_32BPP:
	        colorType = 6;
	        bitDepth = 8;
	        lineSize = width * 4;
	        break;
	      default:
	        throw new Error('invalid format');
	    }

	    // prefix every row with predictor 0
	    var literals = new Uint8Array((1 + lineSize) * height);
	    var offsetLiterals = 0, offsetBytes = 0;
	    var y, i;
	    for (y = 0; y < height; ++y) {
	      literals[offsetLiterals++] = 0; // no prediction
	      literals.set(bytes.subarray(offsetBytes, offsetBytes + lineSize),
	                   offsetLiterals);
	      offsetBytes += lineSize;
	      offsetLiterals += lineSize;
	    }

	    if (kind === ImageKind.GRAYSCALE_1BPP) {
	      // inverting for B/W
	      offsetLiterals = 0;
	      for (y = 0; y < height; y++) {
	        offsetLiterals++; // skipping predictor
	        for (i = 0; i < lineSize; i++) {
	          literals[offsetLiterals++] ^= 0xFF;
	        }
	      }
	    }

	    var ihdr = new Uint8Array([
	      width >> 24 & 0xff,
	      width >> 16 & 0xff,
	      width >> 8 & 0xff,
	      width & 0xff,
	      height >> 24 & 0xff,
	      height >> 16 & 0xff,
	      height >> 8 & 0xff,
	      height & 0xff,
	      bitDepth, // bit depth
	      colorType, // color type
	      0x00, // compression method
	      0x00, // filter method
	      0x00 // interlace method
	    ]);

	    var len = literals.length;
	    var maxBlockLength = 0xFFFF;

	    var deflateBlocks = Math.ceil(len / maxBlockLength);
	    var idat = new Uint8Array(2 + len + deflateBlocks * 5 + 4);
	    var pi = 0;
	    idat[pi++] = 0x78; // compression method and flags
	    idat[pi++] = 0x9c; // flags

	    var pos = 0;
	    while (len > maxBlockLength) {
	      // writing non-final DEFLATE blocks type 0 and length of 65535
	      idat[pi++] = 0x00;
	      idat[pi++] = 0xff;
	      idat[pi++] = 0xff;
	      idat[pi++] = 0x00;
	      idat[pi++] = 0x00;
	      idat.set(literals.subarray(pos, pos + maxBlockLength), pi);
	      pi += maxBlockLength;
	      pos += maxBlockLength;
	      len -= maxBlockLength;
	    }

	    // writing non-final DEFLATE blocks type 0
	    idat[pi++] = 0x01;
	    idat[pi++] = len & 0xff;
	    idat[pi++] = len >> 8 & 0xff;
	    idat[pi++] = (~len & 0xffff) & 0xff;
	    idat[pi++] = (~len & 0xffff) >> 8 & 0xff;
	    idat.set(literals.subarray(pos), pi);
	    pi += literals.length - pos;

	    var adler = adler32(literals, 0, literals.length); // checksum
	    idat[pi++] = adler >> 24 & 0xff;
	    idat[pi++] = adler >> 16 & 0xff;
	    idat[pi++] = adler >> 8 & 0xff;
	    idat[pi++] = adler & 0xff;

	    // PNG will consists: header, IHDR+data, IDAT+data, and IEND.
	    var pngLength = PNG_HEADER.length + (CHUNK_WRAPPER_SIZE * 3) +
	                    ihdr.length + idat.length;
	    var data = new Uint8Array(pngLength);
	    var offset = 0;
	    data.set(PNG_HEADER, offset);
	    offset += PNG_HEADER.length;
	    writePngChunk('IHDR', ihdr, data, offset);
	    offset += CHUNK_WRAPPER_SIZE + ihdr.length;
	    writePngChunk('IDATA', idat, data, offset);
	    offset += CHUNK_WRAPPER_SIZE + idat.length;
	    writePngChunk('IEND', new Uint8Array(0), data, offset);

	    return createObjectURL(data, 'image/png', forceDataSchema);
	  }

	  return function convertImgDataToPng(imgData, forceDataSchema) {
	    var kind = (imgData.kind === undefined ?
	                ImageKind.GRAYSCALE_1BPP : imgData.kind);
	    return encode(imgData, kind, forceDataSchema);
	  };
	})();

	var SVGExtraState = (function SVGExtraStateClosure() {
	  function SVGExtraState() {
	    this.fontSizeScale = 1;
	    this.fontWeight = SVG_DEFAULTS.fontWeight;
	    this.fontSize = 0;

	    this.textMatrix = IDENTITY_MATRIX;
	    this.fontMatrix = FONT_IDENTITY_MATRIX;
	    this.leading = 0;

	    // Current point (in user coordinates)
	    this.x = 0;
	    this.y = 0;

	    // Start of text line (in text coordinates)
	    this.lineX = 0;
	    this.lineY = 0;

	    // Character and word spacing
	    this.charSpacing = 0;
	    this.wordSpacing = 0;
	    this.textHScale = 1;
	    this.textRise = 0;

	    // Default foreground and background colors
	    this.fillColor = SVG_DEFAULTS.fillColor;
	    this.strokeColor = '#000000';

	    this.fillAlpha = 1;
	    this.strokeAlpha = 1;
	    this.lineWidth = 1;
	    this.lineJoin = '';
	    this.lineCap = '';
	    this.miterLimit = 0;

	    this.dashArray = [];
	    this.dashPhase = 0;

	    this.dependencies = [];

	    // Clipping
	    this.clipId = '';
	    this.pendingClip = false;

	    this.maskId = '';
	  }

	  SVGExtraState.prototype = {
	    clone: function SVGExtraState_clone() {
	      return Object.create(this);
	    },
	    setCurrentPoint: function SVGExtraState_setCurrentPoint(x, y) {
	      this.x = x;
	      this.y = y;
	    }
	  };
	  return SVGExtraState;
	})();

	var SVGGraphics = (function SVGGraphicsClosure() {
	  function createScratchSVG(width, height) {
	    var NS = 'http://www.w3.org/2000/svg';
	    var svg = document.createElementNS(NS, 'svg:svg');
	    svg.setAttributeNS(null, 'version', '1.1');
	    svg.setAttributeNS(null, 'width', width + 'px');
	    svg.setAttributeNS(null, 'height', height + 'px');
	    svg.setAttributeNS(null, 'viewBox', '0 0 ' + width + ' ' + height);
	    return svg;
	  }

	  function opListToTree(opList) {
	    var opTree = [];
	    var tmp = [];
	    var opListLen = opList.length;

	    for (var x = 0; x < opListLen; x++) {
	      if (opList[x].fn === 'save') {
	        opTree.push({'fnId': 92, 'fn': 'group', 'items': []});
	        tmp.push(opTree);
	        opTree = opTree[opTree.length - 1].items;
	        continue;
	      }

	      if(opList[x].fn === 'restore') {
	        opTree = tmp.pop();
	      } else {
	        opTree.push(opList[x]);
	      }
	    }
	    return opTree;
	  }

	  /**
	   * Formats float number.
	   * @param value {number} number to format.
	   * @returns {string}
	   */
	  function pf(value) {
	    if (value === (value | 0)) { // integer number
	      return value.toString();
	    }
	    var s = value.toFixed(10);
	    var i = s.length - 1;
	    if (s[i] !== '0') {
	      return s;
	    }
	    // removing trailing zeros
	    do {
	      i--;
	    } while (s[i] === '0');
	    return s.substr(0, s[i] === '.' ? i : i + 1);
	  }

	  /**
	   * Formats transform matrix. The standard rotation, scale and translate
	   * matrices are replaced by their shorter forms, and for identity matrix
	   * returns empty string to save the memory.
	   * @param m {Array} matrix to format.
	   * @returns {string}
	   */
	  function pm(m) {
	    if (m[4] === 0 && m[5] === 0) {
	      if (m[1] === 0 && m[2] === 0) {
	        if (m[0] === 1 && m[3] === 1) {
	          return '';
	        }
	        return 'scale(' + pf(m[0]) + ' ' + pf(m[3]) + ')';
	      }
	      if (m[0] === m[3] && m[1] === -m[2]) {
	        var a = Math.acos(m[0]) * 180 / Math.PI;
	        return 'rotate(' + pf(a) + ')';
	      }
	    } else {
	      if (m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1) {
	        return 'translate(' + pf(m[4]) + ' ' + pf(m[5]) + ')';
	      }
	    }
	    return 'matrix(' + pf(m[0]) + ' ' + pf(m[1]) + ' ' + pf(m[2]) + ' ' +
	      pf(m[3]) + ' ' + pf(m[4]) + ' ' + pf(m[5]) + ')';
	  }

	  function SVGGraphics(commonObjs, objs, forceDataSchema) {
	    this.current = new SVGExtraState();
	    this.transformMatrix = IDENTITY_MATRIX; // Graphics state matrix
	    this.transformStack = [];
	    this.extraStack = [];
	    this.commonObjs = commonObjs;
	    this.objs = objs;
	    this.pendingEOFill = false;

	    this.embedFonts = false;
	    this.embeddedFonts = Object.create(null);
	    this.cssStyle = null;
	    this.forceDataSchema = !!forceDataSchema;
	  }

	  var NS = 'http://www.w3.org/2000/svg';
	  var XML_NS = 'http://www.w3.org/XML/1998/namespace';
	  var XLINK_NS = 'http://www.w3.org/1999/xlink';
	  var LINE_CAP_STYLES = ['butt', 'round', 'square'];
	  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];
	  var clipCount = 0;
	  var maskCount = 0;

	  SVGGraphics.prototype = {
	    save: function SVGGraphics_save() {
	      this.transformStack.push(this.transformMatrix);
	      var old = this.current;
	      this.extraStack.push(old);
	      this.current = old.clone();
	    },

	    restore: function SVGGraphics_restore() {
	      this.transformMatrix = this.transformStack.pop();
	      this.current = this.extraStack.pop();

	      this.tgrp = document.createElementNS(NS, 'svg:g');
	      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
	      this.pgrp.appendChild(this.tgrp);
	    },

	    group: function SVGGraphics_group(items) {
	      this.save();
	      this.executeOpTree(items);
	      this.restore();
	    },

	    loadDependencies: function SVGGraphics_loadDependencies(operatorList) {
	      var fnArray = operatorList.fnArray;
	      var fnArrayLen = fnArray.length;
	      var argsArray = operatorList.argsArray;

	      var self = this;
	      for (var i = 0; i < fnArrayLen; i++) {
	        if (OPS.dependency === fnArray[i]) {
	          var deps = argsArray[i];
	          for (var n = 0, nn = deps.length; n < nn; n++) {
	            var obj = deps[n];
	            var common = obj.substring(0, 2) === 'g_';
	            var promise;
	            if (common) {
	              promise = new Promise(function(resolve) {
	                self.commonObjs.get(obj, resolve);
	              });
	            } else {
	              promise = new Promise(function(resolve) {
	                self.objs.get(obj, resolve);
	              });
	            }
	            this.current.dependencies.push(promise);
	          }
	        }
	      }
	      return Promise.all(this.current.dependencies);
	    },

	    transform: function SVGGraphics_transform(a, b, c, d, e, f) {
	      var transformMatrix = [a, b, c, d, e, f];
	      this.transformMatrix = Util.transform(this.transformMatrix,
	                                            transformMatrix);

	      this.tgrp = document.createElementNS(NS, 'svg:g');
	      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
	    },

	    getSVG: function SVGGraphics_getSVG(operatorList, viewport) {
	      this.svg = createScratchSVG(viewport.width, viewport.height);
	      this.viewport = viewport;

	      return this.loadDependencies(operatorList).then(function () {
	        this.transformMatrix = IDENTITY_MATRIX;
	        this.pgrp = document.createElementNS(NS, 'svg:g'); // Parent group
	        this.pgrp.setAttributeNS(null, 'transform', pm(viewport.transform));
	        this.tgrp = document.createElementNS(NS, 'svg:g'); // Transform group
	        this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
	        this.defs = document.createElementNS(NS, 'svg:defs');
	        this.pgrp.appendChild(this.defs);
	        this.pgrp.appendChild(this.tgrp);
	        this.svg.appendChild(this.pgrp);
	        var opTree = this.convertOpList(operatorList);
	        this.executeOpTree(opTree);
	        return this.svg;
	      }.bind(this));
	    },

	    convertOpList: function SVGGraphics_convertOpList(operatorList) {
	      var argsArray = operatorList.argsArray;
	      var fnArray = operatorList.fnArray;
	      var fnArrayLen  = fnArray.length;
	      var REVOPS = [];
	      var opList = [];

	      for (var op in OPS) {
	        REVOPS[OPS[op]] = op;
	      }

	      for (var x = 0; x < fnArrayLen; x++) {
	        var fnId = fnArray[x];
	        opList.push({'fnId' : fnId, 'fn': REVOPS[fnId], 'args': argsArray[x]});
	      }
	      return opListToTree(opList);
	    },

	    executeOpTree: function SVGGraphics_executeOpTree(opTree) {
	      var opTreeLen = opTree.length;
	      for(var x = 0; x < opTreeLen; x++) {
	        var fn = opTree[x].fn;
	        var fnId = opTree[x].fnId;
	        var args = opTree[x].args;

	        switch (fnId | 0) {
	          case OPS.beginText:
	            this.beginText();
	            break;
	          case OPS.setLeading:
	            this.setLeading(args);
	            break;
	          case OPS.setLeadingMoveText:
	            this.setLeadingMoveText(args[0], args[1]);
	            break;
	          case OPS.setFont:
	            this.setFont(args);
	            break;
	          case OPS.showText:
	            this.showText(args[0]);
	            break;
	          case OPS.showSpacedText:
	            this.showText(args[0]);
	            break;
	          case OPS.endText:
	            this.endText();
	            break;
	          case OPS.moveText:
	            this.moveText(args[0], args[1]);
	            break;
	          case OPS.setCharSpacing:
	            this.setCharSpacing(args[0]);
	            break;
	          case OPS.setWordSpacing:
	            this.setWordSpacing(args[0]);
	            break;
	          case OPS.setHScale:
	            this.setHScale(args[0]);
	            break;
	          case OPS.setTextMatrix:
	            this.setTextMatrix(args[0], args[1], args[2],
	                               args[3], args[4], args[5]);
	            break;
	          case OPS.setLineWidth:
	            this.setLineWidth(args[0]);
	            break;
	          case OPS.setLineJoin:
	            this.setLineJoin(args[0]);
	            break;
	          case OPS.setLineCap:
	            this.setLineCap(args[0]);
	            break;
	          case OPS.setMiterLimit:
	            this.setMiterLimit(args[0]);
	            break;
	          case OPS.setFillRGBColor:
	            this.setFillRGBColor(args[0], args[1], args[2]);
	            break;
	          case OPS.setStrokeRGBColor:
	            this.setStrokeRGBColor(args[0], args[1], args[2]);
	            break;
	          case OPS.setDash:
	            this.setDash(args[0], args[1]);
	            break;
	          case OPS.setGState:
	            this.setGState(args[0]);
	            break;
	          case OPS.fill:
	            this.fill();
	            break;
	          case OPS.eoFill:
	            this.eoFill();
	            break;
	          case OPS.stroke:
	            this.stroke();
	            break;
	          case OPS.fillStroke:
	            this.fillStroke();
	            break;
	          case OPS.eoFillStroke:
	            this.eoFillStroke();
	            break;
	          case OPS.clip:
	            this.clip('nonzero');
	            break;
	          case OPS.eoClip:
	            this.clip('evenodd');
	            break;
	          case OPS.paintSolidColorImageMask:
	            this.paintSolidColorImageMask();
	            break;
	          case OPS.paintJpegXObject:
	            this.paintJpegXObject(args[0], args[1], args[2]);
	            break;
	          case OPS.paintImageXObject:
	            this.paintImageXObject(args[0]);
	            break;
	          case OPS.paintInlineImageXObject:
	            this.paintInlineImageXObject(args[0]);
	            break;
	          case OPS.paintImageMaskXObject:
	            this.paintImageMaskXObject(args[0]);
	            break;
	          case OPS.paintFormXObjectBegin:
	            this.paintFormXObjectBegin(args[0], args[1]);
	            break;
	          case OPS.paintFormXObjectEnd:
	            this.paintFormXObjectEnd();
	            break;
	          case OPS.closePath:
	            this.closePath();
	            break;
	          case OPS.closeStroke:
	            this.closeStroke();
	            break;
	          case OPS.closeFillStroke:
	            this.closeFillStroke();
	            break;
	          case OPS.nextLine:
	            this.nextLine();
	            break;
	          case OPS.transform:
	            this.transform(args[0], args[1], args[2], args[3],
	                           args[4], args[5]);
	            break;
	          case OPS.constructPath:
	            this.constructPath(args[0], args[1]);
	            break;
	          case OPS.endPath:
	            this.endPath();
	            break;
	          case 92:
	            this.group(opTree[x].items);
	            break;
	          default:
	            warn('Unimplemented method '+ fn);
	            break;
	        }
	      }
	    },

	    setWordSpacing: function SVGGraphics_setWordSpacing(wordSpacing) {
	      this.current.wordSpacing = wordSpacing;
	    },

	    setCharSpacing: function SVGGraphics_setCharSpacing(charSpacing) {
	      this.current.charSpacing = charSpacing;
	    },

	    nextLine: function SVGGraphics_nextLine() {
	      this.moveText(0, this.current.leading);
	    },

	    setTextMatrix: function SVGGraphics_setTextMatrix(a, b, c, d, e, f) {
	      var current = this.current;
	      this.current.textMatrix = this.current.lineMatrix = [a, b, c, d, e, f];

	      this.current.x = this.current.lineX = 0;
	      this.current.y = this.current.lineY = 0;

	      current.xcoords = [];
	      current.tspan = document.createElementNS(NS, 'svg:tspan');
	      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
	      current.tspan.setAttributeNS(null, 'font-size',
	                                   pf(current.fontSize) + 'px');
	      current.tspan.setAttributeNS(null, 'y', pf(-current.y));

	      current.txtElement = document.createElementNS(NS, 'svg:text');
	      current.txtElement.appendChild(current.tspan);
	    },

	    beginText: function SVGGraphics_beginText() {
	      this.current.x = this.current.lineX = 0;
	      this.current.y = this.current.lineY = 0;
	      this.current.textMatrix = IDENTITY_MATRIX;
	      this.current.lineMatrix = IDENTITY_MATRIX;
	      this.current.tspan = document.createElementNS(NS, 'svg:tspan');
	      this.current.txtElement = document.createElementNS(NS, 'svg:text');
	      this.current.txtgrp = document.createElementNS(NS, 'svg:g');
	      this.current.xcoords = [];
	    },

	    moveText: function SVGGraphics_moveText(x, y) {
	      var current = this.current;
	      this.current.x = this.current.lineX += x;
	      this.current.y = this.current.lineY += y;

	      current.xcoords = [];
	      current.tspan = document.createElementNS(NS, 'svg:tspan');
	      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
	      current.tspan.setAttributeNS(null, 'font-size',
	                                   pf(current.fontSize) + 'px');
	      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
	    },

	    showText: function SVGGraphics_showText(glyphs) {
	      var current = this.current;
	      var font = current.font;
	      var fontSize = current.fontSize;

	      if (fontSize === 0) {
	        return;
	      }

	      var charSpacing = current.charSpacing;
	      var wordSpacing = current.wordSpacing;
	      var fontDirection = current.fontDirection;
	      var textHScale = current.textHScale * fontDirection;
	      var glyphsLength = glyphs.length;
	      var vertical = font.vertical;
	      var widthAdvanceScale = fontSize * current.fontMatrix[0];

	      var x = 0, i;
	      for (i = 0; i < glyphsLength; ++i) {
	        var glyph = glyphs[i];
	        if (glyph === null) {
	          // word break
	          x += fontDirection * wordSpacing;
	          continue;
	        } else if (isNum(glyph)) {
	          x += -glyph * fontSize * 0.001;
	          continue;
	        }
	        current.xcoords.push(current.x + x * textHScale);

	        var width = glyph.width;
	        var character = glyph.fontChar;
	        var charWidth = width * widthAdvanceScale + charSpacing * fontDirection;
	        x += charWidth;

	        current.tspan.textContent += character;
	      }
	      if (vertical) {
	        current.y -= x * textHScale;
	      } else {
	        current.x += x * textHScale;
	      }

	      current.tspan.setAttributeNS(null, 'x',
	                                   current.xcoords.map(pf).join(' '));
	      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
	      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
	      current.tspan.setAttributeNS(null, 'font-size',
	                                   pf(current.fontSize) + 'px');
	      if (current.fontStyle !== SVG_DEFAULTS.fontStyle) {
	        current.tspan.setAttributeNS(null, 'font-style', current.fontStyle);
	      }
	      if (current.fontWeight !== SVG_DEFAULTS.fontWeight) {
	        current.tspan.setAttributeNS(null, 'font-weight', current.fontWeight);
	      }
	      if (current.fillColor !== SVG_DEFAULTS.fillColor) {
	        current.tspan.setAttributeNS(null, 'fill', current.fillColor);
	      }

	      current.txtElement.setAttributeNS(null, 'transform',
	                                        pm(current.textMatrix) +
	                                        ' scale(1, -1)' );
	      current.txtElement.setAttributeNS(XML_NS, 'xml:space', 'preserve');
	      current.txtElement.appendChild(current.tspan);
	      current.txtgrp.appendChild(current.txtElement);

	      this.tgrp.appendChild(current.txtElement);

	    },

	    setLeadingMoveText: function SVGGraphics_setLeadingMoveText(x, y) {
	      this.setLeading(-y);
	      this.moveText(x, y);
	    },

	    addFontStyle: function SVGGraphics_addFontStyle(fontObj) {
	      if (!this.cssStyle) {
	        this.cssStyle = document.createElementNS(NS, 'svg:style');
	        this.cssStyle.setAttributeNS(null, 'type', 'text/css');
	        this.defs.appendChild(this.cssStyle);
	      }

	      var url = createObjectURL(fontObj.data, fontObj.mimetype,
	                                this.forceDataSchema);
	      this.cssStyle.textContent +=
	        '@font-face { font-family: "' + fontObj.loadedName + '";' +
	        ' src: url(' + url + '); }\n';
	    },

	    setFont: function SVGGraphics_setFont(details) {
	      var current = this.current;
	      var fontObj = this.commonObjs.get(details[0]);
	      var size = details[1];
	      this.current.font = fontObj;

	      if (this.embedFonts && fontObj.data &&
	          !this.embeddedFonts[fontObj.loadedName]) {
	        this.addFontStyle(fontObj);
	        this.embeddedFonts[fontObj.loadedName] = fontObj;
	      }

	      current.fontMatrix = (fontObj.fontMatrix ?
	                            fontObj.fontMatrix : FONT_IDENTITY_MATRIX);

	      var bold = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
	                                 (fontObj.bold ? 'bold' : 'normal');
	      var italic = fontObj.italic ? 'italic' : 'normal';

	      if (size < 0) {
	        size = -size;
	        current.fontDirection = -1;
	      } else {
	        current.fontDirection = 1;
	      }
	      current.fontSize = size;
	      current.fontFamily = fontObj.loadedName;
	      current.fontWeight = bold;
	      current.fontStyle = italic;

	      current.tspan = document.createElementNS(NS, 'svg:tspan');
	      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
	      current.xcoords = [];
	    },

	    endText: function SVGGraphics_endText() {
	      if (this.current.pendingClip) {
	        this.cgrp.appendChild(this.tgrp);
	        this.pgrp.appendChild(this.cgrp);
	      } else {
	        this.pgrp.appendChild(this.tgrp);
	      }
	      this.tgrp = document.createElementNS(NS, 'svg:g');
	      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
	    },

	    // Path properties
	    setLineWidth: function SVGGraphics_setLineWidth(width) {
	      this.current.lineWidth = width;
	    },
	    setLineCap: function SVGGraphics_setLineCap(style) {
	      this.current.lineCap = LINE_CAP_STYLES[style];
	    },
	    setLineJoin: function SVGGraphics_setLineJoin(style) {
	      this.current.lineJoin = LINE_JOIN_STYLES[style];
	    },
	    setMiterLimit: function SVGGraphics_setMiterLimit(limit) {
	      this.current.miterLimit = limit;
	    },
	    setStrokeRGBColor: function SVGGraphics_setStrokeRGBColor(r, g, b) {
	      var color = Util.makeCssRgb(r, g, b);
	      this.current.strokeColor = color;
	    },
	    setFillRGBColor: function SVGGraphics_setFillRGBColor(r, g, b) {
	      var color = Util.makeCssRgb(r, g, b);
	      this.current.fillColor = color;
	      this.current.tspan = document.createElementNS(NS, 'svg:tspan');
	      this.current.xcoords = [];
	    },
	    setDash: function SVGGraphics_setDash(dashArray, dashPhase) {
	      this.current.dashArray = dashArray;
	      this.current.dashPhase = dashPhase;
	    },

	    constructPath: function SVGGraphics_constructPath(ops, args) {
	      var current = this.current;
	      var x = current.x, y = current.y;
	      current.path = document.createElementNS(NS, 'svg:path');
	      var d = [];
	      var opLength = ops.length;

	      for (var i = 0, j = 0; i < opLength; i++) {
	        switch (ops[i] | 0) {
	          case OPS.rectangle:
	            x = args[j++];
	            y = args[j++];
	            var width = args[j++];
	            var height = args[j++];
	            var xw = x + width;
	            var yh = y + height;
	            d.push('M', pf(x), pf(y), 'L', pf(xw) , pf(y), 'L', pf(xw), pf(yh),
	                   'L', pf(x), pf(yh), 'Z');
	            break;
	          case OPS.moveTo:
	            x = args[j++];
	            y = args[j++];
	            d.push('M', pf(x), pf(y));
	            break;
	          case OPS.lineTo:
	            x = args[j++];
	            y = args[j++];
	            d.push('L', pf(x) , pf(y));
	            break;
	          case OPS.curveTo:
	            x = args[j + 4];
	            y = args[j + 5];
	            d.push('C', pf(args[j]), pf(args[j + 1]), pf(args[j + 2]),
	                   pf(args[j + 3]), pf(x), pf(y));
	            j += 6;
	            break;
	          case OPS.curveTo2:
	            x = args[j + 2];
	            y = args[j + 3];
	            d.push('C', pf(x), pf(y), pf(args[j]), pf(args[j + 1]),
	                   pf(args[j + 2]), pf(args[j + 3]));
	            j += 4;
	            break;
	          case OPS.curveTo3:
	            x = args[j + 2];
	            y = args[j + 3];
	            d.push('C', pf(args[j]), pf(args[j + 1]), pf(x), pf(y),
	                   pf(x), pf(y));
	            j += 4;
	            break;
	          case OPS.closePath:
	            d.push('Z');
	            break;
	        }
	      }
	      current.path.setAttributeNS(null, 'd', d.join(' '));
	      current.path.setAttributeNS(null, 'stroke-miterlimit',
	                                  pf(current.miterLimit));
	      current.path.setAttributeNS(null, 'stroke-linecap', current.lineCap);
	      current.path.setAttributeNS(null, 'stroke-linejoin', current.lineJoin);
	      current.path.setAttributeNS(null, 'stroke-width',
	                                  pf(current.lineWidth) + 'px');
	      current.path.setAttributeNS(null, 'stroke-dasharray',
	                                  current.dashArray.map(pf).join(' '));
	      current.path.setAttributeNS(null, 'stroke-dashoffset',
	                                  pf(current.dashPhase) + 'px');
	      current.path.setAttributeNS(null, 'fill', 'none');

	      this.tgrp.appendChild(current.path);
	      if (current.pendingClip) {
	        this.cgrp.appendChild(this.tgrp);
	        this.pgrp.appendChild(this.cgrp);
	      } else {
	        this.pgrp.appendChild(this.tgrp);
	      }
	      // Saving a reference in current.element so that it can be addressed
	      // in 'fill' and 'stroke'
	      current.element = current.path;
	      current.setCurrentPoint(x, y);
	    },

	    endPath: function SVGGraphics_endPath() {
	      var current = this.current;
	      if (current.pendingClip) {
	        this.cgrp.appendChild(this.tgrp);
	        this.pgrp.appendChild(this.cgrp);
	      } else {
	        this.pgrp.appendChild(this.tgrp);
	      }
	      this.tgrp = document.createElementNS(NS, 'svg:g');
	      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
	    },

	    clip: function SVGGraphics_clip(type) {
	      var current = this.current;
	      // Add current path to clipping path
	      current.clipId = 'clippath' + clipCount;
	      clipCount++;
	      this.clippath = document.createElementNS(NS, 'svg:clipPath');
	      this.clippath.setAttributeNS(null, 'id', current.clipId);
	      var clipElement = current.element.cloneNode();
	      if (type === 'evenodd') {
	        clipElement.setAttributeNS(null, 'clip-rule', 'evenodd');
	      } else {
	        clipElement.setAttributeNS(null, 'clip-rule', 'nonzero');
	      }
	      this.clippath.setAttributeNS(null, 'transform', pm(this.transformMatrix));
	      this.clippath.appendChild(clipElement);
	      this.defs.appendChild(this.clippath);

	      // Create a new group with that attribute
	      current.pendingClip = true;
	      this.cgrp = document.createElementNS(NS, 'svg:g');
	      this.cgrp.setAttributeNS(null, 'clip-path',
	                               'url(#' + current.clipId + ')');
	      this.pgrp.appendChild(this.cgrp);
	    },

	    closePath: function SVGGraphics_closePath() {
	      var current = this.current;
	      var d = current.path.getAttributeNS(null, 'd');
	      d += 'Z';
	      current.path.setAttributeNS(null, 'd', d);
	    },

	    setLeading: function SVGGraphics_setLeading(leading) {
	      this.current.leading = -leading;
	    },

	    setTextRise: function SVGGraphics_setTextRise(textRise) {
	      this.current.textRise = textRise;
	    },

	    setHScale: function SVGGraphics_setHScale(scale) {
	      this.current.textHScale = scale / 100;
	    },

	    setGState: function SVGGraphics_setGState(states) {
	      for (var i = 0, ii = states.length; i < ii; i++) {
	        var state = states[i];
	        var key = state[0];
	        var value = state[1];

	        switch (key) {
	          case 'LW':
	            this.setLineWidth(value);
	            break;
	          case 'LC':
	            this.setLineCap(value);
	            break;
	          case 'LJ':
	            this.setLineJoin(value);
	            break;
	          case 'ML':
	            this.setMiterLimit(value);
	            break;
	          case 'D':
	            this.setDash(value[0], value[1]);
	            break;
	          case 'RI':
	            break;
	          case 'FL':
	            break;
	          case 'Font':
	            this.setFont(value);
	            break;
	          case 'CA':
	            break;
	          case 'ca':
	            break;
	          case 'BM':
	            break;
	          case 'SMask':
	            break;
	        }
	      }
	    },

	    fill: function SVGGraphics_fill() {
	      var current = this.current;
	      current.element.setAttributeNS(null, 'fill', current.fillColor);
	    },

	    stroke: function SVGGraphics_stroke() {
	      var current = this.current;
	      current.element.setAttributeNS(null, 'stroke', current.strokeColor);
	      current.element.setAttributeNS(null, 'fill', 'none');
	    },

	    eoFill: function SVGGraphics_eoFill() {
	      var current = this.current;
	      current.element.setAttributeNS(null, 'fill', current.fillColor);
	      current.element.setAttributeNS(null, 'fill-rule', 'evenodd');
	    },

	    fillStroke: function SVGGraphics_fillStroke() {
	      // Order is important since stroke wants fill to be none.
	      // First stroke, then if fill needed, it will be overwritten.
	      this.stroke();
	      this.fill();
	    },

	    eoFillStroke: function SVGGraphics_eoFillStroke() {
	      this.current.element.setAttributeNS(null, 'fill-rule', 'evenodd');
	      this.fillStroke();
	    },

	    closeStroke: function SVGGraphics_closeStroke() {
	      this.closePath();
	      this.stroke();
	    },

	    closeFillStroke: function SVGGraphics_closeFillStroke() {
	      this.closePath();
	      this.fillStroke();
	    },

	    paintSolidColorImageMask:
	        function SVGGraphics_paintSolidColorImageMask() {
	      var current = this.current;
	      var rect = document.createElementNS(NS, 'svg:rect');
	      rect.setAttributeNS(null, 'x', '0');
	      rect.setAttributeNS(null, 'y', '0');
	      rect.setAttributeNS(null, 'width', '1px');
	      rect.setAttributeNS(null, 'height', '1px');
	      rect.setAttributeNS(null, 'fill', current.fillColor);
	      this.tgrp.appendChild(rect);
	    },

	    paintJpegXObject: function SVGGraphics_paintJpegXObject(objId, w, h) {
	      var current = this.current;
	      var imgObj = this.objs.get(objId);
	      var imgEl = document.createElementNS(NS, 'svg:image');
	      imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgObj.src);
	      imgEl.setAttributeNS(null, 'width', imgObj.width + 'px');
	      imgEl.setAttributeNS(null, 'height', imgObj.height + 'px');
	      imgEl.setAttributeNS(null, 'x', '0');
	      imgEl.setAttributeNS(null, 'y', pf(-h));
	      imgEl.setAttributeNS(null, 'transform',
	                           'scale(' + pf(1 / w) + ' ' + pf(-1 / h) + ')');

	      this.tgrp.appendChild(imgEl);
	      if (current.pendingClip) {
	        this.cgrp.appendChild(this.tgrp);
	        this.pgrp.appendChild(this.cgrp);
	      } else {
	        this.pgrp.appendChild(this.tgrp);
	      }
	    },

	    paintImageXObject: function SVGGraphics_paintImageXObject(objId) {
	      var imgData = this.objs.get(objId);
	      if (!imgData) {
	        warn('Dependent image isn\'t ready yet');
	        return;
	      }
	      this.paintInlineImageXObject(imgData);
	    },

	    paintInlineImageXObject:
	        function SVGGraphics_paintInlineImageXObject(imgData, mask) {
	      var current = this.current;
	      var width = imgData.width;
	      var height = imgData.height;

	      var imgSrc = convertImgDataToPng(imgData, this.forceDataSchema);
	      var cliprect = document.createElementNS(NS, 'svg:rect');
	      cliprect.setAttributeNS(null, 'x', '0');
	      cliprect.setAttributeNS(null, 'y', '0');
	      cliprect.setAttributeNS(null, 'width', pf(width));
	      cliprect.setAttributeNS(null, 'height', pf(height));
	      current.element = cliprect;
	      this.clip('nonzero');
	      var imgEl = document.createElementNS(NS, 'svg:image');
	      imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgSrc);
	      imgEl.setAttributeNS(null, 'x', '0');
	      imgEl.setAttributeNS(null, 'y', pf(-height));
	      imgEl.setAttributeNS(null, 'width', pf(width) + 'px');
	      imgEl.setAttributeNS(null, 'height', pf(height) + 'px');
	      imgEl.setAttributeNS(null, 'transform',
	                           'scale(' + pf(1 / width) + ' ' +
	                           pf(-1 / height) + ')');
	      if (mask) {
	        mask.appendChild(imgEl);
	      } else {
	        this.tgrp.appendChild(imgEl);
	      }
	      if (current.pendingClip) {
	        this.cgrp.appendChild(this.tgrp);
	        this.pgrp.appendChild(this.cgrp);
	      } else {
	        this.pgrp.appendChild(this.tgrp);
	      }
	    },

	    paintImageMaskXObject:
	        function SVGGraphics_paintImageMaskXObject(imgData) {
	      var current = this.current;
	      var width = imgData.width;
	      var height = imgData.height;
	      var fillColor = current.fillColor;

	      current.maskId = 'mask' + maskCount++;
	      var mask = document.createElementNS(NS, 'svg:mask');
	      mask.setAttributeNS(null, 'id', current.maskId);

	      var rect = document.createElementNS(NS, 'svg:rect');
	      rect.setAttributeNS(null, 'x', '0');
	      rect.setAttributeNS(null, 'y', '0');
	      rect.setAttributeNS(null, 'width', pf(width));
	      rect.setAttributeNS(null, 'height', pf(height));
	      rect.setAttributeNS(null, 'fill', fillColor);
	      rect.setAttributeNS(null, 'mask', 'url(#' + current.maskId +')');
	      this.defs.appendChild(mask);
	      this.tgrp.appendChild(rect);

	      this.paintInlineImageXObject(imgData, mask);
	    },

	    paintFormXObjectBegin:
	        function SVGGraphics_paintFormXObjectBegin(matrix, bbox) {
	      this.save();

	      if (isArray(matrix) && matrix.length === 6) {
	        this.transform(matrix[0], matrix[1], matrix[2],
	                       matrix[3], matrix[4], matrix[5]);
	      }

	      if (isArray(bbox) && bbox.length === 4) {
	        var width = bbox[2] - bbox[0];
	        var height = bbox[3] - bbox[1];

	        var cliprect = document.createElementNS(NS, 'svg:rect');
	        cliprect.setAttributeNS(null, 'x', bbox[0]);
	        cliprect.setAttributeNS(null, 'y', bbox[1]);
	        cliprect.setAttributeNS(null, 'width', pf(width));
	        cliprect.setAttributeNS(null, 'height', pf(height));
	        this.current.element = cliprect;
	        this.clip('nonzero');
	        this.endPath();
	      }
	    },

	    paintFormXObjectEnd:
	        function SVGGraphics_paintFormXObjectEnd() {
	      this.restore();
	    }
	  };
	  return SVGGraphics;
	})();

	exports.SVGGraphics = SVGGraphics;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplayAnnotationLayer = {}), root.pdfjsSharedUtil,
	      root.pdfjsDisplayDOMUtils);
	  }
	}(this, function (exports, sharedUtil, displayDOMUtils) {

	var AnnotationBorderStyleType = sharedUtil.AnnotationBorderStyleType;
	var AnnotationType = sharedUtil.AnnotationType;
	var Util = sharedUtil.Util;
	var addLinkAttributes = displayDOMUtils.addLinkAttributes;
	var LinkTarget = displayDOMUtils.LinkTarget;
	var getFilenameFromUrl = displayDOMUtils.getFilenameFromUrl;
	var warn = sharedUtil.warn;
	var CustomStyle = displayDOMUtils.CustomStyle;
	var getDefaultSetting = displayDOMUtils.getDefaultSetting;

	/**
	 * @typedef {Object} AnnotationElementParameters
	 * @property {Object} data
	 * @property {HTMLDivElement} layer
	 * @property {PDFPage} page
	 * @property {PageViewport} viewport
	 * @property {IPDFLinkService} linkService
	 * @property {DownloadManager} downloadManager
	 */

	/**
	 * @class
	 * @alias AnnotationElementFactory
	 */
	function AnnotationElementFactory() {}
	AnnotationElementFactory.prototype =
	    /** @lends AnnotationElementFactory.prototype */ {
	  /**
	   * @param {AnnotationElementParameters} parameters
	   * @returns {AnnotationElement}
	   */
	  create: function AnnotationElementFactory_create(parameters) {
	    var subtype = parameters.data.annotationType;

	    switch (subtype) {
	      case AnnotationType.LINK:
	        return new LinkAnnotationElement(parameters);

	      case AnnotationType.TEXT:
	        return new TextAnnotationElement(parameters);

	      case AnnotationType.WIDGET:
	        return new WidgetAnnotationElement(parameters);

	      case AnnotationType.POPUP:
	        return new PopupAnnotationElement(parameters);

	      case AnnotationType.HIGHLIGHT:
	        return new HighlightAnnotationElement(parameters);

	      case AnnotationType.UNDERLINE:
	        return new UnderlineAnnotationElement(parameters);

	      case AnnotationType.SQUIGGLY:
	        return new SquigglyAnnotationElement(parameters);

	      case AnnotationType.STRIKEOUT:
	        return new StrikeOutAnnotationElement(parameters);

	      case AnnotationType.FILEATTACHMENT:
	        return new FileAttachmentAnnotationElement(parameters);

	      default:
	        return new AnnotationElement(parameters);
	    }
	  }
	};

	/**
	 * @class
	 * @alias AnnotationElement
	 */
	var AnnotationElement = (function AnnotationElementClosure() {
	  function AnnotationElement(parameters, isRenderable) {
	    this.isRenderable = isRenderable || false;
	    this.data = parameters.data;
	    this.layer = parameters.layer;
	    this.page = parameters.page;
	    this.viewport = parameters.viewport;
	    this.linkService = parameters.linkService;
	    this.downloadManager = parameters.downloadManager;
	    this.imageResourcesPath = parameters.imageResourcesPath;

	    if (isRenderable) {
	      this.container = this._createContainer();
	    }
	  }

	  AnnotationElement.prototype = /** @lends AnnotationElement.prototype */ {
	    /**
	     * Create an empty container for the annotation's HTML element.
	     *
	     * @private
	     * @memberof AnnotationElement
	     * @returns {HTMLSectionElement}
	     */
	    _createContainer: function AnnotationElement_createContainer() {
	      var data = this.data, page = this.page, viewport = this.viewport;
	      var container = document.createElement('section');
	      var width = data.rect[2] - data.rect[0];
	      var height = data.rect[3] - data.rect[1];

	      container.setAttribute('data-annotation-id', data.id);

	      // Do *not* modify `data.rect`, since that will corrupt the annotation
	      // position on subsequent calls to `_createContainer` (see issue 6804).
	      var rect = Util.normalizeRect([
	        data.rect[0],
	        page.view[3] - data.rect[1] + page.view[1],
	        data.rect[2],
	        page.view[3] - data.rect[3] + page.view[1]
	      ]);

	      CustomStyle.setProp('transform', container,
	                          'matrix(' + viewport.transform.join(',') + ')');
	      CustomStyle.setProp('transformOrigin', container,
	                          -rect[0] + 'px ' + -rect[1] + 'px');

	      if (data.borderStyle.width > 0) {
	        container.style.borderWidth = data.borderStyle.width + 'px';
	        if (data.borderStyle.style !== AnnotationBorderStyleType.UNDERLINE) {
	          // Underline styles only have a bottom border, so we do not need
	          // to adjust for all borders. This yields a similar result as
	          // Adobe Acrobat/Reader.
	          width = width - 2 * data.borderStyle.width;
	          height = height - 2 * data.borderStyle.width;
	        }

	        var horizontalRadius = data.borderStyle.horizontalCornerRadius;
	        var verticalRadius = data.borderStyle.verticalCornerRadius;
	        if (horizontalRadius > 0 || verticalRadius > 0) {
	          var radius = horizontalRadius + 'px / ' + verticalRadius + 'px';
	          CustomStyle.setProp('borderRadius', container, radius);
	        }

	        switch (data.borderStyle.style) {
	          case AnnotationBorderStyleType.SOLID:
	            container.style.borderStyle = 'solid';
	            break;

	          case AnnotationBorderStyleType.DASHED:
	            container.style.borderStyle = 'dashed';
	            break;

	          case AnnotationBorderStyleType.BEVELED:
	            warn('Unimplemented border style: beveled');
	            break;

	          case AnnotationBorderStyleType.INSET:
	            warn('Unimplemented border style: inset');
	            break;

	          case AnnotationBorderStyleType.UNDERLINE:
	            container.style.borderBottomStyle = 'solid';
	            break;

	          default:
	            break;
	        }

	        if (data.color) {
	          container.style.borderColor =
	            Util.makeCssRgb(data.color[0] | 0,
	                            data.color[1] | 0,
	                            data.color[2] | 0);
	        } else {
	          // Transparent (invisible) border, so do not draw it at all.
	          container.style.borderWidth = 0;
	        }
	      }

	      container.style.left = rect[0] + 'px';
	      container.style.top = rect[1] + 'px';

	      container.style.width = width + 'px';
	      container.style.height = height + 'px';

	      return container;
	    },

	    /**
	     * Create a popup for the annotation's HTML element. This is used for
	     * annotations that do not have a Popup entry in the dictionary, but
	     * are of a type that works with popups (such as Highlight annotations).
	     *
	     * @private
	     * @param {HTMLSectionElement} container
	     * @param {HTMLDivElement|HTMLImageElement|null} trigger
	     * @param {Object} data
	     * @memberof AnnotationElement
	     */
	    _createPopup:
	        function AnnotationElement_createPopup(container, trigger, data) {
	      // If no trigger element is specified, create it.
	      if (!trigger) {
	        trigger = document.createElement('div');
	        trigger.style.height = container.style.height;
	        trigger.style.width = container.style.width;
	        container.appendChild(trigger);
	      }

	      var popupElement = new PopupElement({
	        container: container,
	        trigger: trigger,
	        color: data.color,
	        title: data.title,
	        contents: data.contents,
	        hideWrapper: true
	      });
	      var popup = popupElement.render();

	      // Position the popup next to the annotation's container.
	      popup.style.left = container.style.width;

	      container.appendChild(popup);
	    },

	    /**
	     * Render the annotation's HTML element in the empty container.
	     *
	     * @public
	     * @memberof AnnotationElement
	     */
	    render: function AnnotationElement_render() {
	      throw new Error('Abstract method AnnotationElement.render called');
	    }
	  };

	  return AnnotationElement;
	})();

	/**
	 * @class
	 * @alias LinkAnnotationElement
	 */
	var LinkAnnotationElement = (function LinkAnnotationElementClosure() {
	  function LinkAnnotationElement(parameters) {
	    AnnotationElement.call(this, parameters, true);
	  }

	  Util.inherit(LinkAnnotationElement, AnnotationElement, {
	    /**
	     * Render the link annotation's HTML element in the empty container.
	     *
	     * @public
	     * @memberof LinkAnnotationElement
	     * @returns {HTMLSectionElement}
	     */
	    render: function LinkAnnotationElement_render() {
	      this.container.className = 'linkAnnotation';

	      var link = document.createElement('a');
	      addLinkAttributes(link, {
	        url: this.data.url,
	        target: (this.data.newWindow ? LinkTarget.BLANK : undefined),
	      });

	      if (!this.data.url) {
	        if (this.data.action) {
	          this._bindNamedAction(link, this.data.action);
	        } else {
	          this._bindLink(link, (this.data.dest || null));
	        }
	      }

	      this.container.appendChild(link);
	      return this.container;
	    },

	    /**
	     * Bind internal links to the link element.
	     *
	     * @private
	     * @param {Object} link
	     * @param {Object} destination
	     * @memberof LinkAnnotationElement
	     */
	    _bindLink: function LinkAnnotationElement_bindLink(link, destination) {
	      var self = this;

	      link.href = this.linkService.getDestinationHash(destination);
	      link.onclick = function() {
	        if (destination) {
	          self.linkService.navigateTo(destination);
	        }
	        return false;
	      };
	      if (destination) {
	        link.className = 'internalLink';
	      }
	    },

	    /**
	     * Bind named actions to the link element.
	     *
	     * @private
	     * @param {Object} link
	     * @param {Object} action
	     * @memberof LinkAnnotationElement
	     */
	    _bindNamedAction:
	        function LinkAnnotationElement_bindNamedAction(link, action) {
	      var self = this;

	      link.href = this.linkService.getAnchorUrl('');
	      link.onclick = function() {
	        self.linkService.executeNamedAction(action);
	        return false;
	      };
	      link.className = 'internalLink';
	    }
	  });

	  return LinkAnnotationElement;
	})();

	/**
	 * @class
	 * @alias TextAnnotationElement
	 */
	var TextAnnotationElement = (function TextAnnotationElementClosure() {
	  function TextAnnotationElement(parameters) {
	    var isRenderable = !!(parameters.data.hasPopup ||
	                          parameters.data.title || parameters.data.contents);
	    AnnotationElement.call(this, parameters, isRenderable);
	  }

	  Util.inherit(TextAnnotationElement, AnnotationElement, {
	    /**
	     * Render the text annotation's HTML element in the empty container.
	     *
	     * @public
	     * @memberof TextAnnotationElement
	     * @returns {HTMLSectionElement}
	     */
	    render: function TextAnnotationElement_render() {
	      this.container.className = 'textAnnotation';

	      var image = document.createElement('img');
	      image.style.height = this.container.style.height;
	      image.style.width = this.container.style.width;
	      image.src = this.imageResourcesPath + 'annotation-' +
	        this.data.name.toLowerCase() + '.svg';
	      image.alt = '[{{type}} Annotation]';
	      image.dataset.l10nId = 'text_annotation_type';
	      image.dataset.l10nArgs = JSON.stringify({type: this.data.name});

	      if (!this.data.hasPopup) {
	        this._createPopup(this.container, image, this.data);
	      }

	      this.container.appendChild(image);
	      return this.container;
	    }
	  });

	  return TextAnnotationElement;
	})();

	/**
	 * @class
	 * @alias WidgetAnnotationElement
	 */
	var WidgetAnnotationElement = (function WidgetAnnotationElementClosure() {
	  function WidgetAnnotationElement(parameters) {
	    var isRenderable = !parameters.data.hasAppearance &&
	                       !!parameters.data.fieldValue;
	    AnnotationElement.call(this, parameters, isRenderable);
	  }

	  Util.inherit(WidgetAnnotationElement, AnnotationElement, {
	    /**
	     * Render the widget annotation's HTML element in the empty container.
	     *
	     * @public
	     * @memberof WidgetAnnotationElement
	     * @returns {HTMLSectionElement}
	     */
	    render: function WidgetAnnotationElement_render() {
	      var content = document.createElement('div');
	      content.textContent = this.data.fieldValue;
	      var textAlignment = this.data.textAlignment;
	      content.style.textAlign = ['left', 'center', 'right'][textAlignment];
	      content.style.verticalAlign = 'middle';
	      content.style.display = 'table-cell';

	      var font = (this.data.fontRefName ?
	        this.page.commonObjs.getData(this.data.fontRefName) : null);
	      this._setTextStyle(content, font);

	      this.container.appendChild(content);
	      return this.container;
	    },

	    /**
	     * Apply text styles to the text in the element.
	     *
	     * @private
	     * @param {HTMLDivElement} element
	     * @param {Object} font
	     * @memberof WidgetAnnotationElement
	     */
	    _setTextStyle:
	        function WidgetAnnotationElement_setTextStyle(element, font) {
	      // TODO: This duplicates some of the logic in CanvasGraphics.setFont().
	      var style = element.style;
	      style.fontSize = this.data.fontSize + 'px';
	      style.direction = (this.data.fontDirection < 0 ? 'rtl': 'ltr');

	      if (!font) {
	        return;
	      }

	      style.fontWeight = (font.black ?
	        (font.bold ? '900' : 'bold') :
	        (font.bold ? 'bold' : 'normal'));
	      style.fontStyle = (font.italic ? 'italic' : 'normal');

	      // Use a reasonable default font if the font doesn't specify a fallback.
	      var fontFamily = font.loadedName ? '"' + font.loadedName + '", ' : '';
	      var fallbackName = font.fallbackName || 'Helvetica, sans-serif';
	      style.fontFamily = fontFamily + fallbackName;
	    }
	  });

	  return WidgetAnnotationElement;
	})();

	/**
	 * @class
	 * @alias PopupAnnotationElement
	 */
	var PopupAnnotationElement = (function PopupAnnotationElementClosure() {
	  function PopupAnnotationElement(parameters) {
	    var isRenderable = !!(parameters.data.title || parameters.data.contents);
	    AnnotationElement.call(this, parameters, isRenderable);
	  }

	  Util.inherit(PopupAnnotationElement, AnnotationElement, {
	    /**
	     * Render the popup annotation's HTML element in the empty container.
	     *
	     * @public
	     * @memberof PopupAnnotationElement
	     * @returns {HTMLSectionElement}
	     */
	    render: function PopupAnnotationElement_render() {
	      this.container.className = 'popupAnnotation';

	      var selector = '[data-annotation-id="' + this.data.parentId + '"]';
	      var parentElement = this.layer.querySelector(selector);
	      if (!parentElement) {
	        return this.container;
	      }

	      var popup = new PopupElement({
	        container: this.container,
	        trigger: parentElement,
	        color: this.data.color,
	        title: this.data.title,
	        contents: this.data.contents
	      });

	      // Position the popup next to the parent annotation's container.
	      // PDF viewers ignore a popup annotation's rectangle.
	      var parentLeft = parseFloat(parentElement.style.left);
	      var parentWidth = parseFloat(parentElement.style.width);
	      CustomStyle.setProp('transformOrigin', this.container,
	                          -(parentLeft + parentWidth) + 'px -' +
	                          parentElement.style.top);
	      this.container.style.left = (parentLeft + parentWidth) + 'px';

	      this.container.appendChild(popup.render());
	      return this.container;
	    }
	  });

	  return PopupAnnotationElement;
	})();

	/**
	 * @class
	 * @alias PopupElement
	 */
	var PopupElement = (function PopupElementClosure() {
	  var BACKGROUND_ENLIGHT = 0.7;

	  function PopupElement(parameters) {
	    this.container = parameters.container;
	    this.trigger = parameters.trigger;
	    this.color = parameters.color;
	    this.title = parameters.title;
	    this.contents = parameters.contents;
	    this.hideWrapper = parameters.hideWrapper || false;

	    this.pinned = false;
	  }

	  PopupElement.prototype = /** @lends PopupElement.prototype */ {
	    /**
	     * Render the popup's HTML element.
	     *
	     * @public
	     * @memberof PopupElement
	     * @returns {HTMLSectionElement}
	     */
	    render: function PopupElement_render() {
	      var wrapper = document.createElement('div');
	      wrapper.className = 'popupWrapper';

	      // For Popup annotations we hide the entire section because it contains
	      // only the popup. However, for Text annotations without a separate Popup
	      // annotation, we cannot hide the entire container as the image would
	      // disappear too. In that special case, hiding the wrapper suffices.
	      this.hideElement = (this.hideWrapper ? wrapper : this.container);
	      this.hideElement.setAttribute('hidden', true);

	      var popup = document.createElement('div');
	      popup.className = 'popup';

	      var color = this.color;
	      if (color) {
	        // Enlighten the color.
	        var r = BACKGROUND_ENLIGHT * (255 - color[0]) + color[0];
	        var g = BACKGROUND_ENLIGHT * (255 - color[1]) + color[1];
	        var b = BACKGROUND_ENLIGHT * (255 - color[2]) + color[2];
	        popup.style.backgroundColor = Util.makeCssRgb(r | 0, g | 0, b | 0);
	      }

	      var contents = this._formatContents(this.contents);
	      var title = document.createElement('h1');
	      title.textContent = this.title;

	      // Attach the event listeners to the trigger element.
	      this.trigger.addEventListener('click', this._toggle.bind(this));
	      this.trigger.addEventListener('mouseover', this._show.bind(this, false));
	      this.trigger.addEventListener('mouseout', this._hide.bind(this, false));
	      popup.addEventListener('click', this._hide.bind(this, true));

	      popup.appendChild(title);
	      popup.appendChild(contents);
	      wrapper.appendChild(popup);
	      return wrapper;
	    },

	    /**
	     * Format the contents of the popup by adding newlines where necessary.
	     *
	     * @private
	     * @param {string} contents
	     * @memberof PopupElement
	     * @returns {HTMLParagraphElement}
	     */
	    _formatContents: function PopupElement_formatContents(contents) {
	      var p = document.createElement('p');
	      var lines = contents.split(/(?:\r\n?|\n)/);
	      for (var i = 0, ii = lines.length; i < ii; ++i) {
	        var line = lines[i];
	        p.appendChild(document.createTextNode(line));
	        if (i < (ii - 1)) {
	          p.appendChild(document.createElement('br'));
	        }
	      }
	      return p;
	    },

	    /**
	     * Toggle the visibility of the popup.
	     *
	     * @private
	     * @memberof PopupElement
	     */
	    _toggle: function PopupElement_toggle() {
	      if (this.pinned) {
	        this._hide(true);
	      } else {
	        this._show(true);
	      }
	    },

	    /**
	     * Show the popup.
	     *
	     * @private
	     * @param {boolean} pin
	     * @memberof PopupElement
	     */
	    _show: function PopupElement_show(pin) {
	      if (pin) {
	        this.pinned = true;
	      }
	      if (this.hideElement.hasAttribute('hidden')) {
	        this.hideElement.removeAttribute('hidden');
	        this.container.style.zIndex += 1;
	      }
	    },

	    /**
	     * Hide the popup.
	     *
	     * @private
	     * @param {boolean} unpin
	     * @memberof PopupElement
	     */
	    _hide: function PopupElement_hide(unpin) {
	      if (unpin) {
	        this.pinned = false;
	      }
	      if (!this.hideElement.hasAttribute('hidden') && !this.pinned) {
	        this.hideElement.setAttribute('hidden', true);
	        this.container.style.zIndex -= 1;
	      }
	    }
	  };

	  return PopupElement;
	})();

	/**
	 * @class
	 * @alias HighlightAnnotationElement
	 */
	var HighlightAnnotationElement = (
	    function HighlightAnnotationElementClosure() {
	  function HighlightAnnotationElement(parameters) {
	    var isRenderable = !!(parameters.data.hasPopup ||
	                          parameters.data.title || parameters.data.contents);
	    AnnotationElement.call(this, parameters, isRenderable);
	  }

	  Util.inherit(HighlightAnnotationElement, AnnotationElement, {
	    /**
	     * Render the highlight annotation's HTML element in the empty container.
	     *
	     * @public
	     * @memberof HighlightAnnotationElement
	     * @returns {HTMLSectionElement}
	     */
	    render: function HighlightAnnotationElement_render() {
	      this.container.className = 'highlightAnnotation';

	      if (!this.data.hasPopup) {
	        this._createPopup(this.container, null, this.data);
	      }

	      return this.container;
	    }
	  });

	  return HighlightAnnotationElement;
	})();

	/**
	 * @class
	 * @alias UnderlineAnnotationElement
	 */
	var UnderlineAnnotationElement = (
	    function UnderlineAnnotationElementClosure() {
	  function UnderlineAnnotationElement(parameters) {
	    var isRenderable = !!(parameters.data.hasPopup ||
	                          parameters.data.title || parameters.data.contents);
	    AnnotationElement.call(this, parameters, isRenderable);
	  }

	  Util.inherit(UnderlineAnnotationElement, AnnotationElement, {
	    /**
	     * Render the underline annotation's HTML element in the empty container.
	     *
	     * @public
	     * @memberof UnderlineAnnotationElement
	     * @returns {HTMLSectionElement}
	     */
	    render: function UnderlineAnnotationElement_render() {
	      this.container.className = 'underlineAnnotation';

	      if (!this.data.hasPopup) {
	        this._createPopup(this.container, null, this.data);
	      }

	      return this.container;
	    }
	  });

	  return UnderlineAnnotationElement;
	})();

	/**
	 * @class
	 * @alias SquigglyAnnotationElement
	 */
	var SquigglyAnnotationElement = (function SquigglyAnnotationElementClosure() {
	  function SquigglyAnnotationElement(parameters) {
	    var isRenderable = !!(parameters.data.hasPopup ||
	                          parameters.data.title || parameters.data.contents);
	    AnnotationElement.call(this, parameters, isRenderable);
	  }

	  Util.inherit(SquigglyAnnotationElement, AnnotationElement, {
	    /**
	     * Render the squiggly annotation's HTML element in the empty container.
	     *
	     * @public
	     * @memberof SquigglyAnnotationElement
	     * @returns {HTMLSectionElement}
	     */
	    render: function SquigglyAnnotationElement_render() {
	      this.container.className = 'squigglyAnnotation';

	      if (!this.data.hasPopup) {
	        this._createPopup(this.container, null, this.data);
	      }

	      return this.container;
	    }
	  });

	  return SquigglyAnnotationElement;
	})();

	/**
	 * @class
	 * @alias StrikeOutAnnotationElement
	 */
	var StrikeOutAnnotationElement = (
	    function StrikeOutAnnotationElementClosure() {
	  function StrikeOutAnnotationElement(parameters) {
	    var isRenderable = !!(parameters.data.hasPopup ||
	                          parameters.data.title || parameters.data.contents);
	    AnnotationElement.call(this, parameters, isRenderable);
	  }

	  Util.inherit(StrikeOutAnnotationElement, AnnotationElement, {
	    /**
	     * Render the strikeout annotation's HTML element in the empty container.
	     *
	     * @public
	     * @memberof StrikeOutAnnotationElement
	     * @returns {HTMLSectionElement}
	     */
	    render: function StrikeOutAnnotationElement_render() {
	      this.container.className = 'strikeoutAnnotation';

	      if (!this.data.hasPopup) {
	        this._createPopup(this.container, null, this.data);
	      }

	      return this.container;
	    }
	  });

	  return StrikeOutAnnotationElement;
	})();

	/**
	 * @class
	 * @alias FileAttachmentAnnotationElement
	 */
	var FileAttachmentAnnotationElement = (
	    function FileAttachmentAnnotationElementClosure() {
	  function FileAttachmentAnnotationElement(parameters) {
	    AnnotationElement.call(this, parameters, true);

	    this.filename = getFilenameFromUrl(parameters.data.file.filename);
	    this.content = parameters.data.file.content;
	  }

	  Util.inherit(FileAttachmentAnnotationElement, AnnotationElement, {
	    /**
	     * Render the file attachment annotation's HTML element in the empty
	     * container.
	     *
	     * @public
	     * @memberof FileAttachmentAnnotationElement
	     * @returns {HTMLSectionElement}
	     */
	    render: function FileAttachmentAnnotationElement_render() {
	      this.container.className = 'fileAttachmentAnnotation';

	      var trigger = document.createElement('div');
	      trigger.style.height = this.container.style.height;
	      trigger.style.width = this.container.style.width;
	      trigger.addEventListener('dblclick', this._download.bind(this));

	      if (!this.data.hasPopup && (this.data.title || this.data.contents)) {
	        this._createPopup(this.container, trigger, this.data);
	      }

	      this.container.appendChild(trigger);
	      return this.container;
	    },

	    /**
	     * Download the file attachment associated with this annotation.
	     *
	     * @private
	     * @memberof FileAttachmentAnnotationElement
	     */
	    _download: function FileAttachmentAnnotationElement_download() {
	      if (!this.downloadManager) {
	        warn('Download cannot be started due to unavailable download manager');
	        return;
	      }
	      this.downloadManager.downloadData(this.content, this.filename, '');
	    }
	  });

	  return FileAttachmentAnnotationElement;
	})();

	/**
	 * @typedef {Object} AnnotationLayerParameters
	 * @property {PageViewport} viewport
	 * @property {HTMLDivElement} div
	 * @property {Array} annotations
	 * @property {PDFPage} page
	 * @property {IPDFLinkService} linkService
	 * @property {string} imageResourcesPath
	 */

	/**
	 * @class
	 * @alias AnnotationLayer
	 */
	var AnnotationLayer = (function AnnotationLayerClosure() {
	  return {
	    /**
	     * Render a new annotation layer with all annotation elements.
	     *
	     * @public
	     * @param {AnnotationLayerParameters} parameters
	     * @memberof AnnotationLayer
	     */
	    render: function AnnotationLayer_render(parameters) {
	      var annotationElementFactory = new AnnotationElementFactory();

	      for (var i = 0, ii = parameters.annotations.length; i < ii; i++) {
	        var data = parameters.annotations[i];
	        if (!data) {
	          continue;
	        }

	        var properties = {
	          data: data,
	          layer: parameters.div,
	          page: parameters.page,
	          viewport: parameters.viewport,
	          linkService: parameters.linkService,
	          downloadManager: parameters.downloadManager,
	          imageResourcesPath: parameters.imageResourcesPath ||
	                              getDefaultSetting('imageResourcesPath')
	        };
	        var element = annotationElementFactory.create(properties);
	        if (element.isRenderable) {
	          parameters.div.appendChild(element.render());
	        }
	      }
	    },

	    /**
	     * Update the annotation elements on existing annotation layer.
	     *
	     * @public
	     * @param {AnnotationLayerParameters} parameters
	     * @memberof AnnotationLayer
	     */
	    update: function AnnotationLayer_update(parameters) {
	      for (var i = 0, ii = parameters.annotations.length; i < ii; i++) {
	        var data = parameters.annotations[i];
	        var element = parameters.div.querySelector(
	          '[data-annotation-id="' + data.id + '"]');
	        if (element) {
	          CustomStyle.setProp('transform', element,
	            'matrix(' + parameters.viewport.transform.join(',') + ')');
	        }
	      }
	      parameters.div.removeAttribute('hidden');
	    }
	  };
	})();

	exports.AnnotationLayer = AnnotationLayer;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplayTextLayer = {}), root.pdfjsSharedUtil,
	      root.pdfjsDisplayDOMUtils);
	  }
	}(this, function (exports, sharedUtil, displayDOMUtils) {

	var Util = sharedUtil.Util;
	var createPromiseCapability = sharedUtil.createPromiseCapability;
	var CustomStyle = displayDOMUtils.CustomStyle;
	var getDefaultSetting = displayDOMUtils.getDefaultSetting;

	/**
	 * Text layer render parameters.
	 *
	 * @typedef {Object} TextLayerRenderParameters
	 * @property {TextContent} textContent - Text content to render (the object is
	 *   returned by the page's getTextContent() method).
	 * @property {HTMLElement} container - HTML element that will contain text runs.
	 * @property {PageViewport} viewport - The target viewport to properly
	 *   layout the text runs.
	 * @property {Array} textDivs - (optional) HTML elements that are correspond
	 *   the text items of the textContent input. This is output and shall be
	 *   initially be set to empty array.
	 * @property {number} timeout - (optional) Delay in milliseconds before
	 *   rendering of the text  runs occurs.
	 */
	var renderTextLayer = (function renderTextLayerClosure() {
	  var MAX_TEXT_DIVS_TO_RENDER = 100000;

	  var NonWhitespaceRegexp = /\S/;

	  function isAllWhitespace(str) {
	    return !NonWhitespaceRegexp.test(str);
	  }

	  function appendText(textDivs, viewport, geom, styles) {
	    var style = styles[geom.fontName];
	    var textDiv = document.createElement('div');
	    textDivs.push(textDiv);
	    if (isAllWhitespace(geom.str)) {
	      textDiv.dataset.isWhitespace = true;
	      return;
	    }
	    var tx = Util.transform(viewport.transform, geom.transform);
	    var angle = Math.atan2(tx[1], tx[0]);
	    if (style.vertical) {
	      angle += Math.PI / 2;
	    }
	    var fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
	    var fontAscent = fontHeight;
	    if (style.ascent) {
	      fontAscent = style.ascent * fontAscent;
	    } else if (style.descent) {
	      fontAscent = (1 + style.descent) * fontAscent;
	    }

	    var left;
	    var top;
	    if (angle === 0) {
	      left = tx[4];
	      top = tx[5] - fontAscent;
	    } else {
	      left = tx[4] + (fontAscent * Math.sin(angle));
	      top = tx[5] - (fontAscent * Math.cos(angle));
	    }
	    textDiv.style.left = left + 'px';
	    textDiv.style.top = top + 'px';
	    textDiv.style.fontSize = fontHeight + 'px';
	    textDiv.style.fontFamily = style.fontFamily;

	    textDiv.textContent = geom.str;
	    // |fontName| is only used by the Font Inspector. This test will succeed
	    // when e.g. the Font Inspector is off but the Stepper is on, but it's
	    // not worth the effort to do a more accurate test.
	    if (getDefaultSetting('pdfBug')) {
	      textDiv.dataset.fontName = geom.fontName;
	    }
	    // Storing into dataset will convert number into string.
	    if (angle !== 0) {
	      textDiv.dataset.angle = angle * (180 / Math.PI);
	    }
	    // We don't bother scaling single-char text divs, because it has very
	    // little effect on text highlighting. This makes scrolling on docs with
	    // lots of such divs a lot faster.
	    if (geom.str.length > 1) {
	      if (style.vertical) {
	        textDiv.dataset.canvasWidth = geom.height * viewport.scale;
	      } else {
	        textDiv.dataset.canvasWidth = geom.width * viewport.scale;
	      }
	    }
	  }

	  function render(task) {
	    if (task._canceled) {
	      return;
	    }
	    var textLayerFrag = task._container;
	    var textDivs = task._textDivs;
	    var capability = task._capability;
	    var textDivsLength = textDivs.length;

	    // No point in rendering many divs as it would make the browser
	    // unusable even after the divs are rendered.
	    if (textDivsLength > MAX_TEXT_DIVS_TO_RENDER) {
	      capability.resolve();
	      return;
	    }

	    var canvas = document.createElement('canvas');
	    canvas.mozOpaque = true;
	    var ctx = canvas.getContext('2d', {alpha: false});

	    var lastFontSize;
	    var lastFontFamily;
	    for (var i = 0; i < textDivsLength; i++) {
	      var textDiv = textDivs[i];
	      if (textDiv.dataset.isWhitespace !== undefined) {
	        continue;
	      }

	      var fontSize = textDiv.style.fontSize;
	      var fontFamily = textDiv.style.fontFamily;

	      // Only build font string and set to context if different from last.
	      if (fontSize !== lastFontSize || fontFamily !== lastFontFamily) {
	        ctx.font = fontSize + ' ' + fontFamily;
	        lastFontSize = fontSize;
	        lastFontFamily = fontFamily;
	      }

	      var width = ctx.measureText(textDiv.textContent).width;
	      textLayerFrag.appendChild(textDiv);
	      var transform;
	      if (textDiv.dataset.canvasWidth !== undefined && width > 0) {
	        // Dataset values come of type string.
	        var textScale = textDiv.dataset.canvasWidth / width;
	        transform = 'scaleX(' + textScale + ')';
	      } else {
	        transform = '';
	      }
	      var rotation = textDiv.dataset.angle;
	      if (rotation) {
	        transform = 'rotate(' + rotation + 'deg) ' + transform;
	      }
	      if (transform) {
	        CustomStyle.setProp('transform' , textDiv, transform);
	      }
	    }
	    capability.resolve();
	  }

	  /**
	   * Text layer rendering task.
	   *
	   * @param {TextContent} textContent
	   * @param {HTMLElement} container
	   * @param {PageViewport} viewport
	   * @param {Array} textDivs
	   * @private
	   */
	  function TextLayerRenderTask(textContent, container, viewport, textDivs) {
	    this._textContent = textContent;
	    this._container = container;
	    this._viewport = viewport;
	    textDivs = textDivs || [];
	    this._textDivs = textDivs;
	    this._canceled = false;
	    this._capability = createPromiseCapability();
	    this._renderTimer = null;
	  }
	  TextLayerRenderTask.prototype = {
	    get promise() {
	      return this._capability.promise;
	    },

	    cancel: function TextLayer_cancel() {
	      this._canceled = true;
	      if (this._renderTimer !== null) {
	        clearTimeout(this._renderTimer);
	        this._renderTimer = null;
	      }
	      this._capability.reject('canceled');
	    },

	    _render: function TextLayer_render(timeout) {
	      var textItems = this._textContent.items;
	      var styles = this._textContent.styles;
	      var textDivs = this._textDivs;
	      var viewport = this._viewport;
	      for (var i = 0, len = textItems.length; i < len; i++) {
	        appendText(textDivs, viewport, textItems[i], styles);
	      }

	      if (!timeout) { // Render right away
	        render(this);
	      } else { // Schedule
	        var self = this;
	        this._renderTimer = setTimeout(function() {
	          render(self);
	          self._renderTimer = null;
	        }, timeout);
	      }
	    }
	  };


	  /**
	   * Starts rendering of the text layer.
	   *
	   * @param {TextLayerRenderParameters} renderParameters
	   * @returns {TextLayerRenderTask}
	   */
	  function renderTextLayer(renderParameters) {
	    var task = new TextLayerRenderTask(renderParameters.textContent,
	                                       renderParameters.container,
	                                       renderParameters.viewport,
	                                       renderParameters.textDivs);
	    task._render(renderParameters.timeout);
	    return task;
	  }

	  return renderTextLayer;
	})();

	exports.renderTextLayer = renderTextLayer;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplayWebGL = {}), root.pdfjsSharedUtil,
	      root.pdfjsDisplayDOMUtils);
	  }
	}(this, function (exports, sharedUtil, displayDOMUtils) {

	var shadow = sharedUtil.shadow;
	var getDefaultSetting = displayDOMUtils.getDefaultSetting;

	var WebGLUtils = (function WebGLUtilsClosure() {
	  function loadShader(gl, code, shaderType) {
	    var shader = gl.createShader(shaderType);
	    gl.shaderSource(shader, code);
	    gl.compileShader(shader);
	    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	    if (!compiled) {
	      var errorMsg = gl.getShaderInfoLog(shader);
	      throw new Error('Error during shader compilation: ' + errorMsg);
	    }
	    return shader;
	  }
	  function createVertexShader(gl, code) {
	    return loadShader(gl, code, gl.VERTEX_SHADER);
	  }
	  function createFragmentShader(gl, code) {
	    return loadShader(gl, code, gl.FRAGMENT_SHADER);
	  }
	  function createProgram(gl, shaders) {
	    var program = gl.createProgram();
	    for (var i = 0, ii = shaders.length; i < ii; ++i) {
	      gl.attachShader(program, shaders[i]);
	    }
	    gl.linkProgram(program);
	    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
	    if (!linked) {
	      var errorMsg = gl.getProgramInfoLog(program);
	      throw new Error('Error during program linking: ' + errorMsg);
	    }
	    return program;
	  }
	  function createTexture(gl, image, textureId) {
	    gl.activeTexture(textureId);
	    var texture = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_2D, texture);

	    // Set the parameters so we can render any size image.
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	    // Upload the image into the texture.
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	    return texture;
	  }

	  var currentGL, currentCanvas;
	  function generateGL() {
	    if (currentGL) {
	      return;
	    }
	    currentCanvas = document.createElement('canvas');
	    currentGL = currentCanvas.getContext('webgl',
	      { premultipliedalpha: false });
	  }

	  var smaskVertexShaderCode = '\
	  attribute vec2 a_position;                                    \
	  attribute vec2 a_texCoord;                                    \
	                                                                \
	  uniform vec2 u_resolution;                                    \
	                                                                \
	  varying vec2 v_texCoord;                                      \
	                                                                \
	  void main() {                                                 \
	    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;   \
	    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);          \
	                                                                \
	    v_texCoord = a_texCoord;                                    \
	  }                                                             ';

	  var smaskFragmentShaderCode = '\
	  precision mediump float;                                      \
	                                                                \
	  uniform vec4 u_backdrop;                                      \
	  uniform int u_subtype;                                        \
	  uniform sampler2D u_image;                                    \
	  uniform sampler2D u_mask;                                     \
	                                                                \
	  varying vec2 v_texCoord;                                      \
	                                                                \
	  void main() {                                                 \
	    vec4 imageColor = texture2D(u_image, v_texCoord);           \
	    vec4 maskColor = texture2D(u_mask, v_texCoord);             \
	    if (u_backdrop.a > 0.0) {                                   \
	      maskColor.rgb = maskColor.rgb * maskColor.a +             \
	                      u_backdrop.rgb * (1.0 - maskColor.a);     \
	    }                                                           \
	    float lum;                                                  \
	    if (u_subtype == 0) {                                       \
	      lum = maskColor.a;                                        \
	    } else {                                                    \
	      lum = maskColor.r * 0.3 + maskColor.g * 0.59 +            \
	            maskColor.b * 0.11;                                 \
	    }                                                           \
	    imageColor.a *= lum;                                        \
	    imageColor.rgb *= imageColor.a;                             \
	    gl_FragColor = imageColor;                                  \
	  }                                                             ';

	  var smaskCache = null;

	  function initSmaskGL() {
	    var canvas, gl;

	    generateGL();
	    canvas = currentCanvas;
	    currentCanvas = null;
	    gl = currentGL;
	    currentGL = null;

	    // setup a GLSL program
	    var vertexShader = createVertexShader(gl, smaskVertexShaderCode);
	    var fragmentShader = createFragmentShader(gl, smaskFragmentShaderCode);
	    var program = createProgram(gl, [vertexShader, fragmentShader]);
	    gl.useProgram(program);

	    var cache = {};
	    cache.gl = gl;
	    cache.canvas = canvas;
	    cache.resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
	    cache.positionLocation = gl.getAttribLocation(program, 'a_position');
	    cache.backdropLocation = gl.getUniformLocation(program, 'u_backdrop');
	    cache.subtypeLocation = gl.getUniformLocation(program, 'u_subtype');

	    var texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
	    var texLayerLocation = gl.getUniformLocation(program, 'u_image');
	    var texMaskLocation = gl.getUniformLocation(program, 'u_mask');

	    // provide texture coordinates for the rectangle.
	    var texCoordBuffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	      0.0,  0.0,
	      1.0,  0.0,
	      0.0,  1.0,
	      0.0,  1.0,
	      1.0,  0.0,
	      1.0,  1.0]), gl.STATIC_DRAW);
	    gl.enableVertexAttribArray(texCoordLocation);
	    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

	    gl.uniform1i(texLayerLocation, 0);
	    gl.uniform1i(texMaskLocation, 1);

	    smaskCache = cache;
	  }

	  function composeSMask(layer, mask, properties) {
	    var width = layer.width, height = layer.height;

	    if (!smaskCache) {
	      initSmaskGL();
	    }
	    var cache = smaskCache,canvas = cache.canvas, gl = cache.gl;
	    canvas.width = width;
	    canvas.height = height;
	    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	    gl.uniform2f(cache.resolutionLocation, width, height);

	    if (properties.backdrop) {
	      gl.uniform4f(cache.resolutionLocation, properties.backdrop[0],
	                   properties.backdrop[1], properties.backdrop[2], 1);
	    } else {
	      gl.uniform4f(cache.resolutionLocation, 0, 0, 0, 0);
	    }
	    gl.uniform1i(cache.subtypeLocation,
	                 properties.subtype === 'Luminosity' ? 1 : 0);

	    // Create a textures
	    var texture = createTexture(gl, layer, gl.TEXTURE0);
	    var maskTexture = createTexture(gl, mask, gl.TEXTURE1);


	    // Create a buffer and put a single clipspace rectangle in
	    // it (2 triangles)
	    var buffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	      0, 0,
	      width, 0,
	      0, height,
	      0, height,
	      width, 0,
	      width, height]), gl.STATIC_DRAW);
	    gl.enableVertexAttribArray(cache.positionLocation);
	    gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, false, 0, 0);

	    // draw
	    gl.clearColor(0, 0, 0, 0);
	    gl.enable(gl.BLEND);
	    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	    gl.clear(gl.COLOR_BUFFER_BIT);

	    gl.drawArrays(gl.TRIANGLES, 0, 6);

	    gl.flush();

	    gl.deleteTexture(texture);
	    gl.deleteTexture(maskTexture);
	    gl.deleteBuffer(buffer);

	    return canvas;
	  }

	  var figuresVertexShaderCode = '\
	  attribute vec2 a_position;                                    \
	  attribute vec3 a_color;                                       \
	                                                                \
	  uniform vec2 u_resolution;                                    \
	  uniform vec2 u_scale;                                         \
	  uniform vec2 u_offset;                                        \
	                                                                \
	  varying vec4 v_color;                                         \
	                                                                \
	  void main() {                                                 \
	    vec2 position = (a_position + u_offset) * u_scale;          \
	    vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;     \
	    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);          \
	                                                                \
	    v_color = vec4(a_color / 255.0, 1.0);                       \
	  }                                                             ';

	  var figuresFragmentShaderCode = '\
	  precision mediump float;                                      \
	                                                                \
	  varying vec4 v_color;                                         \
	                                                                \
	  void main() {                                                 \
	    gl_FragColor = v_color;                                     \
	  }                                                             ';

	  var figuresCache = null;

	  function initFiguresGL() {
	    var canvas, gl;

	    generateGL();
	    canvas = currentCanvas;
	    currentCanvas = null;
	    gl = currentGL;
	    currentGL = null;

	    // setup a GLSL program
	    var vertexShader = createVertexShader(gl, figuresVertexShaderCode);
	    var fragmentShader = createFragmentShader(gl, figuresFragmentShaderCode);
	    var program = createProgram(gl, [vertexShader, fragmentShader]);
	    gl.useProgram(program);

	    var cache = {};
	    cache.gl = gl;
	    cache.canvas = canvas;
	    cache.resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
	    cache.scaleLocation = gl.getUniformLocation(program, 'u_scale');
	    cache.offsetLocation = gl.getUniformLocation(program, 'u_offset');
	    cache.positionLocation = gl.getAttribLocation(program, 'a_position');
	    cache.colorLocation = gl.getAttribLocation(program, 'a_color');

	    figuresCache = cache;
	  }

	  function drawFigures(width, height, backgroundColor, figures, context) {
	    if (!figuresCache) {
	      initFiguresGL();
	    }
	    var cache = figuresCache, canvas = cache.canvas, gl = cache.gl;

	    canvas.width = width;
	    canvas.height = height;
	    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	    gl.uniform2f(cache.resolutionLocation, width, height);

	    // count triangle points
	    var count = 0;
	    var i, ii, rows;
	    for (i = 0, ii = figures.length; i < ii; i++) {
	      switch (figures[i].type) {
	        case 'lattice':
	          rows = (figures[i].coords.length / figures[i].verticesPerRow) | 0;
	          count += (rows - 1) * (figures[i].verticesPerRow - 1) * 6;
	          break;
	        case 'triangles':
	          count += figures[i].coords.length;
	          break;
	      }
	    }
	    // transfer data
	    var coords = new Float32Array(count * 2);
	    var colors = new Uint8Array(count * 3);
	    var coordsMap = context.coords, colorsMap = context.colors;
	    var pIndex = 0, cIndex = 0;
	    for (i = 0, ii = figures.length; i < ii; i++) {
	      var figure = figures[i], ps = figure.coords, cs = figure.colors;
	      switch (figure.type) {
	        case 'lattice':
	          var cols = figure.verticesPerRow;
	          rows = (ps.length / cols) | 0;
	          for (var row = 1; row < rows; row++) {
	            var offset = row * cols + 1;
	            for (var col = 1; col < cols; col++, offset++) {
	              coords[pIndex] = coordsMap[ps[offset - cols - 1]];
	              coords[pIndex + 1] = coordsMap[ps[offset - cols - 1] + 1];
	              coords[pIndex + 2] = coordsMap[ps[offset - cols]];
	              coords[pIndex + 3] = coordsMap[ps[offset - cols] + 1];
	              coords[pIndex + 4] = coordsMap[ps[offset - 1]];
	              coords[pIndex + 5] = coordsMap[ps[offset - 1] + 1];
	              colors[cIndex] = colorsMap[cs[offset - cols - 1]];
	              colors[cIndex + 1] = colorsMap[cs[offset - cols - 1] + 1];
	              colors[cIndex + 2] = colorsMap[cs[offset - cols - 1] + 2];
	              colors[cIndex + 3] = colorsMap[cs[offset - cols]];
	              colors[cIndex + 4] = colorsMap[cs[offset - cols] + 1];
	              colors[cIndex + 5] = colorsMap[cs[offset - cols] + 2];
	              colors[cIndex + 6] = colorsMap[cs[offset - 1]];
	              colors[cIndex + 7] = colorsMap[cs[offset - 1] + 1];
	              colors[cIndex + 8] = colorsMap[cs[offset - 1] + 2];

	              coords[pIndex + 6] = coords[pIndex + 2];
	              coords[pIndex + 7] = coords[pIndex + 3];
	              coords[pIndex + 8] = coords[pIndex + 4];
	              coords[pIndex + 9] = coords[pIndex + 5];
	              coords[pIndex + 10] = coordsMap[ps[offset]];
	              coords[pIndex + 11] = coordsMap[ps[offset] + 1];
	              colors[cIndex + 9] = colors[cIndex + 3];
	              colors[cIndex + 10] = colors[cIndex + 4];
	              colors[cIndex + 11] = colors[cIndex + 5];
	              colors[cIndex + 12] = colors[cIndex + 6];
	              colors[cIndex + 13] = colors[cIndex + 7];
	              colors[cIndex + 14] = colors[cIndex + 8];
	              colors[cIndex + 15] = colorsMap[cs[offset]];
	              colors[cIndex + 16] = colorsMap[cs[offset] + 1];
	              colors[cIndex + 17] = colorsMap[cs[offset] + 2];
	              pIndex += 12;
	              cIndex += 18;
	            }
	          }
	          break;
	        case 'triangles':
	          for (var j = 0, jj = ps.length; j < jj; j++) {
	            coords[pIndex] = coordsMap[ps[j]];
	            coords[pIndex + 1] = coordsMap[ps[j] + 1];
	            colors[cIndex] = colorsMap[cs[j]];
	            colors[cIndex + 1] = colorsMap[cs[j] + 1];
	            colors[cIndex + 2] = colorsMap[cs[j] + 2];
	            pIndex += 2;
	            cIndex += 3;
	          }
	          break;
	      }
	    }

	    // draw
	    if (backgroundColor) {
	      gl.clearColor(backgroundColor[0] / 255, backgroundColor[1] / 255,
	                    backgroundColor[2] / 255, 1.0);
	    } else {
	      gl.clearColor(0, 0, 0, 0);
	    }
	    gl.clear(gl.COLOR_BUFFER_BIT);

	    var coordsBuffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
	    gl.enableVertexAttribArray(cache.positionLocation);
	    gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, false, 0, 0);

	    var colorsBuffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	    gl.enableVertexAttribArray(cache.colorLocation);
	    gl.vertexAttribPointer(cache.colorLocation, 3, gl.UNSIGNED_BYTE, false,
	                           0, 0);

	    gl.uniform2f(cache.scaleLocation, context.scaleX, context.scaleY);
	    gl.uniform2f(cache.offsetLocation, context.offsetX, context.offsetY);

	    gl.drawArrays(gl.TRIANGLES, 0, count);

	    gl.flush();

	    gl.deleteBuffer(coordsBuffer);
	    gl.deleteBuffer(colorsBuffer);

	    return canvas;
	  }

	  function cleanup() {
	    if (smaskCache && smaskCache.canvas) {
	      smaskCache.canvas.width = 0;
	      smaskCache.canvas.height = 0;
	    }
	    if (figuresCache && figuresCache.canvas) {
	      figuresCache.canvas.width = 0;
	      figuresCache.canvas.height = 0;
	    }
	    smaskCache = null;
	    figuresCache = null;
	  }

	  return {
	    get isEnabled() {
	      if (getDefaultSetting('disableWebGL')) {
	        return false;
	      }
	      var enabled = false;
	      try {
	        generateGL();
	        enabled = !!currentGL;
	      } catch (e) { }
	      return shadow(this, 'isEnabled', enabled);
	    },
	    composeSMask: composeSMask,
	    drawFigures: drawFigures,
	    clear: cleanup
	  };
	})();

	exports.WebGLUtils = WebGLUtils;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplayPatternHelper = {}), root.pdfjsSharedUtil,
	      root.pdfjsDisplayWebGL);
	  }
	}(this, function (exports, sharedUtil, displayWebGL) {

	var Util = sharedUtil.Util;
	var info = sharedUtil.info;
	var isArray = sharedUtil.isArray;
	var error = sharedUtil.error;
	var WebGLUtils = displayWebGL.WebGLUtils;

	var ShadingIRs = {};

	ShadingIRs.RadialAxial = {
	  fromIR: function RadialAxial_fromIR(raw) {
	    var type = raw[1];
	    var colorStops = raw[2];
	    var p0 = raw[3];
	    var p1 = raw[4];
	    var r0 = raw[5];
	    var r1 = raw[6];
	    return {
	      type: 'Pattern',
	      getPattern: function RadialAxial_getPattern(ctx) {
	        var grad;
	        if (type === 'axial') {
	          grad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
	        } else if (type === 'radial') {
	          grad = ctx.createRadialGradient(p0[0], p0[1], r0, p1[0], p1[1], r1);
	        }

	        for (var i = 0, ii = colorStops.length; i < ii; ++i) {
	          var c = colorStops[i];
	          grad.addColorStop(c[0], c[1]);
	        }
	        return grad;
	      }
	    };
	  }
	};

	var createMeshCanvas = (function createMeshCanvasClosure() {
	  function drawTriangle(data, context, p1, p2, p3, c1, c2, c3) {
	    // Very basic Gouraud-shaded triangle rasterization algorithm.
	    var coords = context.coords, colors = context.colors;
	    var bytes = data.data, rowSize = data.width * 4;
	    var tmp;
	    if (coords[p1 + 1] > coords[p2 + 1]) {
	      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;
	    }
	    if (coords[p2 + 1] > coords[p3 + 1]) {
	      tmp = p2; p2 = p3; p3 = tmp; tmp = c2; c2 = c3; c3 = tmp;
	    }
	    if (coords[p1 + 1] > coords[p2 + 1]) {
	      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;
	    }
	    var x1 = (coords[p1] + context.offsetX) * context.scaleX;
	    var y1 = (coords[p1 + 1] + context.offsetY) * context.scaleY;
	    var x2 = (coords[p2] + context.offsetX) * context.scaleX;
	    var y2 = (coords[p2 + 1] + context.offsetY) * context.scaleY;
	    var x3 = (coords[p3] + context.offsetX) * context.scaleX;
	    var y3 = (coords[p3 + 1] + context.offsetY) * context.scaleY;
	    if (y1 >= y3) {
	      return;
	    }
	    var c1r = colors[c1], c1g = colors[c1 + 1], c1b = colors[c1 + 2];
	    var c2r = colors[c2], c2g = colors[c2 + 1], c2b = colors[c2 + 2];
	    var c3r = colors[c3], c3g = colors[c3 + 1], c3b = colors[c3 + 2];

	    var minY = Math.round(y1), maxY = Math.round(y3);
	    var xa, car, cag, cab;
	    var xb, cbr, cbg, cbb;
	    var k;
	    for (var y = minY; y <= maxY; y++) {
	      if (y < y2) {
	        k = y < y1 ? 0 : y1 === y2 ? 1 : (y1 - y) / (y1 - y2);
	        xa = x1 - (x1 - x2) * k;
	        car = c1r - (c1r - c2r) * k;
	        cag = c1g - (c1g - c2g) * k;
	        cab = c1b - (c1b - c2b) * k;
	      } else {
	        k = y > y3 ? 1 : y2 === y3 ? 0 : (y2 - y) / (y2 - y3);
	        xa = x2 - (x2 - x3) * k;
	        car = c2r - (c2r - c3r) * k;
	        cag = c2g - (c2g - c3g) * k;
	        cab = c2b - (c2b - c3b) * k;
	      }
	      k = y < y1 ? 0 : y > y3 ? 1 : (y1 - y) / (y1 - y3);
	      xb = x1 - (x1 - x3) * k;
	      cbr = c1r - (c1r - c3r) * k;
	      cbg = c1g - (c1g - c3g) * k;
	      cbb = c1b - (c1b - c3b) * k;
	      var x1_ = Math.round(Math.min(xa, xb));
	      var x2_ = Math.round(Math.max(xa, xb));
	      var j = rowSize * y + x1_ * 4;
	      for (var x = x1_; x <= x2_; x++) {
	        k = (xa - x) / (xa - xb);
	        k = k < 0 ? 0 : k > 1 ? 1 : k;
	        bytes[j++] = (car - (car - cbr) * k) | 0;
	        bytes[j++] = (cag - (cag - cbg) * k) | 0;
	        bytes[j++] = (cab - (cab - cbb) * k) | 0;
	        bytes[j++] = 255;
	      }
	    }
	  }

	  function drawFigure(data, figure, context) {
	    var ps = figure.coords;
	    var cs = figure.colors;
	    var i, ii;
	    switch (figure.type) {
	      case 'lattice':
	        var verticesPerRow = figure.verticesPerRow;
	        var rows = Math.floor(ps.length / verticesPerRow) - 1;
	        var cols = verticesPerRow - 1;
	        for (i = 0; i < rows; i++) {
	          var q = i * verticesPerRow;
	          for (var j = 0; j < cols; j++, q++) {
	            drawTriangle(data, context,
	              ps[q], ps[q + 1], ps[q + verticesPerRow],
	              cs[q], cs[q + 1], cs[q + verticesPerRow]);
	            drawTriangle(data, context,
	              ps[q + verticesPerRow + 1], ps[q + 1], ps[q + verticesPerRow],
	              cs[q + verticesPerRow + 1], cs[q + 1], cs[q + verticesPerRow]);
	          }
	        }
	        break;
	      case 'triangles':
	        for (i = 0, ii = ps.length; i < ii; i += 3) {
	          drawTriangle(data, context,
	            ps[i], ps[i + 1], ps[i + 2],
	            cs[i], cs[i + 1], cs[i + 2]);
	        }
	        break;
	      default:
	        error('illigal figure');
	        break;
	    }
	  }

	  function createMeshCanvas(bounds, combinesScale, coords, colors, figures,
	                            backgroundColor, cachedCanvases) {
	    // we will increase scale on some weird factor to let antialiasing take
	    // care of "rough" edges
	    var EXPECTED_SCALE = 1.1;
	    // MAX_PATTERN_SIZE is used to avoid OOM situation.
	    var MAX_PATTERN_SIZE = 3000; // 10in @ 300dpi shall be enough
	    // We need to keep transparent border around our pattern for fill():
	    // createPattern with 'no-repeat' will bleed edges accross entire area.
	    var BORDER_SIZE = 2;

	    var offsetX = Math.floor(bounds[0]);
	    var offsetY = Math.floor(bounds[1]);
	    var boundsWidth = Math.ceil(bounds[2]) - offsetX;
	    var boundsHeight = Math.ceil(bounds[3]) - offsetY;

	    var width = Math.min(Math.ceil(Math.abs(boundsWidth * combinesScale[0] *
	      EXPECTED_SCALE)), MAX_PATTERN_SIZE);
	    var height = Math.min(Math.ceil(Math.abs(boundsHeight * combinesScale[1] *
	      EXPECTED_SCALE)), MAX_PATTERN_SIZE);
	    var scaleX = boundsWidth / width;
	    var scaleY = boundsHeight / height;

	    var context = {
	      coords: coords,
	      colors: colors,
	      offsetX: -offsetX,
	      offsetY: -offsetY,
	      scaleX: 1 / scaleX,
	      scaleY: 1 / scaleY
	    };

	    var paddedWidth = width + BORDER_SIZE * 2;
	    var paddedHeight = height + BORDER_SIZE * 2;

	    var canvas, tmpCanvas, i, ii;
	    if (WebGLUtils.isEnabled) {
	      canvas = WebGLUtils.drawFigures(width, height, backgroundColor,
	                                      figures, context);

	      // https://bugzilla.mozilla.org/show_bug.cgi?id=972126
	      tmpCanvas = cachedCanvases.getCanvas('mesh', paddedWidth, paddedHeight,
	                                           false);
	      tmpCanvas.context.drawImage(canvas, BORDER_SIZE, BORDER_SIZE);
	      canvas = tmpCanvas.canvas;
	    } else {
	      tmpCanvas = cachedCanvases.getCanvas('mesh', paddedWidth, paddedHeight,
	                                           false);
	      var tmpCtx = tmpCanvas.context;

	      var data = tmpCtx.createImageData(width, height);
	      if (backgroundColor) {
	        var bytes = data.data;
	        for (i = 0, ii = bytes.length; i < ii; i += 4) {
	          bytes[i] = backgroundColor[0];
	          bytes[i + 1] = backgroundColor[1];
	          bytes[i + 2] = backgroundColor[2];
	          bytes[i + 3] = 255;
	        }
	      }
	      for (i = 0; i < figures.length; i++) {
	        drawFigure(data, figures[i], context);
	      }
	      tmpCtx.putImageData(data, BORDER_SIZE, BORDER_SIZE);
	      canvas = tmpCanvas.canvas;
	    }

	    return {canvas: canvas,
	            offsetX: offsetX - BORDER_SIZE * scaleX,
	            offsetY: offsetY - BORDER_SIZE * scaleY,
	            scaleX: scaleX, scaleY: scaleY};
	  }
	  return createMeshCanvas;
	})();

	ShadingIRs.Mesh = {
	  fromIR: function Mesh_fromIR(raw) {
	    //var type = raw[1];
	    var coords = raw[2];
	    var colors = raw[3];
	    var figures = raw[4];
	    var bounds = raw[5];
	    var matrix = raw[6];
	    //var bbox = raw[7];
	    var background = raw[8];
	    return {
	      type: 'Pattern',
	      getPattern: function Mesh_getPattern(ctx, owner, shadingFill) {
	        var scale;
	        if (shadingFill) {
	          scale = Util.singularValueDecompose2dScale(ctx.mozCurrentTransform);
	        } else {
	          // Obtain scale from matrix and current transformation matrix.
	          scale = Util.singularValueDecompose2dScale(owner.baseTransform);
	          if (matrix) {
	            var matrixScale = Util.singularValueDecompose2dScale(matrix);
	            scale = [scale[0] * matrixScale[0],
	                     scale[1] * matrixScale[1]];
	          }
	        }


	        // Rasterizing on the main thread since sending/queue large canvases
	        // might cause OOM.
	        var temporaryPatternCanvas = createMeshCanvas(bounds, scale, coords,
	          colors, figures, shadingFill ? null : background,
	          owner.cachedCanvases);

	        if (!shadingFill) {
	          ctx.setTransform.apply(ctx, owner.baseTransform);
	          if (matrix) {
	            ctx.transform.apply(ctx, matrix);
	          }
	        }

	        ctx.translate(temporaryPatternCanvas.offsetX,
	                      temporaryPatternCanvas.offsetY);
	        ctx.scale(temporaryPatternCanvas.scaleX,
	                  temporaryPatternCanvas.scaleY);

	        return ctx.createPattern(temporaryPatternCanvas.canvas, 'no-repeat');
	      }
	    };
	  }
	};

	ShadingIRs.Dummy = {
	  fromIR: function Dummy_fromIR() {
	    return {
	      type: 'Pattern',
	      getPattern: function Dummy_fromIR_getPattern() {
	        return 'hotpink';
	      }
	    };
	  }
	};

	function getShadingPatternFromIR(raw) {
	  var shadingIR = ShadingIRs[raw[0]];
	  if (!shadingIR) {
	    error('Unknown IR type: ' + raw[0]);
	  }
	  return shadingIR.fromIR(raw);
	}

	var TilingPattern = (function TilingPatternClosure() {
	  var PaintType = {
	    COLORED: 1,
	    UNCOLORED: 2
	  };

	  var MAX_PATTERN_SIZE = 3000; // 10in @ 300dpi shall be enough

	  function TilingPattern(IR, color, ctx, canvasGraphicsFactory, baseTransform) {
	    this.operatorList = IR[2];
	    this.matrix = IR[3] || [1, 0, 0, 1, 0, 0];
	    this.bbox = IR[4];
	    this.xstep = IR[5];
	    this.ystep = IR[6];
	    this.paintType = IR[7];
	    this.tilingType = IR[8];
	    this.color = color;
	    this.canvasGraphicsFactory = canvasGraphicsFactory;
	    this.baseTransform = baseTransform;
	    this.type = 'Pattern';
	    this.ctx = ctx;
	  }

	  TilingPattern.prototype = {
	    createPatternCanvas: function TilinPattern_createPatternCanvas(owner) {
	      var operatorList = this.operatorList;
	      var bbox = this.bbox;
	      var xstep = this.xstep;
	      var ystep = this.ystep;
	      var paintType = this.paintType;
	      var tilingType = this.tilingType;
	      var color = this.color;
	      var canvasGraphicsFactory = this.canvasGraphicsFactory;

	      info('TilingType: ' + tilingType);

	      var x0 = bbox[0], y0 = bbox[1], x1 = bbox[2], y1 = bbox[3];

	      var topLeft = [x0, y0];
	      // we want the canvas to be as large as the step size
	      var botRight = [x0 + xstep, y0 + ystep];

	      var width = botRight[0] - topLeft[0];
	      var height = botRight[1] - topLeft[1];

	      // Obtain scale from matrix and current transformation matrix.
	      var matrixScale = Util.singularValueDecompose2dScale(this.matrix);
	      var curMatrixScale = Util.singularValueDecompose2dScale(
	        this.baseTransform);
	      var combinedScale = [matrixScale[0] * curMatrixScale[0],
	        matrixScale[1] * curMatrixScale[1]];

	      // MAX_PATTERN_SIZE is used to avoid OOM situation.
	      // Use width and height values that are as close as possible to the end
	      // result when the pattern is used. Too low value makes the pattern look
	      // blurry. Too large value makes it look too crispy.
	      width = Math.min(Math.ceil(Math.abs(width * combinedScale[0])),
	        MAX_PATTERN_SIZE);

	      height = Math.min(Math.ceil(Math.abs(height * combinedScale[1])),
	        MAX_PATTERN_SIZE);

	      var tmpCanvas = owner.cachedCanvases.getCanvas('pattern',
	        width, height, true);
	      var tmpCtx = tmpCanvas.context;
	      var graphics = canvasGraphicsFactory.createCanvasGraphics(tmpCtx);
	      graphics.groupLevel = owner.groupLevel;

	      this.setFillAndStrokeStyleToContext(tmpCtx, paintType, color);

	      this.setScale(width, height, xstep, ystep);
	      this.transformToScale(graphics);

	      // transform coordinates to pattern space
	      var tmpTranslate = [1, 0, 0, 1, -topLeft[0], -topLeft[1]];
	      graphics.transform.apply(graphics, tmpTranslate);

	      this.clipBbox(graphics, bbox, x0, y0, x1, y1);

	      graphics.executeOperatorList(operatorList);
	      return tmpCanvas.canvas;
	    },

	    setScale: function TilingPattern_setScale(width, height, xstep, ystep) {
	      this.scale = [width / xstep, height / ystep];
	    },

	    transformToScale: function TilingPattern_transformToScale(graphics) {
	      var scale = this.scale;
	      var tmpScale = [scale[0], 0, 0, scale[1], 0, 0];
	      graphics.transform.apply(graphics, tmpScale);
	    },

	    scaleToContext: function TilingPattern_scaleToContext() {
	      var scale = this.scale;
	      this.ctx.scale(1 / scale[0], 1 / scale[1]);
	    },

	    clipBbox: function clipBbox(graphics, bbox, x0, y0, x1, y1) {
	      if (bbox && isArray(bbox) && bbox.length === 4) {
	        var bboxWidth = x1 - x0;
	        var bboxHeight = y1 - y0;
	        graphics.ctx.rect(x0, y0, bboxWidth, bboxHeight);
	        graphics.clip();
	        graphics.endPath();
	      }
	    },

	    setFillAndStrokeStyleToContext:
	      function setFillAndStrokeStyleToContext(context, paintType, color) {
	        switch (paintType) {
	          case PaintType.COLORED:
	            var ctx = this.ctx;
	            context.fillStyle = ctx.fillStyle;
	            context.strokeStyle = ctx.strokeStyle;
	            break;
	          case PaintType.UNCOLORED:
	            var cssColor = Util.makeCssRgb(color[0], color[1], color[2]);
	            context.fillStyle = cssColor;
	            context.strokeStyle = cssColor;
	            break;
	          default:
	            error('Unsupported paint type: ' + paintType);
	        }
	      },

	    getPattern: function TilingPattern_getPattern(ctx, owner) {
	      var temporaryPatternCanvas = this.createPatternCanvas(owner);

	      ctx = this.ctx;
	      ctx.setTransform.apply(ctx, this.baseTransform);
	      ctx.transform.apply(ctx, this.matrix);
	      this.scaleToContext();

	      return ctx.createPattern(temporaryPatternCanvas, 'repeat');
	    }
	  };

	  return TilingPattern;
	})();

	exports.getShadingPatternFromIR = getShadingPatternFromIR;
	exports.TilingPattern = TilingPattern;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplayCanvas = {}), root.pdfjsSharedUtil,
	      root.pdfjsDisplayDOMUtils, root.pdfjsDisplayPatternHelper,
	      root.pdfjsDisplayWebGL);
	  }
	}(this, function (exports, sharedUtil, displayDOMUtils, displayPatternHelper,
	                  displayWebGL) {

	var FONT_IDENTITY_MATRIX = sharedUtil.FONT_IDENTITY_MATRIX;
	var IDENTITY_MATRIX = sharedUtil.IDENTITY_MATRIX;
	var ImageKind = sharedUtil.ImageKind;
	var OPS = sharedUtil.OPS;
	var TextRenderingMode = sharedUtil.TextRenderingMode;
	var Uint32ArrayView = sharedUtil.Uint32ArrayView;
	var Util = sharedUtil.Util;
	var assert = sharedUtil.assert;
	var info = sharedUtil.info;
	var isNum = sharedUtil.isNum;
	var isArray = sharedUtil.isArray;
	var isLittleEndian = sharedUtil.isLittleEndian;
	var error = sharedUtil.error;
	var shadow = sharedUtil.shadow;
	var warn = sharedUtil.warn;
	var TilingPattern = displayPatternHelper.TilingPattern;
	var getShadingPatternFromIR = displayPatternHelper.getShadingPatternFromIR;
	var WebGLUtils = displayWebGL.WebGLUtils;
	var hasCanvasTypedArrays = displayDOMUtils.hasCanvasTypedArrays;

	// <canvas> contexts store most of the state we need natively.
	// However, PDF needs a bit more state, which we store here.

	// Minimal font size that would be used during canvas fillText operations.
	var MIN_FONT_SIZE = 16;
	// Maximum font size that would be used during canvas fillText operations.
	var MAX_FONT_SIZE = 100;
	var MAX_GROUP_SIZE = 4096;

	// Heuristic value used when enforcing minimum line widths.
	var MIN_WIDTH_FACTOR = 0.65;

	var COMPILE_TYPE3_GLYPHS = true;
	var MAX_SIZE_TO_COMPILE = 1000;

	var FULL_CHUNK_HEIGHT = 16;

	var HasCanvasTypedArraysCached = {
	  get value() {
	    return shadow(HasCanvasTypedArraysCached, 'value', hasCanvasTypedArrays());
	  }
	};

	var IsLittleEndianCached = {
	  get value() {
	    return shadow(IsLittleEndianCached, 'value', isLittleEndian());
	  }
	};

	function createScratchCanvas(width, height) {
	  var canvas = document.createElement('canvas');
	  canvas.width = width;
	  canvas.height = height;
	  return canvas;
	}

	function addContextCurrentTransform(ctx) {
	  // If the context doesn't expose a `mozCurrentTransform`, add a JS based one.
	  if (!ctx.mozCurrentTransform) {
	    ctx._originalSave = ctx.save;
	    ctx._originalRestore = ctx.restore;
	    ctx._originalRotate = ctx.rotate;
	    ctx._originalScale = ctx.scale;
	    ctx._originalTranslate = ctx.translate;
	    ctx._originalTransform = ctx.transform;
	    ctx._originalSetTransform = ctx.setTransform;

	    ctx._transformMatrix = ctx._transformMatrix || [1, 0, 0, 1, 0, 0];
	    ctx._transformStack = [];

	    Object.defineProperty(ctx, 'mozCurrentTransform', {
	      get: function getCurrentTransform() {
	        return this._transformMatrix;
	      }
	    });

	    Object.defineProperty(ctx, 'mozCurrentTransformInverse', {
	      get: function getCurrentTransformInverse() {
	        // Calculation done using WolframAlpha:
	        // http://www.wolframalpha.com/input/?
	        //   i=Inverse+{{a%2C+c%2C+e}%2C+{b%2C+d%2C+f}%2C+{0%2C+0%2C+1}}

	        var m = this._transformMatrix;
	        var a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5];

	        var ad_bc = a * d - b * c;
	        var bc_ad = b * c - a * d;

	        return [
	          d / ad_bc,
	          b / bc_ad,
	          c / bc_ad,
	          a / ad_bc,
	          (d * e - c * f) / bc_ad,
	          (b * e - a * f) / ad_bc
	        ];
	      }
	    });

	    ctx.save = function ctxSave() {
	      var old = this._transformMatrix;
	      this._transformStack.push(old);
	      this._transformMatrix = old.slice(0, 6);

	      this._originalSave();
	    };

	    ctx.restore = function ctxRestore() {
	      var prev = this._transformStack.pop();
	      if (prev) {
	        this._transformMatrix = prev;
	        this._originalRestore();
	      }
	    };

	    ctx.translate = function ctxTranslate(x, y) {
	      var m = this._transformMatrix;
	      m[4] = m[0] * x + m[2] * y + m[4];
	      m[5] = m[1] * x + m[3] * y + m[5];

	      this._originalTranslate(x, y);
	    };

	    ctx.scale = function ctxScale(x, y) {
	      var m = this._transformMatrix;
	      m[0] = m[0] * x;
	      m[1] = m[1] * x;
	      m[2] = m[2] * y;
	      m[3] = m[3] * y;

	      this._originalScale(x, y);
	    };

	    ctx.transform = function ctxTransform(a, b, c, d, e, f) {
	      var m = this._transformMatrix;
	      this._transformMatrix = [
	        m[0] * a + m[2] * b,
	        m[1] * a + m[3] * b,
	        m[0] * c + m[2] * d,
	        m[1] * c + m[3] * d,
	        m[0] * e + m[2] * f + m[4],
	        m[1] * e + m[3] * f + m[5]
	      ];

	      ctx._originalTransform(a, b, c, d, e, f);
	    };

	    ctx.setTransform = function ctxSetTransform(a, b, c, d, e, f) {
	      this._transformMatrix = [a, b, c, d, e, f];

	      ctx._originalSetTransform(a, b, c, d, e, f);
	    };

	    ctx.rotate = function ctxRotate(angle) {
	      var cosValue = Math.cos(angle);
	      var sinValue = Math.sin(angle);

	      var m = this._transformMatrix;
	      this._transformMatrix = [
	        m[0] * cosValue + m[2] * sinValue,
	        m[1] * cosValue + m[3] * sinValue,
	        m[0] * (-sinValue) + m[2] * cosValue,
	        m[1] * (-sinValue) + m[3] * cosValue,
	        m[4],
	        m[5]
	      ];

	      this._originalRotate(angle);
	    };
	  }
	}

	var CachedCanvases = (function CachedCanvasesClosure() {
	  function CachedCanvases() {
	    this.cache = Object.create(null);
	  }
	  CachedCanvases.prototype = {
	    getCanvas: function CachedCanvases_getCanvas(id, width, height,
	                                                 trackTransform) {
	      var canvasEntry;
	      if (this.cache[id] !== undefined) {
	        canvasEntry = this.cache[id];
	        canvasEntry.canvas.width = width;
	        canvasEntry.canvas.height = height;
	        // reset canvas transform for emulated mozCurrentTransform, if needed
	        canvasEntry.context.setTransform(1, 0, 0, 1, 0, 0);
	      } else {
	        var canvas = createScratchCanvas(width, height);
	        var ctx = canvas.getContext('2d');
	        if (trackTransform) {
	          addContextCurrentTransform(ctx);
	        }
	        this.cache[id] = canvasEntry = {canvas: canvas, context: ctx};
	      }
	      return canvasEntry;
	    },
	    clear: function () {
	      for (var id in this.cache) {
	        var canvasEntry = this.cache[id];
	        // Zeroing the width and height causes Firefox to release graphics
	        // resources immediately, which can greatly reduce memory consumption.
	        canvasEntry.canvas.width = 0;
	        canvasEntry.canvas.height = 0;
	        delete this.cache[id];
	      }
	    }
	  };
	  return CachedCanvases;
	})();

	function compileType3Glyph(imgData) {
	  var POINT_TO_PROCESS_LIMIT = 1000;

	  var width = imgData.width, height = imgData.height;
	  var i, j, j0, width1 = width + 1;
	  var points = new Uint8Array(width1 * (height + 1));
	  var POINT_TYPES =
	      new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]);

	  // decodes bit-packed mask data
	  var lineSize = (width + 7) & ~7, data0 = imgData.data;
	  var data = new Uint8Array(lineSize * height), pos = 0, ii;
	  for (i = 0, ii = data0.length; i < ii; i++) {
	    var mask = 128, elem = data0[i];
	    while (mask > 0) {
	      data[pos++] = (elem & mask) ? 0 : 255;
	      mask >>= 1;
	    }
	  }

	  // finding iteresting points: every point is located between mask pixels,
	  // so there will be points of the (width + 1)x(height + 1) grid. Every point
	  // will have flags assigned based on neighboring mask pixels:
	  //   4 | 8
	  //   --P--
	  //   2 | 1
	  // We are interested only in points with the flags:
	  //   - outside corners: 1, 2, 4, 8;
	  //   - inside corners: 7, 11, 13, 14;
	  //   - and, intersections: 5, 10.
	  var count = 0;
	  pos = 0;
	  if (data[pos] !== 0) {
	    points[0] = 1;
	    ++count;
	  }
	  for (j = 1; j < width; j++) {
	    if (data[pos] !== data[pos + 1]) {
	      points[j] = data[pos] ? 2 : 1;
	      ++count;
	    }
	    pos++;
	  }
	  if (data[pos] !== 0) {
	    points[j] = 2;
	    ++count;
	  }
	  for (i = 1; i < height; i++) {
	    pos = i * lineSize;
	    j0 = i * width1;
	    if (data[pos - lineSize] !== data[pos]) {
	      points[j0] = data[pos] ? 1 : 8;
	      ++count;
	    }
	    // 'sum' is the position of the current pixel configuration in the 'TYPES'
	    // array (in order 8-1-2-4, so we can use '>>2' to shift the column).
	    var sum = (data[pos] ? 4 : 0) + (data[pos - lineSize] ? 8 : 0);
	    for (j = 1; j < width; j++) {
	      sum = (sum >> 2) + (data[pos + 1] ? 4 : 0) +
	            (data[pos - lineSize + 1] ? 8 : 0);
	      if (POINT_TYPES[sum]) {
	        points[j0 + j] = POINT_TYPES[sum];
	        ++count;
	      }
	      pos++;
	    }
	    if (data[pos - lineSize] !== data[pos]) {
	      points[j0 + j] = data[pos] ? 2 : 4;
	      ++count;
	    }

	    if (count > POINT_TO_PROCESS_LIMIT) {
	      return null;
	    }
	  }

	  pos = lineSize * (height - 1);
	  j0 = i * width1;
	  if (data[pos] !== 0) {
	    points[j0] = 8;
	    ++count;
	  }
	  for (j = 1; j < width; j++) {
	    if (data[pos] !== data[pos + 1]) {
	      points[j0 + j] = data[pos] ? 4 : 8;
	      ++count;
	    }
	    pos++;
	  }
	  if (data[pos] !== 0) {
	    points[j0 + j] = 4;
	    ++count;
	  }
	  if (count > POINT_TO_PROCESS_LIMIT) {
	    return null;
	  }

	  // building outlines
	  var steps = new Int32Array([0, width1, -1, 0, -width1, 0, 0, 0, 1]);
	  var outlines = [];
	  for (i = 0; count && i <= height; i++) {
	    var p = i * width1;
	    var end = p + width;
	    while (p < end && !points[p]) {
	      p++;
	    }
	    if (p === end) {
	      continue;
	    }
	    var coords = [p % width1, i];

	    var type = points[p], p0 = p, pp;
	    do {
	      var step = steps[type];
	      do {
	        p += step;
	      } while (!points[p]);

	      pp = points[p];
	      if (pp !== 5 && pp !== 10) {
	        // set new direction
	        type = pp;
	        // delete mark
	        points[p] = 0;
	      } else { // type is 5 or 10, ie, a crossing
	        // set new direction
	        type = pp & ((0x33 * type) >> 4);
	        // set new type for "future hit"
	        points[p] &= (type >> 2 | type << 2);
	      }

	      coords.push(p % width1);
	      coords.push((p / width1) | 0);
	      --count;
	    } while (p0 !== p);
	    outlines.push(coords);
	    --i;
	  }

	  var drawOutline = function(c) {
	    c.save();
	    // the path shall be painted in [0..1]x[0..1] space
	    c.scale(1 / width, -1 / height);
	    c.translate(0, -height);
	    c.beginPath();
	    for (var i = 0, ii = outlines.length; i < ii; i++) {
	      var o = outlines[i];
	      c.moveTo(o[0], o[1]);
	      for (var j = 2, jj = o.length; j < jj; j += 2) {
	        c.lineTo(o[j], o[j+1]);
	      }
	    }
	    c.fill();
	    c.beginPath();
	    c.restore();
	  };

	  return drawOutline;
	}

	var CanvasExtraState = (function CanvasExtraStateClosure() {
	  function CanvasExtraState(old) {
	    // Are soft masks and alpha values shapes or opacities?
	    this.alphaIsShape = false;
	    this.fontSize = 0;
	    this.fontSizeScale = 1;
	    this.textMatrix = IDENTITY_MATRIX;
	    this.textMatrixScale = 1;
	    this.fontMatrix = FONT_IDENTITY_MATRIX;
	    this.leading = 0;
	    // Current point (in user coordinates)
	    this.x = 0;
	    this.y = 0;
	    // Start of text line (in text coordinates)
	    this.lineX = 0;
	    this.lineY = 0;
	    // Character and word spacing
	    this.charSpacing = 0;
	    this.wordSpacing = 0;
	    this.textHScale = 1;
	    this.textRenderingMode = TextRenderingMode.FILL;
	    this.textRise = 0;
	    // Default fore and background colors
	    this.fillColor = '#000000';
	    this.strokeColor = '#000000';
	    this.patternFill = false;
	    // Note: fill alpha applies to all non-stroking operations
	    this.fillAlpha = 1;
	    this.strokeAlpha = 1;
	    this.lineWidth = 1;
	    this.activeSMask = null;
	    this.resumeSMaskCtx = null; // nonclonable field (see the save method below)

	    this.old = old;
	  }

	  CanvasExtraState.prototype = {
	    clone: function CanvasExtraState_clone() {
	      return Object.create(this);
	    },
	    setCurrentPoint: function CanvasExtraState_setCurrentPoint(x, y) {
	      this.x = x;
	      this.y = y;
	    }
	  };
	  return CanvasExtraState;
	})();

	var CanvasGraphics = (function CanvasGraphicsClosure() {
	  // Defines the time the executeOperatorList is going to be executing
	  // before it stops and shedules a continue of execution.
	  var EXECUTION_TIME = 15;
	  // Defines the number of steps before checking the execution time
	  var EXECUTION_STEPS = 10;

	  function CanvasGraphics(canvasCtx, commonObjs, objs, imageLayer) {
	    this.ctx = canvasCtx;
	    this.current = new CanvasExtraState();
	    this.stateStack = [];
	    this.pendingClip = null;
	    this.pendingEOFill = false;
	    this.res = null;
	    this.xobjs = null;
	    this.commonObjs = commonObjs;
	    this.objs = objs;
	    this.imageLayer = imageLayer;
	    this.groupStack = [];
	    this.processingType3 = null;
	    // Patterns are painted relative to the initial page/form transform, see pdf
	    // spec 8.7.2 NOTE 1.
	    this.baseTransform = null;
	    this.baseTransformStack = [];
	    this.groupLevel = 0;
	    this.smaskStack = [];
	    this.smaskCounter = 0;
	    this.tempSMask = null;
	    this.cachedCanvases = new CachedCanvases();
	    if (canvasCtx) {
	      // NOTE: if mozCurrentTransform is polyfilled, then the current state of
	      // the transformation must already be set in canvasCtx._transformMatrix.
	      addContextCurrentTransform(canvasCtx);
	    }
	    this.cachedGetSinglePixelWidth = null;
	  }

	  function putBinaryImageData(ctx, imgData) {
	    if (typeof ImageData !== 'undefined' && imgData instanceof ImageData) {
	      ctx.putImageData(imgData, 0, 0);
	      return;
	    }

	    // Put the image data to the canvas in chunks, rather than putting the
	    // whole image at once.  This saves JS memory, because the ImageData object
	    // is smaller. It also possibly saves C++ memory within the implementation
	    // of putImageData(). (E.g. in Firefox we make two short-lived copies of
	    // the data passed to putImageData()). |n| shouldn't be too small, however,
	    // because too many putImageData() calls will slow things down.
	    //
	    // Note: as written, if the last chunk is partial, the putImageData() call
	    // will (conceptually) put pixels past the bounds of the canvas.  But
	    // that's ok; any such pixels are ignored.

	    var height = imgData.height, width = imgData.width;
	    var partialChunkHeight = height % FULL_CHUNK_HEIGHT;
	    var fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT;
	    var totalChunks = partialChunkHeight === 0 ? fullChunks : fullChunks + 1;

	    var chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT);
	    var srcPos = 0, destPos;
	    var src = imgData.data;
	    var dest = chunkImgData.data;
	    var i, j, thisChunkHeight, elemsInThisChunk;

	    // There are multiple forms in which the pixel data can be passed, and
	    // imgData.kind tells us which one this is.
	    if (imgData.kind === ImageKind.GRAYSCALE_1BPP) {
	      // Grayscale, 1 bit per pixel (i.e. black-and-white).
	      var srcLength = src.byteLength;
	      var dest32 = HasCanvasTypedArraysCached.value ?
	        new Uint32Array(dest.buffer) : new Uint32ArrayView(dest);
	      var dest32DataLength = dest32.length;
	      var fullSrcDiff = (width + 7) >> 3;
	      var white = 0xFFFFFFFF;
	      var black = (IsLittleEndianCached.value ||
	                   !HasCanvasTypedArraysCached.value) ? 0xFF000000 : 0x000000FF;
	      for (i = 0; i < totalChunks; i++) {
	        thisChunkHeight =
	          (i < fullChunks) ? FULL_CHUNK_HEIGHT : partialChunkHeight;
	        destPos = 0;
	        for (j = 0; j < thisChunkHeight; j++) {
	          var srcDiff = srcLength - srcPos;
	          var k = 0;
	          var kEnd = (srcDiff > fullSrcDiff) ? width : srcDiff * 8 - 7;
	          var kEndUnrolled = kEnd & ~7;
	          var mask = 0;
	          var srcByte = 0;
	          for (; k < kEndUnrolled; k += 8) {
	            srcByte = src[srcPos++];
	            dest32[destPos++] = (srcByte & 128) ? white : black;
	            dest32[destPos++] = (srcByte & 64) ? white : black;
	            dest32[destPos++] = (srcByte & 32) ? white : black;
	            dest32[destPos++] = (srcByte & 16) ? white : black;
	            dest32[destPos++] = (srcByte & 8) ? white : black;
	            dest32[destPos++] = (srcByte & 4) ? white : black;
	            dest32[destPos++] = (srcByte & 2) ? white : black;
	            dest32[destPos++] = (srcByte & 1) ? white : black;
	          }
	          for (; k < kEnd; k++) {
	             if (mask === 0) {
	               srcByte = src[srcPos++];
	               mask = 128;
	             }

	            dest32[destPos++] = (srcByte & mask) ? white : black;
	            mask >>= 1;
	          }
	        }
	        // We ran out of input. Make all remaining pixels transparent.
	        while (destPos < dest32DataLength) {
	          dest32[destPos++] = 0;
	        }

	        ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
	      }
	    } else if (imgData.kind === ImageKind.RGBA_32BPP) {
	      // RGBA, 32-bits per pixel.

	      j = 0;
	      elemsInThisChunk = width * FULL_CHUNK_HEIGHT * 4;
	      for (i = 0; i < fullChunks; i++) {
	        dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));
	        srcPos += elemsInThisChunk;

	        ctx.putImageData(chunkImgData, 0, j);
	        j += FULL_CHUNK_HEIGHT;
	      }
	      if (i < totalChunks) {
	        elemsInThisChunk = width * partialChunkHeight * 4;
	        dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));
	        ctx.putImageData(chunkImgData, 0, j);
	      }

	    } else if (imgData.kind === ImageKind.RGB_24BPP) {
	      // RGB, 24-bits per pixel.
	      thisChunkHeight = FULL_CHUNK_HEIGHT;
	      elemsInThisChunk = width * thisChunkHeight;
	      for (i = 0; i < totalChunks; i++) {
	        if (i >= fullChunks) {
	          thisChunkHeight = partialChunkHeight;
	          elemsInThisChunk = width * thisChunkHeight;
	        }

	        destPos = 0;
	        for (j = elemsInThisChunk; j--;) {
	          dest[destPos++] = src[srcPos++];
	          dest[destPos++] = src[srcPos++];
	          dest[destPos++] = src[srcPos++];
	          dest[destPos++] = 255;
	        }
	        ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
	      }
	    } else {
	      error('bad image kind: ' + imgData.kind);
	    }
	  }

	  function putBinaryImageMask(ctx, imgData) {
	    var height = imgData.height, width = imgData.width;
	    var partialChunkHeight = height % FULL_CHUNK_HEIGHT;
	    var fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT;
	    var totalChunks = partialChunkHeight === 0 ? fullChunks : fullChunks + 1;

	    var chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT);
	    var srcPos = 0;
	    var src = imgData.data;
	    var dest = chunkImgData.data;

	    for (var i = 0; i < totalChunks; i++) {
	      var thisChunkHeight =
	        (i < fullChunks) ? FULL_CHUNK_HEIGHT : partialChunkHeight;

	      // Expand the mask so it can be used by the canvas.  Any required
	      // inversion has already been handled.
	      var destPos = 3; // alpha component offset
	      for (var j = 0; j < thisChunkHeight; j++) {
	        var mask = 0;
	        for (var k = 0; k < width; k++) {
	          if (!mask) {
	            var elem = src[srcPos++];
	            mask = 128;
	          }
	          dest[destPos] = (elem & mask) ? 0 : 255;
	          destPos += 4;
	          mask >>= 1;
	        }
	      }
	      ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
	    }
	  }

	  function copyCtxState(sourceCtx, destCtx) {
	    var properties = ['strokeStyle', 'fillStyle', 'fillRule', 'globalAlpha',
	                      'lineWidth', 'lineCap', 'lineJoin', 'miterLimit',
	                      'globalCompositeOperation', 'font'];
	    for (var i = 0, ii = properties.length; i < ii; i++) {
	      var property = properties[i];
	      if (sourceCtx[property] !== undefined) {
	        destCtx[property] = sourceCtx[property];
	      }
	    }
	    if (sourceCtx.setLineDash !== undefined) {
	      destCtx.setLineDash(sourceCtx.getLineDash());
	      destCtx.lineDashOffset =  sourceCtx.lineDashOffset;
	    } else if (sourceCtx.mozDashOffset !== undefined) {
	      destCtx.mozDash = sourceCtx.mozDash;
	      destCtx.mozDashOffset = sourceCtx.mozDashOffset;
	    }
	  }

	  function composeSMaskBackdrop(bytes, r0, g0, b0) {
	    var length = bytes.length;
	    for (var i = 3; i < length; i += 4) {
	      var alpha = bytes[i];
	      if (alpha === 0) {
	        bytes[i - 3] = r0;
	        bytes[i - 2] = g0;
	        bytes[i - 1] = b0;
	      } else if (alpha < 255) {
	        var alpha_ = 255 - alpha;
	        bytes[i - 3] = (bytes[i - 3] * alpha + r0 * alpha_) >> 8;
	        bytes[i - 2] = (bytes[i - 2] * alpha + g0 * alpha_) >> 8;
	        bytes[i - 1] = (bytes[i - 1] * alpha + b0 * alpha_) >> 8;
	      }
	    }
	  }

	  function composeSMaskAlpha(maskData, layerData, transferMap) {
	    var length = maskData.length;
	    var scale = 1 / 255;
	    for (var i = 3; i < length; i += 4) {
	      var alpha = transferMap ? transferMap[maskData[i]] : maskData[i];
	      layerData[i] = (layerData[i] * alpha * scale) | 0;
	    }
	  }

	  function composeSMaskLuminosity(maskData, layerData, transferMap) {
	    var length = maskData.length;
	    for (var i = 3; i < length; i += 4) {
	      var y = (maskData[i - 3] * 77) +  // * 0.3 / 255 * 0x10000
	              (maskData[i - 2] * 152) + // * 0.59 ....
	              (maskData[i - 1] * 28);   // * 0.11 ....
	      layerData[i] = transferMap ?
	        (layerData[i] * transferMap[y >> 8]) >> 8 :
	        (layerData[i] * y) >> 16;
	    }
	  }

	  function genericComposeSMask(maskCtx, layerCtx, width, height,
	                               subtype, backdrop, transferMap) {
	    var hasBackdrop = !!backdrop;
	    var r0 = hasBackdrop ? backdrop[0] : 0;
	    var g0 = hasBackdrop ? backdrop[1] : 0;
	    var b0 = hasBackdrop ? backdrop[2] : 0;

	    var composeFn;
	    if (subtype === 'Luminosity') {
	      composeFn = composeSMaskLuminosity;
	    } else {
	      composeFn = composeSMaskAlpha;
	    }

	    // processing image in chunks to save memory
	    var PIXELS_TO_PROCESS = 1048576;
	    var chunkSize = Math.min(height, Math.ceil(PIXELS_TO_PROCESS / width));
	    for (var row = 0; row < height; row += chunkSize) {
	      var chunkHeight = Math.min(chunkSize, height - row);
	      var maskData = maskCtx.getImageData(0, row, width, chunkHeight);
	      var layerData = layerCtx.getImageData(0, row, width, chunkHeight);

	      if (hasBackdrop) {
	        composeSMaskBackdrop(maskData.data, r0, g0, b0);
	      }
	      composeFn(maskData.data, layerData.data, transferMap);

	      maskCtx.putImageData(layerData, 0, row);
	    }
	  }

	  function composeSMask(ctx, smask, layerCtx) {
	    var mask = smask.canvas;
	    var maskCtx = smask.context;

	    ctx.setTransform(smask.scaleX, 0, 0, smask.scaleY,
	                     smask.offsetX, smask.offsetY);

	    var backdrop = smask.backdrop || null;
	    if (!smask.transferMap && WebGLUtils.isEnabled) {
	      var composed = WebGLUtils.composeSMask(layerCtx.canvas, mask,
	        {subtype: smask.subtype, backdrop: backdrop});
	      ctx.setTransform(1, 0, 0, 1, 0, 0);
	      ctx.drawImage(composed, smask.offsetX, smask.offsetY);
	      return;
	    }
	    genericComposeSMask(maskCtx, layerCtx, mask.width, mask.height,
	                        smask.subtype, backdrop, smask.transferMap);
	    ctx.drawImage(mask, 0, 0);
	  }

	  var LINE_CAP_STYLES = ['butt', 'round', 'square'];
	  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];
	  var NORMAL_CLIP = {};
	  var EO_CLIP = {};

	  CanvasGraphics.prototype = {

	    beginDrawing: function CanvasGraphics_beginDrawing(transform, viewport,
	                                                       transparency) {
	      // For pdfs that use blend modes we have to clear the canvas else certain
	      // blend modes can look wrong since we'd be blending with a white
	      // backdrop. The problem with a transparent backdrop though is we then
	      // don't get sub pixel anti aliasing on text, creating temporary
	      // transparent canvas when we have blend modes.
	      var width = this.ctx.canvas.width;
	      var height = this.ctx.canvas.height;

	      this.ctx.save();
	      this.ctx.fillStyle = 'rgb(255, 255, 255)';
	      this.ctx.fillRect(0, 0, width, height);
	      this.ctx.restore();

	      if (transparency) {
	        var transparentCanvas = this.cachedCanvases.getCanvas(
	          'transparent', width, height, true);
	        this.compositeCtx = this.ctx;
	        this.transparentCanvas = transparentCanvas.canvas;
	        this.ctx = transparentCanvas.context;
	        this.ctx.save();
	        // The transform can be applied before rendering, transferring it to
	        // the new canvas.
	        this.ctx.transform.apply(this.ctx,
	                                 this.compositeCtx.mozCurrentTransform);
	      }

	      this.ctx.save();
	      if (transform) {
	        this.ctx.transform.apply(this.ctx, transform);
	      }
	      this.ctx.transform.apply(this.ctx, viewport.transform);

	      this.baseTransform = this.ctx.mozCurrentTransform.slice();

	      if (this.imageLayer) {
	        this.imageLayer.beginLayout();
	      }
	    },

	    executeOperatorList: function CanvasGraphics_executeOperatorList(
	                                    operatorList,
	                                    executionStartIdx, continueCallback,
	                                    stepper) {
	      var argsArray = operatorList.argsArray;
	      var fnArray = operatorList.fnArray;
	      var i = executionStartIdx || 0;
	      var argsArrayLen = argsArray.length;

	      // Sometimes the OperatorList to execute is empty.
	      if (argsArrayLen === i) {
	        return i;
	      }

	      var chunkOperations = (argsArrayLen - i > EXECUTION_STEPS &&
	                             typeof continueCallback === 'function');
	      var endTime = chunkOperations ? Date.now() + EXECUTION_TIME : 0;
	      var steps = 0;

	      var commonObjs = this.commonObjs;
	      var objs = this.objs;
	      var fnId;

	      while (true) {
	        if (stepper !== undefined && i === stepper.nextBreakPoint) {
	          stepper.breakIt(i, continueCallback);
	          return i;
	        }

	        fnId = fnArray[i];

	        if (fnId !== OPS.dependency) {
	          this[fnId].apply(this, argsArray[i]);
	        } else {
	          var deps = argsArray[i];
	          for (var n = 0, nn = deps.length; n < nn; n++) {
	            var depObjId = deps[n];
	            var common = depObjId[0] === 'g' && depObjId[1] === '_';
	            var objsPool = common ? commonObjs : objs;

	            // If the promise isn't resolved yet, add the continueCallback
	            // to the promise and bail out.
	            if (!objsPool.isResolved(depObjId)) {
	              objsPool.get(depObjId, continueCallback);
	              return i;
	            }
	          }
	        }

	        i++;

	        // If the entire operatorList was executed, stop as were done.
	        if (i === argsArrayLen) {
	          return i;
	        }

	        // If the execution took longer then a certain amount of time and
	        // `continueCallback` is specified, interrupt the execution.
	        if (chunkOperations && ++steps > EXECUTION_STEPS) {
	          if (Date.now() > endTime) {
	            continueCallback();
	            return i;
	          }
	          steps = 0;
	        }

	        // If the operatorList isn't executed completely yet OR the execution
	        // time was short enough, do another execution round.
	      }
	    },

	    endDrawing: function CanvasGraphics_endDrawing() {
	      // Finishing all opened operations such as SMask group painting.
	      if (this.current.activeSMask !== null) {
	        this.endSMaskGroup();
	      }

	      this.ctx.restore();

	      if (this.transparentCanvas) {
	        this.ctx = this.compositeCtx;
	        this.ctx.save();
	        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Avoid apply transform twice
	        this.ctx.drawImage(this.transparentCanvas, 0, 0);
	        this.ctx.restore();
	        this.transparentCanvas = null;
	      }

	      this.cachedCanvases.clear();
	      WebGLUtils.clear();

	      if (this.imageLayer) {
	        this.imageLayer.endLayout();
	      }
	    },

	    // Graphics state
	    setLineWidth: function CanvasGraphics_setLineWidth(width) {
	      this.current.lineWidth = width;
	      this.ctx.lineWidth = width;
	    },
	    setLineCap: function CanvasGraphics_setLineCap(style) {
	      this.ctx.lineCap = LINE_CAP_STYLES[style];
	    },
	    setLineJoin: function CanvasGraphics_setLineJoin(style) {
	      this.ctx.lineJoin = LINE_JOIN_STYLES[style];
	    },
	    setMiterLimit: function CanvasGraphics_setMiterLimit(limit) {
	      this.ctx.miterLimit = limit;
	    },
	    setDash: function CanvasGraphics_setDash(dashArray, dashPhase) {
	      var ctx = this.ctx;
	      if (ctx.setLineDash !== undefined) {
	        ctx.setLineDash(dashArray);
	        ctx.lineDashOffset = dashPhase;
	      } else {
	        ctx.mozDash = dashArray;
	        ctx.mozDashOffset = dashPhase;
	      }
	    },
	    setRenderingIntent: function CanvasGraphics_setRenderingIntent(intent) {
	      // Maybe if we one day fully support color spaces this will be important
	      // for now we can ignore.
	      // TODO set rendering intent?
	    },
	    setFlatness: function CanvasGraphics_setFlatness(flatness) {
	      // There's no way to control this with canvas, but we can safely ignore.
	      // TODO set flatness?
	    },
	    setGState: function CanvasGraphics_setGState(states) {
	      for (var i = 0, ii = states.length; i < ii; i++) {
	        var state = states[i];
	        var key = state[0];
	        var value = state[1];

	        switch (key) {
	          case 'LW':
	            this.setLineWidth(value);
	            break;
	          case 'LC':
	            this.setLineCap(value);
	            break;
	          case 'LJ':
	            this.setLineJoin(value);
	            break;
	          case 'ML':
	            this.setMiterLimit(value);
	            break;
	          case 'D':
	            this.setDash(value[0], value[1]);
	            break;
	          case 'RI':
	            this.setRenderingIntent(value);
	            break;
	          case 'FL':
	            this.setFlatness(value);
	            break;
	          case 'Font':
	            this.setFont(value[0], value[1]);
	            break;
	          case 'CA':
	            this.current.strokeAlpha = state[1];
	            break;
	          case 'ca':
	            this.current.fillAlpha = state[1];
	            this.ctx.globalAlpha = state[1];
	            break;
	          case 'BM':
	            if (value && value.name && (value.name !== 'Normal')) {
	              var mode = value.name.replace(/([A-Z])/g,
	                function(c) {
	                  return '-' + c.toLowerCase();
	                }
	              ).substring(1);
	              this.ctx.globalCompositeOperation = mode;
	              if (this.ctx.globalCompositeOperation !== mode) {
	                warn('globalCompositeOperation "' + mode +
	                     '" is not supported');
	              }
	            } else {
	              this.ctx.globalCompositeOperation = 'source-over';
	            }
	            break;
	          case 'SMask':
	            if (this.current.activeSMask) {
	              // If SMask is currrenly used, it needs to be suspended or
	              // finished. Suspend only makes sense when at least one save()
	              // was performed and state needs to be reverted on restore().
	              if (this.stateStack.length > 0 &&
	                  (this.stateStack[this.stateStack.length - 1].activeSMask ===
	                   this.current.activeSMask)) {
	                this.suspendSMaskGroup();
	              } else {
	                this.endSMaskGroup();
	              }
	            }
	            this.current.activeSMask = value ? this.tempSMask : null;
	            if (this.current.activeSMask) {
	              this.beginSMaskGroup();
	            }
	            this.tempSMask = null;
	            break;
	        }
	      }
	    },
	    beginSMaskGroup: function CanvasGraphics_beginSMaskGroup() {

	      var activeSMask = this.current.activeSMask;
	      var drawnWidth = activeSMask.canvas.width;
	      var drawnHeight = activeSMask.canvas.height;
	      var cacheId = 'smaskGroupAt' + this.groupLevel;
	      var scratchCanvas = this.cachedCanvases.getCanvas(
	        cacheId, drawnWidth, drawnHeight, true);

	      var currentCtx = this.ctx;
	      var currentTransform = currentCtx.mozCurrentTransform;
	      this.ctx.save();

	      var groupCtx = scratchCanvas.context;
	      groupCtx.scale(1 / activeSMask.scaleX, 1 / activeSMask.scaleY);
	      groupCtx.translate(-activeSMask.offsetX, -activeSMask.offsetY);
	      groupCtx.transform.apply(groupCtx, currentTransform);

	      activeSMask.startTransformInverse = groupCtx.mozCurrentTransformInverse;

	      copyCtxState(currentCtx, groupCtx);
	      this.ctx = groupCtx;
	      this.setGState([
	        ['BM', 'Normal'],
	        ['ca', 1],
	        ['CA', 1]
	      ]);
	      this.groupStack.push(currentCtx);
	      this.groupLevel++;
	    },
	    suspendSMaskGroup: function CanvasGraphics_endSMaskGroup() {
	      // Similar to endSMaskGroup, the intermediate canvas has to be composed
	      // and future ctx state restored.
	      var groupCtx = this.ctx;
	      this.groupLevel--;
	      this.ctx = this.groupStack.pop();

	      composeSMask(this.ctx, this.current.activeSMask, groupCtx);
	      this.ctx.restore();
	      this.ctx.save(); // save is needed since SMask will be resumed.
	      copyCtxState(groupCtx, this.ctx);

	      // Saving state for resuming.
	      this.current.resumeSMaskCtx = groupCtx;
	      // Transform was changed in the SMask canvas, reflecting this change on
	      // this.ctx.
	      var deltaTransform = Util.transform(
	        this.current.activeSMask.startTransformInverse,
	        groupCtx.mozCurrentTransform);
	      this.ctx.transform.apply(this.ctx, deltaTransform);

	      // SMask was composed, the results at the groupCtx can be cleared.
	      groupCtx.save();
	      groupCtx.setTransform(1, 0, 0, 1, 0, 0);
	      groupCtx.clearRect(0, 0, groupCtx.canvas.width, groupCtx.canvas.height);
	      groupCtx.restore();
	    },
	    resumeSMaskGroup: function CanvasGraphics_endSMaskGroup() {
	      // Resuming state saved by suspendSMaskGroup. We don't need to restore
	      // any groupCtx state since restore() command (the only caller) will do
	      // that for us. See also beginSMaskGroup.
	      var groupCtx = this.current.resumeSMaskCtx;
	      var currentCtx = this.ctx;
	      this.ctx = groupCtx;
	      this.groupStack.push(currentCtx);
	      this.groupLevel++;
	    },
	    endSMaskGroup: function CanvasGraphics_endSMaskGroup() {
	      var groupCtx = this.ctx;
	      this.groupLevel--;
	      this.ctx = this.groupStack.pop();

	      composeSMask(this.ctx, this.current.activeSMask, groupCtx);
	      this.ctx.restore();
	      copyCtxState(groupCtx, this.ctx);
	      // Transform was changed in the SMask canvas, reflecting this change on
	      // this.ctx.
	      var deltaTransform = Util.transform(
	        this.current.activeSMask.startTransformInverse,
	        groupCtx.mozCurrentTransform);
	      this.ctx.transform.apply(this.ctx, deltaTransform);
	    },
	    save: function CanvasGraphics_save() {
	      this.ctx.save();
	      var old = this.current;
	      this.stateStack.push(old);
	      this.current = old.clone();
	      this.current.resumeSMaskCtx = null;
	    },
	    restore: function CanvasGraphics_restore() {
	      // SMask was suspended, we just need to resume it.
	      if (this.current.resumeSMaskCtx) {
	        this.resumeSMaskGroup();
	      }
	      // SMask has to be finished once there is no states that are using the
	      // same SMask.
	      if (this.current.activeSMask !== null && (this.stateStack.length === 0 ||
	          this.stateStack[this.stateStack.length - 1].activeSMask !==
	          this.current.activeSMask)) {
	        this.endSMaskGroup();
	      }

	      if (this.stateStack.length !== 0) {
	        this.current = this.stateStack.pop();
	        this.ctx.restore();

	        // Ensure that the clipping path is reset (fixes issue6413.pdf).
	        this.pendingClip = null;

	        this.cachedGetSinglePixelWidth = null;
	      }
	    },
	    transform: function CanvasGraphics_transform(a, b, c, d, e, f) {
	      this.ctx.transform(a, b, c, d, e, f);

	      this.cachedGetSinglePixelWidth = null;
	    },

	    // Path
	    constructPath: function CanvasGraphics_constructPath(ops, args) {
	      var ctx = this.ctx;
	      var current = this.current;
	      var x = current.x, y = current.y;
	      for (var i = 0, j = 0, ii = ops.length; i < ii; i++) {
	        switch (ops[i] | 0) {
	          case OPS.rectangle:
	            x = args[j++];
	            y = args[j++];
	            var width = args[j++];
	            var height = args[j++];
	            if (width === 0) {
	              width = this.getSinglePixelWidth();
	            }
	            if (height === 0) {
	              height = this.getSinglePixelWidth();
	            }
	            var xw = x + width;
	            var yh = y + height;
	            this.ctx.moveTo(x, y);
	            this.ctx.lineTo(xw, y);
	            this.ctx.lineTo(xw, yh);
	            this.ctx.lineTo(x, yh);
	            this.ctx.lineTo(x, y);
	            this.ctx.closePath();
	            break;
	          case OPS.moveTo:
	            x = args[j++];
	            y = args[j++];
	            ctx.moveTo(x, y);
	            break;
	          case OPS.lineTo:
	            x = args[j++];
	            y = args[j++];
	            ctx.lineTo(x, y);
	            break;
	          case OPS.curveTo:
	            x = args[j + 4];
	            y = args[j + 5];
	            ctx.bezierCurveTo(args[j], args[j + 1], args[j + 2], args[j + 3],
	                              x, y);
	            j += 6;
	            break;
	          case OPS.curveTo2:
	            ctx.bezierCurveTo(x, y, args[j], args[j + 1],
	                              args[j + 2], args[j + 3]);
	            x = args[j + 2];
	            y = args[j + 3];
	            j += 4;
	            break;
	          case OPS.curveTo3:
	            x = args[j + 2];
	            y = args[j + 3];
	            ctx.bezierCurveTo(args[j], args[j + 1], x, y, x, y);
	            j += 4;
	            break;
	          case OPS.closePath:
	            ctx.closePath();
	            break;
	        }
	      }
	      current.setCurrentPoint(x, y);
	    },
	    closePath: function CanvasGraphics_closePath() {
	      this.ctx.closePath();
	    },
	    stroke: function CanvasGraphics_stroke(consumePath) {
	      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;
	      var ctx = this.ctx;
	      var strokeColor = this.current.strokeColor;
	      // Prevent drawing too thin lines by enforcing a minimum line width.
	      ctx.lineWidth = Math.max(this.getSinglePixelWidth() * MIN_WIDTH_FACTOR,
	                               this.current.lineWidth);
	      // For stroke we want to temporarily change the global alpha to the
	      // stroking alpha.
	      ctx.globalAlpha = this.current.strokeAlpha;
	      if (strokeColor && strokeColor.hasOwnProperty('type') &&
	          strokeColor.type === 'Pattern') {
	        // for patterns, we transform to pattern space, calculate
	        // the pattern, call stroke, and restore to user space
	        ctx.save();
	        ctx.strokeStyle = strokeColor.getPattern(ctx, this);
	        ctx.stroke();
	        ctx.restore();
	      } else {
	        ctx.stroke();
	      }
	      if (consumePath) {
	        this.consumePath();
	      }
	      // Restore the global alpha to the fill alpha
	      ctx.globalAlpha = this.current.fillAlpha;
	    },
	    closeStroke: function CanvasGraphics_closeStroke() {
	      this.closePath();
	      this.stroke();
	    },
	    fill: function CanvasGraphics_fill(consumePath) {
	      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;
	      var ctx = this.ctx;
	      var fillColor = this.current.fillColor;
	      var isPatternFill = this.current.patternFill;
	      var needRestore = false;

	      if (isPatternFill) {
	        ctx.save();
	        if (this.baseTransform) {
	          ctx.setTransform.apply(ctx, this.baseTransform);
	        }
	        ctx.fillStyle = fillColor.getPattern(ctx, this);
	        needRestore = true;
	      }

	      if (this.pendingEOFill) {
	        if (ctx.mozFillRule !== undefined) {
	          ctx.mozFillRule = 'evenodd';
	          ctx.fill();
	          ctx.mozFillRule = 'nonzero';
	        } else {
	          ctx.fill('evenodd');
	        }
	        this.pendingEOFill = false;
	      } else {
	        ctx.fill();
	      }

	      if (needRestore) {
	        ctx.restore();
	      }
	      if (consumePath) {
	        this.consumePath();
	      }
	    },
	    eoFill: function CanvasGraphics_eoFill() {
	      this.pendingEOFill = true;
	      this.fill();
	    },
	    fillStroke: function CanvasGraphics_fillStroke() {
	      this.fill(false);
	      this.stroke(false);

	      this.consumePath();
	    },
	    eoFillStroke: function CanvasGraphics_eoFillStroke() {
	      this.pendingEOFill = true;
	      this.fillStroke();
	    },
	    closeFillStroke: function CanvasGraphics_closeFillStroke() {
	      this.closePath();
	      this.fillStroke();
	    },
	    closeEOFillStroke: function CanvasGraphics_closeEOFillStroke() {
	      this.pendingEOFill = true;
	      this.closePath();
	      this.fillStroke();
	    },
	    endPath: function CanvasGraphics_endPath() {
	      this.consumePath();
	    },

	    // Clipping
	    clip: function CanvasGraphics_clip() {
	      this.pendingClip = NORMAL_CLIP;
	    },
	    eoClip: function CanvasGraphics_eoClip() {
	      this.pendingClip = EO_CLIP;
	    },

	    // Text
	    beginText: function CanvasGraphics_beginText() {
	      this.current.textMatrix = IDENTITY_MATRIX;
	      this.current.textMatrixScale = 1;
	      this.current.x = this.current.lineX = 0;
	      this.current.y = this.current.lineY = 0;
	    },
	    endText: function CanvasGraphics_endText() {
	      var paths = this.pendingTextPaths;
	      var ctx = this.ctx;
	      if (paths === undefined) {
	        ctx.beginPath();
	        return;
	      }

	      ctx.save();
	      ctx.beginPath();
	      for (var i = 0; i < paths.length; i++) {
	        var path = paths[i];
	        ctx.setTransform.apply(ctx, path.transform);
	        ctx.translate(path.x, path.y);
	        path.addToPath(ctx, path.fontSize);
	      }
	      ctx.restore();
	      ctx.clip();
	      ctx.beginPath();
	      delete this.pendingTextPaths;
	    },
	    setCharSpacing: function CanvasGraphics_setCharSpacing(spacing) {
	      this.current.charSpacing = spacing;
	    },
	    setWordSpacing: function CanvasGraphics_setWordSpacing(spacing) {
	      this.current.wordSpacing = spacing;
	    },
	    setHScale: function CanvasGraphics_setHScale(scale) {
	      this.current.textHScale = scale / 100;
	    },
	    setLeading: function CanvasGraphics_setLeading(leading) {
	      this.current.leading = -leading;
	    },
	    setFont: function CanvasGraphics_setFont(fontRefName, size) {
	      var fontObj = this.commonObjs.get(fontRefName);
	      var current = this.current;

	      if (!fontObj) {
	        error('Can\'t find font for ' + fontRefName);
	      }

	      current.fontMatrix = (fontObj.fontMatrix ?
	                            fontObj.fontMatrix : FONT_IDENTITY_MATRIX);

	      // A valid matrix needs all main diagonal elements to be non-zero
	      // This also ensures we bypass FF bugzilla bug #719844.
	      if (current.fontMatrix[0] === 0 ||
	          current.fontMatrix[3] === 0) {
	        warn('Invalid font matrix for font ' + fontRefName);
	      }

	      // The spec for Tf (setFont) says that 'size' specifies the font 'scale',
	      // and in some docs this can be negative (inverted x-y axes).
	      if (size < 0) {
	        size = -size;
	        current.fontDirection = -1;
	      } else {
	        current.fontDirection = 1;
	      }

	      this.current.font = fontObj;
	      this.current.fontSize = size;

	      if (fontObj.isType3Font) {
	        return; // we don't need ctx.font for Type3 fonts
	      }

	      var name = fontObj.loadedName || 'sans-serif';
	      var bold = fontObj.black ? (fontObj.bold ? '900' : 'bold') :
	                                 (fontObj.bold ? 'bold' : 'normal');

	      var italic = fontObj.italic ? 'italic' : 'normal';
	      var typeface = '"' + name + '", ' + fontObj.fallbackName;

	      // Some font backends cannot handle fonts below certain size.
	      // Keeping the font at minimal size and using the fontSizeScale to change
	      // the current transformation matrix before the fillText/strokeText.
	      // See https://bugzilla.mozilla.org/show_bug.cgi?id=726227
	      var browserFontSize = size < MIN_FONT_SIZE ? MIN_FONT_SIZE :
	                            size > MAX_FONT_SIZE ? MAX_FONT_SIZE : size;
	      this.current.fontSizeScale = size / browserFontSize;

	      var rule = italic + ' ' + bold + ' ' + browserFontSize + 'px ' + typeface;
	      this.ctx.font = rule;
	    },
	    setTextRenderingMode: function CanvasGraphics_setTextRenderingMode(mode) {
	      this.current.textRenderingMode = mode;
	    },
	    setTextRise: function CanvasGraphics_setTextRise(rise) {
	      this.current.textRise = rise;
	    },
	    moveText: function CanvasGraphics_moveText(x, y) {
	      this.current.x = this.current.lineX += x;
	      this.current.y = this.current.lineY += y;
	    },
	    setLeadingMoveText: function CanvasGraphics_setLeadingMoveText(x, y) {
	      this.setLeading(-y);
	      this.moveText(x, y);
	    },
	    setTextMatrix: function CanvasGraphics_setTextMatrix(a, b, c, d, e, f) {
	      this.current.textMatrix = [a, b, c, d, e, f];
	      this.current.textMatrixScale = Math.sqrt(a * a + b * b);

	      this.current.x = this.current.lineX = 0;
	      this.current.y = this.current.lineY = 0;
	    },
	    nextLine: function CanvasGraphics_nextLine() {
	      this.moveText(0, this.current.leading);
	    },

	    paintChar: function CanvasGraphics_paintChar(character, x, y) {
	      var ctx = this.ctx;
	      var current = this.current;
	      var font = current.font;
	      var textRenderingMode = current.textRenderingMode;
	      var fontSize = current.fontSize / current.fontSizeScale;
	      var fillStrokeMode = textRenderingMode &
	        TextRenderingMode.FILL_STROKE_MASK;
	      var isAddToPathSet = !!(textRenderingMode &
	        TextRenderingMode.ADD_TO_PATH_FLAG);

	      var addToPath;
	      if (font.disableFontFace || isAddToPathSet) {
	        addToPath = font.getPathGenerator(this.commonObjs, character);
	      }

	      if (font.disableFontFace) {
	        ctx.save();
	        ctx.translate(x, y);
	        ctx.beginPath();
	        addToPath(ctx, fontSize);
	        if (fillStrokeMode === TextRenderingMode.FILL ||
	            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
	          ctx.fill();
	        }
	        if (fillStrokeMode === TextRenderingMode.STROKE ||
	            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
	          ctx.stroke();
	        }
	        ctx.restore();
	      } else {
	        if (fillStrokeMode === TextRenderingMode.FILL ||
	            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
	          ctx.fillText(character, x, y);
	        }
	        if (fillStrokeMode === TextRenderingMode.STROKE ||
	            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
	          ctx.strokeText(character, x, y);
	        }
	      }

	      if (isAddToPathSet) {
	        var paths = this.pendingTextPaths || (this.pendingTextPaths = []);
	        paths.push({
	          transform: ctx.mozCurrentTransform,
	          x: x,
	          y: y,
	          fontSize: fontSize,
	          addToPath: addToPath
	        });
	      }
	    },

	    get isFontSubpixelAAEnabled() {
	      // Checks if anti-aliasing is enabled when scaled text is painted.
	      // On Windows GDI scaled fonts looks bad.
	      var ctx = document.createElement('canvas').getContext('2d');
	      ctx.scale(1.5, 1);
	      ctx.fillText('I', 0, 10);
	      var data = ctx.getImageData(0, 0, 10, 10).data;
	      var enabled = false;
	      for (var i = 3; i < data.length; i += 4) {
	        if (data[i] > 0 && data[i] < 255) {
	          enabled = true;
	          break;
	        }
	      }
	      return shadow(this, 'isFontSubpixelAAEnabled', enabled);
	    },

	    showText: function CanvasGraphics_showText(glyphs) {
	      var current = this.current;
	      var font = current.font;
	      if (font.isType3Font) {
	        return this.showType3Text(glyphs);
	      }

	      var fontSize = current.fontSize;
	      if (fontSize === 0) {
	        return;
	      }

	      var ctx = this.ctx;
	      var fontSizeScale = current.fontSizeScale;
	      var charSpacing = current.charSpacing;
	      var wordSpacing = current.wordSpacing;
	      var fontDirection = current.fontDirection;
	      var textHScale = current.textHScale * fontDirection;
	      var glyphsLength = glyphs.length;
	      var vertical = font.vertical;
	      var spacingDir = vertical ? 1 : -1;
	      var defaultVMetrics = font.defaultVMetrics;
	      var widthAdvanceScale = fontSize * current.fontMatrix[0];

	      var simpleFillText =
	        current.textRenderingMode === TextRenderingMode.FILL &&
	        !font.disableFontFace;

	      ctx.save();
	      ctx.transform.apply(ctx, current.textMatrix);
	      ctx.translate(current.x, current.y + current.textRise);

	      if (current.patternFill) {
	        // TODO: Some shading patterns are not applied correctly to text,
	        //       e.g. issues 3988 and 5432, and ShowText-ShadingPattern.pdf.
	        ctx.fillStyle = current.fillColor.getPattern(ctx, this);
	      }

	      if (fontDirection > 0) {
	        ctx.scale(textHScale, -1);
	      } else {
	        ctx.scale(textHScale, 1);
	      }

	      var lineWidth = current.lineWidth;
	      var scale = current.textMatrixScale;
	      if (scale === 0 || lineWidth === 0) {
	        var fillStrokeMode = current.textRenderingMode &
	          TextRenderingMode.FILL_STROKE_MASK;
	        if (fillStrokeMode === TextRenderingMode.STROKE ||
	            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
	          this.cachedGetSinglePixelWidth = null;
	          lineWidth = this.getSinglePixelWidth() * MIN_WIDTH_FACTOR;
	        }
	      } else {
	        lineWidth /= scale;
	      }

	      if (fontSizeScale !== 1.0) {
	        ctx.scale(fontSizeScale, fontSizeScale);
	        lineWidth /= fontSizeScale;
	      }

	      ctx.lineWidth = lineWidth;

	      var x = 0, i;
	      for (i = 0; i < glyphsLength; ++i) {
	        var glyph = glyphs[i];
	        if (isNum(glyph)) {
	          x += spacingDir * glyph * fontSize / 1000;
	          continue;
	        }

	        var restoreNeeded = false;
	        var spacing = (glyph.isSpace ? wordSpacing : 0) + charSpacing;
	        var character = glyph.fontChar;
	        var accent = glyph.accent;
	        var scaledX, scaledY, scaledAccentX, scaledAccentY;
	        var width = glyph.width;
	        if (vertical) {
	          var vmetric, vx, vy;
	          vmetric = glyph.vmetric || defaultVMetrics;
	          vx = glyph.vmetric ? vmetric[1] : width * 0.5;
	          vx = -vx * widthAdvanceScale;
	          vy = vmetric[2] * widthAdvanceScale;

	          width = vmetric ? -vmetric[0] : width;
	          scaledX = vx / fontSizeScale;
	          scaledY = (x + vy) / fontSizeScale;
	        } else {
	          scaledX = x / fontSizeScale;
	          scaledY = 0;
	        }

	        if (font.remeasure && width > 0) {
	          // Some standard fonts may not have the exact width: rescale per
	          // character if measured width is greater than expected glyph width
	          // and subpixel-aa is enabled, otherwise just center the glyph.
	          var measuredWidth = ctx.measureText(character).width * 1000 /
	            fontSize * fontSizeScale;
	          if (width < measuredWidth && this.isFontSubpixelAAEnabled) {
	            var characterScaleX = width / measuredWidth;
	            restoreNeeded = true;
	            ctx.save();
	            ctx.scale(characterScaleX, 1);
	            scaledX /= characterScaleX;
	          } else if (width !== measuredWidth) {
	            scaledX += (width - measuredWidth) / 2000 *
	              fontSize / fontSizeScale;
	          }
	        }

	        // Only attempt to draw the glyph if it is actually in the embedded font
	        // file or if there isn't a font file so the fallback font is shown.
	        if (glyph.isInFont || font.missingFile) {
	          if (simpleFillText && !accent) {
	            // common case
	            ctx.fillText(character, scaledX, scaledY);
	          } else {
	            this.paintChar(character, scaledX, scaledY);
	            if (accent) {
	              scaledAccentX = scaledX + accent.offset.x / fontSizeScale;
	              scaledAccentY = scaledY - accent.offset.y / fontSizeScale;
	              this.paintChar(accent.fontChar, scaledAccentX, scaledAccentY);
	            }
	          }
	        }

	        var charWidth = width * widthAdvanceScale + spacing * fontDirection;
	        x += charWidth;

	        if (restoreNeeded) {
	          ctx.restore();
	        }
	      }
	      if (vertical) {
	        current.y -= x * textHScale;
	      } else {
	        current.x += x * textHScale;
	      }
	      ctx.restore();
	    },

	    showType3Text: function CanvasGraphics_showType3Text(glyphs) {
	      // Type3 fonts - each glyph is a "mini-PDF"
	      var ctx = this.ctx;
	      var current = this.current;
	      var font = current.font;
	      var fontSize = current.fontSize;
	      var fontDirection = current.fontDirection;
	      var spacingDir = font.vertical ? 1 : -1;
	      var charSpacing = current.charSpacing;
	      var wordSpacing = current.wordSpacing;
	      var textHScale = current.textHScale * fontDirection;
	      var fontMatrix = current.fontMatrix || FONT_IDENTITY_MATRIX;
	      var glyphsLength = glyphs.length;
	      var isTextInvisible =
	        current.textRenderingMode === TextRenderingMode.INVISIBLE;
	      var i, glyph, width, spacingLength;

	      if (isTextInvisible || fontSize === 0) {
	        return;
	      }
	      this.cachedGetSinglePixelWidth = null;

	      ctx.save();
	      ctx.transform.apply(ctx, current.textMatrix);
	      ctx.translate(current.x, current.y);

	      ctx.scale(textHScale, fontDirection);

	      for (i = 0; i < glyphsLength; ++i) {
	        glyph = glyphs[i];
	        if (isNum(glyph)) {
	          spacingLength = spacingDir * glyph * fontSize / 1000;
	          this.ctx.translate(spacingLength, 0);
	          current.x += spacingLength * textHScale;
	          continue;
	        }

	        var spacing = (glyph.isSpace ? wordSpacing : 0) + charSpacing;
	        var operatorList = font.charProcOperatorList[glyph.operatorListId];
	        if (!operatorList) {
	          warn('Type3 character \"' + glyph.operatorListId +
	               '\" is not available');
	          continue;
	        }
	        this.processingType3 = glyph;
	        this.save();
	        ctx.scale(fontSize, fontSize);
	        ctx.transform.apply(ctx, fontMatrix);
	        this.executeOperatorList(operatorList);
	        this.restore();

	        var transformed = Util.applyTransform([glyph.width, 0], fontMatrix);
	        width = transformed[0] * fontSize + spacing;

	        ctx.translate(width, 0);
	        current.x += width * textHScale;
	      }
	      ctx.restore();
	      this.processingType3 = null;
	    },

	    // Type3 fonts
	    setCharWidth: function CanvasGraphics_setCharWidth(xWidth, yWidth) {
	      // We can safely ignore this since the width should be the same
	      // as the width in the Widths array.
	    },
	    setCharWidthAndBounds: function CanvasGraphics_setCharWidthAndBounds(xWidth,
	                                                                        yWidth,
	                                                                        llx,
	                                                                        lly,
	                                                                        urx,
	                                                                        ury) {
	      // TODO According to the spec we're also suppose to ignore any operators
	      // that set color or include images while processing this type3 font.
	      this.ctx.rect(llx, lly, urx - llx, ury - lly);
	      this.clip();
	      this.endPath();
	    },

	    // Color
	    getColorN_Pattern: function CanvasGraphics_getColorN_Pattern(IR) {
	      var pattern;
	      if (IR[0] === 'TilingPattern') {
	        var color = IR[1];
	        var baseTransform = this.baseTransform ||
	                            this.ctx.mozCurrentTransform.slice();
	        var self = this;
	        var canvasGraphicsFactory = {
	          createCanvasGraphics: function (ctx) {
	            return new CanvasGraphics(ctx, self.commonObjs, self.objs);
	          }
	        };
	        pattern = new TilingPattern(IR, color, this.ctx, canvasGraphicsFactory,
	                                    baseTransform);
	      } else {
	        pattern = getShadingPatternFromIR(IR);
	      }
	      return pattern;
	    },
	    setStrokeColorN: function CanvasGraphics_setStrokeColorN(/*...*/) {
	      this.current.strokeColor = this.getColorN_Pattern(arguments);
	    },
	    setFillColorN: function CanvasGraphics_setFillColorN(/*...*/) {
	      this.current.fillColor = this.getColorN_Pattern(arguments);
	      this.current.patternFill = true;
	    },
	    setStrokeRGBColor: function CanvasGraphics_setStrokeRGBColor(r, g, b) {
	      var color = Util.makeCssRgb(r, g, b);
	      this.ctx.strokeStyle = color;
	      this.current.strokeColor = color;
	    },
	    setFillRGBColor: function CanvasGraphics_setFillRGBColor(r, g, b) {
	      var color = Util.makeCssRgb(r, g, b);
	      this.ctx.fillStyle = color;
	      this.current.fillColor = color;
	      this.current.patternFill = false;
	    },

	    shadingFill: function CanvasGraphics_shadingFill(patternIR) {
	      var ctx = this.ctx;

	      this.save();
	      var pattern = getShadingPatternFromIR(patternIR);
	      ctx.fillStyle = pattern.getPattern(ctx, this, true);

	      var inv = ctx.mozCurrentTransformInverse;
	      if (inv) {
	        var canvas = ctx.canvas;
	        var width = canvas.width;
	        var height = canvas.height;

	        var bl = Util.applyTransform([0, 0], inv);
	        var br = Util.applyTransform([0, height], inv);
	        var ul = Util.applyTransform([width, 0], inv);
	        var ur = Util.applyTransform([width, height], inv);

	        var x0 = Math.min(bl[0], br[0], ul[0], ur[0]);
	        var y0 = Math.min(bl[1], br[1], ul[1], ur[1]);
	        var x1 = Math.max(bl[0], br[0], ul[0], ur[0]);
	        var y1 = Math.max(bl[1], br[1], ul[1], ur[1]);

	        this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
	      } else {
	        // HACK to draw the gradient onto an infinite rectangle.
	        // PDF gradients are drawn across the entire image while
	        // Canvas only allows gradients to be drawn in a rectangle
	        // The following bug should allow us to remove this.
	        // https://bugzilla.mozilla.org/show_bug.cgi?id=664884

	        this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10);
	      }

	      this.restore();
	    },

	    // Images
	    beginInlineImage: function CanvasGraphics_beginInlineImage() {
	      error('Should not call beginInlineImage');
	    },
	    beginImageData: function CanvasGraphics_beginImageData() {
	      error('Should not call beginImageData');
	    },

	    paintFormXObjectBegin: function CanvasGraphics_paintFormXObjectBegin(matrix,
	                                                                        bbox) {
	      this.save();
	      this.baseTransformStack.push(this.baseTransform);

	      if (isArray(matrix) && 6 === matrix.length) {
	        this.transform.apply(this, matrix);
	      }

	      this.baseTransform = this.ctx.mozCurrentTransform;

	      if (isArray(bbox) && 4 === bbox.length) {
	        var width = bbox[2] - bbox[0];
	        var height = bbox[3] - bbox[1];
	        this.ctx.rect(bbox[0], bbox[1], width, height);
	        this.clip();
	        this.endPath();
	      }
	    },

	    paintFormXObjectEnd: function CanvasGraphics_paintFormXObjectEnd() {
	      this.restore();
	      this.baseTransform = this.baseTransformStack.pop();
	    },

	    beginGroup: function CanvasGraphics_beginGroup(group) {
	      this.save();
	      var currentCtx = this.ctx;
	      // TODO non-isolated groups - according to Rik at adobe non-isolated
	      // group results aren't usually that different and they even have tools
	      // that ignore this setting. Notes from Rik on implmenting:
	      // - When you encounter an transparency group, create a new canvas with
	      // the dimensions of the bbox
	      // - copy the content from the previous canvas to the new canvas
	      // - draw as usual
	      // - remove the backdrop alpha:
	      // alphaNew = 1 - (1 - alpha)/(1 - alphaBackdrop) with 'alpha' the alpha
	      // value of your transparency group and 'alphaBackdrop' the alpha of the
	      // backdrop
	      // - remove background color:
	      // colorNew = color - alphaNew *colorBackdrop /(1 - alphaNew)
	      if (!group.isolated) {
	        info('TODO: Support non-isolated groups.');
	      }

	      // TODO knockout - supposedly possible with the clever use of compositing
	      // modes.
	      if (group.knockout) {
	        warn('Knockout groups not supported.');
	      }

	      var currentTransform = currentCtx.mozCurrentTransform;
	      if (group.matrix) {
	        currentCtx.transform.apply(currentCtx, group.matrix);
	      }
	      assert(group.bbox, 'Bounding box is required.');

	      // Based on the current transform figure out how big the bounding box
	      // will actually be.
	      var bounds = Util.getAxialAlignedBoundingBox(
	                    group.bbox,
	                    currentCtx.mozCurrentTransform);
	      // Clip the bounding box to the current canvas.
	      var canvasBounds = [0,
	                          0,
	                          currentCtx.canvas.width,
	                          currentCtx.canvas.height];
	      bounds = Util.intersect(bounds, canvasBounds) || [0, 0, 0, 0];
	      // Use ceil in case we're between sizes so we don't create canvas that is
	      // too small and make the canvas at least 1x1 pixels.
	      var offsetX = Math.floor(bounds[0]);
	      var offsetY = Math.floor(bounds[1]);
	      var drawnWidth = Math.max(Math.ceil(bounds[2]) - offsetX, 1);
	      var drawnHeight = Math.max(Math.ceil(bounds[3]) - offsetY, 1);
	      var scaleX = 1, scaleY = 1;
	      if (drawnWidth > MAX_GROUP_SIZE) {
	        scaleX = drawnWidth / MAX_GROUP_SIZE;
	        drawnWidth = MAX_GROUP_SIZE;
	      }
	      if (drawnHeight > MAX_GROUP_SIZE) {
	        scaleY = drawnHeight / MAX_GROUP_SIZE;
	        drawnHeight = MAX_GROUP_SIZE;
	      }

	      var cacheId = 'groupAt' + this.groupLevel;
	      if (group.smask) {
	        // Using two cache entries is case if masks are used one after another.
	        cacheId +=  '_smask_' + ((this.smaskCounter++) % 2);
	      }
	      var scratchCanvas = this.cachedCanvases.getCanvas(
	        cacheId, drawnWidth, drawnHeight, true);
	      var groupCtx = scratchCanvas.context;

	      // Since we created a new canvas that is just the size of the bounding box
	      // we have to translate the group ctx.
	      groupCtx.scale(1 / scaleX, 1 / scaleY);
	      groupCtx.translate(-offsetX, -offsetY);
	      groupCtx.transform.apply(groupCtx, currentTransform);

	      if (group.smask) {
	        // Saving state and cached mask to be used in setGState.
	        this.smaskStack.push({
	          canvas: scratchCanvas.canvas,
	          context: groupCtx,
	          offsetX: offsetX,
	          offsetY: offsetY,
	          scaleX: scaleX,
	          scaleY: scaleY,
	          subtype: group.smask.subtype,
	          backdrop: group.smask.backdrop,
	          transferMap: group.smask.transferMap || null,
	          startTransformInverse: null, // used during suspend operation
	        });
	      } else {
	        // Setup the current ctx so when the group is popped we draw it at the
	        // right location.
	        currentCtx.setTransform(1, 0, 0, 1, 0, 0);
	        currentCtx.translate(offsetX, offsetY);
	        currentCtx.scale(scaleX, scaleY);
	      }
	      // The transparency group inherits all off the current graphics state
	      // except the blend mode, soft mask, and alpha constants.
	      copyCtxState(currentCtx, groupCtx);
	      this.ctx = groupCtx;
	      this.setGState([
	        ['BM', 'Normal'],
	        ['ca', 1],
	        ['CA', 1]
	      ]);
	      this.groupStack.push(currentCtx);
	      this.groupLevel++;

	      // Reseting mask state, masks will be applied on restore of the group.
	      this.current.activeSMask = null;
	    },

	    endGroup: function CanvasGraphics_endGroup(group) {
	      this.groupLevel--;
	      var groupCtx = this.ctx;
	      this.ctx = this.groupStack.pop();
	      // Turn off image smoothing to avoid sub pixel interpolation which can
	      // look kind of blurry for some pdfs.
	      if (this.ctx.imageSmoothingEnabled !== undefined) {
	        this.ctx.imageSmoothingEnabled = false;
	      } else {
	        this.ctx.mozImageSmoothingEnabled = false;
	      }
	      if (group.smask) {
	        this.tempSMask = this.smaskStack.pop();
	      } else {
	        this.ctx.drawImage(groupCtx.canvas, 0, 0);
	      }
	      this.restore();
	    },

	    beginAnnotations: function CanvasGraphics_beginAnnotations() {
	      this.save();
	      this.current = new CanvasExtraState();

	      if (this.baseTransform) {
	        this.ctx.setTransform.apply(this.ctx, this.baseTransform);
	      }
	    },

	    endAnnotations: function CanvasGraphics_endAnnotations() {
	      this.restore();
	    },

	    beginAnnotation: function CanvasGraphics_beginAnnotation(rect, transform,
	                                                             matrix) {
	      this.save();

	      if (isArray(rect) && 4 === rect.length) {
	        var width = rect[2] - rect[0];
	        var height = rect[3] - rect[1];
	        this.ctx.rect(rect[0], rect[1], width, height);
	        this.clip();
	        this.endPath();
	      }

	      this.transform.apply(this, transform);
	      this.transform.apply(this, matrix);
	    },

	    endAnnotation: function CanvasGraphics_endAnnotation() {
	      this.restore();
	    },

	    paintJpegXObject: function CanvasGraphics_paintJpegXObject(objId, w, h) {
	      var domImage = this.objs.get(objId);
	      if (!domImage) {
	        warn('Dependent image isn\'t ready yet');
	        return;
	      }

	      this.save();

	      var ctx = this.ctx;
	      // scale the image to the unit square
	      ctx.scale(1 / w, -1 / h);

	      ctx.drawImage(domImage, 0, 0, domImage.width, domImage.height,
	                    0, -h, w, h);
	      if (this.imageLayer) {
	        var currentTransform = ctx.mozCurrentTransformInverse;
	        var position = this.getCanvasPosition(0, 0);
	        this.imageLayer.appendImage({
	          objId: objId,
	          left: position[0],
	          top: position[1],
	          width: w / currentTransform[0],
	          height: h / currentTransform[3]
	        });
	      }
	      this.restore();
	    },

	    paintImageMaskXObject: function CanvasGraphics_paintImageMaskXObject(img) {
	      var ctx = this.ctx;
	      var width = img.width, height = img.height;
	      var fillColor = this.current.fillColor;
	      var isPatternFill = this.current.patternFill;

	      var glyph = this.processingType3;

	      if (COMPILE_TYPE3_GLYPHS && glyph && glyph.compiled === undefined) {
	        if (width <= MAX_SIZE_TO_COMPILE && height <= MAX_SIZE_TO_COMPILE) {
	          glyph.compiled =
	            compileType3Glyph({data: img.data, width: width, height: height});
	        } else {
	          glyph.compiled = null;
	        }
	      }

	      if (glyph && glyph.compiled) {
	        glyph.compiled(ctx);
	        return;
	      }

	      var maskCanvas = this.cachedCanvases.getCanvas('maskCanvas',
	                                                     width, height);
	      var maskCtx = maskCanvas.context;
	      maskCtx.save();

	      putBinaryImageMask(maskCtx, img);

	      maskCtx.globalCompositeOperation = 'source-in';

	      maskCtx.fillStyle = isPatternFill ?
	                          fillColor.getPattern(maskCtx, this) : fillColor;
	      maskCtx.fillRect(0, 0, width, height);

	      maskCtx.restore();

	      this.paintInlineImageXObject(maskCanvas.canvas);
	    },

	    paintImageMaskXObjectRepeat:
	      function CanvasGraphics_paintImageMaskXObjectRepeat(imgData, scaleX,
	                                                          scaleY, positions) {
	      var width = imgData.width;
	      var height = imgData.height;
	      var fillColor = this.current.fillColor;
	      var isPatternFill = this.current.patternFill;

	      var maskCanvas = this.cachedCanvases.getCanvas('maskCanvas',
	                                                     width, height);
	      var maskCtx = maskCanvas.context;
	      maskCtx.save();

	      putBinaryImageMask(maskCtx, imgData);

	      maskCtx.globalCompositeOperation = 'source-in';

	      maskCtx.fillStyle = isPatternFill ?
	                          fillColor.getPattern(maskCtx, this) : fillColor;
	      maskCtx.fillRect(0, 0, width, height);

	      maskCtx.restore();

	      var ctx = this.ctx;
	      for (var i = 0, ii = positions.length; i < ii; i += 2) {
	        ctx.save();
	        ctx.transform(scaleX, 0, 0, scaleY, positions[i], positions[i + 1]);
	        ctx.scale(1, -1);
	        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,
	          0, -1, 1, 1);
	        ctx.restore();
	      }
	    },

	    paintImageMaskXObjectGroup:
	      function CanvasGraphics_paintImageMaskXObjectGroup(images) {
	      var ctx = this.ctx;

	      var fillColor = this.current.fillColor;
	      var isPatternFill = this.current.patternFill;
	      for (var i = 0, ii = images.length; i < ii; i++) {
	        var image = images[i];
	        var width = image.width, height = image.height;

	        var maskCanvas = this.cachedCanvases.getCanvas('maskCanvas',
	                                                       width, height);
	        var maskCtx = maskCanvas.context;
	        maskCtx.save();

	        putBinaryImageMask(maskCtx, image);

	        maskCtx.globalCompositeOperation = 'source-in';

	        maskCtx.fillStyle = isPatternFill ?
	                            fillColor.getPattern(maskCtx, this) : fillColor;
	        maskCtx.fillRect(0, 0, width, height);

	        maskCtx.restore();

	        ctx.save();
	        ctx.transform.apply(ctx, image.transform);
	        ctx.scale(1, -1);
	        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,
	                      0, -1, 1, 1);
	        ctx.restore();
	      }
	    },

	    paintImageXObject: function CanvasGraphics_paintImageXObject(objId) {
	      var imgData = this.objs.get(objId);
	      if (!imgData) {
	        warn('Dependent image isn\'t ready yet');
	        return;
	      }

	      this.paintInlineImageXObject(imgData);
	    },

	    paintImageXObjectRepeat:
	      function CanvasGraphics_paintImageXObjectRepeat(objId, scaleX, scaleY,
	                                                          positions) {
	      var imgData = this.objs.get(objId);
	      if (!imgData) {
	        warn('Dependent image isn\'t ready yet');
	        return;
	      }

	      var width = imgData.width;
	      var height = imgData.height;
	      var map = [];
	      for (var i = 0, ii = positions.length; i < ii; i += 2) {
	        map.push({transform: [scaleX, 0, 0, scaleY, positions[i],
	                 positions[i + 1]], x: 0, y: 0, w: width, h: height});
	      }
	      this.paintInlineImageXObjectGroup(imgData, map);
	    },

	    paintInlineImageXObject:
	      function CanvasGraphics_paintInlineImageXObject(imgData) {
	      var width = imgData.width;
	      var height = imgData.height;
	      var ctx = this.ctx;

	      this.save();
	      // scale the image to the unit square
	      ctx.scale(1 / width, -1 / height);

	      var currentTransform = ctx.mozCurrentTransformInverse;
	      var a = currentTransform[0], b = currentTransform[1];
	      var widthScale = Math.max(Math.sqrt(a * a + b * b), 1);
	      var c = currentTransform[2], d = currentTransform[3];
	      var heightScale = Math.max(Math.sqrt(c * c + d * d), 1);

	      var imgToPaint, tmpCanvas;
	      // instanceof HTMLElement does not work in jsdom node.js module
	      if (imgData instanceof HTMLElement || !imgData.data) {
	        imgToPaint = imgData;
	      } else {
	        tmpCanvas = this.cachedCanvases.getCanvas('inlineImage',
	                                                  width, height);
	        var tmpCtx = tmpCanvas.context;
	        putBinaryImageData(tmpCtx, imgData);
	        imgToPaint = tmpCanvas.canvas;
	      }

	      var paintWidth = width, paintHeight = height;
	      var tmpCanvasId = 'prescale1';
	      // Vertial or horizontal scaling shall not be more than 2 to not loose the
	      // pixels during drawImage operation, painting on the temporary canvas(es)
	      // that are twice smaller in size
	      while ((widthScale > 2 && paintWidth > 1) ||
	             (heightScale > 2 && paintHeight > 1)) {
	        var newWidth = paintWidth, newHeight = paintHeight;
	        if (widthScale > 2 && paintWidth > 1) {
	          newWidth = Math.ceil(paintWidth / 2);
	          widthScale /= paintWidth / newWidth;
	        }
	        if (heightScale > 2 && paintHeight > 1) {
	          newHeight = Math.ceil(paintHeight / 2);
	          heightScale /= paintHeight / newHeight;
	        }
	        tmpCanvas = this.cachedCanvases.getCanvas(tmpCanvasId,
	                                                  newWidth, newHeight);
	        tmpCtx = tmpCanvas.context;
	        tmpCtx.clearRect(0, 0, newWidth, newHeight);
	        tmpCtx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,
	                                     0, 0, newWidth, newHeight);
	        imgToPaint = tmpCanvas.canvas;
	        paintWidth = newWidth;
	        paintHeight = newHeight;
	        tmpCanvasId = tmpCanvasId === 'prescale1' ? 'prescale2' : 'prescale1';
	      }
	      ctx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,
	                                0, -height, width, height);

	      if (this.imageLayer) {
	        var position = this.getCanvasPosition(0, -height);
	        this.imageLayer.appendImage({
	          imgData: imgData,
	          left: position[0],
	          top: position[1],
	          width: width / currentTransform[0],
	          height: height / currentTransform[3]
	        });
	      }
	      this.restore();
	    },

	    paintInlineImageXObjectGroup:
	      function CanvasGraphics_paintInlineImageXObjectGroup(imgData, map) {
	      var ctx = this.ctx;
	      var w = imgData.width;
	      var h = imgData.height;

	      var tmpCanvas = this.cachedCanvases.getCanvas('inlineImage', w, h);
	      var tmpCtx = tmpCanvas.context;
	      putBinaryImageData(tmpCtx, imgData);

	      for (var i = 0, ii = map.length; i < ii; i++) {
	        var entry = map[i];
	        ctx.save();
	        ctx.transform.apply(ctx, entry.transform);
	        ctx.scale(1, -1);
	        ctx.drawImage(tmpCanvas.canvas, entry.x, entry.y, entry.w, entry.h,
	                      0, -1, 1, 1);
	        if (this.imageLayer) {
	          var position = this.getCanvasPosition(entry.x, entry.y);
	          this.imageLayer.appendImage({
	            imgData: imgData,
	            left: position[0],
	            top: position[1],
	            width: w,
	            height: h
	          });
	        }
	        ctx.restore();
	      }
	    },

	    paintSolidColorImageMask:
	      function CanvasGraphics_paintSolidColorImageMask() {
	        this.ctx.fillRect(0, 0, 1, 1);
	    },

	    paintXObject: function CanvasGraphics_paintXObject() {
	      warn('Unsupported \'paintXObject\' command.');
	    },

	    // Marked content

	    markPoint: function CanvasGraphics_markPoint(tag) {
	      // TODO Marked content.
	    },
	    markPointProps: function CanvasGraphics_markPointProps(tag, properties) {
	      // TODO Marked content.
	    },
	    beginMarkedContent: function CanvasGraphics_beginMarkedContent(tag) {
	      // TODO Marked content.
	    },
	    beginMarkedContentProps: function CanvasGraphics_beginMarkedContentProps(
	                                        tag, properties) {
	      // TODO Marked content.
	    },
	    endMarkedContent: function CanvasGraphics_endMarkedContent() {
	      // TODO Marked content.
	    },

	    // Compatibility

	    beginCompat: function CanvasGraphics_beginCompat() {
	      // TODO ignore undefined operators (should we do that anyway?)
	    },
	    endCompat: function CanvasGraphics_endCompat() {
	      // TODO stop ignoring undefined operators
	    },

	    // Helper functions

	    consumePath: function CanvasGraphics_consumePath() {
	      var ctx = this.ctx;
	      if (this.pendingClip) {
	        if (this.pendingClip === EO_CLIP) {
	          if (ctx.mozFillRule !== undefined) {
	            ctx.mozFillRule = 'evenodd';
	            ctx.clip();
	            ctx.mozFillRule = 'nonzero';
	          } else {
	            ctx.clip('evenodd');
	          }
	        } else {
	          ctx.clip();
	        }
	        this.pendingClip = null;
	      }
	      ctx.beginPath();
	    },
	    getSinglePixelWidth: function CanvasGraphics_getSinglePixelWidth(scale) {
	      if (this.cachedGetSinglePixelWidth === null) {
	        var inverse = this.ctx.mozCurrentTransformInverse;
	        // max of the current horizontal and vertical scale
	        this.cachedGetSinglePixelWidth = Math.sqrt(Math.max(
	          (inverse[0] * inverse[0] + inverse[1] * inverse[1]),
	          (inverse[2] * inverse[2] + inverse[3] * inverse[3])));
	      }
	      return this.cachedGetSinglePixelWidth;
	    },
	    getCanvasPosition: function CanvasGraphics_getCanvasPosition(x, y) {
	      var transform = this.ctx.mozCurrentTransform;
	      return [
	        transform[0] * x + transform[2] * y + transform[4],
	        transform[1] * x + transform[3] * y + transform[5]
	      ];
	    }
	  };

	  for (var op in OPS) {
	    CanvasGraphics.prototype[OPS[op]] = CanvasGraphics.prototype[op];
	  }

	  return CanvasGraphics;
	})();

	exports.CanvasGraphics = CanvasGraphics;
	exports.createScratchCanvas = createScratchCanvas;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplayAPI = {}), root.pdfjsSharedUtil,
	      root.pdfjsDisplayFontLoader, root.pdfjsDisplayCanvas,
	      root.pdfjsDisplayMetadata, root.pdfjsDisplayDOMUtils);
	  }
	}(this, function (exports, sharedUtil, displayFontLoader, displayCanvas,
	                  displayMetadata, displayDOMUtils, amdRequire) {

	var InvalidPDFException = sharedUtil.InvalidPDFException;
	var MessageHandler = sharedUtil.MessageHandler;
	var MissingPDFException = sharedUtil.MissingPDFException;
	var PageViewport = sharedUtil.PageViewport;
	var PasswordResponses = sharedUtil.PasswordResponses;
	var PasswordException = sharedUtil.PasswordException;
	var StatTimer = sharedUtil.StatTimer;
	var UnexpectedResponseException = sharedUtil.UnexpectedResponseException;
	var UnknownErrorException = sharedUtil.UnknownErrorException;
	var Util = sharedUtil.Util;
	var createPromiseCapability = sharedUtil.createPromiseCapability;
	var error = sharedUtil.error;
	var deprecated = sharedUtil.deprecated;
	var getVerbosityLevel = sharedUtil.getVerbosityLevel;
	var info = sharedUtil.info;
	var isArrayBuffer = sharedUtil.isArrayBuffer;
	var isSameOrigin = sharedUtil.isSameOrigin;
	var loadJpegStream = sharedUtil.loadJpegStream;
	var stringToBytes = sharedUtil.stringToBytes;
	var globalScope = sharedUtil.globalScope;
	var warn = sharedUtil.warn;
	var FontFaceObject = displayFontLoader.FontFaceObject;
	var FontLoader = displayFontLoader.FontLoader;
	var CanvasGraphics = displayCanvas.CanvasGraphics;
	var createScratchCanvas = displayCanvas.createScratchCanvas;
	var Metadata = displayMetadata.Metadata;
	var getDefaultSetting = displayDOMUtils.getDefaultSetting;

	var DEFAULT_RANGE_CHUNK_SIZE = 65536; // 2^16 = 65536

	var isWorkerDisabled = false;
	var workerSrc;
	var isPostMessageTransfersDisabled = false;


	var useRequireEnsure = false;
	if (typeof window === 'undefined') {
	  // node.js - disable worker and set require.ensure.
	  isWorkerDisabled = true;
	  if (false) {
	    require.ensure = require('node-ensure');
	  }
	  useRequireEnsure = true;
	}
	if (true) {
	  useRequireEnsure = true;
	}
	if (typeof requirejs !== 'undefined' && requirejs.toUrl) {
	  workerSrc = requirejs.toUrl('pdfjs-dist/build/pdf.worker.js');
	}
	var dynamicLoaderSupported = typeof requirejs !== 'undefined' && requirejs.load;
	var fakeWorkerFilesLoader = useRequireEnsure ? (function (callback) {
	  __webpack_require__.e/* nsure */(1, function () {
	    var worker = __webpack_require__(8);
	    callback(worker.WorkerMessageHandler);
	  });
	}) : dynamicLoaderSupported ? (function (callback) {
	  requirejs(['pdfjs-dist/build/pdf.worker'], function (worker) {
	    callback(worker.WorkerMessageHandler);
	  });
	}) : null;


	/**
	 * Document initialization / loading parameters object.
	 *
	 * @typedef {Object} DocumentInitParameters
	 * @property {string}     url   - The URL of the PDF.
	 * @property {TypedArray|Array|string} data - Binary PDF data. Use typed arrays
	 *   (Uint8Array) to improve the memory usage. If PDF data is BASE64-encoded,
	 *   use atob() to convert it to a binary string first.
	 * @property {Object}     httpHeaders - Basic authentication headers.
	 * @property {boolean}    withCredentials - Indicates whether or not cross-site
	 *   Access-Control requests should be made using credentials such as cookies
	 *   or authorization headers. The default is false.
	 * @property {string}     password - For decrypting password-protected PDFs.
	 * @property {TypedArray} initialData - A typed array with the first portion or
	 *   all of the pdf data. Used by the extension since some data is already
	 *   loaded before the switch to range requests.
	 * @property {number}     length - The PDF file length. It's used for progress
	 *   reports and range requests operations.
	 * @property {PDFDataRangeTransport} range
	 * @property {number}     rangeChunkSize - Optional parameter to specify
	 *   maximum number of bytes fetched per range request. The default value is
	 *   2^16 = 65536.
	 * @property {PDFWorker}  worker - The worker that will be used for the loading
	 *   and parsing of the PDF data.
	 */

	/**
	 * @typedef {Object} PDFDocumentStats
	 * @property {Array} streamTypes - Used stream types in the document (an item
	 *   is set to true if specific stream ID was used in the document).
	 * @property {Array} fontTypes - Used font type in the document (an item is set
	 *   to true if specific font ID was used in the document).
	 */

	/**
	 * This is the main entry point for loading a PDF and interacting with it.
	 * NOTE: If a URL is used to fetch the PDF data a standard XMLHttpRequest(XHR)
	 * is used, which means it must follow the same origin rules that any XHR does
	 * e.g. No cross domain requests without CORS.
	 *
	 * @param {string|TypedArray|DocumentInitParameters|PDFDataRangeTransport} src
	 * Can be a url to where a PDF is located, a typed array (Uint8Array)
	 * already populated with data or parameter object.
	 *
	 * @param {PDFDataRangeTransport} pdfDataRangeTransport (deprecated) It is used
	 * if you want to manually serve range requests for data in the PDF.
	 *
	 * @param {function} passwordCallback (deprecated) It is used to request a
	 * password if wrong or no password was provided. The callback receives two
	 * parameters: function that needs to be called with new password and reason
	 * (see {PasswordResponses}).
	 *
	 * @param {function} progressCallback (deprecated) It is used to be able to
	 * monitor the loading progress of the PDF file (necessary to implement e.g.
	 * a loading bar). The callback receives an {Object} with the properties:
	 * {number} loaded and {number} total.
	 *
	 * @return {PDFDocumentLoadingTask}
	 */
	function getDocument(src, pdfDataRangeTransport,
	                     passwordCallback, progressCallback) {
	  var task = new PDFDocumentLoadingTask();

	  // Support of the obsolete arguments (for compatibility with API v1.0)
	  if (arguments.length > 1) {
	    deprecated('getDocument is called with pdfDataRangeTransport, ' +
	               'passwordCallback or progressCallback argument');
	  }
	  if (pdfDataRangeTransport) {
	    if (!(pdfDataRangeTransport instanceof PDFDataRangeTransport)) {
	      // Not a PDFDataRangeTransport instance, trying to add missing properties.
	      pdfDataRangeTransport = Object.create(pdfDataRangeTransport);
	      pdfDataRangeTransport.length = src.length;
	      pdfDataRangeTransport.initialData = src.initialData;
	      if (!pdfDataRangeTransport.abort) {
	        pdfDataRangeTransport.abort = function () {};
	      }
	    }
	    src = Object.create(src);
	    src.range = pdfDataRangeTransport;
	  }
	  task.onPassword = passwordCallback || null;
	  task.onProgress = progressCallback || null;

	  var source;
	  if (typeof src === 'string') {
	    source = { url: src };
	  } else if (isArrayBuffer(src)) {
	    source = { data: src };
	  } else if (src instanceof PDFDataRangeTransport) {
	    source = { range: src };
	  } else {
	    if (typeof src !== 'object') {
	      error('Invalid parameter in getDocument, need either Uint8Array, ' +
	        'string or a parameter object');
	    }
	    if (!src.url && !src.data && !src.range) {
	      error('Invalid parameter object: need either .data, .range or .url');
	    }

	    source = src;
	  }

	  var params = {};
	  var rangeTransport = null;
	  var worker = null;
	  for (var key in source) {
	    if (key === 'url' && typeof window !== 'undefined') {
	      // The full path is required in the 'url' field.
	      params[key] = new URL(source[key], window.location).href;
	      continue;
	    } else if (key === 'range') {
	      rangeTransport = source[key];
	      continue;
	    } else if (key === 'worker') {
	      worker = source[key];
	      continue;
	    } else if (key === 'data' && !(source[key] instanceof Uint8Array)) {
	      // Converting string or array-like data to Uint8Array.
	      var pdfBytes = source[key];
	      if (typeof pdfBytes === 'string') {
	        params[key] = stringToBytes(pdfBytes);
	      } else if (typeof pdfBytes === 'object' && pdfBytes !== null &&
	                 !isNaN(pdfBytes.length)) {
	        params[key] = new Uint8Array(pdfBytes);
	      } else if (isArrayBuffer(pdfBytes)) {
	        params[key] = new Uint8Array(pdfBytes);
	      } else {
	        error('Invalid PDF binary data: either typed array, string or ' +
	              'array-like object is expected in the data property.');
	      }
	      continue;
	    }
	    params[key] = source[key];
	  }

	  params.rangeChunkSize = params.rangeChunkSize || DEFAULT_RANGE_CHUNK_SIZE;

	  if (!worker) {
	    // Worker was not provided -- creating and owning our own.
	    worker = new PDFWorker();
	    task._worker = worker;
	  }
	  var docId = task.docId;
	  worker.promise.then(function () {
	    if (task.destroyed) {
	      throw new Error('Loading aborted');
	    }
	    return _fetchDocument(worker, params, rangeTransport, docId).then(
	        function (workerId) {
	      if (task.destroyed) {
	        throw new Error('Loading aborted');
	      }
	      var messageHandler = new MessageHandler(docId, workerId, worker.port);
	      var transport = new WorkerTransport(messageHandler, task, rangeTransport);
	      task._transport = transport;
	      messageHandler.send('Ready', null);
	    });
	  }).catch(task._capability.reject);

	  return task;
	}

	/**
	 * Starts fetching of specified PDF document/data.
	 * @param {PDFWorker} worker
	 * @param {Object} source
	 * @param {PDFDataRangeTransport} pdfDataRangeTransport
	 * @param {string} docId Unique document id, used as MessageHandler id.
	 * @returns {Promise} The promise, which is resolved when worker id of
	 *                    MessageHandler is known.
	 * @private
	 */
	function _fetchDocument(worker, source, pdfDataRangeTransport, docId) {
	  if (worker.destroyed) {
	    return Promise.reject(new Error('Worker was destroyed'));
	  }

	  source.disableAutoFetch = getDefaultSetting('disableAutoFetch');
	  source.disableStream = getDefaultSetting('disableStream');
	  source.chunkedViewerLoading = !!pdfDataRangeTransport;
	  if (pdfDataRangeTransport) {
	    source.length = pdfDataRangeTransport.length;
	    source.initialData = pdfDataRangeTransport.initialData;
	  }
	  return worker.messageHandler.sendWithPromise('GetDocRequest', {
	    docId: docId,
	    source: source,
	    disableRange: getDefaultSetting('disableRange'),
	    maxImageSize: getDefaultSetting('maxImageSize'),
	    cMapUrl: getDefaultSetting('cMapUrl'),
	    cMapPacked: getDefaultSetting('cMapPacked'),
	    disableFontFace: getDefaultSetting('disableFontFace'),
	    disableCreateObjectURL: getDefaultSetting('disableCreateObjectURL'),
	    postMessageTransfers: getDefaultSetting('postMessageTransfers') &&
	                          !isPostMessageTransfersDisabled,
	  }).then(function (workerId) {
	    if (worker.destroyed) {
	      throw new Error('Worker was destroyed');
	    }
	    return workerId;
	  });
	}

	/**
	 * PDF document loading operation.
	 * @class
	 * @alias PDFDocumentLoadingTask
	 */
	var PDFDocumentLoadingTask = (function PDFDocumentLoadingTaskClosure() {
	  var nextDocumentId = 0;

	  /** @constructs PDFDocumentLoadingTask */
	  function PDFDocumentLoadingTask() {
	    this._capability = createPromiseCapability();
	    this._transport = null;
	    this._worker = null;

	    /**
	     * Unique document loading task id -- used in MessageHandlers.
	     * @type {string}
	     */
	    this.docId = 'd' + (nextDocumentId++);

	    /**
	     * Shows if loading task is destroyed.
	     * @type {boolean}
	     */
	    this.destroyed = false;

	    /**
	     * Callback to request a password if wrong or no password was provided.
	     * The callback receives two parameters: function that needs to be called
	     * with new password and reason (see {PasswordResponses}).
	     */
	    this.onPassword = null;

	    /**
	     * Callback to be able to monitor the loading progress of the PDF file
	     * (necessary to implement e.g. a loading bar). The callback receives
	     * an {Object} with the properties: {number} loaded and {number} total.
	     */
	    this.onProgress = null;

	    /**
	     * Callback to when unsupported feature is used. The callback receives
	     * an {UNSUPPORTED_FEATURES} argument.
	     */
	    this.onUnsupportedFeature = null;
	  }

	  PDFDocumentLoadingTask.prototype =
	      /** @lends PDFDocumentLoadingTask.prototype */ {
	    /**
	     * @return {Promise}
	     */
	    get promise() {
	      return this._capability.promise;
	    },

	    /**
	     * Aborts all network requests and destroys worker.
	     * @return {Promise} A promise that is resolved after destruction activity
	     *                   is completed.
	     */
	    destroy: function () {
	      this.destroyed = true;

	      var transportDestroyed = !this._transport ? Promise.resolve() :
	        this._transport.destroy();
	      return transportDestroyed.then(function () {
	        this._transport = null;
	        if (this._worker) {
	          this._worker.destroy();
	          this._worker = null;
	        }
	      }.bind(this));
	    },

	    /**
	     * Registers callbacks to indicate the document loading completion.
	     *
	     * @param {function} onFulfilled The callback for the loading completion.
	     * @param {function} onRejected The callback for the loading failure.
	     * @return {Promise} A promise that is resolved after the onFulfilled or
	     *                   onRejected callback.
	     */
	    then: function PDFDocumentLoadingTask_then(onFulfilled, onRejected) {
	      return this.promise.then.apply(this.promise, arguments);
	    }
	  };

	  return PDFDocumentLoadingTask;
	})();

	/**
	 * Abstract class to support range requests file loading.
	 * @class
	 * @alias PDFDataRangeTransport
	 * @param {number} length
	 * @param {Uint8Array} initialData
	 */
	var PDFDataRangeTransport = (function pdfDataRangeTransportClosure() {
	  function PDFDataRangeTransport(length, initialData) {
	    this.length = length;
	    this.initialData = initialData;

	    this._rangeListeners = [];
	    this._progressListeners = [];
	    this._progressiveReadListeners = [];
	    this._readyCapability = createPromiseCapability();
	  }
	  PDFDataRangeTransport.prototype =
	      /** @lends PDFDataRangeTransport.prototype */ {
	    addRangeListener:
	        function PDFDataRangeTransport_addRangeListener(listener) {
	      this._rangeListeners.push(listener);
	    },

	    addProgressListener:
	        function PDFDataRangeTransport_addProgressListener(listener) {
	      this._progressListeners.push(listener);
	    },

	    addProgressiveReadListener:
	        function PDFDataRangeTransport_addProgressiveReadListener(listener) {
	      this._progressiveReadListeners.push(listener);
	    },

	    onDataRange: function PDFDataRangeTransport_onDataRange(begin, chunk) {
	      var listeners = this._rangeListeners;
	      for (var i = 0, n = listeners.length; i < n; ++i) {
	        listeners[i](begin, chunk);
	      }
	    },

	    onDataProgress: function PDFDataRangeTransport_onDataProgress(loaded) {
	      this._readyCapability.promise.then(function () {
	        var listeners = this._progressListeners;
	        for (var i = 0, n = listeners.length; i < n; ++i) {
	          listeners[i](loaded);
	        }
	      }.bind(this));
	    },

	    onDataProgressiveRead:
	        function PDFDataRangeTransport_onDataProgress(chunk) {
	      this._readyCapability.promise.then(function () {
	        var listeners = this._progressiveReadListeners;
	        for (var i = 0, n = listeners.length; i < n; ++i) {
	          listeners[i](chunk);
	        }
	      }.bind(this));
	    },

	    transportReady: function PDFDataRangeTransport_transportReady() {
	      this._readyCapability.resolve();
	    },

	    requestDataRange:
	        function PDFDataRangeTransport_requestDataRange(begin, end) {
	      throw new Error('Abstract method PDFDataRangeTransport.requestDataRange');
	    },

	    abort: function PDFDataRangeTransport_abort() {
	    }
	  };
	  return PDFDataRangeTransport;
	})();

	/**
	 * Proxy to a PDFDocument in the worker thread. Also, contains commonly used
	 * properties that can be read synchronously.
	 * @class
	 * @alias PDFDocumentProxy
	 */
	var PDFDocumentProxy = (function PDFDocumentProxyClosure() {
	  function PDFDocumentProxy(pdfInfo, transport, loadingTask) {
	    this.pdfInfo = pdfInfo;
	    this.transport = transport;
	    this.loadingTask = loadingTask;
	  }
	  PDFDocumentProxy.prototype = /** @lends PDFDocumentProxy.prototype */ {
	    /**
	     * @return {number} Total number of pages the PDF contains.
	     */
	    get numPages() {
	      return this.pdfInfo.numPages;
	    },
	    /**
	     * @return {string} A unique ID to identify a PDF. Not guaranteed to be
	     * unique.
	     */
	    get fingerprint() {
	      return this.pdfInfo.fingerprint;
	    },
	    /**
	     * @param {number} pageNumber The page number to get. The first page is 1.
	     * @return {Promise} A promise that is resolved with a {@link PDFPageProxy}
	     * object.
	     */
	    getPage: function PDFDocumentProxy_getPage(pageNumber) {
	      return this.transport.getPage(pageNumber);
	    },
	    /**
	     * @param {{num: number, gen: number}} ref The page reference. Must have
	     *   the 'num' and 'gen' properties.
	     * @return {Promise} A promise that is resolved with the page index that is
	     * associated with the reference.
	     */
	    getPageIndex: function PDFDocumentProxy_getPageIndex(ref) {
	      return this.transport.getPageIndex(ref);
	    },
	    /**
	     * @return {Promise} A promise that is resolved with a lookup table for
	     * mapping named destinations to reference numbers.
	     *
	     * This can be slow for large documents: use getDestination instead
	     */
	    getDestinations: function PDFDocumentProxy_getDestinations() {
	      return this.transport.getDestinations();
	    },
	    /**
	     * @param {string} id The named destination to get.
	     * @return {Promise} A promise that is resolved with all information
	     * of the given named destination.
	     */
	    getDestination: function PDFDocumentProxy_getDestination(id) {
	      return this.transport.getDestination(id);
	    },
	    /**
	     * @return {Promise} A promise that is resolved with:
	     *   an Array containing the pageLabels that correspond to the pageIndexes,
	     *   or `null` when no pageLabels are present in the PDF file.
	     */
	    getPageLabels: function PDFDocumentProxy_getPageLabels() {
	      return this.transport.getPageLabels();
	    },
	    /**
	     * @return {Promise} A promise that is resolved with a lookup table for
	     * mapping named attachments to their content.
	     */
	    getAttachments: function PDFDocumentProxy_getAttachments() {
	      return this.transport.getAttachments();
	    },
	    /**
	     * @return {Promise} A promise that is resolved with an array of all the
	     * JavaScript strings in the name tree.
	     */
	    getJavaScript: function PDFDocumentProxy_getJavaScript() {
	      return this.transport.getJavaScript();
	    },
	    /**
	     * @return {Promise} A promise that is resolved with an {Array} that is a
	     * tree outline (if it has one) of the PDF. The tree is in the format of:
	     * [
	     *  {
	     *   title: string,
	     *   bold: boolean,
	     *   italic: boolean,
	     *   color: rgb Uint8Array,
	     *   dest: dest obj,
	     *   url: string,
	     *   items: array of more items like this
	     *  },
	     *  ...
	     * ].
	     */
	    getOutline: function PDFDocumentProxy_getOutline() {
	      return this.transport.getOutline();
	    },
	    /**
	     * @return {Promise} A promise that is resolved with an {Object} that has
	     * info and metadata properties.  Info is an {Object} filled with anything
	     * available in the information dictionary and similarly metadata is a
	     * {Metadata} object with information from the metadata section of the PDF.
	     */
	    getMetadata: function PDFDocumentProxy_getMetadata() {
	      return this.transport.getMetadata();
	    },
	    /**
	     * @return {Promise} A promise that is resolved with a TypedArray that has
	     * the raw data from the PDF.
	     */
	    getData: function PDFDocumentProxy_getData() {
	      return this.transport.getData();
	    },
	    /**
	     * @return {Promise} A promise that is resolved when the document's data
	     * is loaded. It is resolved with an {Object} that contains the length
	     * property that indicates size of the PDF data in bytes.
	     */
	    getDownloadInfo: function PDFDocumentProxy_getDownloadInfo() {
	      return this.transport.downloadInfoCapability.promise;
	    },
	    /**
	     * @return {Promise} A promise this is resolved with current stats about
	     * document structures (see {@link PDFDocumentStats}).
	     */
	    getStats: function PDFDocumentProxy_getStats() {
	      return this.transport.getStats();
	    },
	    /**
	     * Cleans up resources allocated by the document, e.g. created @font-face.
	     */
	    cleanup: function PDFDocumentProxy_cleanup() {
	      this.transport.startCleanup();
	    },
	    /**
	     * Destroys current document instance and terminates worker.
	     */
	    destroy: function PDFDocumentProxy_destroy() {
	      return this.loadingTask.destroy();
	    }
	  };
	  return PDFDocumentProxy;
	})();

	/**
	 * Page getTextContent parameters.
	 *
	 * @typedef {Object} getTextContentParameters
	 * @param {boolean} normalizeWhitespace - replaces all occurrences of
	 *   whitespace with standard spaces (0x20). The default value is `false`.
	 */

	/**
	 * Page text content.
	 *
	 * @typedef {Object} TextContent
	 * @property {array} items - array of {@link TextItem}
	 * @property {Object} styles - {@link TextStyles} objects, indexed by font
	 *                    name.
	 */

	/**
	 * Page text content part.
	 *
	 * @typedef {Object} TextItem
	 * @property {string} str - text content.
	 * @property {string} dir - text direction: 'ttb', 'ltr' or 'rtl'.
	 * @property {array} transform - transformation matrix.
	 * @property {number} width - width in device space.
	 * @property {number} height - height in device space.
	 * @property {string} fontName - font name used by pdf.js for converted font.
	 */

	/**
	 * Text style.
	 *
	 * @typedef {Object} TextStyle
	 * @property {number} ascent - font ascent.
	 * @property {number} descent - font descent.
	 * @property {boolean} vertical - text is in vertical mode.
	 * @property {string} fontFamily - possible font family
	 */

	/**
	 * Page annotation parameters.
	 *
	 * @typedef {Object} GetAnnotationsParameters
	 * @param {string} intent - Determines the annotations that will be fetched,
	 *                 can be either 'display' (viewable annotations) or 'print'
	 *                 (printable annotations).
	 *                 If the parameter is omitted, all annotations are fetched.
	 */

	/**
	 * Page render parameters.
	 *
	 * @typedef {Object} RenderParameters
	 * @property {Object} canvasContext - A 2D context of a DOM Canvas object.
	 * @property {PageViewport} viewport - Rendering viewport obtained by
	 *                                calling of PDFPage.getViewport method.
	 * @property {string} intent - Rendering intent, can be 'display' or 'print'
	 *                    (default value is 'display').
	 * @property {Array}  transform - (optional) Additional transform, applied
	 *                    just before viewport transform.
	 * @property {Object} imageLayer - (optional) An object that has beginLayout,
	 *                    endLayout and appendImage functions.
	 * @property {function} continueCallback - (deprecated) A function that will be
	 *                      called each time the rendering is paused.  To continue
	 *                      rendering call the function that is the first argument
	 *                      to the callback.
	 */

	/**
	 * PDF page operator list.
	 *
	 * @typedef {Object} PDFOperatorList
	 * @property {Array} fnArray - Array containing the operator functions.
	 * @property {Array} argsArray - Array containing the arguments of the
	 *                               functions.
	 */

	/**
	 * Proxy to a PDFPage in the worker thread.
	 * @class
	 * @alias PDFPageProxy
	 */
	var PDFPageProxy = (function PDFPageProxyClosure() {
	  function PDFPageProxy(pageIndex, pageInfo, transport) {
	    this.pageIndex = pageIndex;
	    this.pageInfo = pageInfo;
	    this.transport = transport;
	    this.stats = new StatTimer();
	    this.stats.enabled = getDefaultSetting('enableStats');
	    this.commonObjs = transport.commonObjs;
	    this.objs = new PDFObjects();
	    this.cleanupAfterRender = false;
	    this.pendingCleanup = false;
	    this.intentStates = Object.create(null);
	    this.destroyed = false;
	  }
	  PDFPageProxy.prototype = /** @lends PDFPageProxy.prototype */ {
	    /**
	     * @return {number} Page number of the page. First page is 1.
	     */
	    get pageNumber() {
	      return this.pageIndex + 1;
	    },
	    /**
	     * @return {number} The number of degrees the page is rotated clockwise.
	     */
	    get rotate() {
	      return this.pageInfo.rotate;
	    },
	    /**
	     * @return {Object} The reference that points to this page. It has 'num' and
	     * 'gen' properties.
	     */
	    get ref() {
	      return this.pageInfo.ref;
	    },
	    /**
	     * @return {Array} An array of the visible portion of the PDF page in the
	     * user space units - [x1, y1, x2, y2].
	     */
	    get view() {
	      return this.pageInfo.view;
	    },
	    /**
	     * @param {number} scale The desired scale of the viewport.
	     * @param {number} rotate Degrees to rotate the viewport. If omitted this
	     * defaults to the page rotation.
	     * @return {PageViewport} Contains 'width' and 'height' properties
	     * along with transforms required for rendering.
	     */
	    getViewport: function PDFPageProxy_getViewport(scale, rotate) {
	      if (arguments.length < 2) {
	        rotate = this.rotate;
	      }
	      return new PageViewport(this.view, scale, rotate, 0, 0);
	    },
	    /**
	     * @param {GetAnnotationsParameters} params - Annotation parameters.
	     * @return {Promise} A promise that is resolved with an {Array} of the
	     * annotation objects.
	     */
	    getAnnotations: function PDFPageProxy_getAnnotations(params) {
	      var intent = (params && params.intent) || null;

	      if (!this.annotationsPromise || this.annotationsIntent !== intent) {
	        this.annotationsPromise = this.transport.getAnnotations(this.pageIndex,
	                                                                intent);
	        this.annotationsIntent = intent;
	      }
	      return this.annotationsPromise;
	    },
	    /**
	     * Begins the process of rendering a page to the desired context.
	     * @param {RenderParameters} params Page render parameters.
	     * @return {RenderTask} An object that contains the promise, which
	     *                      is resolved when the page finishes rendering.
	     */
	    render: function PDFPageProxy_render(params) {
	      var stats = this.stats;
	      stats.time('Overall');

	      // If there was a pending destroy cancel it so no cleanup happens during
	      // this call to render.
	      this.pendingCleanup = false;

	      var renderingIntent = (params.intent === 'print' ? 'print' : 'display');

	      if (!this.intentStates[renderingIntent]) {
	        this.intentStates[renderingIntent] = Object.create(null);
	      }
	      var intentState = this.intentStates[renderingIntent];

	      // If there's no displayReadyCapability yet, then the operatorList
	      // was never requested before. Make the request and create the promise.
	      if (!intentState.displayReadyCapability) {
	        intentState.receivingOperatorList = true;
	        intentState.displayReadyCapability = createPromiseCapability();
	        intentState.operatorList = {
	          fnArray: [],
	          argsArray: [],
	          lastChunk: false
	        };

	        this.stats.time('Page Request');
	        this.transport.messageHandler.send('RenderPageRequest', {
	          pageIndex: this.pageNumber - 1,
	          intent: renderingIntent
	        });
	      }

	      var internalRenderTask = new InternalRenderTask(complete, params,
	                                                      this.objs,
	                                                      this.commonObjs,
	                                                      intentState.operatorList,
	                                                      this.pageNumber);
	      internalRenderTask.useRequestAnimationFrame = renderingIntent !== 'print';
	      if (!intentState.renderTasks) {
	        intentState.renderTasks = [];
	      }
	      intentState.renderTasks.push(internalRenderTask);
	      var renderTask = internalRenderTask.task;

	      // Obsolete parameter support
	      if (params.continueCallback) {
	        deprecated('render is used with continueCallback parameter');
	        renderTask.onContinue = params.continueCallback;
	      }

	      var self = this;
	      intentState.displayReadyCapability.promise.then(
	        function pageDisplayReadyPromise(transparency) {
	          if (self.pendingCleanup) {
	            complete();
	            return;
	          }
	          stats.time('Rendering');
	          internalRenderTask.initializeGraphics(transparency);
	          internalRenderTask.operatorListChanged();
	        },
	        function pageDisplayReadPromiseError(reason) {
	          complete(reason);
	        }
	      );

	      function complete(error) {
	        var i = intentState.renderTasks.indexOf(internalRenderTask);
	        if (i >= 0) {
	          intentState.renderTasks.splice(i, 1);
	        }

	        if (self.cleanupAfterRender) {
	          self.pendingCleanup = true;
	        }
	        self._tryCleanup();

	        if (error) {
	          internalRenderTask.capability.reject(error);
	        } else {
	          internalRenderTask.capability.resolve();
	        }
	        stats.timeEnd('Rendering');
	        stats.timeEnd('Overall');
	      }

	      return renderTask;
	    },

	    /**
	     * @return {Promise} A promise resolved with an {@link PDFOperatorList}
	     * object that represents page's operator list.
	     */
	    getOperatorList: function PDFPageProxy_getOperatorList() {
	      function operatorListChanged() {
	        if (intentState.operatorList.lastChunk) {
	          intentState.opListReadCapability.resolve(intentState.operatorList);

	          var i = intentState.renderTasks.indexOf(opListTask);
	          if (i >= 0) {
	            intentState.renderTasks.splice(i, 1);
	          }
	        }
	      }

	      var renderingIntent = 'oplist';
	      if (!this.intentStates[renderingIntent]) {
	        this.intentStates[renderingIntent] = Object.create(null);
	      }
	      var intentState = this.intentStates[renderingIntent];
	      var opListTask;

	      if (!intentState.opListReadCapability) {
	        opListTask = {};
	        opListTask.operatorListChanged = operatorListChanged;
	        intentState.receivingOperatorList = true;
	        intentState.opListReadCapability = createPromiseCapability();
	        intentState.renderTasks = [];
	        intentState.renderTasks.push(opListTask);
	        intentState.operatorList = {
	          fnArray: [],
	          argsArray: [],
	          lastChunk: false
	        };

	        this.transport.messageHandler.send('RenderPageRequest', {
	          pageIndex: this.pageIndex,
	          intent: renderingIntent
	        });
	      }
	      return intentState.opListReadCapability.promise;
	    },

	    /**
	     * @param {getTextContentParameters} params - getTextContent parameters.
	     * @return {Promise} That is resolved a {@link TextContent}
	     * object that represent the page text content.
	     */
	    getTextContent: function PDFPageProxy_getTextContent(params) {
	      var normalizeWhitespace = (params && params.normalizeWhitespace) || false;

	      return this.transport.messageHandler.sendWithPromise('GetTextContent', {
	        pageIndex: this.pageNumber - 1,
	        normalizeWhitespace: normalizeWhitespace,
	      });
	    },

	    /**
	     * Destroys page object.
	     */
	    _destroy: function PDFPageProxy_destroy() {
	      this.destroyed = true;
	      this.transport.pageCache[this.pageIndex] = null;

	      var waitOn = [];
	      Object.keys(this.intentStates).forEach(function(intent) {
	        if (intent === 'oplist') {
	          // Avoid errors below, since the renderTasks are just stubs.
	          return;
	        }
	        var intentState = this.intentStates[intent];
	        intentState.renderTasks.forEach(function(renderTask) {
	          var renderCompleted = renderTask.capability.promise.
	            catch(function () {}); // ignoring failures
	          waitOn.push(renderCompleted);
	          renderTask.cancel();
	        });
	      }, this);
	      this.objs.clear();
	      this.annotationsPromise = null;
	      this.pendingCleanup = false;
	      return Promise.all(waitOn);
	    },

	    /**
	     * Cleans up resources allocated by the page. (deprecated)
	     */
	    destroy: function() {
	      deprecated('page destroy method, use cleanup() instead');
	      this.cleanup();
	    },

	    /**
	     * Cleans up resources allocated by the page.
	     */
	    cleanup: function PDFPageProxy_cleanup() {
	      this.pendingCleanup = true;
	      this._tryCleanup();
	    },
	    /**
	     * For internal use only. Attempts to clean up if rendering is in a state
	     * where that's possible.
	     * @ignore
	     */
	    _tryCleanup: function PDFPageProxy_tryCleanup() {
	      if (!this.pendingCleanup ||
	          Object.keys(this.intentStates).some(function(intent) {
	            var intentState = this.intentStates[intent];
	            return (intentState.renderTasks.length !== 0 ||
	                    intentState.receivingOperatorList);
	          }, this)) {
	        return;
	      }

	      Object.keys(this.intentStates).forEach(function(intent) {
	        delete this.intentStates[intent];
	      }, this);
	      this.objs.clear();
	      this.annotationsPromise = null;
	      this.pendingCleanup = false;
	    },
	    /**
	     * For internal use only.
	     * @ignore
	     */
	    _startRenderPage: function PDFPageProxy_startRenderPage(transparency,
	                                                            intent) {
	      var intentState = this.intentStates[intent];
	      // TODO Refactor RenderPageRequest to separate rendering
	      // and operator list logic
	      if (intentState.displayReadyCapability) {
	        intentState.displayReadyCapability.resolve(transparency);
	      }
	    },
	    /**
	     * For internal use only.
	     * @ignore
	     */
	    _renderPageChunk: function PDFPageProxy_renderPageChunk(operatorListChunk,
	                                                            intent) {
	      var intentState = this.intentStates[intent];
	      var i, ii;
	      // Add the new chunk to the current operator list.
	      for (i = 0, ii = operatorListChunk.length; i < ii; i++) {
	        intentState.operatorList.fnArray.push(operatorListChunk.fnArray[i]);
	        intentState.operatorList.argsArray.push(
	          operatorListChunk.argsArray[i]);
	      }
	      intentState.operatorList.lastChunk = operatorListChunk.lastChunk;

	      // Notify all the rendering tasks there are more operators to be consumed.
	      for (i = 0; i < intentState.renderTasks.length; i++) {
	        intentState.renderTasks[i].operatorListChanged();
	      }

	      if (operatorListChunk.lastChunk) {
	        intentState.receivingOperatorList = false;
	        this._tryCleanup();
	      }
	    }
	  };
	  return PDFPageProxy;
	})();

	/**
	 * PDF.js web worker abstraction, it controls instantiation of PDF documents and
	 * WorkerTransport for them.  If creation of a web worker is not possible,
	 * a "fake" worker will be used instead.
	 * @class
	 */
	var PDFWorker = (function PDFWorkerClosure() {
	  var nextFakeWorkerId = 0;

	  function getWorkerSrc() {
	    if (typeof workerSrc !== 'undefined') {
	      return workerSrc;
	    }
	    if (getDefaultSetting('workerSrc')) {
	      return getDefaultSetting('workerSrc');
	    }
	    if (pdfjsFilePath) {
	      return pdfjsFilePath.replace(/\.js$/i, '.worker.js');
	    }
	    error('No PDFJS.workerSrc specified');
	  }

	  var fakeWorkerFilesLoadedCapability;

	  // Loads worker code into main thread.
	  function setupFakeWorkerGlobal() {
	    var WorkerMessageHandler;
	    if (!fakeWorkerFilesLoadedCapability) {
	      fakeWorkerFilesLoadedCapability = createPromiseCapability();
	      // In the developer build load worker_loader which in turn loads all the
	      // other files and resolves the promise. In production only the
	      // pdf.worker.js file is needed.
	      var loader = fakeWorkerFilesLoader || function (callback) {
	        Util.loadScript(getWorkerSrc(), function () {
	          callback(window.pdfjsDistBuildPdfWorker.WorkerMessageHandler);
	        });
	      };
	      loader(fakeWorkerFilesLoadedCapability.resolve);
	    }
	    return fakeWorkerFilesLoadedCapability.promise;
	  }

	  function createCDNWrapper(url) {
	    // We will rely on blob URL's property to specify origin.
	    // We want this function to fail in case if createObjectURL or Blob do not
	    // exist or fail for some reason -- our Worker creation will fail anyway.
	    var wrapper = 'importScripts(\'' + url + '\');';
	    return URL.createObjectURL(new Blob([wrapper]));
	  }

	  function PDFWorker(name) {
	    this.name = name;
	    this.destroyed = false;

	    this._readyCapability = createPromiseCapability();
	    this._port = null;
	    this._webWorker = null;
	    this._messageHandler = null;
	    this._initialize();
	  }

	  PDFWorker.prototype =  /** @lends PDFWorker.prototype */ {
	    get promise() {
	      return this._readyCapability.promise;
	    },

	    get port() {
	      return this._port;
	    },

	    get messageHandler() {
	      return this._messageHandler;
	    },

	    _initialize: function PDFWorker_initialize() {
	      // If worker support isn't disabled explicit and the browser has worker
	      // support, create a new web worker and test if it/the browser fulfills
	      // all requirements to run parts of pdf.js in a web worker.
	      // Right now, the requirement is, that an Uint8Array is still an
	      // Uint8Array as it arrives on the worker. (Chrome added this with v.15.)
	      if (!isWorkerDisabled && !getDefaultSetting('disableWorker') &&
	          typeof Worker !== 'undefined') {
	        var workerSrc = getWorkerSrc();

	        try {
	          // Wraps workerSrc path into blob URL, if the former does not belong
	          // to the same origin.
	          if (!isSameOrigin(window.location.href, workerSrc)) {
	            workerSrc = createCDNWrapper(
	              new URL(workerSrc, window.location).href);
	          }
	          // Some versions of FF can't create a worker on localhost, see:
	          // https://bugzilla.mozilla.org/show_bug.cgi?id=683280
	          var worker = new Worker(workerSrc);
	          var messageHandler = new MessageHandler('main', 'worker', worker);
	          var terminateEarly = function() {
	            worker.removeEventListener('error', onWorkerError);
	            messageHandler.destroy();
	            worker.terminate();
	            if (this.destroyed) {
	              this._readyCapability.reject(new Error('Worker was destroyed'));
	            } else {
	              // Fall back to fake worker if the termination is caused by an
	              // error (e.g. NetworkError / SecurityError).
	              this._setupFakeWorker();
	            }
	          }.bind(this);

	          var onWorkerError = function(event) {
	            if (!this._webWorker) {
	              // Worker failed to initialize due to an error. Clean up and fall
	              // back to the fake worker.
	              terminateEarly();
	            }
	          }.bind(this);
	          worker.addEventListener('error', onWorkerError);

	          messageHandler.on('test', function PDFWorker_test(data) {
	            worker.removeEventListener('error', onWorkerError);
	            if (this.destroyed) {
	              terminateEarly();
	              return; // worker was destroyed
	            }
	            var supportTypedArray = data && data.supportTypedArray;
	            if (supportTypedArray) {
	              this._messageHandler = messageHandler;
	              this._port = worker;
	              this._webWorker = worker;
	              if (!data.supportTransfers) {
	                isPostMessageTransfersDisabled = true;
	              }
	              this._readyCapability.resolve();
	              // Send global setting, e.g. verbosity level.
	              messageHandler.send('configure', {
	                verbosity: getVerbosityLevel()
	              });
	            } else {
	              this._setupFakeWorker();
	              messageHandler.destroy();
	              worker.terminate();
	            }
	          }.bind(this));

	          messageHandler.on('console_log', function (data) {
	            console.log.apply(console, data);
	          });
	          messageHandler.on('console_error', function (data) {
	            console.error.apply(console, data);
	          });

	          messageHandler.on('ready', function (data) {
	            worker.removeEventListener('error', onWorkerError);
	            if (this.destroyed) {
	              terminateEarly();
	              return; // worker was destroyed
	            }
	            try {
	              sendTest();
	            } catch (e)  {
	              // We need fallback to a faked worker.
	              this._setupFakeWorker();
	            }
	          }.bind(this));

	          var sendTest = function () {
	            var postMessageTransfers =
	              getDefaultSetting('postMessageTransfers') &&
	              !isPostMessageTransfersDisabled;
	            var testObj = new Uint8Array([postMessageTransfers ? 255 : 0]);
	            // Some versions of Opera throw a DATA_CLONE_ERR on serializing the
	            // typed array. Also, checking if we can use transfers.
	            try {
	              messageHandler.send('test', testObj, [testObj.buffer]);
	            } catch (ex) {
	              info('Cannot use postMessage transfers');
	              testObj[0] = 0;
	              messageHandler.send('test', testObj);
	            }
	          };

	          // It might take time for worker to initialize (especially when AMD
	          // loader is used). We will try to send test immediately, and then
	          // when 'ready' message will arrive. The worker shall process only
	          // first received 'test'.
	          sendTest();
	          return;
	        } catch (e) {
	          info('The worker has been disabled.');
	        }
	      }
	      // Either workers are disabled, not supported or have thrown an exception.
	      // Thus, we fallback to a faked worker.
	      this._setupFakeWorker();
	    },

	    _setupFakeWorker: function PDFWorker_setupFakeWorker() {
	      if (!isWorkerDisabled && !getDefaultSetting('disableWorker')) {
	        warn('Setting up fake worker.');
	        isWorkerDisabled = true;
	      }

	      setupFakeWorkerGlobal().then(function (WorkerMessageHandler) {
	        if (this.destroyed) {
	          this._readyCapability.reject(new Error('Worker was destroyed'));
	          return;
	        }

	        // If we don't use a worker, just post/sendMessage to the main thread.
	        var port = {
	          _listeners: [],
	          postMessage: function (obj) {
	            var e = {data: obj};
	            this._listeners.forEach(function (listener) {
	              listener.call(this, e);
	            }, this);
	          },
	          addEventListener: function (name, listener) {
	            this._listeners.push(listener);
	          },
	          removeEventListener: function (name, listener) {
	            var i = this._listeners.indexOf(listener);
	            this._listeners.splice(i, 1);
	          },
	          terminate: function () {}
	        };
	        this._port = port;

	        // All fake workers use the same port, making id unique.
	        var id = 'fake' + (nextFakeWorkerId++);

	        // If the main thread is our worker, setup the handling for the
	        // messages -- the main thread sends to it self.
	        var workerHandler = new MessageHandler(id + '_worker', id, port);
	        WorkerMessageHandler.setup(workerHandler, port);

	        var messageHandler = new MessageHandler(id, id + '_worker', port);
	        this._messageHandler = messageHandler;
	        this._readyCapability.resolve();
	      }.bind(this));
	    },

	    /**
	     * Destroys the worker instance.
	     */
	    destroy: function PDFWorker_destroy() {
	      this.destroyed = true;
	      if (this._webWorker) {
	        // We need to terminate only web worker created resource.
	        this._webWorker.terminate();
	        this._webWorker = null;
	      }
	      this._port = null;
	      if (this._messageHandler) {
	        this._messageHandler.destroy();
	        this._messageHandler = null;
	      }
	    }
	  };

	  return PDFWorker;
	})();

	/**
	 * For internal use only.
	 * @ignore
	 */
	var WorkerTransport = (function WorkerTransportClosure() {
	  function WorkerTransport(messageHandler, loadingTask, pdfDataRangeTransport) {
	    this.messageHandler = messageHandler;
	    this.loadingTask = loadingTask;
	    this.pdfDataRangeTransport = pdfDataRangeTransport;
	    this.commonObjs = new PDFObjects();
	    this.fontLoader = new FontLoader(loadingTask.docId);

	    this.destroyed = false;
	    this.destroyCapability = null;

	    this.pageCache = [];
	    this.pagePromises = [];
	    this.downloadInfoCapability = createPromiseCapability();

	    this.setupMessageHandler();
	  }
	  WorkerTransport.prototype = {
	    destroy: function WorkerTransport_destroy() {
	      if (this.destroyCapability) {
	        return this.destroyCapability.promise;
	      }

	      this.destroyed = true;
	      this.destroyCapability = createPromiseCapability();

	      var waitOn = [];
	      // We need to wait for all renderings to be completed, e.g.
	      // timeout/rAF can take a long time.
	      this.pageCache.forEach(function (page) {
	        if (page) {
	          waitOn.push(page._destroy());
	        }
	      });
	      this.pageCache = [];
	      this.pagePromises = [];
	      var self = this;
	      // We also need to wait for the worker to finish its long running tasks.
	      var terminated = this.messageHandler.sendWithPromise('Terminate', null);
	      waitOn.push(terminated);
	      Promise.all(waitOn).then(function () {
	        self.fontLoader.clear();
	        if (self.pdfDataRangeTransport) {
	          self.pdfDataRangeTransport.abort();
	          self.pdfDataRangeTransport = null;
	        }
	        if (self.messageHandler) {
	          self.messageHandler.destroy();
	          self.messageHandler = null;
	        }
	        self.destroyCapability.resolve();
	      }, this.destroyCapability.reject);
	      return this.destroyCapability.promise;
	    },

	    setupMessageHandler:
	      function WorkerTransport_setupMessageHandler() {
	      var messageHandler = this.messageHandler;

	      function updatePassword(password) {
	        messageHandler.send('UpdatePassword', password);
	      }

	      var pdfDataRangeTransport = this.pdfDataRangeTransport;
	      if (pdfDataRangeTransport) {
	        pdfDataRangeTransport.addRangeListener(function(begin, chunk) {
	          messageHandler.send('OnDataRange', {
	            begin: begin,
	            chunk: chunk
	          });
	        });

	        pdfDataRangeTransport.addProgressListener(function(loaded) {
	          messageHandler.send('OnDataProgress', {
	            loaded: loaded
	          });
	        });

	        pdfDataRangeTransport.addProgressiveReadListener(function(chunk) {
	          messageHandler.send('OnDataRange', {
	            chunk: chunk
	          });
	        });

	        messageHandler.on('RequestDataRange',
	          function transportDataRange(data) {
	            pdfDataRangeTransport.requestDataRange(data.begin, data.end);
	          }, this);
	      }

	      messageHandler.on('GetDoc', function transportDoc(data) {
	        var pdfInfo = data.pdfInfo;
	        this.numPages = data.pdfInfo.numPages;
	        var loadingTask = this.loadingTask;
	        var pdfDocument = new PDFDocumentProxy(pdfInfo, this, loadingTask);
	        this.pdfDocument = pdfDocument;
	        loadingTask._capability.resolve(pdfDocument);
	      }, this);

	      messageHandler.on('NeedPassword',
	                        function transportNeedPassword(exception) {
	        var loadingTask = this.loadingTask;
	        if (loadingTask.onPassword) {
	          return loadingTask.onPassword(updatePassword,
	                                        PasswordResponses.NEED_PASSWORD);
	        }
	        loadingTask._capability.reject(
	          new PasswordException(exception.message, exception.code));
	      }, this);

	      messageHandler.on('IncorrectPassword',
	                        function transportIncorrectPassword(exception) {
	        var loadingTask = this.loadingTask;
	        if (loadingTask.onPassword) {
	          return loadingTask.onPassword(updatePassword,
	                                        PasswordResponses.INCORRECT_PASSWORD);
	        }
	        loadingTask._capability.reject(
	          new PasswordException(exception.message, exception.code));
	      }, this);

	      messageHandler.on('InvalidPDF', function transportInvalidPDF(exception) {
	        this.loadingTask._capability.reject(
	          new InvalidPDFException(exception.message));
	      }, this);

	      messageHandler.on('MissingPDF', function transportMissingPDF(exception) {
	        this.loadingTask._capability.reject(
	          new MissingPDFException(exception.message));
	      }, this);

	      messageHandler.on('UnexpectedResponse',
	                        function transportUnexpectedResponse(exception) {
	        this.loadingTask._capability.reject(
	          new UnexpectedResponseException(exception.message, exception.status));
	      }, this);

	      messageHandler.on('UnknownError',
	                        function transportUnknownError(exception) {
	        this.loadingTask._capability.reject(
	          new UnknownErrorException(exception.message, exception.details));
	      }, this);

	      messageHandler.on('DataLoaded', function transportPage(data) {
	        this.downloadInfoCapability.resolve(data);
	      }, this);

	      messageHandler.on('PDFManagerReady', function transportPage(data) {
	        if (this.pdfDataRangeTransport) {
	          this.pdfDataRangeTransport.transportReady();
	        }
	      }, this);

	      messageHandler.on('StartRenderPage', function transportRender(data) {
	        if (this.destroyed) {
	          return; // Ignore any pending requests if the worker was terminated.
	        }
	        var page = this.pageCache[data.pageIndex];

	        page.stats.timeEnd('Page Request');
	        page._startRenderPage(data.transparency, data.intent);
	      }, this);

	      messageHandler.on('RenderPageChunk', function transportRender(data) {
	        if (this.destroyed) {
	          return; // Ignore any pending requests if the worker was terminated.
	        }
	        var page = this.pageCache[data.pageIndex];

	        page._renderPageChunk(data.operatorList, data.intent);
	      }, this);

	      messageHandler.on('commonobj', function transportObj(data) {
	        if (this.destroyed) {
	          return; // Ignore any pending requests if the worker was terminated.
	        }

	        var id = data[0];
	        var type = data[1];
	        if (this.commonObjs.hasData(id)) {
	          return;
	        }

	        switch (type) {
	          case 'Font':
	            var exportedData = data[2];

	            if ('error' in exportedData) {
	              var exportedError = exportedData.error;
	              warn('Error during font loading: ' + exportedError);
	              this.commonObjs.resolve(id, exportedError);
	              break;
	            }
	            var fontRegistry = null;
	            if (getDefaultSetting('pdfBug') && globalScope.FontInspector &&
	                globalScope['FontInspector'].enabled) {
	              fontRegistry = {
	                registerFont: function (font, url) {
	                  globalScope['FontInspector'].fontAdded(font, url);
	                }
	              };
	            }
	            var font = new FontFaceObject(exportedData, {
	              isEvalSuported: getDefaultSetting('isEvalSupported'),
	              disableFontFace: getDefaultSetting('disableFontFace'),
	              fontRegistry: fontRegistry
	            });

	            this.fontLoader.bind(
	              [font],
	              function fontReady(fontObjs) {
	                this.commonObjs.resolve(id, font);
	              }.bind(this)
	            );
	            break;
	          case 'FontPath':
	            this.commonObjs.resolve(id, data[2]);
	            break;
	          default:
	            error('Got unknown common object type ' + type);
	        }
	      }, this);

	      messageHandler.on('obj', function transportObj(data) {
	        if (this.destroyed) {
	          return; // Ignore any pending requests if the worker was terminated.
	        }

	        var id = data[0];
	        var pageIndex = data[1];
	        var type = data[2];
	        var pageProxy = this.pageCache[pageIndex];
	        var imageData;
	        if (pageProxy.objs.hasData(id)) {
	          return;
	        }

	        switch (type) {
	          case 'JpegStream':
	            imageData = data[3];
	            loadJpegStream(id, imageData, pageProxy.objs);
	            break;
	          case 'Image':
	            imageData = data[3];
	            pageProxy.objs.resolve(id, imageData);

	            // heuristics that will allow not to store large data
	            var MAX_IMAGE_SIZE_TO_STORE = 8000000;
	            if (imageData && 'data' in imageData &&
	                imageData.data.length > MAX_IMAGE_SIZE_TO_STORE) {
	              pageProxy.cleanupAfterRender = true;
	            }
	            break;
	          default:
	            error('Got unknown object type ' + type);
	        }
	      }, this);

	      messageHandler.on('DocProgress', function transportDocProgress(data) {
	        if (this.destroyed) {
	          return; // Ignore any pending requests if the worker was terminated.
	        }

	        var loadingTask = this.loadingTask;
	        if (loadingTask.onProgress) {
	          loadingTask.onProgress({
	            loaded: data.loaded,
	            total: data.total
	          });
	        }
	      }, this);

	      messageHandler.on('PageError', function transportError(data) {
	        if (this.destroyed) {
	          return; // Ignore any pending requests if the worker was terminated.
	        }

	        var page = this.pageCache[data.pageNum - 1];
	        var intentState = page.intentStates[data.intent];

	        if (intentState.displayReadyCapability) {
	          intentState.displayReadyCapability.reject(data.error);
	        } else {
	          error(data.error);
	        }

	        if (intentState.operatorList) {
	          // Mark operator list as complete.
	          intentState.operatorList.lastChunk = true;
	          for (var i = 0; i < intentState.renderTasks.length; i++) {
	            intentState.renderTasks[i].operatorListChanged();
	          }
	        }
	      }, this);

	      messageHandler.on('UnsupportedFeature',
	          function transportUnsupportedFeature(data) {
	        if (this.destroyed) {
	          return; // Ignore any pending requests if the worker was terminated.
	        }
	        var featureId = data.featureId;
	        var loadingTask = this.loadingTask;
	        if (loadingTask.onUnsupportedFeature) {
	          loadingTask.onUnsupportedFeature(featureId);
	        }
	        _UnsupportedManager.notify(featureId);
	      }, this);

	      messageHandler.on('JpegDecode', function(data) {
	        if (this.destroyed) {
	          return Promise.reject('Worker was terminated');
	        }

	        var imageUrl = data[0];
	        var components = data[1];
	        if (components !== 3 && components !== 1) {
	          return Promise.reject(
	            new Error('Only 3 components or 1 component can be returned'));
	        }

	        return new Promise(function (resolve, reject) {
	          var img = new Image();
	          img.onload = function () {
	            var width = img.width;
	            var height = img.height;
	            var size = width * height;
	            var rgbaLength = size * 4;
	            var buf = new Uint8Array(size * components);
	            var tmpCanvas = createScratchCanvas(width, height);
	            var tmpCtx = tmpCanvas.getContext('2d');
	            tmpCtx.drawImage(img, 0, 0);
	            var data = tmpCtx.getImageData(0, 0, width, height).data;
	            var i, j;

	            if (components === 3) {
	              for (i = 0, j = 0; i < rgbaLength; i += 4, j += 3) {
	                buf[j] = data[i];
	                buf[j + 1] = data[i + 1];
	                buf[j + 2] = data[i + 2];
	              }
	            } else if (components === 1) {
	              for (i = 0, j = 0; i < rgbaLength; i += 4, j++) {
	                buf[j] = data[i];
	              }
	            }
	            resolve({ data: buf, width: width, height: height});
	          };
	          img.onerror = function () {
	            reject(new Error('JpegDecode failed to load image'));
	          };
	          img.src = imageUrl;
	        });
	      }, this);
	    },

	    getData: function WorkerTransport_getData() {
	      return this.messageHandler.sendWithPromise('GetData', null);
	    },

	    getPage: function WorkerTransport_getPage(pageNumber, capability) {
	      if (pageNumber <= 0 || pageNumber > this.numPages ||
	          (pageNumber|0) !== pageNumber) {
	        return Promise.reject(new Error('Invalid page request'));
	      }

	      var pageIndex = pageNumber - 1;
	      if (pageIndex in this.pagePromises) {
	        return this.pagePromises[pageIndex];
	      }
	      var promise = this.messageHandler.sendWithPromise('GetPage', {
	        pageIndex: pageIndex
	      }).then(function (pageInfo) {
	        if (this.destroyed) {
	          throw new Error('Transport destroyed');
	        }
	        var page = new PDFPageProxy(pageIndex, pageInfo, this);
	        this.pageCache[pageIndex] = page;
	        return page;
	      }.bind(this));
	      this.pagePromises[pageIndex] = promise;
	      return promise;
	    },

	    getPageIndex: function WorkerTransport_getPageIndexByRef(ref) {
	      return this.messageHandler.sendWithPromise('GetPageIndex', { ref: ref }).
	        then(function (pageIndex) {
	          return pageIndex;
	        }, function (reason) {
	          return Promise.reject(new Error(reason));
	        });
	    },

	    getAnnotations: function WorkerTransport_getAnnotations(pageIndex, intent) {
	      return this.messageHandler.sendWithPromise('GetAnnotations', {
	        pageIndex: pageIndex,
	        intent: intent,
	      });
	    },

	    getDestinations: function WorkerTransport_getDestinations() {
	      return this.messageHandler.sendWithPromise('GetDestinations', null);
	    },

	    getDestination: function WorkerTransport_getDestination(id) {
	      return this.messageHandler.sendWithPromise('GetDestination', { id: id });
	    },

	    getPageLabels: function WorkerTransport_getPageLabels() {
	      return this.messageHandler.sendWithPromise('GetPageLabels', null);
	    },

	    getAttachments: function WorkerTransport_getAttachments() {
	      return this.messageHandler.sendWithPromise('GetAttachments', null);
	    },

	    getJavaScript: function WorkerTransport_getJavaScript() {
	      return this.messageHandler.sendWithPromise('GetJavaScript', null);
	    },

	    getOutline: function WorkerTransport_getOutline() {
	      return this.messageHandler.sendWithPromise('GetOutline', null);
	    },

	    getMetadata: function WorkerTransport_getMetadata() {
	      return this.messageHandler.sendWithPromise('GetMetadata', null).
	        then(function transportMetadata(results) {
	        return {
	          info: results[0],
	          metadata: (results[1] ? new Metadata(results[1]) : null)
	        };
	      });
	    },

	    getStats: function WorkerTransport_getStats() {
	      return this.messageHandler.sendWithPromise('GetStats', null);
	    },

	    startCleanup: function WorkerTransport_startCleanup() {
	      this.messageHandler.sendWithPromise('Cleanup', null).
	        then(function endCleanup() {
	        for (var i = 0, ii = this.pageCache.length; i < ii; i++) {
	          var page = this.pageCache[i];
	          if (page) {
	            page.cleanup();
	          }
	        }
	        this.commonObjs.clear();
	        this.fontLoader.clear();
	      }.bind(this));
	    }
	  };
	  return WorkerTransport;

	})();

	/**
	 * A PDF document and page is built of many objects. E.g. there are objects
	 * for fonts, images, rendering code and such. These objects might get processed
	 * inside of a worker. The `PDFObjects` implements some basic functions to
	 * manage these objects.
	 * @ignore
	 */
	var PDFObjects = (function PDFObjectsClosure() {
	  function PDFObjects() {
	    this.objs = Object.create(null);
	  }

	  PDFObjects.prototype = {
	    /**
	     * Internal function.
	     * Ensures there is an object defined for `objId`.
	     */
	    ensureObj: function PDFObjects_ensureObj(objId) {
	      if (this.objs[objId]) {
	        return this.objs[objId];
	      }

	      var obj = {
	        capability: createPromiseCapability(),
	        data: null,
	        resolved: false
	      };
	      this.objs[objId] = obj;

	      return obj;
	    },

	    /**
	     * If called *without* callback, this returns the data of `objId` but the
	     * object needs to be resolved. If it isn't, this function throws.
	     *
	     * If called *with* a callback, the callback is called with the data of the
	     * object once the object is resolved. That means, if you call this
	     * function and the object is already resolved, the callback gets called
	     * right away.
	     */
	    get: function PDFObjects_get(objId, callback) {
	      // If there is a callback, then the get can be async and the object is
	      // not required to be resolved right now
	      if (callback) {
	        this.ensureObj(objId).capability.promise.then(callback);
	        return null;
	      }

	      // If there isn't a callback, the user expects to get the resolved data
	      // directly.
	      var obj = this.objs[objId];

	      // If there isn't an object yet or the object isn't resolved, then the
	      // data isn't ready yet!
	      if (!obj || !obj.resolved) {
	        error('Requesting object that isn\'t resolved yet ' + objId);
	      }

	      return obj.data;
	    },

	    /**
	     * Resolves the object `objId` with optional `data`.
	     */
	    resolve: function PDFObjects_resolve(objId, data) {
	      var obj = this.ensureObj(objId);

	      obj.resolved = true;
	      obj.data = data;
	      obj.capability.resolve(data);
	    },

	    isResolved: function PDFObjects_isResolved(objId) {
	      var objs = this.objs;

	      if (!objs[objId]) {
	        return false;
	      } else {
	        return objs[objId].resolved;
	      }
	    },

	    hasData: function PDFObjects_hasData(objId) {
	      return this.isResolved(objId);
	    },

	    /**
	     * Returns the data of `objId` if object exists, null otherwise.
	     */
	    getData: function PDFObjects_getData(objId) {
	      var objs = this.objs;
	      if (!objs[objId] || !objs[objId].resolved) {
	        return null;
	      } else {
	        return objs[objId].data;
	      }
	    },

	    clear: function PDFObjects_clear() {
	      this.objs = Object.create(null);
	    }
	  };
	  return PDFObjects;
	})();

	/**
	 * Allows controlling of the rendering tasks.
	 * @class
	 * @alias RenderTask
	 */
	var RenderTask = (function RenderTaskClosure() {
	  function RenderTask(internalRenderTask) {
	    this._internalRenderTask = internalRenderTask;

	    /**
	     * Callback for incremental rendering -- a function that will be called
	     * each time the rendering is paused.  To continue rendering call the
	     * function that is the first argument to the callback.
	     * @type {function}
	     */
	    this.onContinue = null;
	  }

	  RenderTask.prototype = /** @lends RenderTask.prototype */ {
	    /**
	     * Promise for rendering task completion.
	     * @return {Promise}
	     */
	    get promise() {
	      return this._internalRenderTask.capability.promise;
	    },

	    /**
	     * Cancels the rendering task. If the task is currently rendering it will
	     * not be cancelled until graphics pauses with a timeout. The promise that
	     * this object extends will resolved when cancelled.
	     */
	    cancel: function RenderTask_cancel() {
	      this._internalRenderTask.cancel();
	    },

	    /**
	     * Registers callbacks to indicate the rendering task completion.
	     *
	     * @param {function} onFulfilled The callback for the rendering completion.
	     * @param {function} onRejected The callback for the rendering failure.
	     * @return {Promise} A promise that is resolved after the onFulfilled or
	     *                   onRejected callback.
	     */
	    then: function RenderTask_then(onFulfilled, onRejected) {
	      return this.promise.then.apply(this.promise, arguments);
	    }
	  };

	  return RenderTask;
	})();

	/**
	 * For internal use only.
	 * @ignore
	 */
	var InternalRenderTask = (function InternalRenderTaskClosure() {

	  function InternalRenderTask(callback, params, objs, commonObjs, operatorList,
	                              pageNumber) {
	    this.callback = callback;
	    this.params = params;
	    this.objs = objs;
	    this.commonObjs = commonObjs;
	    this.operatorListIdx = null;
	    this.operatorList = operatorList;
	    this.pageNumber = pageNumber;
	    this.running = false;
	    this.graphicsReadyCallback = null;
	    this.graphicsReady = false;
	    this.useRequestAnimationFrame = false;
	    this.cancelled = false;
	    this.capability = createPromiseCapability();
	    this.task = new RenderTask(this);
	    // caching this-bound methods
	    this._continueBound = this._continue.bind(this);
	    this._scheduleNextBound = this._scheduleNext.bind(this);
	    this._nextBound = this._next.bind(this);
	  }

	  InternalRenderTask.prototype = {

	    initializeGraphics:
	        function InternalRenderTask_initializeGraphics(transparency) {

	      if (this.cancelled) {
	        return;
	      }
	      if (getDefaultSetting('pdfBug') && globalScope.StepperManager &&
	          globalScope.StepperManager.enabled) {
	        this.stepper = globalScope.StepperManager.create(this.pageNumber - 1);
	        this.stepper.init(this.operatorList);
	        this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint();
	      }

	      var params = this.params;
	      this.gfx = new CanvasGraphics(params.canvasContext, this.commonObjs,
	                                    this.objs, params.imageLayer);

	      this.gfx.beginDrawing(params.transform, params.viewport, transparency);
	      this.operatorListIdx = 0;
	      this.graphicsReady = true;
	      if (this.graphicsReadyCallback) {
	        this.graphicsReadyCallback();
	      }
	    },

	    cancel: function InternalRenderTask_cancel() {
	      this.running = false;
	      this.cancelled = true;
	      this.callback('cancelled');
	    },

	    operatorListChanged: function InternalRenderTask_operatorListChanged() {
	      if (!this.graphicsReady) {
	        if (!this.graphicsReadyCallback) {
	          this.graphicsReadyCallback = this._continueBound;
	        }
	        return;
	      }

	      if (this.stepper) {
	        this.stepper.updateOperatorList(this.operatorList);
	      }

	      if (this.running) {
	        return;
	      }
	      this._continue();
	    },

	    _continue: function InternalRenderTask__continue() {
	      this.running = true;
	      if (this.cancelled) {
	        return;
	      }
	      if (this.task.onContinue) {
	        this.task.onContinue.call(this.task, this._scheduleNextBound);
	      } else {
	        this._scheduleNext();
	      }
	    },

	    _scheduleNext: function InternalRenderTask__scheduleNext() {
	      if (this.useRequestAnimationFrame && typeof window !== 'undefined') {
	        window.requestAnimationFrame(this._nextBound);
	      } else {
	        Promise.resolve(undefined).then(this._nextBound);
	      }
	    },

	    _next: function InternalRenderTask__next() {
	      if (this.cancelled) {
	        return;
	      }
	      this.operatorListIdx = this.gfx.executeOperatorList(this.operatorList,
	                                        this.operatorListIdx,
	                                        this._continueBound,
	                                        this.stepper);
	      if (this.operatorListIdx === this.operatorList.argsArray.length) {
	        this.running = false;
	        if (this.operatorList.lastChunk) {
	          this.gfx.endDrawing();
	          this.callback();
	        }
	      }
	    }

	  };

	  return InternalRenderTask;
	})();

	/**
	 * (Deprecated) Global observer of unsupported feature usages. Use
	 * onUnsupportedFeature callback of the {PDFDocumentLoadingTask} instance.
	 */
	var _UnsupportedManager = (function UnsupportedManagerClosure() {
	  var listeners = [];
	  return {
	    listen: function (cb) {
	      deprecated('Global UnsupportedManager.listen is used: ' +
	                 ' use PDFDocumentLoadingTask.onUnsupportedFeature instead');
	      listeners.push(cb);
	    },
	    notify: function (featureId) {
	      for (var i = 0, ii = listeners.length; i < ii; i++) {
	        listeners[i](featureId);
	      }
	    }
	  };
	})();

	if (typeof pdfjsVersion !== 'undefined') {
	  exports.version = pdfjsVersion;
	}
	if (typeof pdfjsBuild !== 'undefined') {
	  exports.build = pdfjsBuild;
	}

	exports.getDocument = getDocument;
	exports.PDFDataRangeTransport = PDFDataRangeTransport;
	exports.PDFWorker = PDFWorker;
	exports.PDFDocumentProxy = PDFDocumentProxy;
	exports.PDFPageProxy = PDFPageProxy;
	exports._UnsupportedManager = _UnsupportedManager;
	}));


	(function (root, factory) {
	  {
	    factory((root.pdfjsDisplayGlobal = {}), root.pdfjsSharedUtil,
	      root.pdfjsDisplayDOMUtils, root.pdfjsDisplayAPI,
	      root.pdfjsDisplayAnnotationLayer, root.pdfjsDisplayTextLayer,
	      root.pdfjsDisplayMetadata, root.pdfjsDisplaySVG);
	  }
	}(this, function (exports, sharedUtil, displayDOMUtils, displayAPI,
	                  displayAnnotationLayer, displayTextLayer, displayMetadata,
	                  displaySVG) {

	  var globalScope = sharedUtil.globalScope;
	  var deprecated = sharedUtil.deprecated;
	  var warn = sharedUtil.warn;
	  var LinkTarget = displayDOMUtils.LinkTarget;

	  var isWorker = (typeof window === 'undefined');

	  // The global PDFJS object is now deprecated and will not be supported in
	  // the future. The members below are maintained for backward  compatibility
	  // and shall not be extended or modified. If the global.js is included as
	  // a module, we will create a global PDFJS object instance or use existing.
	  if (!globalScope.PDFJS) {
	    globalScope.PDFJS = {};
	  }
	  var PDFJS = globalScope.PDFJS;

	  if (typeof pdfjsVersion !== 'undefined') {
	    PDFJS.version = pdfjsVersion;
	  }
	  if (typeof pdfjsBuild !== 'undefined') {
	    PDFJS.build = pdfjsBuild;
	  }

	  PDFJS.pdfBug = false;

	  if (PDFJS.verbosity !== undefined) {
	    sharedUtil.setVerbosityLevel(PDFJS.verbosity);
	  }
	  delete PDFJS.verbosity;
	  Object.defineProperty(PDFJS, 'verbosity', {
	    get: function () { return sharedUtil.getVerbosityLevel(); },
	    set: function (level) { sharedUtil.setVerbosityLevel(level); },
	    enumerable: true,
	    configurable: true
	  });

	  PDFJS.VERBOSITY_LEVELS = sharedUtil.VERBOSITY_LEVELS;
	  PDFJS.OPS = sharedUtil.OPS;
	  PDFJS.UNSUPPORTED_FEATURES = sharedUtil.UNSUPPORTED_FEATURES;
	  PDFJS.isValidUrl = sharedUtil.isValidUrl;
	  PDFJS.shadow = sharedUtil.shadow;
	  PDFJS.createBlob = sharedUtil.createBlob;
	  PDFJS.createObjectURL = function PDFJS_createObjectURL(data, contentType) {
	    return sharedUtil.createObjectURL(data, contentType,
	                                      PDFJS.disableCreateObjectURL);
	  };
	  Object.defineProperty(PDFJS, 'isLittleEndian', {
	    configurable: true,
	    get: function PDFJS_isLittleEndian() {
	      var value = sharedUtil.isLittleEndian();
	      return sharedUtil.shadow(PDFJS, 'isLittleEndian', value);
	    }
	  });
	  PDFJS.removeNullCharacters = sharedUtil.removeNullCharacters;
	  PDFJS.PasswordResponses = sharedUtil.PasswordResponses;
	  PDFJS.PasswordException = sharedUtil.PasswordException;
	  PDFJS.UnknownErrorException = sharedUtil.UnknownErrorException;
	  PDFJS.InvalidPDFException = sharedUtil.InvalidPDFException;
	  PDFJS.MissingPDFException = sharedUtil.MissingPDFException;
	  PDFJS.UnexpectedResponseException = sharedUtil.UnexpectedResponseException;
	  PDFJS.Util = sharedUtil.Util;
	  PDFJS.PageViewport = sharedUtil.PageViewport;
	  PDFJS.createPromiseCapability = sharedUtil.createPromiseCapability;

	  /**
	   * The maximum allowed image size in total pixels e.g. width * height. Images
	   * above this value will not be drawn. Use -1 for no limit.
	   * @var {number}
	   */
	  PDFJS.maxImageSize = (PDFJS.maxImageSize === undefined ?
	                        -1 : PDFJS.maxImageSize);

	  /**
	   * The url of where the predefined Adobe CMaps are located. Include trailing
	   * slash.
	   * @var {string}
	   */
	  PDFJS.cMapUrl = (PDFJS.cMapUrl === undefined ? null : PDFJS.cMapUrl);

	  /**
	   * Specifies if CMaps are binary packed.
	   * @var {boolean}
	   */
	  PDFJS.cMapPacked = PDFJS.cMapPacked === undefined ? false : PDFJS.cMapPacked;

	  /**
	   * By default fonts are converted to OpenType fonts and loaded via font face
	   * rules. If disabled, the font will be rendered using a built in font
	   * renderer that constructs the glyphs with primitive path commands.
	   * @var {boolean}
	   */
	  PDFJS.disableFontFace = (PDFJS.disableFontFace === undefined ?
	                           false : PDFJS.disableFontFace);

	  /**
	   * Path for image resources, mainly for annotation icons. Include trailing
	   * slash.
	   * @var {string}
	   */
	  PDFJS.imageResourcesPath = (PDFJS.imageResourcesPath === undefined ?
	                              '' : PDFJS.imageResourcesPath);

	  /**
	   * Disable the web worker and run all code on the main thread. This will
	   * happen automatically if the browser doesn't support workers or sending
	   * typed arrays to workers.
	   * @var {boolean}
	   */
	  PDFJS.disableWorker = (PDFJS.disableWorker === undefined ?
	                         false : PDFJS.disableWorker);

	  /**
	   * Path and filename of the worker file. Required when the worker is enabled
	   * in development mode. If unspecified in the production build, the worker
	   * will be loaded based on the location of the pdf.js file. It is recommended
	   * that the workerSrc is set in a custom application to prevent issues caused
	   * by third-party frameworks and libraries.
	   * @var {string}
	   */
	  PDFJS.workerSrc = (PDFJS.workerSrc === undefined ? null : PDFJS.workerSrc);

	  /**
	   * Disable range request loading of PDF files. When enabled and if the server
	   * supports partial content requests then the PDF will be fetched in chunks.
	   * Enabled (false) by default.
	   * @var {boolean}
	   */
	  PDFJS.disableRange = (PDFJS.disableRange === undefined ?
	                        false : PDFJS.disableRange);

	  /**
	   * Disable streaming of PDF file data. By default PDF.js attempts to load PDF
	   * in chunks. This default behavior can be disabled.
	   * @var {boolean}
	   */
	  PDFJS.disableStream = (PDFJS.disableStream === undefined ?
	                         false : PDFJS.disableStream);

	  /**
	   * Disable pre-fetching of PDF file data. When range requests are enabled
	   * PDF.js will automatically keep fetching more data even if it isn't needed
	   * to display the current page. This default behavior can be disabled.
	   *
	   * NOTE: It is also necessary to disable streaming, see above,
	   *       in order for disabling of pre-fetching to work correctly.
	   * @var {boolean}
	   */
	  PDFJS.disableAutoFetch = (PDFJS.disableAutoFetch === undefined ?
	                            false : PDFJS.disableAutoFetch);

	  /**
	   * Enables special hooks for debugging PDF.js.
	   * @var {boolean}
	   */
	  PDFJS.pdfBug = (PDFJS.pdfBug === undefined ? false : PDFJS.pdfBug);

	  /**
	   * Enables transfer usage in postMessage for ArrayBuffers.
	   * @var {boolean}
	   */
	  PDFJS.postMessageTransfers = (PDFJS.postMessageTransfers === undefined ?
	                                true : PDFJS.postMessageTransfers);

	  /**
	   * Disables URL.createObjectURL usage.
	   * @var {boolean}
	   */
	  PDFJS.disableCreateObjectURL = (PDFJS.disableCreateObjectURL === undefined ?
	                                  false : PDFJS.disableCreateObjectURL);

	  /**
	   * Disables WebGL usage.
	   * @var {boolean}
	   */
	  PDFJS.disableWebGL = (PDFJS.disableWebGL === undefined ?
	                        true : PDFJS.disableWebGL);

	  /**
	   * Specifies the |target| attribute for external links.
	   * The constants from PDFJS.LinkTarget should be used:
	   *  - NONE [default]
	   *  - SELF
	   *  - BLANK
	   *  - PARENT
	   *  - TOP
	   * @var {number}
	   */
	  PDFJS.externalLinkTarget = (PDFJS.externalLinkTarget === undefined ?
	                              LinkTarget.NONE : PDFJS.externalLinkTarget);

	  /**
	   * Specifies the |rel| attribute for external links. Defaults to stripping
	   * the referrer.
	   * @var {string}
	   */
	  PDFJS.externalLinkRel = (PDFJS.externalLinkRel === undefined ?
	                           'noreferrer' : PDFJS.externalLinkRel);

	  /**
	    * Determines if we can eval strings as JS. Primarily used to improve
	    * performance for font rendering.
	    * @var {boolean}
	    */
	  PDFJS.isEvalSupported = (PDFJS.isEvalSupported === undefined ?
	                           true : PDFJS.isEvalSupported);

	  var savedOpenExternalLinksInNewWindow = PDFJS.openExternalLinksInNewWindow;
	  delete PDFJS.openExternalLinksInNewWindow;
	  Object.defineProperty(PDFJS, 'openExternalLinksInNewWindow', {
	    get: function () {
	      return PDFJS.externalLinkTarget === LinkTarget.BLANK;
	    },
	    set: function (value) {
	      if (value) {
	        deprecated('PDFJS.openExternalLinksInNewWindow, please use ' +
	          '"PDFJS.externalLinkTarget = PDFJS.LinkTarget.BLANK" instead.');
	      }
	      if (PDFJS.externalLinkTarget !== LinkTarget.NONE) {
	        warn('PDFJS.externalLinkTarget is already initialized');
	        return;
	      }
	      PDFJS.externalLinkTarget = value ? LinkTarget.BLANK : LinkTarget.NONE;
	    },
	    enumerable: true,
	    configurable: true
	  });
	  if (savedOpenExternalLinksInNewWindow) {
	    /**
	     * (Deprecated) Opens external links in a new window if enabled.
	     * The default behavior opens external links in the PDF.js window.
	     *
	     * NOTE: This property has been deprecated, please use
	     *       `PDFJS.externalLinkTarget = PDFJS.LinkTarget.BLANK` instead.
	     * @var {boolean}
	     */
	    PDFJS.openExternalLinksInNewWindow = savedOpenExternalLinksInNewWindow;
	  }

	  PDFJS.getDocument = displayAPI.getDocument;
	  PDFJS.PDFDataRangeTransport = displayAPI.PDFDataRangeTransport;
	  PDFJS.PDFWorker = displayAPI.PDFWorker;

	  Object.defineProperty(PDFJS, 'hasCanvasTypedArrays', {
	    configurable: true,
	    get: function PDFJS_hasCanvasTypedArrays() {
	      var value = displayDOMUtils.hasCanvasTypedArrays();
	      return sharedUtil.shadow(PDFJS, 'hasCanvasTypedArrays', value);
	    }
	  });
	  PDFJS.CustomStyle = displayDOMUtils.CustomStyle;
	  PDFJS.LinkTarget = LinkTarget;
	  PDFJS.addLinkAttributes = displayDOMUtils.addLinkAttributes;
	  PDFJS.getFilenameFromUrl = displayDOMUtils.getFilenameFromUrl;
	  PDFJS.isExternalLinkTargetSet = displayDOMUtils.isExternalLinkTargetSet;

	  PDFJS.AnnotationLayer = displayAnnotationLayer.AnnotationLayer;

	  PDFJS.renderTextLayer = displayTextLayer.renderTextLayer;

	  PDFJS.Metadata = displayMetadata.Metadata;

	  PDFJS.SVGGraphics = displaySVG.SVGGraphics;

	  PDFJS.UnsupportedManager = displayAPI._UnsupportedManager;

	  exports.globalScope = globalScope;
	  exports.isWorker = isWorker;
	  exports.PDFJS = globalScope.PDFJS;
	}));
	  }).call(pdfjsLibs);

	  exports.PDFJS = pdfjsLibs.pdfjsDisplayGlobal.PDFJS;
	  exports.build = pdfjsLibs.pdfjsDisplayAPI.build;
	  exports.version = pdfjsLibs.pdfjsDisplayAPI.version;
	  exports.getDocument = pdfjsLibs.pdfjsDisplayAPI.getDocument;
	  exports.PDFDataRangeTransport =
	    pdfjsLibs.pdfjsDisplayAPI.PDFDataRangeTransport;
	  exports.PDFWorker = pdfjsLibs.pdfjsDisplayAPI.PDFWorker;
	  exports.renderTextLayer = pdfjsLibs.pdfjsDisplayTextLayer.renderTextLayer;
	  exports.AnnotationLayer =
	    pdfjsLibs.pdfjsDisplayAnnotationLayer.AnnotationLayer;
	  exports.CustomStyle = pdfjsLibs.pdfjsDisplayDOMUtils.CustomStyle;
	  exports.PasswordResponses = pdfjsLibs.pdfjsSharedUtil.PasswordResponses;
	  exports.InvalidPDFException = pdfjsLibs.pdfjsSharedUtil.InvalidPDFException;
	  exports.MissingPDFException = pdfjsLibs.pdfjsSharedUtil.MissingPDFException;
	  exports.SVGGraphics = pdfjsLibs.pdfjsDisplaySVG.SVGGraphics;
	  exports.UnexpectedResponseException =
	    pdfjsLibs.pdfjsSharedUtil.UnexpectedResponseException;
	  exports.OPS = pdfjsLibs.pdfjsSharedUtil.OPS;
	  exports.UNSUPPORTED_FEATURES = pdfjsLibs.pdfjsSharedUtil.UNSUPPORTED_FEATURES;
	  exports.isValidUrl = pdfjsLibs.pdfjsSharedUtil.isValidUrl;
	  exports.createObjectURL = pdfjsLibs.pdfjsSharedUtil.createObjectURL;
	  exports.removeNullCharacters = pdfjsLibs.pdfjsSharedUtil.removeNullCharacters;
	  exports.shadow = pdfjsLibs.pdfjsSharedUtil.shadow;
	  exports.createBlob = pdfjsLibs.pdfjsSharedUtil.createBlob;
	  exports.getFilenameFromUrl =
	    pdfjsLibs.pdfjsDisplayDOMUtils.getFilenameFromUrl;
	  exports.addLinkAttributes = pdfjsLibs.pdfjsDisplayDOMUtils.addLinkAttributes;
	}));


	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 8 */,
/* 9 */
/***/ function(module, exports) {

	"use strict";
	class PdfScrapingResult {
	    constructor(successful, text, passwordRequired, passwordIncorrect) {
	        this.successful = successful;
	        this.text = text;
	        this.passwordRequired = passwordRequired;
	        this.passwordIncorrect = passwordIncorrect;
	    }
	    static success(text) {
	        return new PdfScrapingResult(true, text, false, false);
	    }
	    static errorPasswordRequired() {
	        return new PdfScrapingResult(false, [], true, false);
	    }
	    static errorPasswordIncorrect() {
	        return new PdfScrapingResult(false, [], false, true);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = PdfScrapingResult;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const SheetAddResult_1 = __webpack_require__(11);
	const SheetsApiLoader_1 = __webpack_require__(12);
	class SheetAdder {
	    add(spreadsheetId) {
	        return SheetsApiLoader_1.default.load()
	            .then(() => {
	            return this.addSheet(spreadsheetId);
	        }, (reason) => { return SheetAddResult_1.default.ApiLoadFailure(reason); });
	    }
	    addSheet(spreadsheetId) {
	        return gapi.client.sheets.spreadsheets.batchUpdate({
	            spreadsheetId: spreadsheetId,
	            requests: [
	                {
	                    addSheet: {
	                        properties: {
	                            index: 0
	                        }
	                    }
	                }
	            ]
	        }).then((response) => {
	            return SheetAddResult_1.default.Success();
	        }, (reason) => {
	            return SheetAddResult_1.default.AddSheetFailure(reason);
	        });
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SheetAdder;


/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";
	class SheetsAddResult {
	    constructor(successful, errorMessage) {
	        this.successful = successful;
	        this.errorMessage = errorMessage;
	    }
	    static ApiLoadFailure(reason) {
	        return new SheetsAddResult(false, `Failed to load Google Sheets API. Reason: ${reason}`);
	    }
	    static AddSheetFailure(reason) {
	        return new SheetsAddResult(false, `Failed to add a new sheet. Reason: ${reason}`);
	    }
	    static Success() {
	        return new SheetsAddResult(true, "");
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SheetsAddResult;


/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	const SHEETS_DISCOVERY_URL = "https://sheets.googleapis.com/$discovery/rest?version=v4";
	class SheetsApiLoader {
	    static load() {
	        if (gapi.client.sheets !== undefined) {
	            return Promise.resolve(null);
	        }
	        return gapi.client.load(SHEETS_DISCOVERY_URL);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SheetsApiLoader;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const Spreadsheet_1 = __webpack_require__(14);
	const SpreadsheetsLoadResult_1 = __webpack_require__(15);
	const sheetMimeType = "application/vnd.google-apps.spreadsheet";
	class SpreadsheetsLoader {
	    load() {
	        return this.loadDriveApi()
	            .then(this.requestSheets, (reason) => { return SpreadsheetsLoadResult_1.default.ApiLoadFailure(reason); });
	    }
	    loadDriveApi() {
	        return gapi.client.load('drive', 'v3');
	    }
	    requestSheets() {
	        return gapi.client.drive.files.list({
	            pageSize: 10,
	            q: `mimeType='${sheetMimeType}'`
	        }).then((response) => {
	            let sheets = response.result.files;
	            return SpreadsheetsLoadResult_1.default.Success(sheets.map((spreadsheet) => {
	                return new Spreadsheet_1.default(spreadsheet.id, spreadsheet.name);
	            }));
	        }, (reason) => {
	            return SpreadsheetsLoadResult_1.default.ApiListFailure(reason);
	        });
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SpreadsheetsLoader;


/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	class Spreadsheet {
	    constructor(id, name) {
	        this.id = id;
	        this.name = name;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Spreadsheet;


/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";
	class SpreadsheetsLoadResult {
	    constructor(successful, sheets, errorMessage) {
	        this.successful = successful;
	        this.sheets = sheets;
	        this.errorMessage = errorMessage;
	    }
	    static ApiLoadFailure(reason) {
	        return new SpreadsheetsLoadResult(false, [], `Failed to load Google Drive API. Reason: ${reason}`);
	    }
	    static ApiListFailure(reason) {
	        return new SpreadsheetsLoadResult(false, [], `Failed to retrieve a list of sheets from Google Drive API. Reason: ${reason}`);
	    }
	    static Success(sheets) {
	        return new SpreadsheetsLoadResult(true, sheets, "");
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SpreadsheetsLoadResult;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const SheetsApiLoader_1 = __webpack_require__(12);
	const SpreadsheetWriteResult_1 = __webpack_require__(17);
	class SpreadsheetWriter {
	    write(spreadsheetId, values) {
	        return SheetsApiLoader_1.default.load()
	            .then(() => {
	            return this.addSheet(spreadsheetId, values);
	        }, reason => {
	            return SpreadsheetWriteResult_1.default.ApiLoadFailure(reason);
	        });
	    }
	    addSheet(spreadsheetId, values) {
	        return gapi.client.sheets.spreadsheets.values.update({
	            spreadsheetId: spreadsheetId,
	            range: "A1",
	            valueInputOption: "USER_ENTERED",
	            values: values
	        }).then((response) => {
	            return SpreadsheetWriteResult_1.default.Success();
	        }, reason => {
	            return SpreadsheetWriteResult_1.default.WriteFailure(reason);
	        });
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SpreadsheetWriter;


/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";
	class SpreadsheetWriteResult {
	    constructor(successful, errorMessage) {
	        this.successful = successful;
	        this.errorMessage = errorMessage;
	    }
	    static ApiLoadFailure(reason) {
	        return new SpreadsheetWriteResult(false, `Failed to load Google Sheets API. Reason: ${reason}`);
	    }
	    static WriteFailure(reason) {
	        return new SpreadsheetWriteResult(false, `Failed to write to the Google Sheet. Reason: ${reason}`);
	    }
	    static Success() {
	        return new SpreadsheetWriteResult(true, "");
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SpreadsheetWriteResult;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const StatementItem_1 = __webpack_require__(19);
	class StatementParser {
	    parse(statementText) {
	        let items = [], cardNumber = null, startIndex = this.indexOfNextTransactionRow(statementText, 0);
	        while (startIndex > -1) {
	            let index = startIndex;
	            while (index < statementText.length) {
	                if (this.textIsCardNumber(statementText[index])) {
	                    cardNumber = this.parseCardNumber(statementText[index]);
	                    index += 1;
	                }
	                if (this.textIsInternationTransanctionFee(statementText[index])) {
	                    index += 1;
	                }
	                if (this.textIsRowEnding(statementText[index]) ||
	                    this.textIsTransactionsEnd(statementText[index])) {
	                    break;
	                }
	                let date = statementText[index], transactionDetails = statementText[index + 1], amount = statementText[index + 2], referenceNumber = statementText[index + 3], foreignCurrencyAmount = "";
	                index += 4;
	                if (this.textIsForeignCurrencyAmount(statementText[index])) {
	                    foreignCurrencyAmount = statementText[index];
	                    index += 1;
	                }
	                items.push(new StatementItem_1.default(cardNumber, date, transactionDetails, referenceNumber, amount, foreignCurrencyAmount));
	            }
	            startIndex = this.indexOfNextTransactionRow(statementText, index);
	        }
	        return items;
	    }
	    indexOfNextTransactionRow(statementText, searchFrom) {
	        let index = -1;
	        for (let i = searchFrom; i < statementText.length; i++) {
	            if ((statementText[i] == "Transactions" || statementText[i] == "Transactions (Continued)") &&
	                statementText[i + 1] == "Date" &&
	                statementText[i + 2] == "Transaction Details" &&
	                statementText[i + 3] == "Reference Number" &&
	                statementText[i + 4] == "Amount") {
	                return i + 5;
	            }
	        }
	        return index;
	    }
	    textIsCardNumber(text) {
	        return /Card Number (\d\d\d\d \d\d\d\d \d\d\d\d \d\d\d\d)/.test(text);
	    }
	    parseCardNumber(text) {
	        return text.match(/Card Number (\d\d\d\d \d\d\d\d \d\d\d\d \d\d\d\d)/)[1];
	    }
	    textIsRowEnding(text) {
	        return text === "(Continued next page)";
	    }
	    textIsTransactionsEnd(text) {
	        return text === "Closing Balance";
	    }
	    textIsForeignCurrencyAmount(text) {
	        return text.startsWith("Foreign Amount ");
	    }
	    textIsInternationTransanctionFee(text) {
	        return /AUD (\d)*.\d\d includes International Transaction fee AUD (\d)*.\d\d/.test(text);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = StatementParser;


/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";
	class StatementItem {
	    constructor(cardNumber, date, transactionDetails, referenceNumber, amount, foreignCurrencyAmount) {
	        this.cardNumber = cardNumber;
	        this.date = date;
	        this.transactionDetails = transactionDetails;
	        this.referenceNumber = referenceNumber;
	        this.amount = amount;
	        this.foreignCurrencyAmount = foreignCurrencyAmount;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = StatementItem;


/***/ }
/******/ ]);